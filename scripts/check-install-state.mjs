#!/usr/bin/env node
/**
 * check-install-state.mjs — registry-based install-state gate (read-only).
 *
 * Compares every runtime skills directory against the catalog (skills are only
 * directories that contain SKILL.md) and the ownership registry at
 * `<home>/.skills-install/manifest.json`:
 *
 *   - missing      catalog skill absent from an installed runtime            -> error
 *   - unregistered catalog skill present but never recorded in the manifest  -> error
 *     (the "extracted without registration" failure mode)
 *   - foreign      runtime skill that is not part of the catalog             -> info
 *
 * This script never writes: no manifest, backup, or runtime file is touched.
 * Counts are compared against catalog-matching skills, not raw directory
 * counts, because runtime roots also hold foreign and infrastructure entries.
 *
 * Usage:
 *   node scripts/check-install-state.mjs [--strict] [--json]
 *     [--catalog <path>] [--home <path>] [--manifest <path>]
 *
 * Exit codes: 0 = pass (or non-strict findings); 1 = errors (strict / manifest unreadable); 2 = usage error.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, dirname, join, resolve, sep } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

let strict = false;
let jsonOut = false;
let catalogRoot = resolve(__dirname, ".."); // catalog root; NEVER process.cwd()
let home = homedir();
let manifestOverride = null;

const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--strict") strict = true;
  else if (a === "--json") jsonOut = true;
  else if (a === "--catalog") catalogRoot = resolve(args[++i]);
  else if (a === "--home") home = resolve(args[++i]);
  else if (a === "--manifest") manifestOverride = resolve(args[++i]);
  else if (a === "--help" || a === "-h") {
    printHelp();
    process.exit(0);
  } else {
    console.error(`Unknown argument: ${a}`);
    process.exit(2);
  }
}

const manifestPath = manifestOverride ?? join(home, ".skills-install", "manifest.json");

// Mirrors install-skills.mjs AGENT_TARGETS globalInstallPath(): <id> -> <home>/<rel>/skills
const RUNTIMES = [
  ["claude-code", ".claude"],
  ["opencode", ".config/opencode"],
  ["cursor", ".cursor"],
  ["copilot", ".copilot"],
  ["codex", ".codex"],
  ["gemini-cli", ".gemini"],
  ["antigravity", ".gemini/antigravity"],
  ["kiro", ".kiro"],
  ["windsurf", ".codeium/windsurf"],
  ["deepseek", ".deepseek"],
  ["dsh", ".agents"],
];

// Same exclusion contract as the catalog walk in install-skills.mjs / validate-skills.mjs.
const EXCLUDED = new Set(["copia-de-seguridad", "copia-de-seguridad-2", "node_modules", ".git", "gentle-ai-dsh", "_shared"]);
const isExcluded = (name) => EXCLUDED.has(name) || name.startsWith("copia-de-seguridad");

function printHelp() {
  console.log(`check-install-state.mjs — registry-based install-state gate (read-only)

Usage:
  node scripts/check-install-state.mjs [--strict] [--json]
    [--catalog <path>] [--home <path>] [--manifest <path>]

  --strict          Exit 1 when missing or unregistered skills exist.
  --json            Machine-readable report (stdout is JSON only).
  --catalog <path>  Catalog root to walk (default: this repo, from script location).
  --home <path>     Home containing runtime dirs and .skills-install (default: user home).
  --manifest <p>    Explicit manifest path (default: <home>/.skills-install/manifest.json).

Exit codes: 0 = pass; 1 = errors in strict mode / manifest unreadable; 2 = usage error.`);
}

function readDirSafe(dir) {
  try {
    return readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

/** Directories containing SKILL.md are skills. Docs and excluded dirs never count. */
export function collectCatalogSkills(root) {
  const out = [];
  const walk = (dir) => {
    for (const e of readDirSafe(dir)) {
      if (e.isDirectory()) {
        if (isExcluded(e.name)) continue;
        walk(join(dir, e.name));
      } else if (e.isFile() && e.name === "SKILL.md") {
        out.push(dir);
      }
    }
  };
  if (existsSync(root)) walk(root);
  return out;
}

function loadManifest(path) {
  if (!existsSync(path)) return { error: `no install manifest at ${path} — run install-skills.mjs first` };
  try {
    return { manifest: JSON.parse(readFileSync(path, "utf8")) };
  } catch (err) {
    return { error: `manifest at ${path} is unreadable (${err.message})` };
  }
}

function manifestGenerations(manifest) {
  return [...(manifest.previousGenerations || []), { generation: manifest.generation ?? 0, entries: manifest.entries || [] }];
}

/** Skill names ever owned by the manifest, per runtime (registration in any generation counts). */
function collectOwned(manifest, roots) {
  const owned = new Map(roots.map((r) => [r.id, new Set()]));
  for (const gen of manifestGenerations(manifest)) {
    for (const e of gen.entries || []) {
      if (!e.dest) continue;
      for (const r of roots) {
        const prefix = r.root + sep;
        if (!e.dest.startsWith(prefix)) continue;
        const parts = e.dest.slice(prefix.length).split(sep);
        if (e.kind === "symlink" && parts.length === 1) owned.get(r.id).add(parts[0]);
        else if (parts.length === 2 && parts[1] === "SKILL.md") owned.get(r.id).add(parts[0]);
        break;
      }
    }
  }
  return owned;
}

