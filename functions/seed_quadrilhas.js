const admin = require("firebase-admin");
const fs = require("fs/promises");
const path = require("path");

const DATA_PATH = path.resolve(__dirname, "../data/quadrilhas.json");
const ENTIDADE = "LINQ-DFE";

const SIGLA_OVERRIDES = {
  // "arroxa-o-no": "ARROXA",
};

function slugify(text) {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function normalizeGrupo(grupo) {
  if (!grupo) return null;
  const upper = String(grupo).trim().toUpperCase();
  return upper || null;
}

function normalizeSigla({ sigla, slug, nome }) {
  if (sigla) return String(sigla).trim().toUpperCase();
  if (slug && SIGLA_OVERRIDES[slug]) return SIGLA_OVERRIDES[slug];
  if (slug) return slug.replace(/-/g, "").toUpperCase();
  if (!nome) return null;
  const fallback = slugify(nome);
  return fallback ? fallback.replace(/-/g, "").toUpperCase() : null;
}

function buildDoc(quad, slug) {
  const doc = {
    ativa: true,
    cidade: quad.cidade || null,
    entidade: ENTIDADE,
    grupo_atual: normalizeGrupo(quad.grupo),
    instagram: quad.instagram || null,
    nome: quad.nome || null,
    sigla: normalizeSigla({
      sigla: quad.sigla,
      slug,
      nome: quad.nome,
    }),
    uf: quad.uf || null,
  };

  Object.keys(doc).forEach((key) => {
    if (doc[key] === null || doc[key] === undefined) {
      delete doc[key];
    }
  });

  return doc;
}

function parseArg(name) {
  const prefix = `${name}=`;
  const item = process.argv.find((arg) => arg.startsWith(prefix));
  return item ? item.slice(prefix.length) : null;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const onlyArg = parseArg("--only");
  const limitArg = parseArg("--limit");
  const onlySet = onlyArg
    ? new Set(onlyArg.split(",").map((s) => s.trim()).filter(Boolean))
    : null;
  const limit = limitArg ? Number(limitArg) : null;

  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId:
      process.env.FIREBASE_PROJECT_ID ||
      process.env.GCLOUD_PROJECT ||
      undefined,
  });

  const db = admin.firestore();
  const raw = await fs.readFile(DATA_PATH, "utf8");
  const quadrilhas = JSON.parse(raw);

  let processed = 0;
  let skipped = 0;
  let batch = db.batch();
  let batchCount = 0;

  for (const quad of quadrilhas) {
    const slug = quad.slug || slugify(quad.nome || "");
    if (!slug) {
      skipped += 1;
      continue;
    }

    if (onlySet && !onlySet.has(slug)) {
      skipped += 1;
      continue;
    }

    const docId = slug;
    const data = buildDoc(quad, slug);

    if (!data.nome) {
      skipped += 1;
      continue;
    }

    if (dryRun) {
      console.log(`[dry-run] ${docId}`, data);
    } else {
      const ref = db.collection("quadrilhas").doc(docId);
      batch.set(ref, data, { merge: true });
      batchCount += 1;
    }

    processed += 1;

    if (!dryRun && batchCount >= 450) {
      await batch.commit();
      batch = db.batch();
      batchCount = 0;
    }

    if (limit && processed >= limit) break;
  }

  if (!dryRun && batchCount > 0) {
    await batch.commit();
  }

  console.log(
    `Done. processed=${processed} skipped=${skipped} dryRun=${dryRun}`
  );
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exitCode = 1;
});
