#!/usr/bin/env node
/**
 * set-models.mjs — Switcher for the favorite provider/model of ALL agents.
 *
 * Resolves tier → model from _shared/agent-roster/profiles.json (or inline
 * --strong/--flash/--all overrides), then delegates to apply.mjs for every
 * detected runtime. Nothing is written without --apply (dry-run default).
 *
 * Usage:
 *   node set-models.mjs --profile glm --apply
 *   node set-models.mjs --all <model> --apply
 *   node set-models.mjs --strong <model> --apply
 *   node set-models.mjs --flash <model> --apply
 *   node set-models.mjs --save-profile <name> --apply
 *   node set-models.mjs --list
 *
 * Test-only rule: do NOT --apply against the real global opencode.json;
 * functional tests must use a temp copy via apply.mjs --config.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = resolve(__dirname, "..");
const CATALOG_ROOT = resolve(SKILL_DIR, "../..");
const PROFILES_PATH = join(CATALOG_ROOT, "_shared", "agent-roster", "profiles.json");
const ROSTER_PATH = join(CATALOG_ROOT, "_shared", "agent-roster", "roster.json");
const APPLY_PATH = join(__dirname, "apply.mjs");
const DEFAULT_OPENCODE_CONFIG = join(homedir(), ".config", "opencode", "opencode.json");
const DSH_PRESET_PATH = join(CATALOG_ROOT, "gentle-ai-dsh", "preset", "agent.cordis.yml");

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const opts = {
    strong: null,
    flash: null,
    all: null,
    profile: null,
    saveProfile: null,
    list: false,
    dryRun: false,
    apply: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--strong") opts.strong = argv[++i];
    else if (a === "--flash") opts.flash = argv[++i];
    else if (a === "--all") opts.all = argv[++i];
    else if (a === "--profile") opts.profile = argv[++i];
    else if (a === "--save-profile") opts.saveProfile = argv[++i];
    else if (a === "--list") opts.list = true;
    else if (a === "--dry-run") opts.dryRun = true;
    else if (a === "--apply") opts.apply = true;
    else if (a === "--help" || a === "-h") {
      printHelp();
      process.exit(0);
    } else {
      console.error(`Unknown argument: ${a}`);
      process.exit(2);
    }
  }
  if (opts.all && (opts.strong || opts.flash)) {
    console.error("--all cannot be combined with --strong or --flash.");
    process.exit(2);
  }
  if (opts.saveProfile && !/^[a-z0-9][a-z0-9-]{0,63}$/.test(opts.saveProfile)) {
    console.error(`--save-profile name must be lowercase-hyphen (got "${opts.saveProfile}")`);
    process.exit(2);
  }
  if (!opts.dryRun && !opts.apply) opts.dryRun = true; // never write without --apply
  return opts;
}

function printHelp() {
  console.log(`set-models.mjs — switch the model/provider of ALL roster agents at once

Usage:
  node set-models.mjs [options]

Options:
  --profile <name>      Switch profiles.json "current" to <name>
  --all <model>         Same model for both tiers (strong and flash)
  --strong <model>      Override the strong-tier model
  --flash <model>       Override the flash-tier model
  --save-profile <n>    Save the resolved strong/flash as a named profile
  --list                Print profiles + detected runtimes + current mapping
  --dry-run             Print the plan without writing (DEFAULT)
  --apply               Persist profiles.json and write runtime configs
  --help, -h            Show this help

Rules:
  - Never writes without --apply.
  - Test-only rule: do NOT --apply against the real global opencode.json.
`);
}

function readUtf8(p) {
  return readFileSync(p, "utf8").replace(/^\uFEFF/, "");
}

function loadProfiles() {
  try {
    return JSON.parse(readUtf8(PROFILES_PATH));
  } catch (err) {
    console.error(`❌ profiles.json unreadable: ${err.message}`);
    process.exit(2);
  }
}

// ---------------------------------------------------------------------------
// Resolution
// ---------------------------------------------------------------------------

function resolveModels(opts, profiles) {
  const baseName = opts.profile || profiles.current;
  const base = profiles.profiles[baseName];
  if (!base || typeof base.strong !== "string" || typeof base.flash !== "string") {
    console.error(`❌ profile "${baseName}" does not exist in profiles.json`);
    process.exit(2);
  }
  const strong = opts.all || opts.strong || base.strong;
  const flash = opts.all || opts.flash || base.flash;
  return { baseName, strong, flash };
}

function profileEditsFor(opts, profiles, resolved) {
  const edits = { changed: false, saveProfile: null };
  if (opts.profile && profiles.current !== opts.profile) {
    profiles.current = opts.profile;
    edits.changed = true;
  }
  const cur = profiles.profiles[profiles.current];
  if ((opts.all || opts.strong) && cur.strong !== resolved.strong) {
    cur.strong = resolved.strong;
    edits.changed = true;
  }
  if ((opts.all || opts.flash) && cur.flash !== resolved.flash) {
    cur.flash = resolved.flash;
    edits.changed = true;
  }
  if (opts.saveProfile) {
    profiles.profiles[opts.saveProfile] = { strong: resolved.strong, flash: resolved.flash };
    edits.saveProfile = opts.saveProfile;
    edits.changed = true;
  }
  return edits;
}

// ---------------------------------------------------------------------------
// Output helpers
// ---------------------------------------------------------------------------

function detectedRuntimes() {
  const list = [];
  if (existsSync(DEFAULT_OPENCODE_CONFIG)) list.push("opencode");
  if (existsSync(DSH_PRESET_PATH)) list.push("dsh");
  return list;
}

function printSummaryTable(roster, resolved, runtime) {
  console.log(`\nSummary — ${runtime}: ${roster.agents.length} agents (profile "${resolved.baseName}")`);
  console.log("  agent".padEnd(24) + "tier".padEnd(8) + "model");
  console.log("  " + "-".repeat(74));
  for (const a of roster.agents) {
    const model = a.tier === "strong" ? resolved.strong : resolved.flash;
    console.log(`  ${a.name.padEnd(24)}${a.tier.padEnd(8)}${model}`);
  }
}

function delegateToApply(opts, resolved) {
  const runtimes = detectedRuntimes();
  if (runtimes.length === 0) {
    console.log("\n⚠️  No runtime detected (no opencode config, no dsh preset). Nothing to delegate.");
    return;
  }
  const override = JSON.stringify({ strong: resolved.strong, flash: resolved.flash });
  for (const r of runtimes) {
    const res = spawnSync(
      process.execPath,
      [APPLY_PATH, "--runtime", r, opts.apply ? "--apply" : "--dry-run", "--override", override],
      { stdio: "inherit" }
    );
    if (res.status !== 0) {
      console.error(`❌ apply.mjs --runtime ${r} exited with ${res.status}`);
      process.exit(res.status ?? 1);
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const profiles = loadProfiles();
  const roster = JSON.parse(readUtf8(ROSTER_PATH));

  if (opts.list) {
    console.log(`\nProfiles (${PROFILES_PATH}):`);
    console.log(`  current: ${profiles.current}`);
    for (const [name, p] of Object.entries(profiles.profiles)) {
      const mark = name === profiles.current ? " *" : "  ";
      console.log(`  ${mark} ${name}: strong=${p.strong}, flash=${p.flash}`);
    }
    const resolved = { baseName: profiles.current, strong: profiles.profiles[profiles.current].strong, flash: profiles.profiles[profiles.current].flash };
    const res = spawnSync(process.execPath, [APPLY_PATH, "--runtime", "list"], { stdio: "inherit" });
    if (res.status !== 0) process.exit(res.status ?? 1);
    return;
  }

  const resolved = resolveModels(opts, profiles);

  console.log(`\nset-models — tier resolution (base profile: "${resolved.baseName}")`);
  console.log(`  strong: ${resolved.strong}`);
  console.log(`  flash:  ${resolved.flash}`);

  const prevCurrent = profiles.current;
  const edits = profileEditsFor(opts, profiles, resolved);
  if (edits.changed) {
    console.log("\nprofiles.json changes:");
    if (opts.profile && prevCurrent !== profiles.current) {
      console.log(`  [CHANGED] current: ${prevCurrent} -> ${profiles.current}`);
    }
    if (opts.profile || opts.all || opts.strong || opts.flash) {
      const cur = profiles.profiles[profiles.current];
      if (opts.all || opts.strong) console.log(`  [CHANGED] profiles.${profiles.current}.strong -> ${resolved.strong}`);
      if (opts.all || opts.flash) console.log(`  [CHANGED] profiles.${profiles.current}.flash -> ${resolved.flash}`);
      void cur;
    }
    if (edits.saveProfile) {
      console.log(`  [CHANGED] profiles.${edits.saveProfile} -> { strong: ${resolved.strong}, flash: ${resolved.flash} }`);
    }
  } else {
    console.log("\nprofiles.json: no changes (already resolves to this tier mapping).");
  }

  const runtimes = detectedRuntimes();
  console.log(`\nDetected runtimes: ${runtimes.length ? runtimes.join(", ") : "(none)"}`);
  if (runtimes.includes("opencode")) {
    console.log(`  opencode target: ${DEFAULT_OPENCODE_CONFIG}`);
  }
  if (runtimes.includes("dsh")) {
    console.log(`  dsh preset:      ${DSH_PRESET_PATH}`);
  }

  if (opts.apply && edits.changed) {
    writeFileSync(PROFILES_PATH, JSON.stringify(profiles, null, 2) + "\n");
    console.log(`\n✅ Wrote ${PROFILES_PATH}`);
  } else if (edits.changed) {
    console.log("\n✨ Dry-run: profiles.json NOT written (use --apply to persist).");
  }

  for (const r of runtimes) printSummaryTable(roster, resolved, r);

  console.log(`\nMode: ${opts.apply ? "apply" : "dry-run"}`);
  delegateToApply(opts, resolved);

  if (!opts.apply) {
    console.log("\n✨ Dry-run complete. No changes written (use --apply to write).");
  } else {
    console.log("\n✅ Done. Restart the affected runtimes to pick up the new models.");
  }
}

main();
