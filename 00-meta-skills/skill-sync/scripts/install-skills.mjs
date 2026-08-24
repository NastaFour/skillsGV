#!/usr/bin/env node
/**
 * install-skills.mjs — Cross-tool skill installer
 *
 * Usage:
 *   node install-skills.mjs                                          # Install globally for detected tools
 *   node install-skills.mjs --target <path>                          # Install into a specific project
 *   node install-skills.mjs --target <path> --tool claude-code       # Install for one tool only
 *   node install-skills.mjs --symlink                                # Symlink instead of copy
 *   node install-skills.mjs --dry-run                                # Preview only
 *   node install-skills.mjs --only "04-backend,05-frontend"          # Filter by category
 *   node install-skills.mjs [--target <path>] --uninstall            # Remove only manifest-owned files
 *   node install-skills.mjs [--target <path>] --rollback             # Revert the last install generation
 *
 * Detects which agents are installed and creates the right folder structure for each.
 * Cross-platform: Windows uses junctions, macOS/Linux use symlinks.
 *
 * Ownership lifecycle: every install records what it created/overwrote in
 * `<target>/.skills-install/manifest.json`. Uninstall and rollback only ever touch
 * files whose current content still matches the manifest (user edits are retained),
 * and never touch foreign files planted alongside installed skills.
 */

import {
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  symlinkSync,
  lstatSync,
  copyFileSync,
  readFileSync,
  cpSync,
  writeFileSync,
  renameSync,
  rmSync,
  rmdirSync,
} from "node:fs";
import { dirname, join, relative, resolve, sep, basename } from "node:path";
import { homedir, platform } from "node:os";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CATALOG_ROOT = resolve(__dirname, "../../..");

const args = process.argv.slice(2);
let target = null;
let tool = null;
let useSymlink = false;
let dryRun = false;
let onlyCategories = null;
let skipDetect = false;
let doUninstall = false;
let doRollback = false;

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--target") target = resolve(args[++i]);
  else if (a === "--tool") tool = args[++i];
  else if (a === "--symlink") useSymlink = true;
  else if (a === "--dry-run") dryRun = true;
  else if (a === "--only") onlyCategories = args[++i].split(",").map((s) => s.trim());
  else if (a === "--all-tools") skipDetect = true;
  else if (a === "--uninstall") doUninstall = true;
  else if (a === "--rollback") doRollback = true;
  else if (a === "--help" || a === "-h") {
    printHelp();
    process.exit(0);
  } else {
    console.error(`Unknown argument: ${a}`);
    process.exit(2);
  }
}

if (doUninstall && doRollback) {
  console.error("--uninstall and --rollback are mutually exclusive.");
  process.exit(2);
}

const isWindows = platform() === "win32";

