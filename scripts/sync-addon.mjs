#!/usr/bin/env node
/**
 * sync-addon.mjs — Mirror sync & parity gate for gentle-ai-dsh addon
 *
 * Requirements (spec: installer-lifecycle):
 * - Resolves roots from __dirname (never process.cwd()).
 * - Reads canonical skills using catalog-manifest walkSkillPaths (excludes _shared, gentle-ai-dsh).
 * - Flat mirror structure: gentle-ai-dsh/skills/<skill-name>/...
 * - --check: read-only parity check; fails (exit 1) if there is any content divergence,
 *   missing skill, or orphan skill in the mirror. Coverage is explicit:
 *   1. every canonical skill exists in the mirror with byte-identical files;
 *   2. skill-like orphan directories (dirs with SKILL.md absent from the catalog) fail;
 *   3. `_shared/**` union: every canonical `_shared` file exists in the mirror
 *      with byte-identical content; mirror-only `_shared` files are allowed
 *      (curated addon extras) and are never removed.
 * - --write: mechanically synchronizes all 210 canonical skills to gentle-ai-dsh/skills/,
 *   removing extra/orphan files and skill-like orphan directories, and copies every
 *   canonical `_shared` file to the mirror (union), achieving byte parity. Mirror-only
 *   `_shared` files are kept.
 * - Safety: the mirror root MUST live under the catalog root; the catalog root itself,
 *   its ancestors and any outside path are rejected (exit 2) before any mutation.
 *   Orphan directories are purged only when they look like mirror skills (SKILL.md).
 *
 * Usage:
 *   node scripts/sync-addon.mjs --check [--json]
 *   node scripts/sync-addon.mjs --write [--json]
 *   node scripts/sync-addon.mjs [--catalog <path>] [--mirror <path>] (--check|--write)
 *
 * Exit codes:
 *   0 = pass (--check in sync, or --write successful)
 *   1 = divergence found in --check
 *   2 = invalid arguments / unsafe mirror root
 */

import {
  existsSync,
  readdirSync,
  readFileSync,
  copyFileSync,
  mkdirSync,
  rmSync,
  rmdirSync,
} from "node:fs";
import { dirname, join, resolve, basename, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { walkSkillPaths } from "../_shared/catalog-manifest.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const DEFAULT_CATALOG_ROOT = resolve(__dirname, "..");
export const DEFAULT_MIRROR_ROOT = resolve(DEFAULT_CATALOG_ROOT, "gentle-ai-dsh", "skills");

/** Case-tolerant comparison on Windows; exact elsewhere. */
const samePath = (a, b) =>
  process.platform === "win32" ? a.toLowerCase() === b.toLowerCase() : a === b;
const underPath = (child, parent) =>
  process.platform === "win32"
    ? child.toLowerCase().startsWith((parent + sep).toLowerCase())
    : child.startsWith(parent + sep);

/**
 * Safety gate for the mirror root: it MUST live strictly under the catalog
 * root. The catalog root itself, its ancestors, and any path outside the
 * catalog (repo root, home, filesystem root) are rejected before any mutation.
 * Returns the resolved roots or throws an Error with the reason.
 */
export function assertSafeMirrorRoot(catalogRoot = DEFAULT_CATALOG_ROOT, mirrorRoot = DEFAULT_MIRROR_ROOT) {
  const cat = resolve(catalogRoot);
  const mir = resolve(mirrorRoot);
  if (samePath(mir, cat)) {
    throw new Error(`unsafe mirror root "${mir}": it is the catalog root itself`);
  }
  if (underPath(cat, mir)) {
    throw new Error(`unsafe mirror root "${mir}": it contains the catalog root "${cat}"`);
  }
  if (!underPath(mir, cat)) {
    throw new Error(`unsafe mirror root "${mir}": it is outside the catalog root "${cat}"`);
  }
  return { catalogRoot: cat, mirrorRoot: mir };
}

/**
 * Recursively walks a directory and returns an array of { rel, full } for all files.
 * Relative paths use forward slashes (POSIX style) for cross-platform comparison.
 */
export function walkFilesRecursive(dir, base = "") {
  const out = [];
  if (!existsSync(dir)) return out;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name === ".git" || e.name === "node_modules") continue;
    const rel = base ? `${base}/${e.name}` : e.name;
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...walkFilesRecursive(full, rel));
    } else if (e.isFile()) {
      out.push({ rel, full });
    }
  }
  return out;
}

