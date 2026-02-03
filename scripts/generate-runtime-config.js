#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const requiredEnv = {
  FIREBASE_API_KEY: "apiKey",
  FIREBASE_AUTH_DOMAIN: "authDomain",
  FIREBASE_PROJECT_ID: "projectId",
  FIREBASE_STORAGE_BUCKET: "storageBucket",
  FIREBASE_MESSAGING_SENDER_ID: "messagingSenderId",
  FIREBASE_APP_ID: "appId",
};

const optionalEnv = {
  FIREBASE_MEASUREMENT_ID: "measurementId",
};

function readEnv(name) {
  const raw = process.env[name];
  if (typeof raw !== "string") {
    return "";
  }
  return raw.trim();
}

function main() {
  const firebase = {};
  const missing = [];

  for (const [envName, key] of Object.entries(requiredEnv)) {
    const value = readEnv(envName);
    if (!value) {
      missing.push(envName);
      continue;
    }
    firebase[key] = value;
  }

  if (missing.length > 0) {
    console.error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
    process.exit(1);
  }

  for (const [envName, key] of Object.entries(optionalEnv)) {
    const value = readEnv(envName);
    if (value) {
      firebase[key] = value;
    }
  }

  const config = { firebase };
  const output = `window.RUNTIME_CONFIG = ${JSON.stringify(config, null, 2)};\n`;
  const outputDir = path.join(process.cwd(), "js");
  const outputPath = path.join(outputDir, "runtime-config.js");

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, output, "utf8");

  console.log(`Generated ${path.relative(process.cwd(), outputPath)}`);
}

main();
