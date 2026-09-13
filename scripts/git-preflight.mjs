#!/usr/bin/env node
/**
 * git-preflight.mjs — work-unit stage guard (read-only).
 *
 * Verifies that the staged set in a repository is contained in the allowlist of
 * the work unit being committed. The repository root is resolved from this
 * script's own location (`scripts/` -> catalog root), never from cwd.
 *
 * This script never stages, commits, or touches configuration: the caller must
 * stage selectively with `git add -- <paths>` first. Never use `-A`, `commit -a`
 * or `--no-verify`; this guard fails closed when the stage drifts from the
 * work-unit allowlist.
 *
 * Usage:
 *   node scripts/git-preflight.mjs --paths <p1,p2,...> [--paths-file <file>]
 *     [--repo <path>] [--allow-partial] [--json]
 *
 * Exit codes: 0 = staged set inside allowlist; 1 = violations; 2 = usage error.
 */
import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_REPO = resolve(__dirname, ".."); // catalog root; NEVER process.cwd()

let repo = DEFAULT_REPO;
let jsonOut = false;
let allowPartial = false;
const allow = [];

const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--repo") repo = resolve(args[++i]);
  else if (a === "--paths") allow.push(...args[++i].split(",").map((s) => s.trim()).filter(Boolean));
  else if (a === "--paths-file") {
    const file = resolve(args[++i]);
    allow.push(
      ...readFileSync(file, "utf8")
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter((s) => s && !s.startsWith("#"))
    );
  } else if (a === "--allow-partial") allowPartial = true;
  else if (a === "--json") jsonOut = true;
  else if (a === "--help" || a === "-h") {
    printHelp();
    process.exit(0);
  } else {
    console.error(`Unknown argument: ${a}`);
    process.exit(2);
  }
}

const norm = (p) => p.replace(/\\/g, "/").replace(/^\.\//, "");

function printHelp() {
  console.log(`git-preflight.mjs — work-unit stage guard

Usage:
  node scripts/git-preflight.mjs --paths <p1,p2,...> [--paths-file <file>]
    [--repo <path>] [--allow-partial] [--json]

  --paths <csv>     Work-unit allowlist (repeatable, comma-separated).
  --paths-file <f>  Read the allowlist from a file (one path per line, # comments).
  --repo <path>     Repository to inspect (default: catalog root, from script location).
  --allow-partial   Allow allowlisted paths that are not staged yet.
  --json            Machine-readable result.

Exit codes: 0 = pass; 1 = staged outside allowlist / missing stage; 2 = usage error.`);
}

const allowSet = new Set(allow.map(norm));
if (allowSet.size === 0) {
  console.error("Usage error: provide --paths or --paths-file with at least one path.");
  process.exit(2);
}
if (!existsSync(join(repo, ".git"))) {
  console.error(`Usage error: ${repo} is not a git repository.`);
  process.exit(2);
}

let staged = [];
try {
  const out = execFileSync("git", ["-C", repo, "diff", "--cached", "--name-only", "-z"], { encoding: "utf8" });
  staged = out.split("\0").filter(Boolean).map(norm);
} catch (err) {
  console.error(`git failed in ${repo}: ${err.message}`);
  process.exit(2);
}

const stagedSet = new Set(staged);
const extras = [...stagedSet].filter((p) => !allowSet.has(p)).sort();
const missing = [...allowSet].filter((p) => !stagedSet.has(p)).sort();
const pass = extras.length === 0 && (allowPartial || missing.length === 0);

if (jsonOut) {
  console.log(
    JSON.stringify({ repo, staged: [...stagedSet].sort(), allowlist: [...allowSet].sort(), extras, missing, allowPartial, pass }, null, 2)
  );
} else {
  console.log(`🛡️  git-preflight — ${repo}`);
  console.log(`   staged: ${staged.length} · allowlist: ${allowSet.size}${allowPartial ? " (partial allowed)" : ""}`);
  for (const p of extras) console.log(`   ✖ staged outside the work-unit allowlist: ${p}`);
  for (const p of missing) console.log(`   ${allowPartial ? "ℹ️" : "✖"} allowlisted but not staged: ${p}`);
  console.log(pass ? "✅ PASS: staged set matches the work unit." : "❌ FAIL: the stage does not match the work-unit allowlist.");
}
process.exitCode = pass ? 0 : 1;