/**
 * Discovers all canonical skills from the catalog root.
 * Returns a Map<skillName, { skillName, canonicalDir, relSkillMdPath }>
 */
export function getCanonicalSkills(catalogRoot) {
  const skillPaths = walkSkillPaths(catalogRoot);
  const skills = new Map();
  for (const relSkillMdPath of skillPaths) {
    const fullSkillMdPath = join(catalogRoot, relSkillMdPath);
    const canonicalDir = dirname(fullSkillMdPath);
    const skillName = basename(canonicalDir);
    skills.set(skillName, {
      skillName,
      canonicalDir,
      relSkillMdPath,
    });
  }
  return skills;
}

/**
 * Discovers the skill directories currently present in the mirror directory.
 * Ignores _shared (support folder) and dot-directories. Only directories that
 * contain a SKILL.md are considered mirror skills, so purges never touch
 * non-skill directories (docs, caches, user extras).
 * Returns a Map<skillName, mirrorDir>
 */
export function getMirrorSkills(mirrorRoot) {
  const skills = new Map();
  if (!existsSync(mirrorRoot)) return skills;
  const entries = readdirSync(mirrorRoot, { withFileTypes: true });
  for (const e of entries) {
    if (!e.isDirectory() || e.name === "_shared" || e.name.startsWith(".")) continue;
    if (!existsSync(join(mirrorRoot, e.name, "SKILL.md"))) continue;
    skills.set(e.name, join(mirrorRoot, e.name));
  }
  return skills;
}

/**
 * `_shared/**` union between the canonical catalog and the mirror.
 * Every canonical file under `_shared/**` MUST exist in the mirror with
 * byte-identical content (the mirror ships scripts that import these modules).
 * Mirror-only files are allowed addon extras; they are reported and preserved.
 * Returns {
 *   canonicalFiles, mirrorFiles,
 *   missing:    canonical rel paths absent from the mirror,
 *   divergent:  canonical rel paths present in both with different bytes,
 *   mirrorOnly: mirror rel paths with no canonical counterpart,
 *   entries:    [{ rel, canonicalFull, mirrorFull|null }] for every canonical file,
 * }
 */
export function sharedUnion(catalogRoot, mirrorRoot) {
  const canonicalFiles = walkFilesRecursive(join(catalogRoot, "_shared"));
  const mirrorFiles = walkFilesRecursive(join(mirrorRoot, "_shared"));
  const mirrorMap = new Map(mirrorFiles.map((f) => [f.rel, f.full]));
  const entries = [];
  const missing = [];
  const divergent = [];
  for (const f of canonicalFiles) {
    const mirrorFull = mirrorMap.get(f.rel) || null;
    entries.push({ rel: f.rel, canonicalFull: f.full, mirrorFull });
    if (!mirrorFull) {
      missing.push(f.rel);
    } else if (Buffer.compare(readFileSync(f.full), readFileSync(mirrorFull)) !== 0) {
      divergent.push(f.rel);
    }
  }
  const canonicalRels = new Set(canonicalFiles.map((f) => f.rel));
  const mirrorOnly = mirrorFiles.filter((f) => !canonicalRels.has(f.rel)).map((f) => f.rel);
  return {
    canonicalFiles: canonicalFiles.length,
    mirrorFiles: mirrorFiles.length,
    missing,
    divergent,
    mirrorOnly,
    entries,
  };
}

/**
 * Compares the canonical catalog against the mirror.
 * Returns { pass, missingSkills, orphanSkills, skillDivergences, totalCanonicalSkills, totalMirrorSkills }
 */
