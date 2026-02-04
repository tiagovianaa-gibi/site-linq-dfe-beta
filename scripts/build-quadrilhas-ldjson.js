const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const FILE = path.join(ROOT, "quadrilhas.html");
const DATA_FILE = path.join(ROOT, "data", "quadrilhas.json");

const TITLE = "Quadrilhas Filiadas | LINQ-DFE \u2014 DF e Entorno";
const DESCRIPTION =
  "Conhe\u00e7a as quadrilhas filiadas \u00e0 LINQ-DFE no Distrito Federal e Entorno. Lista oficial com cidade/UF, grupo (Especial/Acesso) e links para as p\u00e1ginas individuais.";
const CANONICAL = "https://linqdfe.com.br/quadrilhas.html";
const OG_IMAGE = "https://linqdfe.com.br/assets/logos/linq-dfe.png";
const ORG = {
  "@type": "Organization",
  name: "LINQ-DFE",
  url: "https://linqdfe.com.br/",
  logo: "https://linqdfe.com.br/assets/logos/linq-dfe.png",
  sameAs: ["https://instagram.com/linqdfe"],
};

const SUBTITLE = "ConheÃ§a todas as quadrilhas que fazem parte da LINQ-DFE";

function replaceOnce(html, pattern, replacement, required = true) {
  const next = html.replace(pattern, replacement);
  if (next === html && required) {
    throw new Error(`Pattern not found: ${pattern}`);
  }
  return next;
}

function insertBeforeHeadClose(html, snippet) {
  const headClose = /<\/head>/i;
  if (!headClose.test(html)) {
    throw new Error("Missing </head>.");
  }
  return html.replace(headClose, `${snippet}\n\n</head>`);
}

function updateMeta(html, name, content) {
  const pattern = new RegExp(`<meta\\s+name="${name}"[^>]*>`, "gi");
  const replacement = `<meta name="${name}" content="${content}">`;
  const stripped = html.replace(pattern, "");
  return insertBeforeHeadClose(stripped, replacement);
}

function updateOg(html, property, content) {
  const pattern = new RegExp(`<meta\\s+property="${property}"[^>]*>`, "gi");
  const replacement = `<meta property="${property}" content="${content}">`;
  const stripped = html.replace(pattern, "");
  return insertBeforeHeadClose(stripped, replacement);
}

function updateCanonical(html, href) {
  const pattern = new RegExp('<link\\s+rel="canonical"[^>]*>', "gi");
  const replacement = `<link rel="canonical" href="${href}">`;
  const stripped = html.replace(pattern, "");
  return insertBeforeHeadClose(stripped, replacement);
}

function updateTitle(html, title) {
  const pattern = new RegExp("<title>.*?<\\/title>", "i");
  const replacement = `<title>${title}</title>`;
  return pattern.test(html)
    ? html.replace(pattern, replacement)
    : insertBeforeHeadClose(html, replacement);
}

function updateCharset(html) {
  const pattern = new RegExp("<meta\\s+charset=\"[^\"]*\">", "i");
  const replacement = '<meta charset="utf-8">';
  return pattern.test(html)
    ? html.replace(pattern, replacement)
    : insertBeforeHeadClose(html, replacement);
}

function updateSubtitle(html) {
  const pattern = new RegExp(
    '<p class="section-subtitle">[\\s\\S]*?<\\/p>',
    "i"
  );
  const replacement = `<p class="section-subtitle">${SUBTITLE}</p>`;
  return pattern.test(html) ? html.replace(pattern, replacement) : html;
}

function findTagBlock(html, startIndex, tagName) {
  const openTag = `<${tagName}`;
  const closeTag = `</${tagName}>`;
  let index = startIndex;
  let depth = 0;
  while (index < html.length) {
    const nextOpen = html.indexOf(openTag, index);
    const nextClose = html.indexOf(closeTag, index);
    if (nextOpen === -1 || nextClose === -1) {
      break;
    }
    if (nextOpen < nextClose) {
      depth += 1;
      index = nextOpen + openTag.length;
      continue;
    }
    depth -= 1;
    index = nextClose + closeTag.length;
    if (depth === 0) {
      return { end: index, closeStart: nextClose };
    }
  }
  throw new Error(`Could not match closing </${tagName}>`);
}

function normalizeUrl(href) {
  if (!href) return "";
  if (href.startsWith("http://") || href.startsWith("https://")) return href;
  return `https://linqdfe.com.br/${href.replace(/^\/+/, "")}`;
}

function buildCardsFromData() {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  const cards = data
    .slice()
    .sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"))
    .map((quad) => {
      const slug = quad.slug || "";
      const href = `quadrilha/${slug}.html`;
      const foto = quad.foto_capa || quad.foto || "assets/banners/placeholder.jpg";
      const cleanedFoto = foto.startsWith("/") ? foto.slice(1) : foto;
      const src = cleanedFoto.includes("/")
        ? cleanedFoto
        : `assets/fotos-quadrilhas/${cleanedFoto}`;
      const name = quad.nome || "";
      const city = quad.cidade || "";
      const group = quad.grupo || "";
      const badgeClass = group === "Especial" ? "badge" : "badge badge-secondary";
      const alt = `${name} \u2014 ${city} \u2014 Grupo ${group} | LINQ-DFE`.trim();
      return { href, name, city, group, badgeClass, src, alt };
    });

  const html = cards
    .map(
      (card) => `
          <article class="card quadrilha-card">
            <a class="quadrilha-card-link" href="${card.href}">
              <img class="card-image" src="${card.src}" alt="${card.alt}" loading="lazy">
              <div class="card-overlay">
                <h2 class="card-title">${card.name}</h2>
                <div class="card-meta">
                  <span>${card.city}</span>
                  <span class="${card.badgeClass}">${card.group}</span>
                </div>
              </div>
            </a>
          </article>`.trim()
    )
    .join("\n\n");

  return { cards, html };
}

