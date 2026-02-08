const fs = require("fs");
const path = require("path");

function fail(msg) {
  console.error(`[validate-assets-data] ${msg}`);
  process.exit(1);
}

function mustExist(p) {
  if (!fs.existsSync(p)) {
    fail(`Missing: ${p}`);
  }
}

function validateJsonFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    JSON.parse(raw);
  } catch (error) {
    fail(`Invalid JSON: ${filePath} :: ${error.message}`);
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (entry.isFile() && entry.name.toLowerCase().endsWith(".json")) {
      validateJsonFile(full);
    }
  }
}

const dataDir = path.join(process.cwd(), "assets", "data");
mustExist(dataDir);
walk(dataDir);

console.log("[validate-assets-data] OK");
process.exit(0);
