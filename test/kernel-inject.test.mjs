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

test("CLI integration: install → re-install → uninstall round-trip via install-skills.mjs", { timeout: 120000 }, async () => {
  const { execFile } = await import("node:child_process");
  const { promisify } = await import("node:util");
  const run = promisify(execFile);
  const root = tmpRoot();
  const home = homedir();
  const candidates = [
    ["gemini-cli", join(home, ".gemini")],
    ["claude-code", join(home, ".claude")],
    ["opencode", join(home, ".config", "opencode")],
  ];
  const picked = candidates.find(([, d]) => existsSync(d));
  if (!picked) return; // nothing detectable on this machine — skip gracefully
  const [toolId] = picked;
  const channel = toolId === "claude-code" ? "CLAUDE.md" : toolId === "gemini-cli" ? "GEMINI.md" : "AGENTS.md";
  const args = ["00-meta-skills/skill-sync/scripts/install-skills.mjs", "--target", root, "--tool", toolId, "--only", "09-media-graphics"];

  const run$ = (extra) => run(process.execPath, [...args, ...extra], { cwd: CATALOG_ROOT, maxBuffer: 8 * 1024 * 1024 });

  await run$([]); // install
  const channelPath = join(root, channel);
  assert.ok(existsSync(channelPath) && readFileSync(channelPath, "utf8").includes(KERNEL_START), "kernel reached the channel");
  assert.ok(readFileSync(join(root, ".gitignore"), "utf8").includes(".skills-install/"), "gitignore guarded");
  const mf1 = JSON.parse(readFileSync(join(root, ".skills-install", "manifest.json"), "utf8"));
  assert.ok(mf1.kernel && mf1.kernel.files.length >= 1, "kernel recorded");

  await run$([]); // re-install (the documented update flow)
  const mf2 = JSON.parse(readFileSync(join(root, ".skills-install", "manifest.json"), "utf8"));
  assert.ok(mf2.kernel && mf2.kernel.files.length >= 1, "re-install still records kernel channels (F1)");

  await run$(["--uninstall"]);
  if (existsSync(channelPath)) {
    assert.ok(!readFileSync(channelPath, "utf8").includes(KERNEL_START), "uninstall strips kernel blocks after re-install");
  }
  if (existsSync(join(root, ".gitignore"))) {
    assert.ok(!readFileSync(join(root, ".gitignore"), "utf8").includes("skillsGV install"), "uninstall removes the guarded block");
  }
  rmSync(root, { recursive: true, force: true });
});
