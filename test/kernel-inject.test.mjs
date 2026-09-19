import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir, homedir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  KERNEL_START,
  KERNEL_END,
  channelFilesFor,
  detectVariant,
  extractBlock,
  injectKernel,
  removeKernel,
  guardGitignore,
  unguardGitignore,
  summarizeKernel,
} from "../_shared/kernel-inject.mjs";

const CATALOG_ROOT = fileURLToPath(new URL("..", import.meta.url));

function tmpRoot() {
  return mkdtempSync(join(tmpdir(), "skillsgv-kernel-"));
}

const FULL_BLOCK = [
  KERNEL_START,
  "## test kernel",
  "- rule one",
  KERNEL_END,
].join("\n");

test("channelFilesFor dedupes shared channel files", () => {
  const files = channelFilesFor(["opencode", "cursor", "codex", "dsh", "claude-code", "gemini-cli", "antigravity"]);
  assert.deepEqual(files, ["AGENTS.md", "CLAUDE.md", "GEMINI.md"]);
});

test("detectVariant returns full without gentle-ai and minimal with it", () => {
  const bareHome = tmpRoot();
  assert.equal(detectVariant({ home: bareHome, hasBinaryFn: () => false }), "full");
  assert.equal(detectVariant({ home: bareHome, hasBinaryFn: (n) => n === "gentle-ai" }), "minimal");

  const gentleHome = tmpRoot();
  mkdirSync(join(gentleHome, ".gemini"), { recursive: true });
  writeFileSync(join(gentleHome, ".gemini", "GEMINI.md"), "<!-- gentle-ai:agent-routing -->\n", "utf8");
  assert.equal(detectVariant({ home: gentleHome, hasBinaryFn: () => false }), "minimal");

  rmSync(bareHome, { recursive: true, force: true });
  rmSync(gentleHome, { recursive: true, force: true });
});

test("injectKernel creates missing channel files and is idempotent", () => {
  const root = tmpRoot();
  const opts = { root, agentIds: ["opencode"], variant: "full", catalogRoot: CATALOG_ROOT };

  const first = injectKernel(opts);
  assert.equal(first.find((r) => r.file === "AGENTS.md").status, "injected");
  const agentsMd = readFileSync(join(root, "AGENTS.md"), "utf8");
  assert.ok(agentsMd.includes(KERNEL_START) && agentsMd.includes(KERNEL_END));
  assert.ok(agentsMd.includes("kernel de arranque"));

  const second = injectKernel(opts);
  assert.equal(second.find((r) => r.file === "AGENTS.md").status, "unchanged");
  assert.equal(readFileSync(join(root, "AGENTS.md"), "utf8"), agentsMd);

  rmSync(root, { recursive: true, force: true });
});

test("injectKernel appends to an existing AGENTS.md without touching user content", () => {
  const root = tmpRoot();
  writeFileSync(join(root, "AGENTS.md"), "# Proyecto X\n\nReglas propias del repo.\n", "utf8");

  injectKernel({ root, agentIds: ["cursor"], variant: "full", catalogRoot: CATALOG_ROOT });
  const after = readFileSync(join(root, "AGENTS.md"), "utf8");
  assert.ok(after.startsWith("# Proyecto X"));
  assert.ok(after.includes("Reglas propias del repo."));
  assert.ok(after.includes(KERNEL_START));

  rmSync(root, { recursive: true, force: true });
});

test("injectKernel replaces a stale block instead of duplicating it", () => {
  const root = tmpRoot();
  writeFileSync(join(root, "GEMINI.md"), `# Previo\n\n${FULL_BLOCK}\n`, "utf8");

  injectKernel({ root, agentIds: ["antigravity"], variant: "minimal", catalogRoot: CATALOG_ROOT });
  const after = readFileSync(join(root, "GEMINI.md"), "utf8");
  assert.equal(after.indexOf(KERNEL_START), after.lastIndexOf(KERNEL_START));
  assert.ok(after.includes("modo gentle-ai"));
  assert.ok(after.includes("# Previo"));

  rmSync(root, { recursive: true, force: true });
});

