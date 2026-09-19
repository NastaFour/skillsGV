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
 * Judgment-day round 1 (2026-09-19) hardened invariants:
 *  - Records cover ALL channels (including "unchanged"), so uninstall/rollback stay
 *    symmetric across the documented re-install/update flow.
 *  - Stripping is positional and surgical: user whitespace outside the removed
 *    block (and its one separator line) is never rewritten.
 *  - Rollback force-restores a whole file ONLY when it is byte-identical to what
 *    this installer last wrote (wroteSha256); any user edit degrades to a surgical
 *    strip, never a wholesale restore.
 *  - CRLF-aware comparison (no churn on Windows files), UTF-16/BOM files are
 *    skipped with a warning instead of destroyed, symlinked channels are skipped.
 *  - Replacement strings are inserted via function replacements (no `$`-pattern
 *    expansion from template content).
 */

import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { homedir } from "node:os";
import { createHash } from "node:crypto";

export const KERNEL_START = "<!-- skillsGV:kernel:start -->";
export const KERNEL_END = "<!-- skillsGV:kernel:end -->";

/**
 * Per-harness auto-loaded context file (relative to the install root).
 * Claude reads CLAUDE.md, Gemini CLI / Antigravity read GEMINI.md, everything
 * else follows the agents.md standard (AGENTS.md). Copilot uses its own file.
 * NOTE: each channel is a hypothesis until verified — references/canary-activation.md.
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

const GITIGNORE_MARK_START = "# >>> skillsGV install (generated - do not edit) >>>";
const GITIGNORE_MARK_END = "# <<< skillsGV install <<<";
const META_DIR = ".skills-install";

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
 * knowledge layer and defers process to the harness. Marker-based check — a bare
 * mention of "gentle-ai" in prose is not enough.
 */
export function detectVariant({ home = homedir(), hasBinaryFn } = {}) {
  try {
    if (typeof hasBinaryFn === "function" && hasBinaryFn("gentle-ai")) return "minimal";
  } catch {}
  try {
    const geminiMd = join(home, ".gemini", "GEMINI.md");
    if (existsSync(geminiMd) && readFileSync(geminiMd, "utf8").includes("gentle-ai:")) {
      return "minimal";
    }
  } catch {}
  return "full";
}

function sha256(str) {
  return createHash("sha256").update(str, "utf8").digest("hex");
}

const toLf = (s) => s.replace(/\r\n/g, "\n");
const detectEol = (s) => (s.includes("\r\n") ? "\r\n" : "\n");
const adaptEol = (s, eol) => (eol === "\n" ? s : s.replace(/\r?\n/g, "\r\n"));

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
  // Marker-bounded, trailing-newline-free: extractBlock() slices exactly to
  // KERNEL_END, so the recorded blockSha256 and any current block compare equal.
  return toLf(block).replace(/\n+$/, "");
}

/** True when the file cannot be safely round-tripped as utf8 text. */
function isBinaryOrUtf16(buf) {
  if (buf.length >= 2 && ((buf[0] === 0xff && buf[1] === 0xfe) || (buf[0] === 0xfe && buf[1] === 0xff))) return true; // UTF-16 BOM
  for (let i = 1; i < buf.length; i += 2) if (buf[i] === 0x00 && buf[i - 1] !== 0x00) return true; // UTF-16 without BOM heuristic
  return false;
}

function isSymlink(p) {
  try {
    return lstatSync(p).isSymbolicLink();
  } catch {
    return false;
  }
}

/**
 * Surgical removal of the block (first occurrence) plus the single newline the
 * installer wrote after it. If the block sat at EOF, the one blank line the
 * installer added before it is also removed. Nothing else in the file changes.
 */
function stripBlockOnce(content) {
  const block = extractBlock(content);
  if (!block) return null;
  const eol = detectEol(content);
  const i = content.indexOf(block);
  const before = content.slice(0, i);
  const after = content.slice(i + block.length).replace(/^\r?\n/, "");
  if (after.trim() === "" && before.trim() === "") return "";
  if (after.trim() === "") {
    // block was appended at EOF: drop the one blank line the installer added before it
    return before.replace(/(\r?\n)?\r?\n$/, (m) => (m ? eol : ""));
  }
  return before + after;
}

/**
 * Inject (or refresh) the kernel block in every channel file for `agentIds`.
 * Idempotent and EOL-aware; user content outside the markers is never touched.
 * Records are returned for EVERY channel (including unchanged and skipped) so
 * the manifest lifecycle stays symmetric. Per-channel failures are captured as
 * { status: "error" } instead of aborting the whole install.
 */
