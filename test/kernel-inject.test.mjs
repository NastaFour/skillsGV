import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
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