const AGENT_TARGETS = [
  {
    id: "claude-code",
    name: "Claude Code",
    detect: (h) => existsSync(join(h, ".claude")) || hasBinary("claude"),
    globalInstallPath: (h) => join(h, ".claude", "skills"),
    projectInstallPath: (target) => join(target, ".claude", "skills"),
  },
  {
    id: "opencode",
    name: "OpenCode",
    detect: (h) => existsSync(join(h, ".config", "opencode")) || hasBinary("opencode"),
    globalInstallPath: (h) => join(h, ".config", "opencode", "skills"),
    projectInstallPath: (target) => join(target, ".opencode", "skills"),
  },
  {
    id: "cursor",
    name: "Cursor",
    detect: (h) => existsSync(join(h, ".cursor")),
    globalInstallPath: (h) => join(h, ".cursor", "skills"),
    projectInstallPath: (target) => join(target, ".cursor", "skills"),
  },
  {
    id: "copilot",
    name: "GitHub Copilot (VS Code)",
    detect: (h) => existsSync(join(h, ".copilot")),
    globalInstallPath: (h) => join(h, ".copilot", "skills"),
    projectInstallPath: (target) => join(target, ".copilot", "skills"),
  },
  {
    id: "codex",
    name: "OpenAI Codex",
    detect: (h) => existsSync(join(h, ".codex")) || hasBinary("codex"),
    globalInstallPath: (h) => join(h, ".codex", "skills"),
    projectInstallPath: (target) => join(target, ".codex", "skills"),
  },
  {
    id: "gemini-cli",
    name: "Gemini CLI",
    detect: (h) => existsSync(join(h, ".gemini")) || hasBinary("gemini"),
    globalInstallPath: (h) => join(h, ".gemini", "skills"),
    projectInstallPath: (target) => join(target, ".gemini", "skills"),
  },
  {
    id: "antigravity",
    name: "Antigravity",
    detect: (h) => existsSync(join(h, ".gemini", "antigravity")),
    globalInstallPath: (h) => join(h, ".gemini", "antigravity", "skills"),
    projectInstallPath: (target) => join(target, ".gemini", "antigravity", "skills"),
  },
  {
    id: "kiro",
    name: "Kiro IDE",
    detect: (h) => existsSync(join(h, ".kiro")) || hasBinary("kiro"),
    globalInstallPath: (h) => join(h, ".kiro", "skills"),
    projectInstallPath: (target) => join(target, ".kiro", "skills"),
  },
  {
    id: "windsurf",
    name: "Windsurf",
    detect: (h) => existsSync(join(h, ".codeium", "windsurf")),
    globalInstallPath: (h) => join(h, ".codeium", "windsurf", "skills"),
    projectInstallPath: (target) => join(target, ".codeium", "windsurf", "skills"),
  },
  {
    id: "deepseek",
    name: "DeepSeek IDE (TUI)",
    detect: (h) => existsSync(join(h, ".deepseek")) || hasBinary("deepseek"),
    globalInstallPath: (h) => join(h, ".deepseek", "skills"),
    projectInstallPath: (target) => join(target, ".deepseek", "skills"),
  },
];

function hasBinary(name) {
  const pathSep = isWindows ? ";" : ":";
  const dirs = (process.env.PATH || "").split(pathSep);
  const exts = isWindows ? [".exe", ".cmd", ".bat", ""] : [""];
  for (const d of dirs) {
    for (const ext of exts) {
      const p = join(d, name + ext);
      try {
        if (existsSync(p) && statSync(p).isFile()) return true;
      } catch {}
    }
  }
  return false;
}

function printHelp() {
  console.log(`install-skills.mjs — Cross-tool skill installer

Usage:
  node install-skills.mjs [options]

Options:
  --target <path>      Install into a specific project directory (default: global install for detected tools)
  --tool <id>          Install for a specific tool only (claude-code, opencode, cursor, copilot, codex, gemini-cli, antigravity, kiro, windsurf, deepseek)
  --symlink            Use symlinks (junctions on Windows) instead of copy
  --dry-run            Preview changes without writing
  --only <list>        Comma-separated list of categories to install (e.g. "04-backend,05-frontend")
  --all-tools          Skip detection; install for all known tools
  --uninstall          Remove only files recorded as owned in the manifest (foreign or
                       user-edited files are retained and listed). Requires a manifest.
  --rollback           Revert the last install generation (restores overwritten previous
                       state, removes files that were new). Registered in manifest history.
  --help, -h           Show this help

Examples:
  # Install globally for all detected tools
  node install-skills.mjs

  # Install into a project for Claude Code and Cursor only
  node install-skills.mjs --target "C:\\\\trabajos\\\\superapp" --tool claude-code --tool cursor

  # Use symlinks for live editing
  node install-skills.mjs --target "C:\\\\trabajos\\\\superapp" --symlink

  # Preview what would happen
  node install-skills.mjs --dry-run
`);
}