export function injectKernel({ root, agentIds, variant, catalogRoot, dryRun = false, backupFn = null }) {
  const blockLf = templateBlock(catalogRoot, variant);
  const blockSha256 = sha256(blockLf);
  const results = [];
  for (const rel of channelFilesFor(agentIds)) {
    try {
      const file = join(root, rel);
      if (existsSync(file) && isSymlink(file)) {
        results.push({ file: rel, status: "skipped-symlink" });
        continue;
      }
      const buf = existsSync(file) ? readFileSync(file) : null;
      if (buf !== null && isBinaryOrUtf16(buf)) {
        results.push({ file: rel, status: "skipped-encoding" });
        continue;
      }
      const prev = buf === null ? null : buf.toString("utf8");
      const eol = prev === null ? "\n" : detectEol(prev);
      const existing = prev === null ? null : extractBlock(prev);
      if (existing !== null && toLf(existing) === blockLf) {
        results.push({ file: rel, status: "unchanged", blockSha256, wroteSha256: prev === null ? null : sha256(prev) });
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
      const adapted = adaptEol(blockLf, eol);
      const createdFile = prev === null || prev.trim() === "";
      const next =
        existing !== null
          ? prev.replace(existing, () => adapted)
          : createdFile
            ? adapted + "\n"
            : prev.replace(/(\r?\n)*$/, "") + eol + eol + adapted + "\n";
      writeFileSync(file, next, "utf8");
      results.push({
        file: rel,
        status: existing ? "updated" : "injected",
        blockSha256,
        wroteSha256: sha256(next),
        prevBackup,
        createdFile,
      });
    } catch (err) {
      results.push({ file: rel, status: "error", message: err.message });
    }
  }
  return results;
}

/** Manifest record for the kernel + gitignore guard of one generation (all channels). */
export function summarizeKernel(variant, injectResults, gitignoreResult) {
  return {
    variant,
    ts: new Date().toISOString(),
    files: injectResults
      .filter((r) => ["injected", "updated", "unchanged"].includes(r.status))
      .map((r) => ({
        file: r.file,
        blockSha256: r.blockSha256,
        wroteSha256: r.wroteSha256 ?? null,
        prevBackup: r.prevBackup ?? null,
        createdFile: r.status === "injected",
      })),
    skipped: injectResults
      .filter((r) => r.status.startsWith("skipped") || r.status === "error")
      .map((r) => ({ file: r.file, status: r.status, ...(r.message ? { message: r.message } : {}) })),
    gitignore: gitignoreResult,
  };
}

/**
 * Remove the kernel blocks recorded by a generation (records may come from any
 * generation — the installer passes the cross-generation union).
 *  - Normal: strip surgically; blocks the user edited inside the markers are
 *    retained and reported, never reverted.
 *  - force (rollback): restore the whole pre-install file ONLY when the current
 *    content is byte-identical to what this installer last wrote; anything else
 *    degrades to the surgical strip. Created files are deleted only when empty.
 */
export function removeKernel(root, kernel, { force = false } = {}) {
  const stats = { removed: 0, retained: [], restoredBackups: 0, removedFiles: 0 };
  if (!kernel || !Array.isArray(kernel.files)) return stats;
  for (const rec of kernel.files) {
    try {
      const file = resolve(root, rec.file);
      if (!existsSync(file)) continue;
      if (isSymlink(file)) {
        stats.retained.push(`${rec.file} (symlink)`);
        continue;
      }
      const content = readFileSync(file, "utf8");
      if (force && rec.wroteSha256 && sha256(content) === rec.wroteSha256) {
        if (rec.prevBackup) {
          const backup = resolve(root, META_DIR, rec.prevBackup);
          if (existsSync(backup)) {
            writeFileSync(file, readFileSync(backup)); // binary-safe restore
            rmSync(backup, { force: true });
            stats.restoredBackups++;
            stats.removed++;
            continue;
          }
        }
        if (rec.createdFile) {
          rmSync(file, { force: true });
          stats.removedFiles++;
          stats.removed++;
          continue;
        }
        // no backup and pre-existing: fall through to surgical strip
      }
      const current = extractBlock(content);
      if (current === null) continue; // already gone
      if (rec.blockSha256 && sha256(toLf(current)) !== rec.blockSha256) {
        stats.retained.push(rec.file); // user edited inside the markers
        continue;
      }
      const stripped = stripBlockOnce(content);
      if (stripped !== null && stripped.trim() === "" && rec.createdFile) {
        rmSync(file, { force: true });
        stats.removedFiles++;
      } else if (stripped !== null) {
        writeFileSync(file, stripped, "utf8");
      }
      stats.removed++;
    } catch (err) {
      stats.retained.push(`${rec.file} (error: ${err.message})`);
    }
  }
  return stats;
}

function gitignoreBlockFrom(entries, eol) {
  return adaptEol([GITIGNORE_MARK_START, ...entries, GITIGNORE_MARK_END].join("\n") + "\n", eol);
}
void gitignoreBlockFrom; // (kept for tests/debugging; guardGitignore builds its trim variant inline)

function parseGuardedEntries(content) {
  const s = content.indexOf(GITIGNORE_MARK_START);
  const e = content.indexOf(GITIGNORE_MARK_END);
  if (s === -1 || e === -1 || e < s) return null;
  return toLf(content.slice(s + GITIGNORE_MARK_START.length, e))
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
}

/**
 * Append (or refresh) a guarded .gitignore block covering the installed skill
 * directories and the install metadata dir, so `git add .` can never commit the
 * catalog into the host repository (bench lesson: a 540-file commit). The update
 * path UNIONS with previously guarded entries: a re-install for a tool subset
 * never unguards directories an earlier generation installed.
 */
export function guardGitignore({ root, skillDirs, metaDir = META_DIR, dryRun = false }) {
  const gi = join(root, ".gitignore");
  try {
    if (existsSync(gi) && isSymlink(gi)) return { status: "skipped-symlink", created: false, entries: [] };
    const buf = existsSync(gi) ? readFileSync(gi) : null;
    if (buf !== null && isBinaryOrUtf16(buf)) return { status: "skipped-encoding", created: false, entries: [] };
    const prev = buf === null ? null : buf.toString("utf8");
    const eol = detectEol(prev ?? "\n");
    const existing = prev === null ? [] : parseGuardedEntries(prev) || [];
    // UNION with previously guarded entries: a re-install for a tool subset never
    // unguards directories an earlier generation installed (judgment-day F4).
    const wanted = [...new Set([...existing, ...skillDirs.map((d) => d.replace(/\/+$/, "") + "/"), metaDir + "/"])]
      .filter((e) => e !== "")
      .sort();
    const blockTrim = adaptEol([GITIGNORE_MARK_START, ...wanted, GITIGNORE_MARK_END].join("\n"), eol);
    const s = prev === null ? -1 : prev.indexOf(GITIGNORE_MARK_START);
    const e = prev === null ? -1 : prev.indexOf(GITIGNORE_MARK_END);
    if (s !== -1 && e !== -1 && e > s) {
      const currentEntries = parseGuardedEntries(prev);
      if (currentEntries && [...currentEntries].sort().join("\n") === wanted.join("\n")) {
        return { status: "unchanged", created: false, entries: wanted };
      }
      if (dryRun) return { status: "update", created: false, entries: wanted };
      const currentRegion = prev.slice(s, e + GITIGNORE_MARK_END.length);
      writeFileSync(gi, prev.replace(currentRegion, () => blockTrim), "utf8");
      return { status: "updated", created: false, entries: wanted };
    }
    if (dryRun) return { status: "create", created: prev === null, entries: wanted };
    const next =
      prev === null || prev.trim() === ""
        ? blockTrim + "\n"
        : prev.replace(/(\r?\n)*$/, "") + eol + eol + blockTrim + "\n";
    writeFileSync(gi, next, "utf8");
    return { status: "created", created: prev === null, entries: wanted };
  } catch (err) {
    return { status: `error: ${err.message}`, created: false, entries: [] };
  }
}

/** Remove the guarded block; delete .gitignore only if this installer created it. */
export function unguardGitignore(root, giRecord) {
  const gi = join(root, ".gitignore");
  try {
    if (!existsSync(gi)) return { status: "absent" };
    if (isSymlink(gi)) return { status: "skipped-symlink" };
    const content = readFileSync(gi, "utf8");
    const eol = detectEol(content);
    const s = content.indexOf(GITIGNORE_MARK_START);
    const e = content.indexOf(GITIGNORE_MARK_END);
    if (s === -1 || e === -1 || e < s) return { status: "absent" };
    const block = content.slice(s, e + GITIGNORE_MARK_END.length);
    let next = content.replace(block, () => "");
    if (content.startsWith(block)) next = next.replace(/^\r?\n/, "");
    else if (content.endsWith(block)) next = next.replace(/\r?\n$/, "");
    next = next.replace(/(\r?\n)(\r?\n)$/, "$1"); // collapse one dangling blank line at EOF
    if (next.trim() === "" && giRecord && giRecord.created) {
      rmSync(gi, { force: true });
      return { status: "removed-file" };
    }
    writeFileSync(gi, next.replace(/(\r?\n)+$/, "") + eol, "utf8");
    return { status: "removed-block" };
  } catch (err) {
    return { status: `error: ${err.message}` };
  }
}

export { sha256 as __sha256ForTests, stripBlockOnce as __stripBlockOnceForTests };