test("removeKernel strips the block exactly and retains user-edited blocks", () => {
  const root = tmpRoot();
  const original = "# Proyecto X\n\nReglas propias.\n";
  writeFileSync(join(root, "AGENTS.md"), original, "utf8");

  const results = injectKernel({ root, agentIds: ["opencode"], variant: "full", catalogRoot: CATALOG_ROOT });
  const rec = { files: [{ file: "AGENTS.md", blockSha256: results.find((r) => r.file === "AGENTS.md").blockSha256, createdFile: false }] };

  // user edits OUTSIDE the block: removal still works and keeps the edit
  writeFileSync(join(root, "AGENTS.md"), readFileSync(join(root, "AGENTS.md"), "utf8") + "\nNota agregada despues.\n", "utf8");
  const stats = removeKernel(root, rec);
  assert.equal(stats.removed, 1);
  const after = readFileSync(join(root, "AGENTS.md"), "utf8");
  assert.ok(!after.includes(KERNEL_START));
  assert.ok(after.includes("Nota agregada despues."));

  // user edits INSIDE the block (marker line touched): retained, reported, never reverted
  injectKernel({ root, agentIds: ["opencode"], variant: "full", catalogRoot: CATALOG_ROOT });
  writeFileSync(join(root, "AGENTS.md"), readFileSync(join(root, "AGENTS.md"), "utf8").replace("kernel de arranque", "kernel EDITADO"), "utf8");
  const stats2 = removeKernel(root, rec);
  assert.equal(stats2.removed, 0);
  assert.equal(stats2.retained.length, 1);
  assert.ok(readFileSync(join(root, "AGENTS.md"), "utf8").includes(KERNEL_START));

  rmSync(root, { recursive: true, force: true });
});

test("guardGitignore creates, refreshes and unguards cleanly", () => {
  const root = tmpRoot();

  const created = guardGitignore({ root, skillDirs: [".claude/skills", ".agents/skills"] });
  assert.equal(created.status, "created");
  assert.ok(created.created);
  let gi = readFileSync(join(root, ".gitignore"), "utf8");
  assert.ok(gi.includes(".claude/skills/") && gi.includes(".agents/skills/") && gi.includes(".skills-install/"));

  // idempotent refresh with the same dirs
  assert.equal(guardGitignore({ root, skillDirs: [".agents/skills", ".claude/skills"] }).status, "unchanged");

  // adds new dirs without losing foreign lines
  writeFileSync(join(root, ".gitignore"), "node_modules/\n" + gi, "utf8");
  const updated = guardGitignore({ root, skillDirs: [".claude/skills", ".agents/skills", ".gemini/skills"] });
  assert.ok(["updated", "created"].includes(updated.status));
  gi = readFileSync(join(root, ".gitignore"), "utf8");
  assert.ok(gi.includes("node_modules/") && gi.includes(".gemini/skills/"));

  // unguard keeps foreign lines; created-file deletion only when we made the file
  const un = unguardGitignore(root, { created: false });
  assert.equal(un.status, "removed-block");
  const finalGi = readFileSync(join(root, ".gitignore"), "utf8");
  assert.ok(finalGi.includes("node_modules/"));
  assert.ok(!finalGi.includes(".skills-install/"));

  rmSync(root, { recursive: true, force: true });
});

test("end-to-end: uninstall returns the root to its pre-install state", () => {
  const root = tmpRoot();
  writeFileSync(join(root, "AGENTS.md"), "# Solo esto\n", "utf8");

  const results = injectKernel({ root, agentIds: ["opencode"], variant: "full", catalogRoot: CATALOG_ROOT });
  const kernelRec = {
    variant: "full",
    files: results
      .filter((r) => r.blockSha256)
      .map((r) => ({ file: r.file, blockSha256: r.blockSha256, prevBackup: r.prevBackup, createdFile: r.createdFile })),
    gitignore: guardGitignore({ root, skillDirs: [".opencode/skills"] }),
  };

  removeKernel(root, kernelRec);
  unguardGitignore(root, kernelRec.gitignore);
  assert.equal(readFileSync(join(root, "AGENTS.md"), "utf8"), "# Solo esto\n");
  assert.ok(!existsSync(join(root, ".gitignore")));

  rmSync(root, { recursive: true, force: true });
});