function collectSkills(root) {
  const skills = [];
  const skipDirs = new Set(["copia-de-seguridad", "copia-de-seguridad-2", "node_modules", ".git"]);
  function isCategoryDir(relPath) {
    if (!onlyCategories) return true;
    const topFolder = relPath.split(sep)[0];
    return onlyCategories.includes(topFolder);
  }
  function walk(dir, rel) {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.isDirectory()) {
        if (skipDirs.has(e.name)) continue;
        const subRel = rel ? join(rel, e.name) : e.name;
        if (rel === "" && !isCategoryDir(subRel)) continue;
        walk(join(dir, e.name), subRel);
      } else if (e.isFile() && e.name === "SKILL.md") {
        skills.push(dir);
      }
    }
  }
  walk(root, "");
  return skills;
}

function copyDirSync(src, dest) {
  if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
  const entries = readdirSync(src, { withFileTypes: true });
  for (const e of entries) {
    const s = join(src, e.name);
    const d = join(dest, e.name);
    if (e.isDirectory()) {
      copyDirSync(s, d);
    } else if (e.isFile()) {
      copyFileSync(s, d);
    }
  }
}

// ---------------------------------------------------------------------------
// Ownership lifecycle (manifest, dry-run plan, uninstall, rollback)
// ---------------------------------------------------------------------------

const LIFECYCLE_ROOT = target || homedir();
const INSTALL_META_DIR = join(LIFECYCLE_ROOT, ".skills-install");
const MANIFEST_PATH = join(INSTALL_META_DIR, "manifest.json");
const BACKUPS_DIR = join(INSTALL_META_DIR, "backups");

function sha256File(p) {
  return createHash("sha256").update(readFileSync(p)).digest("hex");
}

function walkFiles(dir, rel = "") {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const r = rel ? join(rel, e.name) : e.name;
    if (e.isDirectory()) out.push(...walkFiles(join(dir, e.name), r));
    else if (e.isFile()) out.push({ abs: join(dir, e.name), rel: r });
  }
  return out.sort((a, b) => (a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0));
}

function loadManifest() {
  if (!existsSync(MANIFEST_PATH)) return null;
  try {
    return JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
  } catch (err) {
    console.error(`❌ Manifest at ${MANIFEST_PATH} is unreadable (${err.message}); refusing to act.`);
    process.exit(1);
  }
}

function saveManifest(mf) {
  // Atomic replace: write sibling tmp then rename over the manifest.
  const tmp = `${MANIFEST_PATH}.tmp-${process.pid}`;
  mkdirSync(INSTALL_META_DIR, { recursive: true });
  writeFileSync(tmp, JSON.stringify(mf, null, 2) + "\n", "utf8");
  renameSync(tmp, MANIFEST_PATH);
}

function backupPrevFile(absDest, generation, idx) {
  const dir = join(BACKUPS_DIR, `g${generation}`);
  mkdirSync(dir, { recursive: true });
  const name = `${idx}-${basename(absDest)}`;
  const dest = join(dir, name);
  copyFileSync(absDest, dest);
  return relative(INSTALL_META_DIR, dest);
}

function emptyManifest(mode) {
  return {
    version: 1,
    generation: 0,
    ts: null,
    tool: null,
    mode,
    entries: [],
    previousGenerations: [],
    history: [],
  };
}

/**
 * Copy one skill directory file-by-file, recording ownership entries.
 * Never wholesale-deletes the destination: pre-existing foreign files are left
 * untouched and never recorded as owned. Overwritten files get their previous
 * content backed up so --rollback can restore it.
 */