export function checkMirror(catalogRoot = DEFAULT_CATALOG_ROOT, mirrorRoot = DEFAULT_MIRROR_ROOT) {
  assertSafeMirrorRoot(catalogRoot, mirrorRoot);
  const canonicalMap = getCanonicalSkills(catalogRoot);
  const mirrorMap = getMirrorSkills(mirrorRoot);

  const missingSkills = [];
  const orphanSkills = [];
  const skillDivergences = [];

  // 1. Missing skills in mirror
  for (const skillName of canonicalMap.keys()) {
    if (!mirrorMap.has(skillName)) {
      missingSkills.push(skillName);
    }
  }

  // 2. Orphan skills in mirror
  for (const mirrorName of mirrorMap.keys()) {
    if (!canonicalMap.has(mirrorName)) {
      orphanSkills.push(mirrorName);
    }
  }

  // 3. File content / presence divergence in skills present in both
  for (const [skillName, canonicalInfo] of canonicalMap.entries()) {
    if (!mirrorMap.has(skillName)) continue;
    const mirrorDir = mirrorMap.get(skillName);

    const canonicalFiles = walkFilesRecursive(canonicalInfo.canonicalDir);
    const mirrorFiles = walkFilesRecursive(mirrorDir);

    const canonicalFileMap = new Map(canonicalFiles.map((f) => [f.rel, f.full]));
    const mirrorFileMap = new Map(mirrorFiles.map((f) => [f.rel, f.full]));

    const missingInMirror = [];
    const extraInMirror = [];
    const modified = [];

    for (const [rel, full] of canonicalFileMap.entries()) {
      if (!mirrorFileMap.has(rel)) {
        missingInMirror.push(rel);
      } else {
        const mirrorFull = mirrorFileMap.get(rel);
        const canBuf = readFileSync(full);
        const mirBuf = readFileSync(mirrorFull);
        if (Buffer.compare(canBuf, mirBuf) !== 0) {
          modified.push(rel);
        }
      }
    }

    for (const rel of mirrorFileMap.keys()) {
      if (!canonicalFileMap.has(rel)) {
        extraInMirror.push(rel);
      }
    }

    if (missingInMirror.length > 0 || extraInMirror.length > 0 || modified.length > 0) {
      skillDivergences.push({
        skillName,
        missingInMirror,
        extraInMirror,
        modified,
      });
    }
  }

  const shared = sharedUnion(catalogRoot, mirrorRoot);

  const pass =
    missingSkills.length === 0 &&
    orphanSkills.length === 0 &&
    skillDivergences.length === 0 &&
    shared.missing.length === 0 &&
    shared.divergent.length === 0;

  return {
    pass,
    missingSkills,
    orphanSkills,
    skillDivergences,
    sharedUnion: {
      canonicalFiles: shared.canonicalFiles,
      mirrorFiles: shared.mirrorFiles,
      filesChecked: shared.canonicalFiles,
      missing: shared.missing,
      divergences: shared.divergent,
      mirrorOnly: shared.mirrorOnly,
    },
    totalCanonicalSkills: canonicalMap.size,
    totalMirrorSkills: mirrorMap.size,
  };
}

/**
 * Recursively removes empty subdirectories inside a directory.
 */
function cleanupEmptyDirs(dir) {
  if (!existsSync(dir)) return;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) {
      const sub = join(dir, e.name);
      cleanupEmptyDirs(sub);
    }
  }
  const remaining = readdirSync(dir);
  if (remaining.length === 0) {
    try {
      rmdirSync(dir);
    } catch {}
  }
}

/**
 * Synchronizes canonical skills into the mirror directory.
 * Returns stats on files copied, deleted, skills created, and orphans removed.
 */
