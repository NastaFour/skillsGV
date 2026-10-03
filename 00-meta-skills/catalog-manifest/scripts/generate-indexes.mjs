#!/usr/bin/env node
/**
 * generate-indexes.mjs — catalog manifest + index generator
 */
import { resolve } from "node:path";
import {
  REPO_ROOT,
  checkCatalog,
  generateIndexes,
} from "../../../_shared/catalog-manifest.mjs";

let mode = null;
let root = REPO_ROOT;
let jsonOut = false;

const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--write") mode = "write";
  else if (arg === "--check") mode = "check";
  else if (arg === "--root") root = resolve(args[++i]);
  else if (arg === "--json") jsonOut = true;
  else if (arg === "--help" || arg === "-h") {
    printHelp();
    process.exit(0);
  } else {
    console.error(`Unknown argument: ${arg}`);
    process.exit(2);
  }
}

function printHelp() {
  console.log(`generate-indexes.mjs — catalog manifest + index generator

Usage:
  node generate-indexes.mjs --write [--root <dir>] [--json]   regenerate catalog.json + indexes
  node generate-indexes.mjs --check [--root <dir>] [--json]   read-only consistency gate

  --root <dir>   Catalog root directory only (default: resolved from this script's location, never cwd).
                 External skill folders/repos without catalog.json must be checked with validate-skills.mjs.
  --json         Machine-readable result.
  --help         Show this help.

Exit codes: 0 = ok; 1 = issues found; 2 = usage error.`);
}

if (!mode) {
  console.error("Usage error: pass exactly one of --write or --check (see --help).");
  process.exit(2);
}

const result = mode === "write" ? generateIndexes(root) : checkCatalog(root);
const issues = result.issues ?? [];

if (jsonOut) {
  console.log(
    JSON.stringify(
      {
        mode,
        root,
        ok: result.ok,
        skills: result.skills ?? null,
        categories: result.categories ?? null,
        written: result.written ?? [],
        issues,
      },
      null,
      2
    )
  );
} else if (result.ok) {
  if (mode === "write") {
    const files = result.written.length ? result.written.join(", ") : "no changes";
    console.log(`✅ catalog-manifest: ${result.skills} skills · ${result.categories} categories — ${files}`);
  } else {
    console.log(`✅ catalog-manifest: ${result.skills} skills · ${result.categories} categories consistent`);
  }
} else {
  console.error(`❌ catalog-manifest: ${issues.length} issue(s) found`);
  for (const issue of issues) {
    console.error(`  - [${issue.code}] ${issue.detail}`);
  }
  process.exit(1);
}
