#!/usr/bin/env node
/**
 * generate-indexes.mjs — catalog manifest + index generator (change
 * skills-25-upgrade, WU1a / spec catalog-manifest).
 *
 * Generates from the skill tree + frontmatter:
 *   - catalog.json          single source of truth (skills, categories, counts)
 *   - SKILLS.md             category tables + prose count
 *   - AGENTS.md             categories table (skills per category)
 * and validates that every Auto-Invoke entry in AGENTS.md exists in the
 * manifest. `note`/`autoInvoke` and category titles are merge-preserved from
 * the previous manifest; new skills enter with defaults.
 *
 * Usage:
 *   node generate-indexes.mjs --write [--root <dir>] [--json]
 *   node generate-indexes.mjs --check [--root <dir>] [--json]
 *
 * --check is read-only and fails (exit 1) with a summarized diff when the
 * tree, the manifest or the indexes diverge; it never writes.
 * --write regenerates the three artifacts, validating first and failing
 * closed (exit 1, no writes) on Tier 0 / Auto-Invoke inconsistencies.
 *
 * The catalog root defaults to this script's own location resolved upward
 * (00-meta-skills/skill-registry/scripts/ -> catalog root), NEVER to cwd.
 * --root is an explicit override for tests and tooling.
 *
 * Exit codes: 0 = ok; 1 = issues found; 2 = usage error.
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

  --root <dir>   Catalog root (default: resolved from this script's location, never cwd).
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
    console.log(`✅ catalog-manifest: ${result.skills} skills · ${result.categories} categories — SKILLS.md, AGENTS.md and catalog.json are consistent`);
  }
} else {
  console.log(`❌ catalog-manifest ${mode}: ${issues.length} issue(s)`);
  for (const issue of issues) console.log(`   ✖ [${issue.code}] ${issue.detail}`);
}

process.exitCode = result.ok ? 0 : 1;
