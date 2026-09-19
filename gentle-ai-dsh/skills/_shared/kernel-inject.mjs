/**
 * kernel-inject.mjs — Activation layer for the skillsGV catalog.
 *
 * Lesson from the 2026-09-18 bench (Zona del Sonido, CON vs SIN skills): an agent
 * only follows guidelines that live in its harness's always-injected context layer.
 * Rules stored in files the agent must decide to read (AGENTS.md, SKILLS.md,
 * .agents/rules/*) are never read in autonomous one-shot runs. This module closes
 * that gap: on project installs it (a) injects a small "kernel" block between
 * idempotent markers into the files each harness auto-loads, and (b) appends a
 * guarded .gitignore block so installed skills are never committed.
 *
 * Exports are pure-ish (fs only); the installer wires them into its manifest
 * lifecycle so --uninstall and --rollback stay symmetric.
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { homedir } from "node:os";
import { createHash } from "node:crypto";

export const KERNEL_START = "<!-- skillsGV:kernel:start -->";
export const KERNEL_END = "<!-- skillsGV:kernel:end -->";

/**
 * Per-harness auto-loaded context file (relative to the install root).
 * Claude reads CLAUDE.md, Gemini CLI / Antigravity read GEMINI.md, everything
 * else follows the agents.md standard (AGENTS.md). Copilot uses its own file.
 */
export const KERNEL_CHANNELS = {
  "claude-code": "CLAUDE.md",
  copilot: ".github/copilot-instructions.md",
  "gemini-cli": "GEMINI.md",
  antigravity: "GEMINI.md",
  opencode: "AGENTS.md",
  cursor: "AGENTS.md",
  codex: "AGENTS.md",
  kiro: "AGENTS.md",
  windsurf: "AGENTS.md",
  deepseek: "AGENTS.md",
  dsh: "AGENTS.md",
};

const GITIGNORE_MARK_START = "# >>> skillsGV install (generated — do not edit) >>>";
const GITIGNORE_MARK_END = "# <<< skillsGV install <<<";

export function channelFilesFor(agentIds) {
  const files = [];
  for (const id of agentIds) {
    const f = KERNEL_CHANNELS[id];
    if (f && !files.includes(f)) files.push(f);
  }
  return files;
}

/**
 * Full kernel when the environment has no gentle-ai (the kernel IS the process
 * floor). Minimal kernel when gentle-ai is present: gentle already injects
 * ODD/RDD/memory into the system prompt, so the catalog declares itself as a
 * knowledge layer and defers process to the harness.
 */
export function detectVariant({ home = homedir(), hasBinaryFn } = {}) {
  try {
    if (typeof hasBinaryFn === "function" && hasBinaryFn("gentle-ai")) return "minimal";
  } catch {}
  try {
    const geminiMd = join(home, ".gemini", "GEMINI.md");
    if (existsSync(geminiMd) && readFileSync(geminiMd, "utf8").includes("gentle-ai")) {
      return "minimal";
    }
  } catch {}
  return "full";
}

function sha256(str) {
  return createHash("sha256").update(str, "utf8").digest("hex");
}

export function extractBlock(content) {
  const i = content.indexOf(KERNEL_START);
  const j = content.indexOf(KERNEL_END);
  if (i === -1 || j === -1 || j < i) return null;
  return content.slice(i, j + KERNEL_END.length);
}

function templateBlock(catalogRoot, variant) {
  const name = variant === "minimal" ? "bootstrap-kernel-minimal.md" : "bootstrap-kernel-full.md";
  const tpl = readFileSync(join(catalogRoot, "_shared", name), "utf8");
  const block = extractBlock(tpl);
  if (!block) {
    throw new Error(`kernel template ${name} is missing ${KERNEL_START}/${KERNEL_END} markers`);
  }
  return block;
}

function stripBlock(content) {
  const block = extractBlock(content);
  if (!block) return content;
  let next = content.replace(block, "");
  // swallow at most one blank line pair left behind by the removal
  next = next.replace(/\n\n\n+/g, "\n\n");
  return next.replace(/^\n+/, "").replace(/\n+$/, "") + "\n";
}

/**
 * Inject (or refresh) the kernel block in every channel file for `agentIds`.
 * Idempotent: identical blocks are left untouched; changed blocks are replaced
 * in place; user content outside the markers is never modified. When a channel
 * file exists, `backupFn(absFile)` is called once before the first modification
 * so --rollback can restore the whole previous file.
 */
export function injectKernel({ root, agentIds, variant, catalogRoot, dryRun = false, backupFn = null }) {
  const block = templateBlock(catalogRoot, variant);
  const blockSha256 = sha256(block);
  const results = [];
  for (const rel of channelFilesFor(agentIds)) {
    const file = join(root, rel);
    const prev = existsSync(file) ? readFileSync(file, "utf8") : null;
    const existing = prev === null ? null : extractBlock(prev);
    if (existing === block) {
      results.push({ file: rel, status: "unchanged" });
      continue;
    }
    if (dryRun) {
      results.push({ file: rel, status: existing ? "update" : "create" });
      continue;
    }
    let prevBackup = null;
    if (prev !== null && typeof backupFn === "function") {
      prevBackup = backupFn(file);
    }
    mkdirSync(dirname(file), { recursive: true });
    const next =
      existing !== null
        ? prev.replace(existing, block)
        : `${prev === null ? "" : prev.replace(/\n*$/, "\n\n")}${block}\n`;
    writeFileSync(file, next, "utf8");
    results.push({
      file: rel,
      status: existing ? "updated" : "injected",
      blockSha256,
      prevBackup,
      createdFile: prev === null,
    });
  }
  return results;
}

