const admin = require("firebase-admin");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const crypto = require("crypto");

admin.initializeApp();

const db = admin.firestore();

const REQUIRED_TAGS = [
  "quadrilha junina",
  "DF e Entorno",
  "LINQ-DFE",
  "Circuito de Quadrilhas",
];

function generateTempPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.randomBytes(12);
  let password = "";
  for (let i = 0; i < bytes.length; i += 1) {
    password += alphabet[bytes[i] % alphabet.length];
  }
  return password;
}

function sanitizeText(value) {
  if (!value) return "";
  return String(value)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/[<>]/g, "")
    .trim();
}


function normalizeTags(tags, keywords) {
  const base = [
    ...REQUIRED_TAGS,
    ...(keywords || []).map((k) => sanitizeText(k)),
    "São João",
    "cultura popular",
  ];
  const unique = [];
  base.forEach((tag) => {
    const clean = sanitizeText(tag);
    if (clean && !unique.includes(clean)) unique.push(clean);
  });
  return unique.slice(0, 12);
}

function clampText(text, min, max) {
  const clean = sanitizeText(text);
  if (!clean) return "";
  if (clean.length > max) return clean.slice(0, max - 1).trim() + "…";
  if (clean.length < min) return clean;
  return clean;
}

function buildFallbackDraft({ keywords, type, includeLinks, brief }) {
  const kw = (keywords || []).map(sanitizeText).filter(Boolean);
  const keywordText = kw.length ? kw.join(", ") : "quadrilhas juninas";
  const typeLabel = type || "NOTICIA";
  const titleBase = `LINQ-DFE: ${typeLabel.toLowerCase()} sobre ${keywordText}`;
  const titulo = clampText(titleBase, 60, 90);
  const resumoBase = `Comunicado da LINQ-DFE sobre ${keywordText} no DF e Entorno. Informações oficiais e próximas etapas do Circuito de Quadrilhas.`;
  const resumo = clampText(resumoBase, 120, 160);
  const tags = normalizeTags([], kw);
  const briefText = sanitizeText(brief);

  const sections = [
    "## Contexto do comunicado",
    "## Pontos principais",
    "## O que acontece a seguir",
  ];

  const conteudoPortal = [
    `A LINQ-DFE informa sobre ${keywordText} no DF e Entorno. ${briefText || "Detalhes seguem a confirmação oficial."}`,
    sections[0],
    "A Liga reforça o compromisso com o Circuito de Quadrilhas e a transparência das etapas em andamento.",
    sections[1],
    "As orientações serão divulgadas conforme a consolidação das informações e alinhamento com as quadrilhas.",
    sections[2],
    "Em breve serão publicados novos comunicados com prazos e orientações.",
    includeLinks
      ? "Saiba mais: /circuito.html | /noticias.html | /quadrilhas.html"
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return { titulo, resumo, tags, conteudoPortal };
}

function ensureSubtitles(text) {
  const lines = text.split("\n");
  const subtitleCount = lines.filter((line) => line.trim().startsWith("## "))
    .length;
  return subtitleCount >= 3 && subtitleCount <= 6;
}

async function callAI(payload) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const prompt = `
Você é assistente da LINQ-DFE. Gere um rascunho de notícia em PT-BR.
Regras:
- Tom institucional, direto.
- Não inventar números/datas/fatos. Se não houver dado, use "a confirmar" ou omita.
- Formato do conteúdo: texto simples, com linhas em branco separando parágrafos.
- Subtítulos: linhas iniciando com "## ".
- 3 a 6 subtítulos.
- Título: 60–90 caracteres. Resumo: 120–160 caracteres.
- Tags: 8–12, sem repetição, incluindo "quadrilha junina", "DF e Entorno", "LINQ-DFE", "Circuito de Quadrilhas".
- Se includeLinks=true, adicione no final: "Saiba mais: /circuito.html | /noticias.html | /quadrilhas.html".
- Responda somente JSON com chaves: titulo, resumo, tags (array), conteudoPortal.
Dados:
keywords=${JSON.stringify(payload.keywords)}
type=${payload.type}
includeLinks=${payload.includeLinks}
brief=${payload.brief || ""}
seed=${payload.seed || 0}
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Você é um redator institucional." },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    logger.warn("OpenAI response error", { status: response.status, text });
    return null;
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) return null;

  try {
    return JSON.parse(content);
  } catch (err) {
    logger.warn("Failed to parse AI JSON", err);
    return null;
  }
}

exports.generateNewsDraft = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Usuário não autenticado.");
  }

  const uid = request.auth.uid;
  const body = request.data || {};
  const keywords = Array.isArray(body.keywords) ? body.keywords : [];
  const type = sanitizeText(body.type || "NOTICIA");
  const includeLinks = Boolean(body.includeLinks);
  const brief = sanitizeText(body.brief || "");
  const seed = Number.isFinite(body.seed) ? body.seed : 0;

  const today = new Date().toISOString().slice(0, 10);
  const usageRef = db.collection("ai_usage").doc(uid);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(usageRef);
    const data = snap.exists ? snap.data() : {};
    const sameDay = data?.date === today;
    const count = sameDay ? Number(data?.count || 0) : 0;

    if (count >= 10) {
      throw new HttpsError(
        "resource-exhausted",
        "Limite diário de geração atingido."
      );
    }

    tx.set(
      usageRef,
      { date: today, count: count + 1 },
      { merge: true }
    );
  });

  const payload = {
    keywords: keywords.map(sanitizeText).filter(Boolean),
    type,
    includeLinks,
    brief,
    seed,
  };

  let draft = await callAI(payload);

  if (!draft) {
    draft = buildFallbackDraft(payload);
  }

  const titulo = clampText(draft.titulo, 60, 90);
  const resumo = clampText(draft.resumo, 120, 160);
  const tags = normalizeTags(draft.tags || [], payload.keywords);
  const conteudoPortal = sanitizeText(draft.conteudoPortal || "");

  const finalContent =
    conteudoPortal && ensureSubtitles(conteudoPortal)
      ? conteudoPortal
      : buildFallbackDraft(payload).conteudoPortal;

  const normalized = includeLinks
    ? finalContent.includes("Saiba mais:")
      ? finalContent
      : `${finalContent}\n\nSaiba mais: /circuito.html | /noticias.html | /quadrilhas.html`
    : finalContent.replace(/\\n\\nSaiba mais:[\\s\\S]*$/i, "").trim();

  return {
    titulo,
    resumo,
    tags,
    conteudoPortal: normalized,
  };
});

exports.createPortalUser = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Usuário não autenticado.");
  }

  const callerEmail = request.auth.token?.email;
  if (!callerEmail) {
    throw new HttpsError("permission-denied", "E-mail do usuário não encontrado.");
  }

  const callerSnap = await db.collection("users").doc(callerEmail).get();
  const callerData = callerSnap.exists ? callerSnap.data() : null;
  if (!callerData || callerData.papel !== "LIGA_ADMIN") {
    throw new HttpsError("permission-denied", "Sem permissão para criar usuários.");
  }

  const body = request.data || {};
  const email = sanitizeText(body.email || "").toLowerCase();
  const nome = sanitizeText(body.nome || "");
  const papel = sanitizeText(body.papel || "");
  const quadrilhaId = sanitizeText(body.quadrilhaId || "");

  if (!email || !papel) {
    throw new HttpsError("invalid-argument", "E-mail e papel são obrigatórios.");
  }

  const tempPassword = generateTempPassword();

  try {
    await admin.auth().createUser({
      email,
      password: tempPassword,
      displayName: nome || undefined,
    });
  } catch (err) {
    if (err?.code === "auth/email-already-exists") {
      throw new HttpsError("already-exists", "Usuário já existe no Auth.");
    }
    logger.error("Erro ao criar usuário no Auth", err);
    throw new HttpsError("internal", "Erro ao criar usuário.");
  }

  await db.collection("users").doc(email).set(
    {
      email,
      nome: nome || null,
      papel,
      quadrilhaId: quadrilhaId || null,
      mustChangePassword: true,
      passwordGeneratedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return { created: true };
});