export function syncMirror(catalogRoot = DEFAULT_CATALOG_ROOT, mirrorRoot = DEFAULT_MIRROR_ROOT) {
  assertSafeMirrorRoot(catalogRoot, mirrorRoot);
  const canonicalMap = getCanonicalSkills(catalogRoot);
  const mirrorMap = getMirrorSkills(mirrorRoot);

  if (!existsSync(mirrorRoot)) {
    mkdirSync(mirrorRoot, { recursive: true });
  }

  let copiedFiles = 0;
  let deletedFiles = 0;
  let createdSkills = 0;
  let removedOrphanSkills = 0;

  // 1. Sync all canonical skills to mirror
  for (const [skillName, canonicalInfo] of canonicalMap.entries()) {
    const mirrorDir = join(mirrorRoot, skillName);
    if (!existsSync(mirrorDir)) {
      mkdirSync(mirrorDir, { recursive: true });
      createdSkills++;
    }

    const canonicalFiles = walkFilesRecursive(canonicalInfo.canonicalDir);
    const mirrorFiles = walkFilesRecursive(mirrorDir);

    const canonicalFileMap = new Map(canonicalFiles.map((f) => [f.rel, f.full]));
    const mirrorFileMap = new Map(mirrorFiles.map((f) => [f.rel, f.full]));

    // Copy new or modified files
    for (const [rel, srcFull] of canonicalFileMap.entries()) {
      const destFull = join(mirrorDir, rel);
      let needsCopy = false;
      if (!existsSync(destFull)) {
        needsCopy = true;
      } else {
        const srcBuf = readFileSync(srcFull);
        const destBuf = readFileSync(destFull);
        if (Buffer.compare(srcBuf, destBuf) !== 0) {
          needsCopy = true;
        }
      }

      if (needsCopy) {
        mkdirSync(dirname(destFull), { recursive: true });
        copyFileSync(srcFull, destFull);
        copiedFiles++;
      }
    }

    // Delete mirror files that no longer exist in canonical
    for (const [rel, destFull] of mirrorFileMap.entries()) {
      if (!canonicalFileMap.has(rel)) {
        rmSync(destFull, { force: true });
        deletedFiles++;
      }
    }

    cleanupEmptyDirs(mirrorDir);
  }

  // 2. Remove orphan skill directories from mirror (skill-like dirs only,
  //    excluding _shared and non-skill directories)
  for (const [orphanName, orphanDir] of mirrorMap.entries()) {
    if (!canonicalMap.has(orphanName)) {
      rmSync(orphanDir, { recursive: true, force: true });
      removedOrphanSkills++;
    }
  }

  // 3. Sync `_shared/**` as a union: every canonical file is copied to the
  //    mirror (byte-identical after --write), including canonical-only modules
  //    the mirror scripts import; mirror-only files are kept untouched.
  const shared = sharedUnion(catalogRoot, mirrorRoot);
  let sharedFilesCopied = 0;
  for (const f of shared.entries) {
    if (f.mirrorFull && Buffer.compare(readFileSync(f.canonicalFull), readFileSync(f.mirrorFull)) === 0) {
      continue;
    }
    const dest = join(mirrorRoot, "_shared", f.rel);
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(f.canonicalFull, dest);
    sharedFilesCopied++;
  }

  return {
    canonicalCount: canonicalMap.size,
    copiedFiles,
    deletedFiles,
    createdSkills,
    removedOrphanSkills,
    sharedFilesChecked: shared.canonicalFiles,
    sharedFilesCopied,
    sharedMirrorOnly: shared.mirrorOnly.length,
  };
}

function printHelp() {
  console.log(`sync-addon.mjs — Mirror sync & parity gate for gentle-ai-dsh addon

Usage:
  node scripts/sync-addon.mjs --check [--json]
  node scripts/sync-addon.mjs --write [--json]
  node scripts/sync-addon.mjs [--catalog <path>] [--mirror <path>] (--check|--write)

Options:
  --check            Read-only check comparing canonical catalog against the mirror.
                     Coverage: (1) every canonical skill present and byte-identical;
                     (2) skill-like orphan dirs (containing SKILL.md) fail;
                     (3) _shared/** union: every canonical _shared file MUST be present
                     and byte-identical in the mirror (mirror-only _shared files are
                     allowed extras and reported).
                     Exits with code 1 if divergences are found, 0 if in sync.
  --write            Mechanically synchronizes canonical skills to the mirror and copies
                     every canonical _shared file (union); mirror-only _shared files are kept.
  --catalog <path>   Override canonical catalog root (defaults to parent of scripts/).
  --mirror <path>    Override addon mirror root (defaults to gentle-ai-dsh/skills/). The
                     mirror MUST live under the catalog root; the catalog root itself, its
                     ancestors and any path outside it are rejected (exit 2).
  --json             Output results as machine-readable JSON.
  --help, -h         Show this help message.
`);
}