/** Manifest record for the kernel + gitignore guard of one generation. */
export function summarizeKernel(variant, injectResults, gitignoreResult) {
  return {
    variant,
    ts: new Date().toISOString(),
    files: injectResults
      .filter((r) => r.status === "updated" || r.status === "injected")
      .map((r) => ({
        file: r.file,
        blockSha256: r.blockSha256,
        prevBackup: r.prevBackup,
        createdFile: r.createdFile,
      })),
    unchanged: injectResults.filter((r) => r.status === "unchanged").map((r) => r.file),
    gitignore: gitignoreResult,
  };
}

/**
 * Remove the kernel blocks recorded by a generation. Blocks the user edited
 * inside the markers are retained and reported (never silently reverted).
 * `force` (rollback path) additionally restores whole-file backups when present
 * and deletes channel files this installer created.
 */
export function removeKernel(root, kernel, { force = false } = {}) {
  const stats = { removed: 0, retained: [], restoredBackups: 0, removedFiles: 0 };
  if (!kernel || !Array.isArray(kernel.files)) return stats;
  for (const rec of kernel.files) {
    const file = resolve(root, rec.file);
    if (force && rec.prevBackup) {
      const backup = resolve(root, ".skills-install", rec.prevBackup);
      if (existsSync(backup) && existsSync(file)) {
        writeFileSync(file, readFileSync(backup, "utf8"), "utf8");
        stats.restoredBackups++;
        stats.removed++;
        continue;
      }
    }
    if (!existsSync(file)) continue;
    const content = readFileSync(file, "utf8");
    const current = extractBlock(content);
    if (current === null) continue; // already gone
    if (!force && sha256(current) !== rec.blockSha256) {
      stats.retained.push(rec.file);
      continue; // user edited inside the block — keep their version
    }
    const stripped = stripBlock(content);
    const empty = stripped.trim() === "";
    if (empty && (rec.createdFile || force)) {
      rmSync(file, { force: true });
      stats.removedFiles++;
    } else {
      writeFileSync(file, stripped, "utf8");
    }
    stats.removed++;
  }
  return stats;
}

/**
 * Append (or refresh) a guarded .gitignore block covering the installed skill
 * directories and the install metadata dir, so `git add .` can never commit the
 * catalog into the host repository (bench lesson: a 540-file commit).
 */
export function guardGitignore({ root, skillDirs, metaDir = ".skills-install", dryRun = false }) {
  const gi = join(root, ".gitignore");
  const wanted = [...new Set([...skillDirs.map((d) => d.replace(/\/+$/, "") + "/"), metaDir + "/"])]
    .sort();
  const block = [GITIGNORE_MARK_START, ...wanted, GITIGNORE_MARK_END].join("\n") + "\n";
  const prev = existsSync(gi) ? readFileSync(gi, "utf8") : null;
  const s = prev === null ? -1 : prev.indexOf(GITIGNORE_MARK_START);
  const e = prev === null ? -1 : prev.indexOf(GITIGNORE_MARK_END);
  if (s !== -1 && e !== -1 && e > s) {
    const current = prev.slice(s, e + GITIGNORE_MARK_END.length) + "\n";
    if (current === block) return { status: "unchanged", created: false, entries: wanted };
    if (dryRun) return { status: "update", created: false, entries: wanted };
    writeFileSync(gi, prev.replace(prev.slice(s, e + GITIGNORE_MARK_END.length), block.trimEnd()), "utf8");
    return { status: "updated", created: false, entries: wanted };
  }
  if (dryRun) return { status: "create", created: prev === null, entries: wanted };
  const next = prev === null ? block : prev.replace(/\n*$/, "\n\n") + block;
  writeFileSync(gi, next, "utf8");
  return { status: "created", created: prev === null, entries: wanted };
}

/** Remove the guarded block; delete .gitignore only if this installer created it. */
export function unguardGitignore(root, giRecord) {
  const gi = join(root, ".gitignore");
  if (!existsSync(gi)) return { status: "absent" };
  const content = readFileSync(gi, "utf8");
  const s = content.indexOf(GITIGNORE_MARK_START);
  const e = content.indexOf(GITIGNORE_MARK_END);
  if (s === -1 || e === -1 || e < s) return { status: "absent" };
  let next = content.replace(content.slice(s, e + GITIGNORE_MARK_END.length), "");
  next = next.replace(/^\n+/, "").replace(/\n+$/, "");
  if (next === "" && giRecord && giRecord.created) {
    rmSync(gi, { force: true });
    return { status: "removed-file" };
  }
  writeFileSync(gi, next + "\n", "utf8");
  return { status: "removed-block" };
}

export { sha256 as __sha256ForTests };
