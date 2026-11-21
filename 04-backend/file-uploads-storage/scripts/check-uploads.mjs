#!/usr/bin/env node
/**
 * check-uploads.mjs
 *
 * Detects upload endpoints without file validation (fileFilter or limits).
 *
 * Usage:
 *   node check-uploads.mjs [--apiDir <path>]
 *
 * Exit codes: 0 = OK, 1 = unvalidated upload found
 */

import { resolve, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { walkFiles, readFileUtf8, buildResult, printResult, exitFromResult, exitFromResultGuarded, findProjectRoot } from "../../../_shared/script-utils.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const args = process.argv.slice(2);
let apiDir = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--apiDir" && args[i + 1]) apiDir = resolve(args[++i]);
}
if (!apiDir) {
  const root = findProjectRoot(process.cwd());
  apiDir = root ? join(root, "apps", "api", "src") : resolve(process.cwd(), "apps/api/src");
}

const issues = [];

const srcFiles = walkFiles(apiDir, (name) => /\.(t|j)s$/.test(name));

function extractMulterConfigs(content) {
  const configs = [];
  const callRe = /\bmulter\s*\(\s*\{/g;
  let m;
  while ((m = callRe.exec(content)) !== null) {
    const openBraceIdx = content.indexOf("{", m.index);
    if (openBraceIdx === -1) continue;
    let depth = 0;
    let quote = null;
    let escaped = false;
    for (let i = openBraceIdx; i < content.length; i++) {
      const ch = content[i];
      if (quote) {
        if (escaped) {
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          escaped = true;
          continue;
        }
        if (ch === quote) quote = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === "`") {
        quote = ch;
        continue;
      }
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) {
          configs.push(content.slice(openBraceIdx + 1, i));
          break;
        }
      }
    }
  }
  return configs;
}

for (const file of srcFiles) {
  const content = readFileUtf8(file);
  const relFile = relative(process.cwd(), file);

  // Find multer config: multer({ ... }) with balanced brace extraction
  const multerConfigs = extractMulterConfigs(content);
  for (const config of multerConfigs) {

    if (!/fileFilter/i.test(config)) {
      issues.push({
        severity: "error",
        check: "upload-no-filter",
        msg: `Multer config without fileFilter. Any file type can be uploaded (security risk). Add fileFilter to validate mimetype.`,
        file: relFile,
      });
    }

    if (!/limits/i.test(config)) {
      issues.push({
        severity: "error",
        check: "upload-no-limits",
        msg: `Multer config without limits. No max file size → DoS risk (unlimited upload size). Add limits: { fileSize: 5*1024*1024 }.`,
        file: relFile,
      });
    }
  }
}

const result = buildResult(issues);
printResult(result, "Upload Validator Checker");
exitFromResultGuarded(result);
