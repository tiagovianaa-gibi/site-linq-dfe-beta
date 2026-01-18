import { readdir, readFile, writeFile } from "node:fs/promises";
import { extname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const JS_DIR = new URL("../js/", import.meta.url);

async function listSources() {
  const entries = await readdir(JS_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && extname(entry.name) === ".js")
    .map((entry) => entry.name)
    .filter((name) => !name.endsWith(".min.js"));
}

async function minifyFile(name) {
  const input = new URL(name, JS_DIR);
  const outputName = `${basename(name, ".js")}.min.js`;
  const output = new URL(outputName, JS_DIR);

  const inputPath = fileURLToPath(input);
  const outputPath = fileURLToPath(output);

  await build({
    entryPoints: [inputPath],
    outfile: outputPath,
    bundle: false,
    minify: true,
    format: "esm",
    platform: "browser",
    target: ["es2018"],
  });

  let content = await readFile(output, "utf-8");
  content = content.replace(/(\.{1,2}\/shared)\.js/g, "$1.min.js");
  await writeFile(output, content);
}

async function main() {
  const sources = await listSources();
  for (const name of sources) {
    await minifyFile(name);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
