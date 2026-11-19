#!/usr/bin/env node
/**
 * check-eas-config.mjs
 * Verifies eas.json and app.json have required fields for store deployment.
 * Usage: node check-eas-config.mjs [--dir <path>] [--json]
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

const monorepoApps = [
  join(root, "apps", "mobile-client"),
  join(root, "apps", "mobile-admin"),
].filter((p) => existsSync(p));

const appPaths = targetDir || existsSync(join(root, "eas.json")) || existsSync(join(root, "app.json"))
  ? [root]
  : monorepoApps.length > 0
    ? monorepoApps
    : [root];

for (const appPath of appPaths) {
  const easJsonPath = join(appPath, "eas.json");
  const appJsonPath = join(appPath, "app.json");

  if (!existsSync(easJsonPath)) {
    issues.push({ severity: "warning", check: "eas-json-missing", msg: `eas.json not found in ${appPath}. Required for EAS build/submit.` });
  } else {
    try {
      const eas = JSON.parse(readFileSync(easJsonPath, "utf8"));
      if (!eas.build?.production) {
        issues.push({ severity: "error", check: "no-production-profile", msg: `eas.json in ${appPath} has no production build profile.`, file: easJsonPath });
      }
      if (!eas.build?.staging) {
        issues.push({ severity: "warning", check: "no-staging-profile", msg: `eas.json in ${appPath} has no staging build profile.`, file: easJsonPath });
      }
    } catch {
      issues.push({ severity: "error", check: "invalid-json", msg: `Invalid JSON in ${easJsonPath}`, file: easJsonPath });
    }
  }

  if (!existsSync(appJsonPath)) {
    issues.push({ severity: "warning", check: "app-json-missing", msg: `app.json not found in ${appPath}` });
  } else {
    try {
      const app = JSON.parse(readFileSync(appJsonPath, "utf8"));
      if (!app.expo?.version) {
        issues.push({ severity: "error", check: "no-version", msg: `app.json in ${appPath} has no expo.version. Required for store submission.`, file: appJsonPath });
      }
      if (!app.expo?.updates?.url) {
        issues.push({ severity: "warning", check: "no-updates-config", msg: `No expo.updates.url in ${appPath}. OTA updates won't work.`, file: appJsonPath });
      }
    } catch {
      issues.push({ severity: "error", check: "invalid-json", msg: `Invalid JSON in ${appJsonPath}`, file: appJsonPath });
    }
  }
}

const result = buildResult(issues);
printResult(result, "EAS Config Checker");
exitFromResultGuarded(result);