function installSkillTracked(srcSkillDir, destSkillsDir, generation, entriesAcc) {
  const skillName = basename(srcSkillDir);
  const dest = join(destSkillsDir, skillName);
  if (dryRun) {
    for (const f of walkFiles(srcSkillDir)) {
      const d = join(dest, f.rel);
      console.log(`  [dry-run] ${existsSync(d) ? "overwrite" : "create"} ${d}`);
    }
    return;
  }
  if (existsSync(dest)) {
    const stat = lstatSync(dest);
    if (stat.isSymbolicLink()) rmSync(dest, { force: true }); // swap old link; real dirs are copied over
  }
  const files = walkFiles(srcSkillDir);
  const firstOwn = entriesAcc.length;
  for (const f of files) {
    const d = join(dest, f.rel);
    mkdirSync(dirname(d), { recursive: true });
    let prevState = "new";
    let prevSha256;
    let prevBackup;
    if (existsSync(d)) {
      prevState = "overwritten";
      prevSha256 = sha256File(d);
      prevBackup = backupPrevFile(d, generation, entriesAcc.length + 1);
    }
    copyFileSync(f.abs, d);
    entriesAcc.push({
      dest: d,
      src: f.abs,
      sha256: null, // hashed after post-copy fixups below
      prevState,
      ...(prevSha256 ? { prevSha256 } : {}),
      ...(prevBackup ? { prevBackup } : {}),
    });
  }
  fixSharedImports(dest);
  fixCrossSkillRefs(dest);
  for (let i = firstOwn; i < entriesAcc.length; i++) {
    const e = entriesAcc[i];
    if (existsSync(e.dest)) e.sha256 = sha256File(e.dest);
  }
  console.log(`  ✅ copied: ${skillName} (${files.length} files owned)`);
}

/** Record a completed run as a new generation in the manifest. */
function commitGeneration(toolIds, mode, entries, nextGen) {
  if (dryRun || entries.length === 0) return;
  const mf = loadManifest() || emptyManifest(mode);
  if (mf.generation > 0 && Array.isArray(mf.entries) && mf.entries.length > 0) {
    mf.previousGenerations.push({
      generation: mf.generation,
      ts: mf.ts,
      tool: mf.tool,
      mode: mf.mode,
      entries: mf.entries,
    });
  }
  mf.generation = nextGen;
  mf.ts = new Date().toISOString();
  mf.tool = toolIds.join("+");
  mf.mode = mode;
  mf.entries = entries;
  saveManifest(mf);
  console.log(`\n🗂️  generation ${mf.generation} recorded in ${MANIFEST_PATH} (${entries.length} files owned)`);
}

/** All files ever owned, keyed by dest; latest record wins. */
function collectOwned(mf) {
  const byDest = new Map();
  for (const gen of mf.previousGenerations || []) {
    for (const e of gen.entries) byDest.set(e.dest, e);
  }
  for (const e of mf.entries || []) byDest.set(e.dest, e);
  return [...byDest.values()];
}

function linkExists(p) {
  try {
    lstatSync(p);
    return true;
  } catch {
    return false;
  }
}

function removeFileOwned(entry, stats, action) {
  if (entry.kind === "symlink") {
    if (!linkExists(entry.dest)) return;
    rmSync(entry.dest, { force: true });
    stats.removed++;
    console.log(`  🗑️  ${action} symlink: ${entry.dest}`);
    return;
  }
  if (!existsSync(entry.dest)) return;
  if (sha256File(entry.dest) !== entry.sha256) {
    stats.retained.push(entry.dest);
    console.log(`  🔒 retained (edited since install): ${entry.dest}`);
    return;
  }
  rmSync(entry.dest, { force: true });
  stats.removed++;
  console.log(`  🗑️  ${action}: ${entry.dest}`);
}

/** Remove directories that became empty under the skills roots we cleaned. */
function pruneEmptyDirs(dirs) {
  const sorted = [...new Set(dirs)].sort((a, b) => b.length - a.length); // deepest first
  for (const d of sorted) {
    try {
      rmdirSync(d); // only succeeds when empty
    } catch {}
  }
}

function parentDirsOf(filePaths, stopAt) {
  const dirs = [];
  for (const p of filePaths) {
    let d = dirname(p);
    while (d.startsWith(stopAt) && d !== stopAt && d.length > stopAt.length) {
      dirs.push(d);
      d = dirname(d);
    }
  }
  return dirs;
}

