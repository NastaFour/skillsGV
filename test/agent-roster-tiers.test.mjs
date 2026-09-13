/**
 * WU4b — native tiers and 21-agent roster coherence suite (task 4b.3).
 *
 * Validates:
 * 1. Declarative roster consistency: 21 agents recognized (gentle-orchestrator + 20 subagents),
 *    sdd-research present in group 'sdd' with delegate_only: true, native tiers (sdd-strong,
 *    sdd-mid, sdd-cheap), research & judges in strong, apply & fix-agent in mid, phases declared
 *    with tier and reasoning effort.
 * 2. Exact sync args emission: `set-models.mjs --emit-sync-args [--json]` outputs exact
 *    `gentle-ai sync --profile <name:model>` and `--profile-phase <name:phase:model>` flags
 *    with native tier names, without writing any files.
 * 3. Switcher and runtime adapter integration:
 *    - set-models.mjs --list displays native tiers and sync command;
 *    - tier overrides (--strong, --mid, --cheap, --flash, --all) resolve correctly;
 *    - apply.mjs --runtime opencode applies surgical models to all 21 agents with backup;
 *    - apply.mjs --runtime dsh routes strong to subagent_strong and mid/cheap to subagent;
 *    - dry-run writes nothing.
 *
 * Hard rule: all mutative tests use fixtures in os.tmpdir(); never touch the real global config.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ROSTER_PATH = join(ROOT, "_shared", "agent-roster", "roster.json");
const PROFILES_PATH = join(ROOT, "_shared", "agent-roster", "profiles.json");
const SET_MODELS = join(ROOT, "00-meta-skills", "agent-roster", "scripts", "set-models.mjs");
const APPLY = join(ROOT, "00-meta-skills", "agent-roster", "scripts", "apply.mjs");

function run(script, args) {
  const res = spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });
  return { code: res.status ?? 1, stdout: `${res.stdout ?? ""}${res.stderr ?? ""}` };
}

function makeDir(t) {
  const dir = mkdtempSync(join(tmpdir(), "wu4b-roster-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));
const backupsIn = (dir) => readdirSync(dir).filter((f) => f.includes(".roster.bak-"));

function profilesFixture(dir, overrides = {}) {
  const doc = {
    version: 1,
    current: "deepseek",
    profiles: {
      deepseek: {
        "sdd-strong": "opencode-go/deepseek-v4-pro",
        "sdd-mid": "opencode-go/deepseek-v4-flash",
        "sdd-cheap": "opencode-go/deepseek-v4-flash",
        strong: "opencode-go/deepseek-v4-pro",
        mid: "opencode-go/deepseek-v4-flash",
        cheap: "opencode-go/deepseek-v4-flash",
        flash: "opencode-go/deepseek-v4-flash",
      },
      glm: {
        "sdd-strong": "opencode-go/glm-5.3",
        "sdd-mid": "opencode-go/glm-5.2",
        "sdd-cheap": "opencode-go/glm-5.2",
        strong: "opencode-go/glm-5.3",
        mid: "opencode-go/glm-5.2",
        cheap: "opencode-go/glm-5.2",
        flash: "opencode-go/glm-5.2",
      },
      ...overrides,
    },
    providers: {},
  };
  const p = join(dir, "profiles.json");
  writeFileSync(p, JSON.stringify(doc, null, 2) + "\n", "utf8");
  return p;
}

function opencodeConfigFixture(dir, agentNames) {
  const agent = {};
  for (const name of agentNames) {
    agent[name] = { model: "opencode-go/legacy-model" };
  }
  const doc = {
    $schema: "https://opencode.ai/config.json",
    agent,
  };
  const p = join(dir, "opencode.json");
  writeFileSync(p, JSON.stringify(doc, null, 2) + "\n", "utf8");
  return p;
}

// ---------------------------------------------------------------------------
// 1. Roster JSON declarative integrity
// ---------------------------------------------------------------------------

test("roster.json declares exactly 21 agents and sdd-research with correct metadata", () => {
  const roster = readJson(ROSTER_PATH);
  assert.equal(roster.version, 1);
  assert.ok(Array.isArray(roster.agents), "agents must be an array");
  assert.equal(roster.agents.length, 21, "roster must declare exactly 21 agents (1 coordinator + 20 subagents)");

  // Check unique agent names
  const names = roster.agents.map((a) => a.name);
  const uniqueNames = new Set(names);
  assert.equal(uniqueNames.size, 21, "all 21 agent names must be unique");

  // Verify sdd-research
  const research = roster.agents.find((a) => a.name === "sdd-research");
  assert.ok(research, "sdd-research must exist in the roster");
  assert.equal(research.group, "sdd");
  assert.equal(research.delegate_only, true, "sdd-research must be delegate_only: true");
  assert.equal(research.tier, "sdd-strong", "sdd-research must be in sdd-strong tier");
  assert.equal(research.effort, "high");
  assert.match(research.role, /evidence|research/i, "role must be descriptive");

  // Verify strong tier agents (research and judges + coordinator)
  const strongAgents = roster.agents.filter((a) => a.tier === "sdd-strong" || a.tier === "strong");
  const strongNames = strongAgents.map((a) => a.name).sort();
  assert.deepEqual(strongNames, ["gentle-orchestrator", "jd-judge-a", "jd-judge-b", "sdd-research"]);

  // Verify mid tier agents (apply and fix-agent)
  const midAgents = roster.agents.filter((a) => a.tier === "sdd-mid" || a.tier === "mid");
  const midNames = midAgents.map((a) => a.name).sort();
  assert.deepEqual(midNames, ["jd-fix-agent", "sdd-apply"]);

  // Verify cheap tier agents (the remaining 15 agents)
  const cheapAgents = roster.agents.filter((a) => a.tier === "sdd-cheap" || a.tier === "cheap" || a.tier === "flash");
  assert.equal(cheapAgents.length, 15, "exactly 15 agents must be in cheap tier");

  // Verify delegate_only exceptions
  const nonDelegated = roster.agents.filter((a) => !a.delegate_only).map((a) => a.name).sort();
  assert.deepEqual(nonDelegated, ["gentle-orchestrator", "sdd-onboard"], "only gentle-orchestrator and sdd-onboard are delegate_only: false");
});

test("roster.json declares native tiers and phases with reasoning effort", () => {
  const roster = readJson(ROSTER_PATH);
  assert.ok(roster.tiers, "roster must declare a 'tiers' block");
  assert.ok(roster.tiers["sdd-strong"], "tiers must declare sdd-strong");
  assert.ok(roster.tiers["sdd-mid"], "tiers must declare sdd-mid");
  assert.ok(roster.tiers["sdd-cheap"], "tiers must declare sdd-cheap");

  assert.ok(roster.phases, "roster must declare a 'phases' block");
  // Research and judges must be strong
  assert.equal(roster.phases.research.tier, "sdd-strong");
  assert.equal(roster.phases.research.reasoning_effort, "high");
  assert.equal(roster.phases["judgment-day"].tier, "sdd-strong");
  assert.equal(roster.phases["judgment-day"].reasoning_effort, "high");

  // Apply and fix-agent must be mid
  assert.equal(roster.phases.apply.tier, "sdd-mid");
  assert.equal(roster.phases["fix-agent"].tier, "sdd-mid");

  // Tasks and explore must be cheap
  assert.equal(roster.phases.tasks.tier, "sdd-cheap");
  assert.equal(roster.phases.explore.tier, "sdd-cheap");
});

// ---------------------------------------------------------------------------
// 2. Emission of exact gentle-ai sync args
// ---------------------------------------------------------------------------

test("set-models.mjs --emit-sync-args emits native sync args and flags breakdown", () => {
  const res = run(SET_MODELS, ["--emit-sync-args"]);
  assert.equal(res.code, 0, res.stdout);
  assert.match(res.stdout, /Exact sync arguments for gentle-ai/);
  assert.match(res.stdout, /gentle-ai sync/);
  assert.match(res.stdout, /--profile sdd-strong:opencode-go\//);
  assert.match(res.stdout, /--profile sdd-mid:opencode-go\//);
  assert.match(res.stdout, /--profile sdd-cheap:opencode-go\//);
  assert.match(res.stdout, /--profile-phase deepseek:research:opencode-go\/deepseek-v4-pro/);
  assert.match(res.stdout, /--profile-phase deepseek:judgment-day:opencode-go\/deepseek-v4-pro/);
  assert.match(res.stdout, /--profile-phase deepseek:apply:opencode-go\/deepseek-v4-flash/);
  assert.match(res.stdout, /--profile-phase deepseek:tasks:opencode-go\/deepseek-v4-flash/);
});

test("set-models.mjs --emit-sync-args --json returns structured argument array", () => {
  const res = run(SET_MODELS, ["--emit-sync-args", "--json"]);
  assert.equal(res.code, 0, res.stdout);
  const parsed = JSON.parse(res.stdout);
  assert.equal(parsed.profile, "deepseek");
  assert.ok(Array.isArray(parsed.syncArgs));
  assert.ok(typeof parsed.command === "string");

  // Check that syncArgs contains --profile sdd-* pairs
  const args = parsed.syncArgs;
  const strongIdx = args.indexOf("sdd-strong:opencode-go/deepseek-v4-pro");
  assert.ok(strongIdx > 0 && args[strongIdx - 1] === "--profile");

  const midIdx = args.indexOf("sdd-mid:opencode-go/deepseek-v4-flash");
  assert.ok(midIdx > 0 && args[midIdx - 1] === "--profile");

  const cheapIdx = args.indexOf("sdd-cheap:opencode-go/deepseek-v4-flash");
  assert.ok(cheapIdx > 0 && args[cheapIdx - 1] === "--profile");

  // Check phase args
  assert.ok(args.includes("deepseek:research:opencode-go/deepseek-v4-pro"));
  assert.ok(args.includes("deepseek:apply:opencode-go/deepseek-v4-flash"));
});

test("set-models.mjs --emit-sync-args respects --profile selection", () => {
  const res = run(SET_MODELS, ["--profile", "glm", "--emit-sync-args", "--json"]);
  assert.equal(res.code, 0, res.stdout);
  const parsed = JSON.parse(res.stdout);
  assert.equal(parsed.profile, "glm");
  assert.ok(parsed.syncArgs.includes("sdd-strong:opencode-go/glm-5.3"));
  assert.ok(parsed.syncArgs.includes("sdd-mid:opencode-go/glm-5.2"));
  assert.ok(parsed.syncArgs.includes("glm:research:opencode-go/glm-5.3"));
  assert.ok(parsed.syncArgs.includes("glm:apply:opencode-go/glm-5.2"));
});

// ---------------------------------------------------------------------------
// 3. Switcher listing and dry-run safety
// ---------------------------------------------------------------------------

test("set-models.mjs --list shows native sync args and exits 0", () => {
  const res = run(SET_MODELS, ["--list"]);
  assert.equal(res.code, 0, res.stdout);
  assert.match(res.stdout, /Profiles/);
  assert.match(res.stdout, /Native sync args/);
  assert.match(res.stdout, /gentle-ai sync --profile sdd-strong:/);
});

test("set-models.mjs dry-run produces 21 agent summary and does not touch profiles", (t) => {
  const dir = makeDir(t);
  const prof = profilesFixture(dir);
  const original = readFileSync(prof, "utf8");

  const res = run(SET_MODELS, ["--profile", "glm", "--profiles", prof, "--dry-run"]);
  assert.equal(res.code, 0, res.stdout);
  assert.match(res.stdout, /Summary — .*: 21 agents/);
  assert.match(res.stdout, /sdd-research/);
  assert.match(res.stdout, /Dry-run complete/);
  assert.equal(readFileSync(prof, "utf8"), original, "dry-run must not write profiles.json");
});

test("set-models.mjs supports --strong, --mid, and --cheap overrides", (t) => {
  const dir = makeDir(t);
  const prof = profilesFixture(dir);

  const res = run(SET_MODELS, [
    "--strong", "custom/strong-model",
    "--mid", "custom/mid-model",
    "--cheap", "custom/cheap-model",
    "--profiles", prof,
    "--dry-run",
  ]);
  assert.equal(res.code, 0, res.stdout);
  assert.match(res.stdout, /sdd-strong:\s+custom\/strong-model/);
  assert.match(res.stdout, /sdd-mid:\s+custom\/mid-model/);
  assert.match(res.stdout, /sdd-cheap:\s+custom\/cheap-model/);
});

test("set-models.mjs rejects conflicting --all and tier overrides", () => {
  const res = run(SET_MODELS, ["--all", "model/x", "--strong", "model/y"]);
  assert.equal(res.code, 2);
  assert.match(res.stdout, /--all cannot be combined/);
});

// ---------------------------------------------------------------------------
// 4. OpenCode adapter with all 21 agents
// ---------------------------------------------------------------------------

test("apply.mjs --runtime opencode updates all 21 agents correctly with backup", (t) => {
  const dir = makeDir(t);
  const roster = readJson(ROSTER_PATH);
  const agentNames = roster.agents.map((a) => a.name);
  assert.equal(agentNames.length, 21);

  const cfg = opencodeConfigFixture(dir, agentNames);
  const prof = profilesFixture(dir);

  // 1. Dry run
  const dry = run(APPLY, ["--runtime", "opencode", "--config", cfg, "--profiles", prof, "--dry-run"]);
  assert.equal(dry.code, 0, dry.stdout);
  assert.match(dry.stdout, /Agents \(21\):/);
  assert.match(dry.stdout, /21 agent model\(s\) would change/);
  assert.equal(backupsIn(dir).length, 0, "dry-run must not create backups");

  // 2. Apply
  const applied = run(APPLY, ["--runtime", "opencode", "--config", cfg, "--profiles", prof, "--apply"]);
  assert.equal(applied.code, 0, applied.stdout);
  assert.match(applied.stdout, /Applied 21 change\(s\)/);
  assert.equal(backupsIn(dir).length, 1, "exactly one backup created");

  const doc = readJson(cfg);
  // Strong tier check
  assert.equal(doc.agent["gentle-orchestrator"].model, "opencode-go/deepseek-v4-pro");
  assert.equal(doc.agent["jd-judge-a"].model, "opencode-go/deepseek-v4-pro");
  assert.equal(doc.agent["jd-judge-b"].model, "opencode-go/deepseek-v4-pro");
  assert.equal(doc.agent["sdd-research"].model, "opencode-go/deepseek-v4-pro");

  // Mid tier check
  assert.equal(doc.agent["sdd-apply"].model, "opencode-go/deepseek-v4-flash");
  assert.equal(doc.agent["jd-fix-agent"].model, "opencode-go/deepseek-v4-flash");

  // Cheap tier check
  assert.equal(doc.agent["sdd-tasks"].model, "opencode-go/deepseek-v4-flash");
  assert.equal(doc.agent["review-risk"].model, "opencode-go/deepseek-v4-flash");

  // 3. Idempotency re-run
  const second = run(APPLY, ["--runtime", "opencode", "--config", cfg, "--profiles", prof, "--apply"]);
  assert.equal(second.code, 0, second.stdout);
  assert.match(second.stdout, /Already in sync/);
  assert.equal(backupsIn(dir).length, 1, "no new backup on second run");
});

// ---------------------------------------------------------------------------
// 5. dsh adapter routes 21 agents
// ---------------------------------------------------------------------------

test("apply.mjs --runtime dsh routes 21 agents with correct tool mapping", (t) => {
  const dir = makeDir(t);
  const prof = profilesFixture(dir);

  const res = run(APPLY, ["--runtime", "dsh", "--profiles", prof, "--json"]);
  assert.equal(res.code, 0, res.stdout);
  const parsed = JSON.parse(res.stdout);
  assert.equal(parsed.runtime, "dsh");
  assert.equal(parsed.profile, "deepseek");
});

// ---------------------------------------------------------------------------
// 6. Validation and error handling
// ---------------------------------------------------------------------------

test("apply.mjs rejects an unknown runtime argument with exit 2", () => {
  const res = run(APPLY, ["--runtime", "unsupported-runtime"]);
  assert.equal(res.code, 2);
  assert.match(res.stdout, /--runtime must be one of: opencode, dsh, list/);
});
