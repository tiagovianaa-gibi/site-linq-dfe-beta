const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DATA_FILE = path.join(ROOT, "data", "noticias.json");

const MOJIBAKE_REPLACEMENTS = [
  ["\u00c3\u00a1", "\u00e1"],
  ["\u00c3\u00a0", "\u00e0"],
  ["\u00c3\u00a2", "\u00e2"],
  ["\u00c3\u00a3", "\u00e3"],
  ["\u00c3\u00a4", "\u00e4"],
  ["\u00c3\u00a7", "\u00e7"],
  ["\u00c3\u00a9", "\u00e9"],
  ["\u00c3\u00a8", "\u00e8"],
  ["\u00c3\u00aa", "\u00ea"],
  ["\u00c3\u00ad", "\u00ed"],
  ["\u00c3\u00af", "\u00ef"],
  ["\u00c3\u00b3", "\u00f3"],
  ["\u00c3\u00b4", "\u00f4"],
  ["\u00c3\u00b5", "\u00f5"],
  ["\u00c3\u00ba", "\u00fa"],
  ["\u00c3\u00bc", "\u00fc"],
  ["\u00c3\u0081", "\u00c1"],
  ["\u00c3\u0080", "\u00c0"],
  ["\u00c3\u0082", "\u00c2"],
  ["\u00c3\u0083", "\u00c3"],
  ["\u00c3\u0087", "\u00c7"],
  ["\u00c3\u0089", "\u00c9"],
  ["\u00c3\u008a", "\u00ca"],
  ["\u00c3\u008d", "\u00cd"],
  ["\u00c3\u0093", "\u00d3"],
  ["\u00c3\u0094", "\u00d4"],
  ["\u00c3\u0095", "\u00d5"],
  ["\u00c3\u009a", "\u00da"],
  ["\u00c3\u009c", "\u00dc"],
  ["\u00c2\u00a0", " "],
  ["\u00e2\u0080\u0093", "\u2013"],
  ["\u00e2\u0080\u0094", "\u2014"],
  ["\u00e2\u0080\u0098", "\u2018"],
  ["\u00e2\u0080\u0099", "\u2019"],
  ["\u00e2\u0080\u009c", "\u201c"],
  ["\u00e2\u0080\u009d", "\u201d"],
  ["\u00e2\u0080\u00a6", "\u2026"],
  ["\u00c2\u00ba", "\u00ba"],
  ["\u00c2\u00aa", "\u00aa"],
];

function fixMojibake(text) {
  if (!text) return text;
  if (!/[\u00c2\u00c3\u00e2]/.test(text)) return text;
  let out = text;
  for (const [bad, good] of MOJIBAKE_REPLACEMENTS) {
    out = out.split(bad).join(good);
  }
  return out;
}

function normalizeValue(value) {
  if (typeof value === "string") {
    return fixMojibake(value);
  }
  if (Array.isArray(value)) {
    return value.map(normalizeValue);
  }
  if (value && typeof value === "object") {
    const next = {};
    Object.keys(value).forEach((key) => {
      next[key] = normalizeValue(value[key]);
    });
    return next;
  }
  return value;
}

function main() {
  if (!fs.existsSync(DATA_FILE)) {
    throw new Error("data/noticias.json not found.");
  }
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  const data = JSON.parse(raw);
  const normalized = normalizeValue(data);
  fs.writeFileSync(DATA_FILE, JSON.stringify(normalized, null, 2), "utf8");
  console.log("Updated data/noticias.json");
}

main();
