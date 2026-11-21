/**
 * test/agent-roster-v4.test.mjs — TDD suite for System Upgrade v4 agent-roster fixes:
 * - Roster lifts hardcoded 21-agent cap and includes frontend-builder + frontend-critic (23 agents)
 * - Unknown / "frontend" tiers NEVER silently fall back to cheap
 * - set-models.mjs supports --frontend <model> and --agent <name>:<model> overrides
 * - apply.mjs --runtime claude-code surgically patches .claude/agents/*.md model frontmatter with backup & idempotency
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ROSTER_PATH = join(ROOT, "_shared", "agent-roster", "roster.json");
const SCHEMA_PATH = join(ROOT, "_shared", "model-routing", "profiles.schema.json");
const SET_MODELS = join(ROOT, "00-meta-skills", "agent-roster", "scripts", "set-models.mjs");
const APPLY = join(ROOT, "00-meta-skills", "agent-roster", "scripts", "apply.mjs");

function run(script, args) {
  const res = spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });
  return { code: res.status ?? 1, stdout: `${res.stdout ?? ""}${res.stderr ?? ""}` };
}

function makeDir(t) {
  const dir = mkdtempSync(join(tmpdir(), "v4-roster-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));

test("roster.json includes frontend-builder, frontend-critic, and frontend-build/eval phases", () => {
  const roster = readJson(ROSTER_PATH);
  const schema = readJson(SCHEMA_PATH);
  assert.ok(roster.agents.length >= 23, `expected >= 23 agents, got ${roster.agents.length}`);
  assert.ok(roster.phases["frontend-build"], "roster.phases must declare frontend-build");
  assert.ok(roster.phases["frontend-eval"], "roster.phases must declare frontend-eval");
  assert.equal(roster.phases["frontend-build"].tier, "strong");
  assert.equal(roster.phases["frontend-eval"].tier, "strong");

  for (const name of ["frontend-builder", "frontend-critic"]) {
    const entry = roster.agents.find((a) => a.name === name);
    assert.ok(entry, `${name} must exist in roster.json`);
    assert.equal(entry.group, "frontend");
    assert.equal(entry.tier, "strong");
    assert.equal(entry.effort, "high");
    assert.equal(entry.delegate_only, true);
  }

  assert.ok(schema.properties.phases.properties["frontend-build"], "profiles.schema.json must allow frontend-build phase");
  assert.ok(schema.properties.phases.properties["frontend-eval"], "profiles.schema.json must allow frontend-eval phase");
  assert.ok(schema.properties.overrides, "profiles.schema.json must allow per-agent overrides");
});

test("apply.mjs accepts custom rosters != 21 agents and never falls back to cheap on frontend/unknown tier", (t) => {
  const dir = makeDir(t);
  const customRosterPath = join(dir, "roster.json");
  writeFileSync(
    customRosterPath,
    JSON.stringify({
      version: 1,
      agents: [
        { name: "gentle-orchestrator", group: "coordinator", role: "coord", tier: "strong", effort: "max", delegate_only: false },
        { name: "frontend-builder", group: "frontend", role: "ui", tier: "frontend", effort: "high", delegate_only: true },
        { name: "custom-specialist", group: "custom", role: "spec", tier: "experimental", effort: "high", delegate_only: true },
      ],
    }, null, 2),
    "utf8"
  );
  const profPath = join(dir, "profiles.json");
  writeFileSync(
    profPath,
    JSON.stringify({
      version: 1,
      current: "deepseek",
      profiles: {
        deepseek: {
          "sdd-strong": "opencode-go/deepseek-v4-pro",
          "sdd-mid": "opencode-go/deepseek-v4-mid",
          "sdd-cheap": "opencode-go/deepseek-v4-cheap",
          strong: "opencode-go/deepseek-v4-pro",
          mid: "opencode-go/deepseek-v4-mid",
          cheap: "opencode-go/deepseek-v4-cheap",
          flash: "opencode-go/deepseek-v4-cheap",
        },
      },
      providers: {},
    }, null, 2),
    "utf8"
  );
  const cfgPath = join(dir, "opencode.json");
  writeFileSync(
    cfgPath,
    JSON.stringify({
      agent: {
        "gentle-orchestrator": { model: "old/a" },
        "frontend-builder": { model: "old/b" },
        "custom-specialist": { model: "old/c" },
      },
    }, null, 2),
    "utf8"
  );

  const res = run(APPLY, [
    "--runtime", "opencode",
    "--roster", customRosterPath,
    "--profiles", profPath,
    "--config", cfgPath,
    "--apply",
  ]);
  assert.equal(res.code, 0, res.stdout);
  const updated = readJson(cfgPath);
  assert.equal(updated.agent["frontend-builder"].model, "opencode-go/deepseek-v4-pro");
  assert.equal(updated.agent["custom-specialist"].model, "opencode-go/deepseek-v4-pro");
});

test("set-models.mjs supports --frontend and --agent overrides without downgrading to cheap", (t) => {
  const dir = makeDir(t);
  const profPath = join(dir, "profiles.json");
  writeFileSync(
    profPath,
    JSON.stringify({
      version: 1,
      current: "gemini",
      profiles: {
        gemini: {
          "sdd-strong": "gemini-4-argon",
          "sdd-mid": "gemini-3.8-flash",
          "sdd-cheap": "gemini-3.8-flash",
          strong: "gemini-4-argon",
          mid: "gemini-3.8-flash",
          cheap: "gemini-3.8-flash",
          flash: "gemini-3.8-flash",
        },
      },
      providers: {},
    }, null, 2),
    "utf8"
  );

  const res = run(SET_MODELS, [
    "--frontend", "anthropic/claude-opus-4-6",
    "--agent", "frontend-critic:google/gemini-4-neon",
    "--profiles", profPath,
    "--apply",
  ]);
  assert.equal(res.code, 0, res.stdout);
  const saved = readJson(profPath);
  assert.equal(saved.profiles.gemini.overrides["frontend-builder"], "anthropic/claude-opus-4-6");
  assert.equal(saved.profiles.gemini.overrides["frontend-critic"], "google/gemini-4-neon");
});

test("apply.mjs --runtime claude-code patches .claude/agents/*.md frontmatter surgically with backup", (t) => {
  const dir = makeDir(t);
  const agentsDir = join(dir, ".claude", "agents");
  mkdirSync(agentsDir, { recursive: true });
  const builderMd = join(agentsDir, "frontend-builder.md");
  writeFileSync(
    builderMd,
    "---\nname: frontend-builder\ndescription: Builds UI\nmodel: sonnet\n---\n\n# Frontend Builder\nKeep body intact.\n",
    "utf8"
  );
  const profPath = join(dir, "profiles.json");
  writeFileSync(
    profPath,
    JSON.stringify({
      version: 1,
      current: "custom",
      profiles: {
        custom: {
          strong: "opus",
          mid: "sonnet",
          cheap: "haiku",
          overrides: { "frontend-builder": "opus" },
        },
      },
    }, null, 2),
    "utf8"
  );

  const res = run(APPLY, ["--runtime", "claude-code", "--config", agentsDir, "--profiles", profPath, "--apply"]);
  assert.equal(res.code, 0, res.stdout);
  const after = readFileSync(builderMd, "utf8");
  assert.match(after, /^model: opus$/m);
  assert.match(after, /Keep body intact\./);
  assert.equal(readdirSync(agentsDir).filter((f) => f.includes(".roster.bak-")).length, 1);

  const second = run(APPLY, ["--runtime", "claude-code", "--config", agentsDir, "--profiles", profPath, "--apply"]);
  assert.equal(second.code, 0, second.stdout);
  assert.match(second.stdout, /Already in sync/i);
  assert.equal(readdirSync(agentsDir).filter((f) => f.includes(".roster.bak-")).length, 1);
});