// --- Judgment-day round 1 regression tests (2026-09-19) ---

test("F1: re-install (all channels unchanged) still records files, so uninstall strips blocks", () => {
  const root = tmpRoot();
  const opts = { root, agentIds: ["opencode"], variant: "full", catalogRoot: CATALOG_ROOT };
  injectKernel(opts);
  const second = injectKernel(opts);
  assert.equal(second.find((r) => r.file === "AGENTS.md").status, "unchanged");

  const rec = summarizeKernel("full", second, { status: "created", created: true, entries: [] });
  assert.ok(rec.files.length >= 1, "unchanged channels must be recorded for uninstall symmetry");

  const stats = removeKernel(root, rec);
  assert.equal(stats.removed, 1);
  assert.ok(!readFileSync(join(root, "AGENTS.md"), "utf8").includes(KERNEL_START));
  rmSync(root, { recursive: true, force: true });
});

test("F2: surgical strip preserves user whitespace away from the block", () => {
  const root = tmpRoot();
  const original = "# A\n\n\n\n# B (user triple blank line)\n";
  writeFileSync(join(root, "AGENTS.md"), original, "utf8");
  injectKernel({ root, agentIds: ["opencode"], variant: "full", catalogRoot: CATALOG_ROOT });

  const results = injectKernel({ root, agentIds: ["opencode"], variant: "full", catalogRoot: CATALOG_ROOT });
  const rec = summarizeKernel("full", results, null);
  removeKernel(root, rec);

  const after = readFileSync(join(root, "AGENTS.md"), "utf8");
  assert.ok(after.includes("# A\n\n\n\n# B"), "user blank-line runs must survive the strip");
  assert.ok(!after.includes(KERNEL_START));
  rmSync(root, { recursive: true, force: true });
});

test("F2b: CRLF files round-trip without churn or mixed line endings", () => {
  const root = tmpRoot();
  writeFileSync(join(root, "AGENTS.md"), "# Proyecto\r\n\r\nReglas.\r\n", "utf8");

  injectKernel({ root, agentIds: ["opencode"], variant: "full", catalogRoot: CATALOG_ROOT });
  const withBlock = readFileSync(join(root, "AGENTS.md"), "utf8");
  assert.ok(withBlock.includes("\r\n"), "block must adapt to CRLF");
  assert.ok(!withBlock.replace(/\r\n/g, "").includes("\n"), "no mixed line endings (block tail must use the file's EOL)");

  const second = injectKernel({ root, agentIds: ["opencode"], variant: "full", catalogRoot: CATALOG_ROOT });
  assert.equal(second.find((r) => r.file === "AGENTS.md").status, "unchanged", "CRLF must not cause perpetual churn");

  const rec = summarizeKernel("full", second, null);
  removeKernel(root, rec);
  assert.equal(readFileSync(join(root, "AGENTS.md"), "utf8"), "# Proyecto\r\n\r\nReglas.\r\n");
  rmSync(root, { recursive: true, force: true });
});

test("F3: force rollback never wholesale-restores a file the user edited", () => {
  const root = tmpRoot();
  mkdirSync(join(root, ".skills-install", "backups", "g1"), { recursive: true });
  writeFileSync(join(root, "AGENTS.md"), "# Original\n", "utf8");

  const inject = injectKernel({
    root,
    agentIds: ["opencode"],
    variant: "full",
    catalogRoot: CATALOG_ROOT,
    backupFn: (f) => {
      const rel = join(".skills-install", "backups", "g1", "kernel-1-" + f.split(/[\\/]/).pop());
      writeFileSync(join(root, rel), readFileSync(f));
      return rel.split("\\").join("/");
    },
  });
  const rec = summarizeKernel("full", inject, null);

  // user edits OUTSIDE the block after install
  writeFileSync(join(root, "AGENTS.md"), readFileSync(join(root, "AGENTS.md"), "utf8") + "\n## Nota del usuario\n", "utf8");
  const stats = removeKernel(root, rec, { force: true });
  const after = readFileSync(join(root, "AGENTS.md"), "utf8");
  assert.ok(after.includes("## Nota del usuario"), "user edit must survive force rollback");
  assert.ok(!after.includes(KERNEL_START), "block must still be stripped");
  assert.equal(stats.restoredBackups, 0, "no wholesale restore on user-edited file");
  rmSync(root, { recursive: true, force: true });
});

