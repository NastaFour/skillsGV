#!/usr/bin/env node
/**
 * check-deep-links.mjs
 * Verifies app.json has scheme configured for deep linking.
 * Usage: node check-deep-links.mjs [--dir <path>] [--json]
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { buildResult, printResult, exitFromResultGuarded, findProjectRoot } from "../../../_shared/script-utils.mjs";

const args = process.argv.slice(2);
let targetDir = null;
for (let i = 0; i < args.length; i++) {
  if ((args[i] === "--dir" || args[i] === "--projectDir") && args[i + 1]) {
    targetDir = resolve(args[++i]);
  }
}

const root = targetDir || findProjectRoot(process.cwd()) || process.cwd();
const issues = [];

const standaloneAppJson = join(root, "app.json");
const monorepoPaths = [
  join(root, "apps", "mobile-client", "app.json"),
  join(root, "apps", "mobile-admin", "app.json"),
].filter((p) => existsSync(p));

const appJsonPaths = existsSync(standaloneAppJson)
  ? [standaloneAppJson]
  : monorepoPaths.length > 0
    ? monorepoPaths
    : [standaloneAppJson];

for (const p of appJsonPaths) {
  if (!existsSync(p)) {
    issues.push({ severity: "warning", check: "app-json-missing", msg: `app.json not found at ${p}` });
    continue;
  }
  const content = readFileSync(p, "utf8");
  try {
    const json = JSON.parse(content);
    if (!json.expo?.scheme) {
      issues.push({ severity: "error", check: "no-scheme", msg: `app.json at ${p} has no expo.scheme. Deep links won't work. Add "scheme": "myapp".`, file: p });
    }
    if (!json.expo?.ios?.associatedDomains) {
      issues.push({ severity: "warning", check: "no-universal-links", msg: `No iOS associatedDomains in ${p}. Universal links won't work.`, file: p });
    }
  } catch {
    issues.push({ severity: "error", check: "invalid-json", msg: `Invalid JSON in ${p}`, file: p });
  }
}

const result = buildResult(issues);
printResult(result, "Deep Link Checker");
exitFromResultGuarded(result);