/**
 * Files currently living under the installed skills roots that the manifest
 * never owned (foreign skills planted by the user, or stray files inside the
 * skills tree). Read-only discovery: uninstall lists them so the operator can
 * decide, but never deletes them — that is the ownership-lifecycle promise.
 */
function discoverForeignFiles(ownedDests) {
  const foreign = [];
  const roots = new Set();
  for (const agent of AGENT_TARGETS) {
    const root = target ? agent.projectInstallPath(target) : agent.globalInstallPath(homedir());
    if (existsSync(root)) roots.add(root);
  }
  for (const root of roots) {
    for (const f of walkFiles(root)) {
      if (!ownedDests.has(f.abs)) foreign.push(f.abs);
    }
  }
  return foreign;
}

function cmdUninstall() {
  const mf = loadManifest();
  if (!mf) {
    console.error(`❌ No manifest at ${MANIFEST_PATH}; nothing identifiable to uninstall. Aborting without deleting anything.`);
    process.exit(1);
  }
  console.log("🧹 Uninstall (manifest-owned files only)\n");
  const owned = collectOwned(mf);
  const ownedDests = new Set(owned.map((o) => o.dest));
  const stats = { removed: 0, retained: [], foreign: [] };
  if (dryRun) {
    for (const e of owned) {
      const gone = e.kind === "symlink" ? !linkExists(e.dest) : !existsSync(e.dest);
      const keep = !gone && e.kind !== "symlink" && sha256File(e.dest) !== e.sha256;
      console.log(`  [dry-run] ${gone ? "already absent" : keep ? "retain (edited)" : "delete"} ${e.dest}`);
    }
    for (const p of discoverForeignFiles(ownedDests)) {
      console.log(`  [dry-run] retain (foreign) ${p}`);
    }
    console.log(`\n✨ Dry-run complete. No changes written.`);
    return;
  }
  for (const e of owned) removeFileOwned(e, stats, "uninstalled");
  stats.foreign = discoverForeignFiles(ownedDests);
  pruneEmptyDirs(parentDirsOf(stats.removed ? owned.map((o) => o.dest) : [], LIFECYCLE_ROOT));
  mf.history.push({
    type: "uninstall",
    ts: new Date().toISOString(),
    removed: stats.removed,
    retained: stats.retained.length,
    foreign: stats.foreign.length,
  });
  saveManifest(mf);
  if (stats.retained.length || stats.foreign.length) {
    console.log(`\n🔒 Retained foreign/user-edited files (${stats.retained.length + stats.foreign.length}):`);
    for (const p of [...stats.retained, ...stats.foreign]) console.log(`   - ${p}`);
  }
  console.log(`\n✨ Uninstalled ${stats.removed} owned file(s)/link(s).`);
}