test("F4: gitignore guard UNIONS entries across re-installs for tool subsets", () => {
  const root = tmpRoot();
  const first = guardGitignore({ root, skillDirs: [".claude/skills", ".cursor/skills"] });
  assert.equal(first.status, "created");
  const second = guardGitignore({ root, skillDirs: [".claude/skills"] }); // narrower subset
  const gi = readFileSync(join(root, ".gitignore"), "utf8");
  assert.ok(gi.includes(".claude/skills/"), "current dirs stay guarded");
  assert.ok(gi.includes(".cursor/skills/"), "previously guarded dirs are never unguarded by a subset re-install");
  const third = guardGitignore({ root, skillDirs: [".claude/skills"] });
  assert.equal(third.status, "unchanged");
  rmSync(root, { recursive: true, force: true });
});

test("encoding: UTF-16 channel files are skipped, not destroyed", () => {
  const root = tmpRoot();
  const utf16 = Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from("# Proyecto\r\n", "utf16le")]);
  writeFileSync(join(root, "AGENTS.md"), utf16);
  const results = injectKernel({ root, agentIds: ["opencode"], variant: "full", catalogRoot: CATALOG_ROOT });
  assert.equal(results.find((r) => r.file === "AGENTS.md").status, "skipped-encoding");
  assert.deepEqual(readFileSync(join(root, "AGENTS.md")), utf16, "file must be byte-identical after skip");
  rmSync(root, { recursive: true, force: true });
});

// --- Judgment-day round 2 regression tests (2026-09-19) ---

test("R2: force rollback KEEPS a block that is unchanged from an earlier generation", () => {
  const root = tmpRoot();
  writeFileSync(join(root, "AGENTS.md"), "# Doc\n", "utf8");
  const rec = injectKernel({ root, agentIds: ["opencode"], variant: "full", catalogRoot: CATALOG_ROOT }).find((r) => r.file === "AGENTS.md");

  // A re-install records the channel as "unchanged": no backup, not created by that generation.
  const unchangedFromEarlierGen = {
    files: [{ file: "AGENTS.md", blockSha256: rec.blockSha256, wroteSha256: rec.wroteSha256, prevBackup: null, createdFile: false }],
  };
  const stats = removeKernel(root, unchangedFromEarlierGen, { force: true });
  assert.equal(stats.removed, 0, "rollback must not strip a block that belongs to the restored generation");
  assert.ok(readFileSync(join(root, "AGENTS.md"), "utf8").includes(KERNEL_START), "previous generation's block survives");
  rmSync(root, { recursive: true, force: true });
});

test("R2: merged createdFile lets uninstall delete a channel file after a no-op re-install", () => {
  const root = tmpRoot();
  const first = injectKernel({ root, agentIds: ["opencode"], variant: "full", catalogRoot: CATALOG_ROOT }).find((r) => r.file === "AGENTS.md");
  assert.equal(first.createdFile, true, "first generation creates the channel");
  const second = injectKernel({ root, agentIds: ["opencode"], variant: "full", catalogRoot: CATALOG_ROOT }).find((r) => r.file === "AGENTS.md");
  assert.equal(second.status, "unchanged");

  // collectKernelOwned OR-merges createdFile across generations (simulated here).
  const merged = {
    files: [{ file: "AGENTS.md", blockSha256: second.blockSha256, wroteSha256: second.wroteSha256, prevBackup: null, createdFile: Boolean(first.createdFile || second.createdFile) }],
  };
  const stats = removeKernel(root, merged);
  assert.equal(stats.removedFiles, 1, "installer-created channel is deleted at uninstall");
  assert.ok(!existsSync(join(root, "AGENTS.md")));
  rmSync(root, { recursive: true, force: true });
});