/** Skill dirs and infra dirs of one runtime root (one level; symlinked skills count as present). */
function scanRuntime(root) {
  const names = new Set();
  const infra = [];
  for (const e of readDirSafe(root)) {
    if (isExcluded(e.name)) {
      if (existsSync(join(root, e.name, "SKILL.md"))) infra.push(e.name);
      continue;
    }
    if ((e.isDirectory() || e.isSymbolicLink()) && existsSync(join(root, e.name, "SKILL.md"))) names.add(e.name);
  }
  return { names, infra };
}

function printList(marker, label, list) {
  if (!list.length) return;
  const shown = list.slice(0, 12).join(", ");
  console.log(`      ${marker} ${label} (${list.length}): ${shown}${list.length > 12 ? ` … +${list.length - 12} more` : ""}`);
}

const canonical = new Set(collectCatalogSkills(catalogRoot).map((d) => basename(d)));
const loaded = loadManifest(manifestPath);

if (loaded.error) {
  if (jsonOut) {
    console.log(
      JSON.stringify(
        { catalog: { root: catalogRoot, total: canonical.size }, manifest: { path: manifestPath, generation: null }, runtimes: [], summary: { errors: 1, pass: false, message: loaded.error } },
        null,
        2
      )
    );
  } else {
    console.error(`❌ ${loaded.error}`);
  }
  process.exitCode = 1;
} else {
  const manifest = loaded.manifest;
  const roots = RUNTIMES.map(([id, rel]) => ({ id, rel, root: join(home, rel, "skills") }));
  const owned = collectOwned(manifest, roots);

  let totalMissing = 0;
  let totalUnregistered = 0;
  let problemRuntimes = 0;
  const runtimes = [];

  for (const r of roots) {
    const present = existsSync(r.root);
    const { names, infra } = present ? scanRuntime(r.root) : { names: new Set(), infra: [] };
    const ownedHere = owned.get(r.id);
    const matched = [...names].filter((n) => canonical.has(n));
    const missing = present ? [...canonical].filter((n) => !names.has(n)).sort() : [];
    const unregistered = matched.filter((n) => !ownedHere.has(n)).sort();
    const foreign = [...names].filter((n) => !canonical.has(n)).sort();
    const errors = [];
    if (!present && ownedHere.size > 0) errors.push(`runtime root absent but the manifest owns ${ownedHere.size} skill(s) here`);
    if (present && missing.length) errors.push(`${missing.length} catalog skill(s) missing`);
    if (present && unregistered.length) errors.push(`${unregistered.length} catalog skill(s) extracted without registration`);
    if (errors.length) problemRuntimes++;
    totalMissing += missing.length;
    totalUnregistered += unregistered.length;
    runtimes.push({
      id: r.id,
      root: r.root,
      present,
      expected: canonical.size,
      observed: matched.length,
      missing,
      unregistered,
      foreign,
      infra,
      errors,
    });
  }

  const absentOwned = runtimes.filter((rt) => !rt.present && rt.errors.length > 0).length;
  const errorCount = totalMissing + totalUnregistered + absentOwned;
  const pass = errorCount === 0;

  if (jsonOut) {
    console.log(
      JSON.stringify(
        {
          catalog: { root: catalogRoot, total: canonical.size },
          manifest: { path: manifestPath, generation: manifest.generation ?? 0, tool: manifest.tool ?? null },
          runtimes,
          summary: { errors: errorCount, pass },
        },
        null,
        2
      )
    );
  } else {
    console.log(`🔎 Install-state gate — catalog: ${canonical.size} skills · manifest generation ${manifest.generation ?? 0} (tool: ${manifest.tool ?? "?"})`);
    console.log(`   home: ${home}`);
    console.log("");
    for (const rt of runtimes) {
      if (!rt.present) {
        console.log(`  ${rt.id.padEnd(14)} not installed (no skills root)`);
        continue;
      }
      const infraNote = rt.infra.length ? ` · infra ${rt.infra.length}` : "";
      console.log(
        `  ${rt.id.padEnd(14)} expected ${rt.expected} · observed ${rt.observed} · missing ${rt.missing.length} · unregistered ${rt.unregistered.length} · foreign ${rt.foreign.length}${infraNote}`
      );
      printList("✖", "unregistered without registry entry", rt.unregistered);
      printList("✖", "missing from runtime", rt.missing);
      printList("ℹ️", "foreign (info only)", rt.foreign);
    }
    console.log("");
    if (pass) {
      console.log("✅ PASS: every runtime matches the catalog and the install manifest (missing=0, unregistered=0).");
    } else {
      console.log(`❌ ${strict ? "FAIL (strict)" : "WARN (non-strict)"}: missing=${totalMissing} · unregistered=${totalUnregistered} · runtimes with problems=${problemRuntimes}`);
      console.log("   Next: node 00-meta-skills/skill-sync/scripts/install-skills.mjs --all-tools");
    }
  }

  process.exitCode = strict && !pass ? 1 : 0;
}
