#!/usr/bin/env node
/**
 * set-models.mjs — Switcher for the favorite provider/model of ALL agents.
 *
 * Resolves tier → model from _shared/agent-roster/profiles.json (or inline
 * --strong/--mid/--cheap/--flash/--all overrides), then delegates to apply.mjs
 * for every detected runtime. Nothing is written without --apply (dry-run default).
 *
 * Aligns with native gentle-ai 2.7.0 profiles:
 * - Emits exact arguments for `gentle-ai sync --profile <name:model>` and
 *   `--profile-phase <name:phase:model>` using native tier names
 *   (sdd-strong, sdd-mid, sdd-cheap) via `--emit-sync-args`.
 * - Does not duplicate the phase profile application engine: phase profiles
 *   are applied by `gentle-ai sync`; the 21-agent roster is applied by apply.mjs.
 *
 * Usage:
 *   node set-models.mjs --profile glm --apply
 *   node set-models.mjs --all <model> --apply
 *   node set-models.mjs --strong <model> --apply
 *   node set-models.mjs --mid <model> --apply
 *   node set-models.mjs --cheap <model> --apply
 *   node set-models.mjs --emit-sync-args [--json]
 *   node set-models.mjs --save-profile <name> --apply
 *   node set-models.mjs --save-provider <id> --base-url <u> --api-key-env <VAR> --models m1,m2 [--apply]
 *   node set-models.mjs --list
 *
 * The custom-provider block NEVER stores the API key: --api-key-env takes the
 * env-var NAME (the key lives in the environment; opencode.json gets the
 * literal "{env:<VAR>}" reference via apply.mjs).
 *
 * Test-only rule: do NOT --apply against the real global opencode.json;
 * functional tests must use a temp copy via apply.mjs --config and a temp
 * profiles.json via --profiles.
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
// Helpers: Tier normalization
// ---------------------------------------------------------------------------

// Known credential shapes that also satisfy the env-var NAME regex. Rejected
// explicitly so a pasted key can never be persisted as if it were a variable
// name (the key itself is never accepted nor stored).
const SECRET_SHAPE_PATTERNS = [
  /^gh[pousr]_/, // GitHub tokens (classic)
  /^github_pat_/, // GitHub fine-grained PAT
  /^AKIA[0-9A-Z]{8,}$/, // AWS access key id
  /^ASIA[0-9A-Z]{8,}$/, // AWS temporary access key id
  /^sk_live_|^sk_test_/, // Stripe secret keys
  /^xox[baprs]-/, // Slack tokens
  /^ya29\./, // Google OAuth access token
  /^AIza[0-9A-Za-z_-]{10,}$/, // Google API key
  /^eyJ[A-Za-z0-9_-]{10,}\./, // JWT
  /^hf_/, // Hugging Face user access tokens
  /^npm_/, // npm automation/publish tokens
  /^dop_v1_/, // DigitalOcean personal access tokens
  /^shpat_/, // Shopify admin API access tokens
  /^figd_/, // Figma personal access tokens
];
const looksLikeSecret = (value) => SECRET_SHAPE_PATTERNS.some((re) => re.test(value));

export function normalizeTier(tier) {
  if (!tier) return "cheap";
  const t = String(tier).toLowerCase().trim();
  if (t === "sdd-strong" || t === "strong") return "strong";
  if (t === "sdd-mid" || t === "mid") return "mid";
  if (t === "sdd-cheap" || t === "cheap" || t === "flash") return "cheap";
  return t;
}

export function nativeTier(tier) {
  const norm = normalizeTier(tier);
  if (norm === "strong") return "sdd-strong";
  if (norm === "mid") return "sdd-mid";
  if (norm === "cheap") return "sdd-cheap";
  return tier;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const opts = {
    strong: null,
    mid: null,
    cheap: null,
    flash: null,
    all: null,
    profile: null,
    saveProfile: null,
    saveProvider: null,
    baseUrl: null,
    apiKeyEnv: null,
    models: null,
    profilesPath: null,
    emitSyncArgs: false,
    json: false,
    list: false,
    dryRun: false,
    apply: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--strong" || a === "--sdd-strong") opts.strong = argv[++i];
    else if (a === "--mid" || a === "--sdd-mid") opts.mid = argv[++i];
    else if (a === "--cheap" || a === "--sdd-cheap") opts.cheap = argv[++i];
    else if (a === "--flash") opts.flash = argv[++i];
    else if (a === "--all") opts.all = argv[++i];
    else if (a === "--profile") opts.profile = argv[++i];
    else if (a === "--save-profile") opts.saveProfile = argv[++i];
    else if (a === "--save-provider") opts.saveProvider = argv[++i];
    else if (a === "--base-url") opts.baseUrl = argv[++i];
    else if (a === "--api-key-env") opts.apiKeyEnv = argv[++i];
    else if (a === "--models") opts.models = argv[++i];
    else if (a === "--profiles") opts.profilesPath = resolve(argv[++i]);
    else if (a === "--emit-sync-args") opts.emitSyncArgs = true;
    else if (a === "--json") opts.json = true;
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
  if (opts.all && (opts.strong || opts.mid || opts.cheap || opts.flash)) {
    console.error("--all cannot be combined with --strong, --mid, --cheap, or --flash.");
    process.exit(2);
  }
  if (opts.saveProfile && !/^[a-z0-9][a-z0-9-]{0,63}$/.test(opts.saveProfile)) {
    console.error(`--save-profile name must be lowercase-hyphen (got "${opts.saveProfile}")`);
    process.exit(2);
  }
  if (opts.saveProvider) {
    if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(opts.saveProvider)) {
      console.error(`--save-provider id must be lowercase-hyphen (got "${opts.saveProvider}")`);
      process.exit(2);
    }
    if (opts.all || opts.strong || opts.mid || opts.cheap || opts.flash || opts.profile || opts.saveProfile) {
      console.error("--save-provider cannot be combined with tier/profile flags.");
      process.exit(2);
    }
    if (!opts.baseUrl || !opts.apiKeyEnv || !opts.models) {
      console.error("--save-provider requires --base-url, --api-key-env and --models.");
      process.exit(2);
    }
    if (!/^https?:\/\/\S+$/.test(opts.baseUrl)) {
      console.error(`--base-url must be an http(s) URL (got "${opts.baseUrl}")`);
      process.exit(2);
    }
    if (looksLikeSecret(opts.apiKeyEnv) || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(opts.apiKeyEnv)) {
      console.error(
        `--api-key-env expects the environment variable NAME (e.g. OPENCODE_GO_API_KEY), never the key itself (got "${opts.apiKeyEnv}")`
      );
      process.exit(2);
    }
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
  --all <model>         Same model for all tiers (strong, mid, and cheap)
  --strong <model>      Override the strong-tier model (alias: --sdd-strong)
  --mid <model>         Override the mid-tier model (alias: --sdd-mid)
  --cheap <model>       Override the cheap-tier model (alias: --sdd-cheap, --flash)
  --flash <model>       Alias for --cheap
  --emit-sync-args      Emit exact native 'gentle-ai sync' arguments for profiles
  --json                Emit output as JSON (used with --emit-sync-args)
  --save-profile <n>    Save the resolved strong/mid/cheap as a named profile
  --save-provider <id>  Declare a custom provider (requires --base-url,
                        --api-key-env and --models); persisted under "providers"
  --base-url <url>      Provider baseURL (used with --save-provider)
  --api-key-env <VAR>   Env-var NAME that holds the key (used with --save-provider;
                        the key itself is never accepted nor stored)
  --models <m1,m2>      Comma-separated model ids served by the provider
  --profiles <path>     Override profiles.json path (tests/fixtures)
  --list                Print profiles + detected runtimes + current mapping
  --dry-run             Print the plan without writing (DEFAULT)
  --apply               Persist profiles.json and write runtime configs
  --help, -h            Show this help

Rules:
  - Never writes without --apply.
  - Aligned with native tiers (sdd-strong, sdd-mid, sdd-cheap).
  - Emits exact 'gentle-ai sync --profile / --profile-phase' args without
    duplicating the native phase profile engine.
  - Test-only rule: do NOT --apply against the real global opencode.json; use
    a temp config (apply.mjs --config) and a temp profiles.json (--profiles).
`);
}

function readUtf8(p) {
  return readFileSync(p, "utf8").replace(/^\uFEFF/, "");
}

function loadProfiles(path) {
  try {
    return JSON.parse(readUtf8(path));
  } catch (err) {
    console.error(`❌ profiles.json unreadable: ${err.message}`);
    process.exit(2);
  }
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  if (a && b && typeof a === "object" && typeof b === "object") {
    const ka = Object.keys(a);
    const kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    return ka.every((k) => Object.prototype.hasOwnProperty.call(b, k) && deepEqual(a[k], b[k]));
  }
  return false;
}

// ---------------------------------------------------------------------------
// Custom provider persistence (never stores the key: only the env-var name)
// ---------------------------------------------------------------------------

function runSaveProvider(opts, profiles, profilesPath) {
  const models = [...new Set(opts.models.split(",").map((s) => s.trim()).filter(Boolean))];
  if (models.length === 0) {
    console.error("--models must be a non-empty comma-separated list.");
    process.exit(2);
  }
  if (profiles.providers === undefined) profiles.providers = {};
  if (!profiles.providers || typeof profiles.providers !== "object" || Array.isArray(profiles.providers)) {
    console.error('❌ profiles.json: "providers" must be an object keyed by provider id');
    process.exit(2);
  }
  const entry = { baseURL: opts.baseUrl, apiKeyEnv: opts.apiKeyEnv, models };
  const existing = profiles.providers[opts.saveProvider];

  console.log(`\nset-models — save provider "${opts.saveProvider}"`);
  console.log(`  baseURL:   ${entry.baseURL}`);
  console.log(`  apiKeyEnv: ${entry.apiKeyEnv} (env-var name only — the key itself is never stored)`);
  console.log(`  models:    ${entry.models.join(", ")}`);

  if (existing && deepEqual(existing, entry)) {
    console.log(`\nproviders.${opts.saveProvider}: no changes (already declared).`);
    return;
  }
  console.log(`\nproviders.${opts.saveProvider}: ${existing ? "update" : "new entry"}`);

  if (opts.apply) {
    profiles.providers[opts.saveProvider] = entry;
    writeFileSync(profilesPath, JSON.stringify(profiles, null, 2) + "\n");
    console.log(`\n✅ Wrote ${profilesPath}`);
    console.log("   Inject it with: node 00-meta-skills/agent-roster/scripts/apply.mjs --runtime opencode --apply");
  } else {
    console.log("\n✨ Dry-run: profiles.json NOT written (use --apply to persist).");
  }
}

// ---------------------------------------------------------------------------
// Resolution
// ---------------------------------------------------------------------------

function resolveModels(opts, profiles) {
  const baseName = opts.profile || profiles.current;
  const base = profiles.profiles ? profiles.profiles[baseName] : null;
  if (!base) {
    console.error(`❌ profile "${baseName}" does not exist in profiles.json`);
    process.exit(2);
  }

  const baseStrong = base["sdd-strong"] || base.strong;
  const baseFlash = base.flash || base["sdd-cheap"] || base.cheap;
  const baseMid = base["sdd-mid"] || base.mid || baseFlash;
  const baseCheap = base["sdd-cheap"] || base.cheap || baseFlash;

  const strong = opts.all || opts.strong || baseStrong;
  const flash = opts.all || opts.flash || opts.cheap || baseFlash;
  const mid = opts.all || opts.mid || baseMid;
  const cheap = opts.all || opts.cheap || opts.flash || baseCheap;

  if (typeof strong !== "string" || typeof flash !== "string") {
    console.error(`❌ profile "${baseName}" is missing required model tiers`);
    process.exit(2);
  }

  return {
    baseName,
    strong,
    mid: mid || flash,
    cheap: cheap || flash,
    flash,
    "sdd-strong": strong,
    "sdd-mid": mid || flash,
    "sdd-cheap": cheap || flash,
  };
}

function profileEditsFor(opts, profiles, resolved) {
  const edits = { changed: false, saveProfile: null };
  if (opts.profile && profiles.current !== opts.profile) {
    profiles.current = opts.profile;
    edits.changed = true;
  }
  const cur = profiles.profiles[profiles.current];
  if (opts.all || opts.strong) {
    if (cur.strong !== resolved.strong || cur["sdd-strong"] !== resolved.strong) {
      cur.strong = resolved.strong;
      cur["sdd-strong"] = resolved.strong;
      edits.changed = true;
    }
  }
  if (opts.all || opts.mid) {
    if (cur.mid !== resolved.mid || cur["sdd-mid"] !== resolved.mid) {
      cur.mid = resolved.mid;
      cur["sdd-mid"] = resolved.mid;
      edits.changed = true;
    }
  }
  if (opts.all || opts.cheap || opts.flash) {
    if (cur.cheap !== resolved.cheap || cur["sdd-cheap"] !== resolved.cheap || cur.flash !== resolved.flash) {
      cur.cheap = resolved.cheap;
      cur["sdd-cheap"] = resolved.cheap;
      cur.flash = resolved.flash;
      edits.changed = true;
    }
  }
  if (opts.saveProfile) {
    profiles.profiles[opts.saveProfile] = {
      "sdd-strong": resolved.strong,
      "sdd-mid": resolved.mid,
      "sdd-cheap": resolved.cheap,
      strong: resolved.strong,
      mid: resolved.mid,
      cheap: resolved.cheap,
      flash: resolved.flash,
    };
    edits.saveProfile = opts.saveProfile;
    edits.changed = true;
  }
  return edits;
}

// ---------------------------------------------------------------------------
// Native sync arguments generation
// ---------------------------------------------------------------------------

export function buildSyncArgs(roster, resolved, profileName) {
  const args = [
    "--profile", `sdd-strong:${resolved.strong}`,
    "--profile", `sdd-mid:${resolved.mid}`,
    "--profile", `sdd-cheap:${resolved.cheap}`,
  ];
  if (roster && roster.phases && typeof roster.phases === "object") {
    for (const [phase, info] of Object.entries(roster.phases)) {
      const tierNorm = normalizeTier(info.tier);
      const model = tierNorm === "strong" ? resolved.strong : (tierNorm === "mid" ? resolved.mid : resolved.cheap);
      args.push("--profile-phase", `${profileName}:${phase}:${model}`);
    }
  }
  return args;
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
  console.log("  agent".padEnd(24) + "tier".padEnd(14) + "model");
  console.log("  " + "-".repeat(74));
  for (const a of roster.agents) {
    const tierNorm = normalizeTier(a.tier);
    const model = tierNorm === "strong" ? resolved.strong : (tierNorm === "mid" ? resolved.mid : resolved.cheap);
    console.log(`  ${a.name.padEnd(24)}${a.tier.padEnd(14)}${model}`);
  }
}

function delegateToApply(opts, resolved) {
  const runtimes = detectedRuntimes();
  if (runtimes.length === 0) {
    console.log("\n⚠️  No runtime detected (no opencode config, no dsh preset). Nothing to delegate.");
    return;
  }
  const override = JSON.stringify({
    "sdd-strong": resolved.strong,
    "sdd-mid": resolved.mid,
    "sdd-cheap": resolved.cheap,
    strong: resolved.strong,
    mid: resolved.mid,
    cheap: resolved.cheap,
    flash: resolved.flash,
  });
  const extra = opts.profilesPath ? ["--profiles", opts.profilesPath] : [];
  for (const r of runtimes) {
    const res = spawnSync(
      process.execPath,
      [APPLY_PATH, "--runtime", r, opts.apply ? "--apply" : "--dry-run", "--override", override, ...extra],
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
  const profilesPath = opts.profilesPath || PROFILES_PATH;
  const profiles = loadProfiles(profilesPath);

  if (opts.saveProvider) {
    runSaveProvider(opts, profiles, profilesPath);
    return;
  }

  const roster = JSON.parse(readUtf8(ROSTER_PATH));

  if (opts.emitSyncArgs) {
    const resolved = resolveModels(opts, profiles);
    const syncArgs = buildSyncArgs(roster, resolved, resolved.baseName);
    const command = `gentle-ai sync ${syncArgs.map((a) => (a.includes(" ") ? `"${a}"` : a)).join(" ")}`;
    if (opts.json) {
      console.log(JSON.stringify({ profile: resolved.baseName, syncArgs, command }, null, 2));
    } else {
      console.log(`\nExact sync arguments for gentle-ai (profile "${resolved.baseName}"):`);
      console.log(`  ${command}\n`);
      console.log("Flags breakdown:");
      for (let i = 0; i < syncArgs.length; i += 2) {
        console.log(`  ${syncArgs[i].padEnd(18)} ${syncArgs[i + 1]}`);
      }
    }
    return;
  }

  if (opts.list) {
    console.log(`\nProfiles (${profilesPath}):`);
    console.log(`  current: ${profiles.current}`);
    for (const [name, p] of Object.entries(profiles.profiles)) {
      const mark = name === profiles.current ? " *" : "  ";
      const strong = p["sdd-strong"] || p.strong;
      const mid = p["sdd-mid"] || p.mid || p.flash;
      const cheap = p["sdd-cheap"] || p.cheap || p.flash;
      console.log(`  ${mark} ${name}: strong=${strong}, mid=${mid}, cheap=${cheap}`);
    }
    const providerIds = profiles.providers && typeof profiles.providers === "object" ? Object.keys(profiles.providers) : [];
    if (providerIds.length > 0) {
      console.log(`\nProviders (${providerIds.length}) — custom entries declared:`);
      for (const id of providerIds) {
        const p = profiles.providers[id];
        console.log(`    ${id}: baseURL=${p.baseURL}, apiKeyEnv=${p.apiKeyEnv}, models=${(p.models || []).join(",")}`);
      }
    }
    const resolved = resolveModels(opts, profiles);
    const syncArgs = buildSyncArgs(roster, resolved, resolved.baseName);
    console.log(`\nNative sync args (gentle-ai sync --profile / --profile-phase):`);
    console.log(`  gentle-ai sync ${syncArgs.map((a) => (a.includes(" ") ? `"${a}"` : a)).join(" ")}`);
    const res = spawnSync(process.execPath, [APPLY_PATH, "--runtime", "list"], { stdio: "inherit" });
    if (res.status !== 0) process.exit(res.status ?? 1);
    return;
  }

  const resolved = resolveModels(opts, profiles);

  console.log(`\nset-models — tier resolution (base profile: "${resolved.baseName}")`);
  console.log(`  sdd-strong: ${resolved.strong}`);
  console.log(`  sdd-mid:    ${resolved.mid}`);
  console.log(`  sdd-cheap:  ${resolved.cheap}`);

  const prevCurrent = profiles.current;
  const edits = profileEditsFor(opts, profiles, resolved);
  if (edits.changed) {
    console.log("\nprofiles.json changes:");
    if (opts.profile && prevCurrent !== profiles.current) {
      console.log(`  [CHANGED] current: ${prevCurrent} -> ${profiles.current}`);
    }
    if (opts.profile || opts.all || opts.strong || opts.mid || opts.cheap || opts.flash) {
      if (opts.all || opts.strong) console.log(`  [CHANGED] profiles.${profiles.current}.strong -> ${resolved.strong}`);
      if (opts.all || opts.mid) console.log(`  [CHANGED] profiles.${profiles.current}.mid -> ${resolved.mid}`);
      if (opts.all || opts.cheap || opts.flash) console.log(`  [CHANGED] profiles.${profiles.current}.cheap -> ${resolved.cheap}`);
    }
    if (edits.saveProfile) {
      console.log(`  [CHANGED] profiles.${edits.saveProfile} -> { strong: ${resolved.strong}, mid: ${resolved.mid}, cheap: ${resolved.cheap} }`);
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
    writeFileSync(profilesPath, JSON.stringify(profiles, null, 2) + "\n");
    console.log(`\n✅ Wrote ${profilesPath}`);
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

// Only execute main when called directly (allows importing in tests)
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main();
}