test("R2: legacy em-dash gitignore markers are upgraded, not duplicated", () => {
  const root = tmpRoot();
  const legacy =
    "# >>> skillsGV install (generated \u2014 do not edit) >>>\n.claude/skills/\n.skills-install/\n# <<< skillsGV install <<<\n";
  writeFileSync(join(root, ".gitignore"), "node_modules/\n\n" + legacy, "utf8");

  const res = guardGitignore({ root, skillDirs: [".claude/skills", ".gemini/skills"] });
  assert.equal(res.status, "updated", "legacy block is upgraded in place");
  const gi = readFileSync(join(root, ".gitignore"), "utf8");
  const startCount = gi.split("\n").filter((l) => l.startsWith("# >>>")).length;
  assert.equal(startCount, 1, "a single guarded block");
  assert.ok(gi.includes(".gemini/skills/") && gi.includes(".claude/skills/") && gi.includes("node_modules/"), "union keeps old and new entries");

  const un = unguardGitignore(root, { created: false });
  assert.equal(un.status, "removed-block");
  assert.ok(!readFileSync(join(root, ".gitignore"), "utf8").includes("skillsGV install"));
  rmSync(root, { recursive: true, force: true });
});

test("CLI integration: install → re-install → rollback → uninstall via install-skills.mjs", { timeout: 180000 }, async () => {
  const { execFile } = await import("node:child_process");
  const { promisify } = await import("node:util");
  const run = promisify(execFile);
  const root = tmpRoot();
  const home = homedir();
  const detected = [
    ["gemini-cli", join(home, ".gemini"), "GEMINI.md"],
    ["claude-code", join(home, ".claude"), "CLAUDE.md"],
    ["opencode", join(home, ".config", "opencode"), "AGENTS.md"],
  ].filter(([, d]) => existsSync(d));
  if (detected.length === 0) return; // nothing detectable on this machine — skip gracefully
  const [toolId, , channel] = detected[0];
  const [toolId2] = detected[1] || detected[0]; // second generation may reuse the tool
  const script = "00-meta-skills/skill-sync/scripts/install-skills.mjs";
  const run$ = (extra) =>
    run(process.execPath, [script, "--target", root, "--only", "09-media-graphics", ...extra], { cwd: CATALOG_ROOT, maxBuffer: 8 * 1024 * 1024 });

  await run$(["--tool", toolId]); // gen1
  const channelPath = join(root, channel);
  assert.ok(existsSync(channelPath) && readFileSync(channelPath, "utf8").includes(KERNEL_START), "kernel reached the channel");
  assert.ok(readFileSync(join(root, ".gitignore"), "utf8").includes(".skills-install/"), "gitignore guarded");

  await run$(["--tool", toolId2]); // gen2 — the documented update flow
  const mf2 = JSON.parse(readFileSync(join(root, ".skills-install", "manifest.json"), "utf8"));
  assert.ok(mf2.kernel && mf2.kernel.files.length >= 1, "re-install still records kernel channels (F1)");

  // Judgment-day round 2: rollback must NOT destroy the restored generation's
  // activation layer, and must re-guard the .gitignore (both were broken before).
  await run$(["--rollback"]);
  assert.ok(existsSync(channelPath) && readFileSync(channelPath, "utf8").includes(KERNEL_START), "rollback keeps the restored generation's kernel block");
  assert.ok(readFileSync(join(root, ".gitignore"), "utf8").includes("skillsGV install"), "rollback re-guards the .gitignore");
  const mf3 = JSON.parse(readFileSync(join(root, ".skills-install", "manifest.json"), "utf8"));
  assert.equal(mf3.generation, 1, "rollback returns to generation 1");

  await run$(["--uninstall"]);
  assert.ok(!existsSync(channelPath), "uninstall deletes the installer-created channel file");
  assert.ok(!existsSync(join(root, ".gitignore")), "uninstall deletes the installer-created .gitignore");
  assert.ok(!existsSync(join(root, ".skills-install")), "uninstall removes install metadata (.skills-install)");
  rmSync(root, { recursive: true, force: true });
});