function cmdRollback() {
  const mf = loadManifest();
  if (!mf) {
    console.error(`❌ No manifest at ${MANIFEST_PATH}; no generation to roll back. Aborting without deleting anything.`);
    process.exit(1);
  }
  if (!mf.entries || mf.entries.length === 0) {
    console.log("Nothing to roll back: no active generation in the manifest.");
    return;
  }
  const rolledGeneration = mf.generation;
  console.log(`⏪ Rollback of generation ${rolledGeneration}\n`);
  const stats = { restored: 0, removed: 0, retained: [] };
  for (const e of mf.entries) {
    if (dryRun) {
      console.log(`  [dry-run] ${e.prevState === "overwritten" ? "restore previous content of" : "delete"} ${e.dest}`);
      continue;
    }
    if (e.kind === "symlink") {
      if (existsSync(e.dest)) rmSync(e.dest, { force: true });
      stats.removed++;
      continue;
    }
    if (e.prevState === "new") {
      removeFileOwned(e, stats, "rollback-removed");
      continue;
    }
    // overwritten: restore previous content from backup when untouched.
    if (!existsSync(e.dest)) continue;
    if (sha256File(e.dest) !== e.sha256) {
      stats.retained.push(e.dest);
      console.log(`  🔒 retained (edited since install): ${e.dest}`);
      continue;
    }
    const backupPath = join(INSTALL_META_DIR, e.prevBackup);
    if (!existsSync(backupPath)) {
      console.warn(`  ⚠️  backup missing, kept as-is: ${e.dest}`);
      continue;
    }
    copyFileSync(backupPath, e.dest);
    rmSync(backupPath, { force: true });
    stats.restored++;
    console.log(`  ♻️  restored previous content: ${e.dest}`);
  }
  if (dryRun) {
    console.log(`\n✨ Dry-run complete. No changes written.`);
    return;
  }
  mf.history.push({
    type: "rollback",
    ts: new Date().toISOString(),
    generation: rolledGeneration,
    restored: stats.restored,
    removed: stats.removed,
    retained: stats.retained.length,
  });
  const prev = (mf.previousGenerations || []).pop();
  if (prev) {
    mf.generation = prev.generation;
    mf.ts = prev.ts;
    mf.tool = prev.tool;
    if (prev.mode) mf.mode = prev.mode; // restored generation keeps its own install mode
    mf.entries = prev.entries;
  } else {
    mf.generation = 0;
    mf.ts = null;
    mf.tool = null;
    mf.entries = [];
  }
  saveManifest(mf);
  console.log(
    `\n✨ Rollback done: ${stats.restored} restored, ${stats.removed} removed, ${stats.retained.length} retained. Manifest back to generation ${mf.generation}.`
  );
}

function fixSharedImports(skillDestDir) {
  const scriptsDir = join(skillDestDir, "scripts");
  if (!existsSync(scriptsDir)) return;
  let changed = 0;
  for (const e of readdirSync(scriptsDir, { withFileTypes: true })) {
    if (!e.isFile() || !e.name.endsWith(".mjs")) continue;
    const p = join(scriptsDir, e.name);
    const src = readFileSync(p, "utf8");
    const rewritten = src
      .split('"../../../_shared/').join('"../../_shared/')
      .split("'../../../_shared/").join("'../../_shared/");
    if (rewritten !== src) {
      writeFileSync(p, rewritten);
      changed++;
    }
  }
  if (changed) console.log(`  🔧 rewrote _shared imports in ${changed} script(s)`);
}

function fixCrossSkillRefs(skillDestDir) {
  const skillFile = join(skillDestDir, "SKILL.md");
  if (!existsSync(skillFile)) return;
  const src = readFileSync(skillFile, "utf8");
  const rewritten = src
    .replace(
      /\.\.\/\.\.\/\d{2}-[a-z-]+\/([a-z0-9-]+)\/SKILL\.md/g,
      "../$1/SKILL.md"
    )
    .replace(
      /\.\.\/\.\.\/professional-planner\/SKILL\.md/g,
      "../professional-planner/SKILL.md"
    );
  if (rewritten !== src) {
    writeFileSync(skillFile, rewritten);
    console.log(`  🔧 flattened cross-skill references in SKILL.md`);
  }
}

function installSkill(srcSkillDir, destSkillsDir, generation, entriesAcc) {
  const skillName = basename(srcSkillDir);
  const dest = join(destSkillsDir, skillName);
  if (useSymlink) {
    if (dryRun) {
      console.log(`  [dry-run] ${srcSkillDir} -> ${dest}`);
      return;
    }
    let prevState = "new";
    if (existsSync(dest)) {
      const stat = lstatSync(dest);
      if (stat.isSymbolicLink()) {
        prevState = "overwritten";
        rmSync(dest, { force: true });
      } else {
        // Never wipe a real directory just to place a link: owned files must be
        // uninstalled through the manifest first.
        console.warn(`  ⚠️  ${skillName}: destination exists as a real directory; skipped. Run --uninstall first.`);
        return;
      }
    }
    try {
      symlinkSync(srcSkillDir, dest, isWindows ? "junction" : "dir");
      entriesAcc.push({ dest, src: srcSkillDir, sha256: null, kind: "symlink", prevState });
      console.log(`  ✅ symlink: ${skillName}`);
    } catch (err) {
      console.warn(`  ⚠️  symlink failed for ${skillName}, falling back to copy: ${err.message}`);
      installSkillTracked(srcSkillDir, destSkillsDir, generation, entriesAcc);
      return;
    }
  } else {
    installSkillTracked(srcSkillDir, destSkillsDir, generation, entriesAcc);
  }
}

