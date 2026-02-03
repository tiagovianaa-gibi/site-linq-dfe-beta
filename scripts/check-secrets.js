#!/usr/bin/env node
"use strict";

const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const ROOT_DIR = process.cwd();
const FALLBACK_IGNORED_DIRS = new Set([".git", "node_modules"]);
const FALLBACK_IGNORED_FILES = new Set(["js/runtime-config.js"]);
const SCAN_EXCLUDED_FILES = new Set(["scripts/check-secrets.js"]);

const SECRET_PATTERNS = [
  {
    name: "Firebase API key",
    regex: /\bAIza[0-9A-Za-z_-]{35}\b/g,
  },
  {
    name: "Private key block",
    regex: /-----BEGIN(?: [A-Z0-9]+)? PRIVATE KEY-----/g,
  },
  {
    name: "GitHub personal access token",
    regex: /\bghp_[A-Za-z0-9]{36}\b/g,
  },
  {
    name: "GitHub fine-grained token",
    regex: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/g,
  },
  {
    name: "Google OAuth token",
    regex: /\bya29\.[0-9A-Za-z\-_]+\b/g,
  },
  {
    name: "Firebase service account private_key",
    regex: /"private_key"\s*:\s*"-----BEGIN PRIVATE KEY-----/g,
  },
];

const TEXT_EXTENSIONS = new Set([
  ".html",
  ".css",
  ".js",
  ".mjs",
  ".cjs",
  ".json",
  ".yml",
  ".yaml",
  ".md",
  ".txt",
  ".xml",
  ".py",
  ".sh",
  ".ps1",
  ".ts",
  ".tsx",
  ".jsx",
  ".env",
  ".ini",
  ".cfg",
  ".toml",
]);

function getTrackedFiles() {
  try {
    const output = execFileSync("git", ["ls-files", "-z"], {
      cwd: ROOT_DIR,
      encoding: "utf8",
    });

    return output
      .split("\0")
      .map((file) => file.trim())
      .filter(Boolean);
  } catch (error) {
    console.warn(
      "Warning: could not run 'git ls-files'. Falling back to filesystem scan."
    );
    return walkFiles(ROOT_DIR);
  }
}

function walkFiles(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === "." || entry.name === "..") {
      continue;
    }

    const absPath = path.join(dirPath, entry.name);
    const relPath = path.relative(ROOT_DIR, absPath).replace(/\\/g, "/");

    if (entry.isDirectory()) {
      if (FALLBACK_IGNORED_DIRS.has(entry.name)) {
        continue;
      }
      files.push(...walkFiles(absPath));
      continue;
    }

    if (entry.isFile() && !FALLBACK_IGNORED_FILES.has(relPath)) {
      files.push(relPath);
    }
  }

  return files;
}

function looksTextFile(filePath, buffer) {
  if (TEXT_EXTENSIONS.has(path.extname(filePath).toLowerCase())) {
    return true;
  }

  const probe = buffer.subarray(0, Math.min(buffer.length, 2048));
  return !probe.includes(0);
}

function lineNumberFromIndex(text, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (text.charCodeAt(i) === 10) {
      line += 1;
    }
  }
  return line;
}

function scanFile(relPath) {
  const absPath = path.join(ROOT_DIR, relPath);
  const contentBuffer = fs.readFileSync(absPath);

  if (!looksTextFile(relPath, contentBuffer)) {
    return [];
  }

  const text = contentBuffer.toString("utf8");
  const findings = [];

  for (const pattern of SECRET_PATTERNS) {
    pattern.regex.lastIndex = 0;
    let match = pattern.regex.exec(text);

    while (match) {
      findings.push({
        file: relPath,
        line: lineNumberFromIndex(text, match.index),
        type: pattern.name,
      });
      match = pattern.regex.exec(text);
    }
  }

  return findings;
}

function main() {
  const trackedFiles = getTrackedFiles();
  const findings = [];

  for (const file of trackedFiles) {
    if (SCAN_EXCLUDED_FILES.has(file.replace(/\\/g, "/"))) {
      continue;
    }
    try {
      findings.push(...scanFile(file));
    } catch (error) {
      console.warn(`Warning: failed to scan ${file}: ${error.message}`);
    }
  }

  if (findings.length > 0) {
    console.error("Potential secrets found in tracked files:");
    for (const finding of findings) {
      console.error(
        `- ${finding.file}:${finding.line} (${finding.type})`
      );
    }
    process.exit(1);
  }

  console.log(`Secret scan passed (${trackedFiles.length} tracked files).`);
}

main();
