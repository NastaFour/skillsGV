#!/usr/bin/env node
/**
 * sync-addon.mjs — Mirror sync & parity gate for gentle-ai-dsh addon
 *
 * Requirements (spec: installer-lifecycle):
 * - Resolves roots from __dirname (never process.cwd()).
 * - Reads canonical skills using catalog-manifest walkSkillPaths (excludes _shared, gentle-ai-dsh).
 * - Flat mirror structure: gentle-ai-dsh/skills/<skill-name>/...
 * - --check: read-only parity check; fails (exit 1) if there is any content divergence,
 *   missing skill, or orphan skill in the mirror. Emits actionable report.
 * - --write: mechanically synchronizes all 209 canonical skills to gentle-ai-dsh/skills/,
 *   removing extra/orphan files and directories, achieving byte parity.
 *
 * Usage:
 *   node scripts/sync-addon.mjs --check [--json]
 *   node scripts/sync-addon.mjs --write [--json]
 *   node scripts/sync-addon.mjs [--catalog <path>] [--mirror <path>] (--check|--write)
 *
 * Exit codes:
 *   0 = pass (--check in sync, or --write successful)
 *   1 = divergence found in --check
 *   2 = invalid arguments
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
import { dirname, join, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { walkSkillPaths } from "../_shared/catalog-manifest.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const DEFAULT_CATALOG_ROOT = resolve(__dirname, "..");
export const DEFAULT_MIRROR_ROOT = resolve(DEFAULT_CATALOG_ROOT, "gentle-ai-dsh", "skills");

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
 * Discovers all skills currently present in the mirror directory.
 * Ignores _shared (support folder) and dot-directories.
 * Returns a Map<skillName, mirrorDir>
 */
export function getMirrorSkills(mirrorRoot) {
  const skills = new Map();
  if (!existsSync(mirrorRoot)) return skills;
  const entries = readdirSync(mirrorRoot, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory() && e.name !== "_shared" && !e.name.startsWith(".")) {
      skills.set(e.name, join(mirrorRoot, e.name));
    }
  }
  return skills;
}

/**
 * Compares the canonical catalog against the mirror.
 * Returns { pass, missingSkills, orphanSkills, skillDivergences, totalCanonicalSkills, totalMirrorSkills }
 */
export function checkMirror(catalogRoot = DEFAULT_CATALOG_ROOT, mirrorRoot = DEFAULT_MIRROR_ROOT) {
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

  const pass =
    missingSkills.length === 0 &&
    orphanSkills.length === 0 &&
    skillDivergences.length === 0;

  return {
    pass,
    missingSkills,
    orphanSkills,
    skillDivergences,
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

  // 2. Remove orphan skill directories from mirror (excluding _shared)
  for (const [orphanName, orphanDir] of mirrorMap.entries()) {
    if (!canonicalMap.has(orphanName)) {
      rmSync(orphanDir, { recursive: true, force: true });
      removedOrphanSkills++;
    }
  }

  return {
    canonicalCount: canonicalMap.size,
    copiedFiles,
    deletedFiles,
    createdSkills,
    removedOrphanSkills,
  };
}

function printHelp() {
  console.log(`sync-addon.mjs — Mirror sync & parity gate for gentle-ai-dsh addon

Usage:
  node scripts/sync-addon.mjs --check [--json]
  node scripts/sync-addon.mjs --write [--json]
  node scripts/sync-addon.mjs [--catalog <path>] [--mirror <path>] (--check|--write)

Options:
  --check            Read-only check comparing canonical catalog against gentle-ai-dsh/skills/.
                     Exits with code 1 if divergences are found, 0 if in sync.
  --write            Mechanically synchronizes canonical skills to gentle-ai-dsh/skills/.
  --catalog <path>   Override canonical catalog root (defaults to parent of scripts/).
  --mirror <path>    Override addon mirror root (defaults to gentle-ai-dsh/skills/).
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

  if (mode === "check") {
    const res = checkMirror(catalogRoot, mirrorRoot);
    if (jsonOut) {
      console.log(JSON.stringify(res, null, 2));
    } else {
      if (res.pass) {
        console.log(
          `[sync-addon] PASS: ${res.totalCanonicalSkills} skills in full parity between canonical catalog and addon mirror.`
        );
      } else {
        console.error(
          `[sync-addon] FAIL: Divergence detected between canonical catalog (${res.totalCanonicalSkills} skills) and addon mirror (${res.totalMirrorSkills} skills):`
        );
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