function main() {
  if (doUninstall) {
    cmdUninstall();
    return;
  }
  if (doRollback) {
    cmdRollback();
    return;
  }

  console.log("📦 Skill Installer (Cross-Tool Distribution)\n");
  console.log(`Catalog: ${CATALOG_ROOT}`);
  console.log(`Platform: ${platform()}`);
  console.log(`Mode: ${useSymlink ? "symlink" : "copy"}${dryRun ? " (dry-run)" : ""}\n`);

  const home = homedir();
  const detected = skipDetect
    ? AGENT_TARGETS
    : AGENT_TARGETS.filter((t) => {
        try {
          return t.detect(home);
        } catch {
          return false;
        }
      });

  const filtered = tool ? detected.filter((t) => t.id === tool) : detected;
  if (filtered.length === 0) {
    console.log("❌ No matching tools detected.");
    if (!tool) {
      console.log("   Use --all-tools to install for all known tools.");
      console.log("   Or specify --tool <id> for a specific tool.");
    }
    process.exit(0);
  }

  const currentMf = loadManifest();
  const nextGen = (currentMf && currentMf.generation ? currentMf.generation : 0) + 1;
  const entriesAcc = [];

  console.log(`🔍 Detected ${filtered.length} tool(s): ${filtered.map((t) => t.name).join(", ")}\n`);

  const skills = collectSkills(CATALOG_ROOT);
  console.log(`📚 Found ${skills.length} skills in catalog${onlyCategories ? ` (filtered to: ${onlyCategories.join(", ")})` : ""}\n`);

  for (const agent of filtered) {
    const installPath = target ? agent.projectInstallPath(target) : agent.globalInstallPath(home);
    console.log(`\n→ ${agent.name}${target ? ` (project: ${target})` : " (global)"}`);
    console.log(`  target: ${installPath}`);

    if (!dryRun && !existsSync(dirname(installPath))) {
      try {
        mkdirSync(dirname(installPath), { recursive: true });
        console.log(`  📁 created parent: ${dirname(installPath)}`);
      } catch (err) {
        console.error(`  ❌ cannot create parent: ${err.message}`);
        continue;
      }
    }

    for (const skillDir of skills) {
      try {
        installSkill(skillDir, installPath, nextGen, entriesAcc);
      } catch (err) {
        console.error(`  ❌ ${basename(skillDir)}: ${err.message}`);
      }
    }

    if (!useSymlink) {
      const sharedSrc = join(CATALOG_ROOT, "_shared");
      if (existsSync(sharedSrc)) {
        const sharedDest = join(installPath, "_shared");
        if (dryRun) {
          for (const f of walkFiles(sharedSrc)) {
            const d = join(sharedDest, f.rel);
            console.log(`  [dry-run] ${existsSync(d) ? "overwrite" : "create"} ${d}`);
          }
        } else {
          installSkillTracked(sharedSrc, installPath, nextGen, entriesAcc);
          console.log(`  ✅ copied: _shared (shared script resources)`);
        }
      }
    }
  }

  if (dryRun) {
    console.log(`\n✨ Dry-run plan complete (create/overwrite lines above). No changes written.`);
    return;
  }

  commitGeneration(
    filtered.map((t) => t.id),
    useSymlink ? "symlink" : "copy",
    entriesAcc,
    nextGen
  );
  console.log(`\n✨ Done. Restart your AI tools to load the new skills.`);
}

main();