export function runCli(argv = process.argv.slice(2)) {
  let mode = null;
  let jsonOut = false;
  let catalogRoot = DEFAULT_CATALOG_ROOT;
  let mirrorRoot = DEFAULT_MIRROR_ROOT;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--check") mode = "check";
    else if (a === "--write") mode = "write";
    else if (a === "--json") jsonOut = true;
    else if (a === "--catalog") catalogRoot = resolve(argv[++i]);
    else if (a === "--mirror") mirrorRoot = resolve(argv[++i]);
    else if (a === "--help" || a === "-h") {
      printHelp();
      return 0;
    } else {
      console.error(`[sync-addon] Unknown argument: ${a}`);
      printHelp();
      return 2;
    }
  }

  if (!mode) {
    console.error("[sync-addon] ERROR: Must specify either --check or --write");
    printHelp();
    return 2;
  }

  // Fail closed before any read/write when the mirror root is unsafe.
  try {
    assertSafeMirrorRoot(catalogRoot, mirrorRoot);
  } catch (err) {
    console.error(`[sync-addon] ERROR: ${err.message}`);
    return 2;
  }

  if (mode === "check") {
    const res = checkMirror(catalogRoot, mirrorRoot);
    const coverage =
      `${res.totalCanonicalSkills} canonical skills (byte parity) · ` +
      `_shared/** union: ${res.sharedUnion.filesChecked} canonical file(s) checked ` +
      `(presence + byte-parity required; ${res.sharedUnion.mirrorOnly.length} mirror-only file(s) allowed)`;
    if (jsonOut) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      if (res.pass) {
        console.log(
          `[sync-addon] PASS: ${res.totalCanonicalSkills} skills in full parity between canonical catalog and addon mirror.`
        );
        console.log(`[sync-addon] Coverage: ${coverage}`);
      } else {
        console.error(
          `[sync-addon] FAIL: Divergence detected between canonical catalog (${res.totalCanonicalSkills} skills) and addon mirror (${res.totalMirrorSkills} skills):`
        );
        console.error(`[sync-addon] Coverage: ${coverage}`);
        if (res.missingSkills.length > 0) {
          console.error(`  Missing skills in mirror (${res.missingSkills.length}):`);
          for (const s of res.missingSkills) console.error(`    - ${s}`);
        }
        if (res.orphanSkills.length > 0) {
          console.error(`  Orphan skills in mirror (${res.orphanSkills.length}):`);
          for (const s of res.orphanSkills) console.error(`    - ${s}`);
        }
        if (res.skillDivergences.length > 0) {
          console.error(`  Content divergences in ${res.skillDivergences.length} skill(s):`);
          for (const d of res.skillDivergences) {
            console.error(`    - ${d.skillName}:`);
            for (const f of d.modified) console.error(`        modified: ${f}`);
            for (const f of d.missingInMirror) console.error(`        missing in mirror: ${f}`);
            for (const f of d.extraInMirror) console.error(`        extra in mirror: ${f}`);
          }
        }
        if (res.sharedUnion.missing.length > 0) {
          console.error(`  _shared missing in mirror (${res.sharedUnion.missing.length} canonical file(s)):`);
          for (const f of res.sharedUnion.missing) console.error(`    - _shared/${f}`);
        }
        if (res.sharedUnion.divergences.length > 0) {
          console.error(`  _shared divergences (${res.sharedUnion.divergences.length} canonical file(s) with drifted bytes):`);
          for (const f of res.sharedUnion.divergences) console.error(`    - _shared/${f}`);
        }
        console.error("\nAction required: Run 'node scripts/sync-addon.mjs --write' to regenerate mirror from canonical.");
      }
    }
    return res.pass ? 0 : 1;
  }

  if (mode === "write") {
    const stats = syncMirror(catalogRoot, mirrorRoot);
    if (jsonOut) {
      console.log(JSON.stringify({ pass: true, ...stats }, null, 2));
    } else {
      console.log(`[sync-addon] Synchronized ${stats.canonicalCount} canonical skills to addon mirror:`);
      console.log(`  Files copied/updated:    ${stats.copiedFiles}`);
      console.log(`  Files deleted:           ${stats.deletedFiles}`);
      console.log(`  New skills created:      ${stats.createdSkills}`);
      console.log(`  Orphan skills removed:   ${stats.removedOrphanSkills}`);
      console.log(`[sync-addon] Coverage: ${stats.canonicalCount} canonical skills · _shared/** union: ${stats.sharedFilesChecked} canonical file(s) checked, ${stats.sharedFilesCopied} copied/updated, ${stats.sharedMirrorOnly} mirror-only file(s) preserved.`);
      console.log(`[sync-addon] PASS: Mirror regenerated successfully.`);
    }
    return 0;
  }

  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const exitCode = runCli();
  process.exit(exitCode);
}