function buildJsonLd(cards) {
  const itemList = {
    "@type": "ItemList",
    name: "Quadrilhas Filiadas \u2014 LINQ-DFE",
    itemListOrder: "https://schema.org/ItemListUnordered",
    numberOfItems: cards.length,
    itemListElement: cards.map((card, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: card.name,
      url: normalizeUrl(card.href),
    })),
  };

  return JSON.stringify(
    {
      "@context": "https://schema.org",
      "@graph": [ORG, itemList],
    },
    null,
    2
  );
}

function extractJsonLd(html) {
  const match = html.match(
    new RegExp('<script type="application\\/ld\\+json">([\\s\\S]*?)<\\/script>', "i")
  );
  if (!match) {
    throw new Error("JSON-LD script not found.");
  }
  return JSON.parse(match[1].trim());
}

function validate(cards, html) {
  if (!html.includes(`<title>${TITLE}</title>`)) {
    throw new Error("Title not updated.");
  }
  if (!html.includes(`rel="canonical" href="${CANONICAL}"`)) {
    throw new Error("Canonical not updated.");
  }

  const jsonLd = extractJsonLd(html);
  const graph = jsonLd["@graph"] || [];
  const org = graph.find((item) => item["@type"] === "Organization");
  const list = graph.find((item) => item["@type"] === "ItemList");
  if (!org || !list) {
    throw new Error("JSON-LD Organization or ItemList missing.");
  }

  if (list.numberOfItems !== cards.length) {
    throw new Error("JSON-LD numberOfItems does not match cards.");
  }
  if (!Array.isArray(list.itemListElement) || list.itemListElement.length !== cards.length) {
    throw new Error("JSON-LD itemListElement length mismatch.");
  }

  list.itemListElement.forEach((item, index) => {
    if (item.position !== index + 1) {
      throw new Error(`JSON-LD position mismatch at ${index + 1}.`);
    }
    if (!item.url || !item.url.startsWith("https://linqdfe.com.br/")) {
      throw new Error(`JSON-LD url invÃ¡lida: ${item.url}`);
    }
  });

  cards.forEach((card) => {
    if (!card.alt.includes("â€”") || !card.alt.includes("Grupo")) {
      throw new Error(`Alt invÃ¡lido: ${card.alt}`);
    }
  });
}

function updateHtml(html) {
  let next = html;
  next = updateCharset(next);
  next = updateTitle(next, TITLE);
  next = updateMeta(next, "description", DESCRIPTION);
  next = updateCanonical(next, CANONICAL);
  next = updateOg(next, "og:title", TITLE);
  next = updateOg(next, "og:description", DESCRIPTION);
  next = updateOg(next, "og:type", "website");
  next = updateOg(next, "og:url", CANONICAL);
  next = updateOg(next, "og:image", OG_IMAGE);
  next = updateMeta(next, "twitter:card", "summary_large_image");
  next = updateMeta(next, "twitter:title", TITLE);
  next = updateMeta(next, "twitter:description", DESCRIPTION);
  next = updateMeta(next, "twitter:image", OG_IMAGE);
  next = updateSubtitle(next);

  const gridIndex = next.indexOf('id="filiadasGrid"');
  if (gridIndex === -1) {
    throw new Error("Could not find filiadasGrid.");
  }
  const divOpenStart = next.lastIndexOf("<div", gridIndex);
  const divOpenEnd = next.indexOf(">", divOpenStart);
  const block = findTagBlock(next, divOpenStart, "div");
  const { cards, html: cardsHtml } = buildCardsFromData();

  const newGrid = `
        <section aria-label="Lista de quadrilhas filiadas">
          <div class="grid grid-large" id="filiadasGrid">

${cardsHtml}

          </div>
        </section>
  `.trim();

  next = next.slice(0, divOpenStart) + newGrid + next.slice(block.end);

  const jsonLd = buildJsonLd(cards);
  const ldScript = `<script type="application/ld+json">\n${jsonLd}\n  </script>`;
  const ldPattern = new RegExp('<script type="application\\/ld\\+json">[\\s\\S]*?<\\/script>', "i");
  next = ldPattern.test(next)
    ? next.replace(ldPattern, ldScript)
    : insertBeforeHeadClose(next, ldScript);

  return { html: next, cards };
}

function main() {
  const html = fs.readFileSync(FILE, "utf8");
  const { html: updated, cards } = updateHtml(html);
  validate(cards, updated);
  fs.writeFileSync(FILE, updated, "utf8");
  console.log(`Updated ${FILE} with ${cards.length} cards.`);
}

main();

