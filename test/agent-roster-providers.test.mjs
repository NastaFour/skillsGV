/**
 * WU4a — custom provider block (RED-first, task 4a.4).
 *
 * Covers the model-routing spec scenarios against OS temp fixtures only:
 * - `set-models.mjs --save-provider` persists baseURL/apiKeyEnv/models and
 *   never stores a cleartext key (only the env-var name);
 * - `apply.mjs --runtime opencode` injects the provider block surgically into
 *   a temp opencode config (saving a timestamped backup, preserving other
 *   provider entries and the rest of the file);
 * - re-applying an in-sync config writes nothing and creates no backup;
 * - a divergent managed entry is replaced; a missing provider section is
 *   created;
 * - dsh reports the custom-provider limitation without failing.
 *
 * Hard rule: every config fixture lives in os.tmpdir(); the real global
 * opencode.json (or any home-directory config) is never read or written.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SET_MODELS = join(ROOT, "00-meta-skills", "agent-roster", "scripts", "set-models.mjs");
const APPLY = join(ROOT, "00-meta-skills", "agent-roster", "scripts", "apply.mjs");
const DSH_PRESET = join(ROOT, "gentle-ai-dsh", "preset", "agent.cordis.yml");

const ACME = {
  baseURL: "https://api.acme.example/v1",
  apiKeyEnv: "ACME_API_KEY",
  models: ["acme-fast", "acme-pro"],
};
const DEFAULT_PROVIDER = {
  humain: { options: { baseURL: "https://api.humain.example/v1" }, models: { "humain-1": {} } },
};

function makeDir(t) {
  const dir = mkdtempSync(join(tmpdir(), "wu4a-providers-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

function run(script, args) {
  const res = spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });
  return { code: res.status ?? 1, stdout: `${res.stdout ?? ""}${res.stderr ?? ""}` };
}

function profilesFixture(dir, { providers } = {}) {
  const doc = {
    version: 1,
    current: "deepseek",
    profiles: {
      deepseek: { strong: "opencode-go/deepseek-v4-pro", flash: "opencode-go/deepseek-v4-flash" },
    },
  };
  if (providers !== undefined) doc.providers = providers;
  const p = join(dir, "profiles.json");
  writeFileSync(p, JSON.stringify(doc, null, 2) + "\n", "utf8");
  return p;
}

function configFixture(dir, { provider = DEFAULT_PROVIDER } = {}) {
  const doc = {
    $schema: "https://opencode.ai/config.json",
    agent: { "gentle-orchestrator": { model: "opencode-go/deepseek-v4-pro" } },
  };
  if (provider !== null) doc.provider = provider;
  const p = join(dir, "opencode.json");
  writeFileSync(p, JSON.stringify(doc, null, 2) + "\n", "utf8");
  return p;
}

const backupsIn = (dir) => readdirSync(dir).filter((f) => f.includes(".roster.bak-"));
const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));

test("--save-provider persists baseURL/apiKeyEnv/models and never a cleartext key", (t) => {
  const dir = makeDir(t);
  const prof = profilesFixture(dir);
  const flags = [
    "--save-provider", "acme",
    "--base-url", ACME.baseURL,
    "--api-key-env", "ACME_API_KEY",
    "--models", "acme-fast,acme-pro",
    "--profiles", prof,
  ];

  const dry = run(SET_MODELS, flags);
  assert.equal(dry.code, 0, dry.stdout);
  assert.match(dry.stdout, /Dry-run/);
  assert.equal(readJson(prof).providers, undefined, "dry-run must not persist the provider");

  const applied = run(SET_MODELS, [...flags, "--apply"]);
  assert.equal(applied.code, 0, applied.stdout);
  const saved = readJson(prof);
  assert.deepEqual(saved.providers.acme, ACME);
  assert.equal(saved.providers.acme.apiKey, undefined, "the entry carries no apiKey field");
  assert.ok(!/sk-|secret/i.test(readFileSync(prof, "utf8")), "no key-like value may land in profiles.json");

  const badEnv = run(SET_MODELS, ["--save-provider", "acme2", "--base-url", ACME.baseURL, "--api-key-env", "sk-live-123", "--models", "m", "--profiles", prof]);
  assert.equal(badEnv.code, 2, badEnv.stdout);
  assert.match(badEnv.stdout, /never the key itself/i);

  // Real-key shapes that satisfy the env-name regex must still be rejected.
  for (const keyish of [
    "ghp_a1b2c3d4e5f6",
    "AKIAIOSFODNN7EXAMPLE",
    "sk_live_51abcdef",
    "hf_FIXTURE0000NOTREAL",
    "npm_FIXTURE0000NOTREAL",
    "dop_v1_FIXTURE0000NOTREAL",
    "shpat_FIXTURE0000NOTREAL",
    "figd_FIXTURE0000NOTREAL",
  ]) {
    const shaped = run(SET_MODELS, ["--save-provider", "acme2", "--base-url", ACME.baseURL, "--api-key-env", keyish, "--models", "m", "--profiles", prof]);
    assert.equal(shaped.code, 2, `${keyish} must be rejected: ${shaped.stdout}`);
    assert.match(shaped.stdout, /never the key itself/i);
  }

  const incomplete = run(SET_MODELS, ["--save-provider", "acme3", "--base-url", ACME.baseURL, "--profiles", prof]);
  assert.equal(incomplete.code, 2, incomplete.stdout);
});

test("saved providers are injected into a temp config, neighbours untouched, backup created", (t) => {
  const dir = makeDir(t);
  const beta = { baseURL: "https://api.beta.example/v2", apiKeyEnv: "BETA_TOKEN", models: ["beta-1"] };
  const prof = profilesFixture(dir);
  const cfg = configFixture(dir);
  const original = readFileSync(cfg, "utf8");

  for (const [id, p] of [["acme", ACME], ["beta", beta]]) {
    const save = run(SET_MODELS, [
      "--save-provider", id, "--base-url", p.baseURL,
      "--api-key-env", p.apiKeyEnv, "--models", p.models.join(","),
      "--profiles", prof, "--apply",
    ]);
    assert.equal(save.code, 0, save.stdout);
  }

  const plan = run(APPLY, ["--runtime", "opencode", "--config", cfg, "--profiles", prof, "--json"]);
  assert.equal(plan.code, 0, plan.stdout);
  const planned = JSON.parse(plan.stdout);
  assert.deepEqual(planned.patch.provider.acme, {
    options: { baseURL: ACME.baseURL, apiKey: "{env:ACME_API_KEY}" },
    models: { "acme-fast": {}, "acme-pro": {} },
  });
  assert.deepEqual(planned.patch.provider.beta, {
    options: { baseURL: beta.baseURL, apiKey: "{env:BETA_TOKEN}" },
    models: { "beta-1": {} },
  });
  assert.equal(readFileSync(cfg, "utf8"), original, "--json is a plan: the config must not change");

  const applied = run(APPLY, ["--runtime", "opencode", "--config", cfg, "--profiles", prof, "--apply"]);
  assert.equal(applied.code, 0, applied.stdout);
  const doc = readJson(cfg);
  assert.deepEqual(doc.provider.acme, {
    options: { baseURL: ACME.baseURL, apiKey: "{env:ACME_API_KEY}" },
    models: { "acme-fast": {}, "acme-pro": {} },
  });
  assert.deepEqual(doc.provider.beta, {
    options: { baseURL: beta.baseURL, apiKey: "{env:BETA_TOKEN}" },
    models: { "beta-1": {} },
  });
  assert.deepEqual(doc.provider.humain, DEFAULT_PROVIDER.humain, "unmanaged provider entries stay byte-identical");

  const backups = backupsIn(dir);
  assert.equal(backups.length, 1, "exactly one timestamped backup");
  assert.equal(readFileSync(join(dir, backups[0]), "utf8"), original, "the backup preserves the original bytes");
});

test("re-applying an in-sync config writes nothing and creates no backup", (t) => {
  const dir = makeDir(t);
  const prof = profilesFixture(dir, { providers: { acme: ACME } });
  const cfg = configFixture(dir);

  const first = run(APPLY, ["--runtime", "opencode", "--config", cfg, "--profiles", prof, "--apply"]);
  assert.equal(first.code, 0, first.stdout);
  const afterFirst = readFileSync(cfg, "utf8");

  const second = run(APPLY, ["--runtime", "opencode", "--config", cfg, "--profiles", prof, "--apply"]);
  assert.equal(second.code, 0, second.stdout);
  assert.match(second.stdout, /Already in sync/);
  assert.equal(readFileSync(cfg, "utf8"), afterFirst, "in-sync config must stay byte-identical");
  assert.equal(backupsIn(dir).length, 1, "no second backup without changes");
});

test("a divergent managed entry is replaced while unmanaged entries stay untouched", (t) => {
  const dir = makeDir(t);
  const prof = profilesFixture(dir, { providers: { acme: ACME } });
  const stale = {
    humain: DEFAULT_PROVIDER.humain,
    acme: { options: { baseURL: "https://stale.example/v0" }, models: { legacy: {} } },
  };
  const cfg = configFixture(dir, { provider: stale });

  const r = run(APPLY, ["--runtime", "opencode", "--config", cfg, "--profiles", prof, "--apply"]);
  assert.equal(r.code, 0, r.stdout);
  const doc = readJson(cfg);
  assert.equal(doc.provider.acme.options.baseURL, ACME.baseURL);
  assert.equal(doc.provider.acme.options.apiKey, "{env:ACME_API_KEY}");
  assert.deepEqual(Object.keys(doc.provider.acme.models), ["acme-fast", "acme-pro"]);
  assert.deepEqual(doc.provider.humain, DEFAULT_PROVIDER.humain);
});

test("a config without a provider section receives the block without disturbing the rest", (t) => {
  const dir = makeDir(t);
  const beta = { baseURL: "https://api.beta.example/v2", apiKeyEnv: "BETA_TOKEN", models: ["beta-1"] };
  const prof = profilesFixture(dir, { providers: { acme: ACME, beta } });
  const cfg = configFixture(dir, { provider: null });
  const before = readJson(cfg);

  const r = run(APPLY, ["--runtime", "opencode", "--config", cfg, "--profiles", prof, "--apply"]);
  assert.equal(r.code, 0, r.stdout);
  const doc = readJson(cfg);
  assert.equal(doc.$schema, before.$schema);
  assert.deepEqual(doc.agent, before.agent, "the rest of the file is untouched");
  assert.equal(doc.provider.acme.options.baseURL, ACME.baseURL);
  assert.equal(doc.provider.beta.options.apiKey, "{env:BETA_TOKEN}");
});

test("compact single-line config: a divergent managed entry is replaced without corrupting the file", (t) => {
  const dir = makeDir(t);
  const prof = profilesFixture(dir, { providers: { acme: ACME } });
  const doc = {
    $schema: "https://opencode.ai/config.json",
    agent: { "gentle-orchestrator": { model: "opencode-go/deepseek-v4-pro" } },
    provider: {
      humain: DEFAULT_PROVIDER.humain,
      acme: { options: { baseURL: "https://stale.example/v0" }, models: { legacy: {} } },
    },
  };
  const cfg = join(dir, "opencode.json");
  writeFileSync(cfg, JSON.stringify(doc), "utf8"); // one single line, no real indentation

  const r = run(APPLY, ["--runtime", "opencode", "--config", cfg, "--profiles", prof, "--apply"]);
  assert.equal(r.code, 0, r.stdout);
  const applied = readJson(cfg); // throws if the merge corrupted the JSON
  assert.equal(applied.provider.acme.options.baseURL, ACME.baseURL);
  assert.equal(applied.provider.acme.options.apiKey, "{env:ACME_API_KEY}");
  assert.deepEqual(Object.keys(applied.provider.acme.models), ["acme-fast", "acme-pro"]);
  assert.deepEqual(applied.provider.humain, DEFAULT_PROVIDER.humain);
  assert.equal(applied.agent["gentle-orchestrator"].model, "opencode-go/deepseek-v4-pro");
});

test("a nested provider block is never mistaken for the root provider section", (t) => {
  const dir = makeDir(t);
  const prof = profilesFixture(dir, { providers: { acme: ACME } });
  const nested = { nested: { options: { baseURL: "https://nested.example/v1" } } };
  const doc = {
    $schema: "https://opencode.ai/config.json",
    agent: { "gentle-orchestrator": { model: "opencode-go/deepseek-v4-pro", provider: nested } },
  };
  const cfg = join(dir, "opencode.json");
  writeFileSync(cfg, JSON.stringify(doc, null, 2) + "\n", "utf8");

  const r = run(APPLY, ["--runtime", "opencode", "--config", cfg, "--profiles", prof, "--apply"]);
  assert.equal(r.code, 0, r.stdout);
  const applied = readJson(cfg);
  // The managed entry lands in a NEW root-level provider section...
  assert.equal(applied.provider.acme.options.baseURL, ACME.baseURL);
  assert.equal(applied.provider.acme.options.apiKey, "{env:ACME_API_KEY}");
  // ...while the agent's nested provider object stays byte-identical in shape.
  assert.deepEqual(applied.agent["gentle-orchestrator"].provider, nested);
});

test("pretty-printed config: a replaced managed entry keeps its original indentation", (t) => {
  const dir = makeDir(t);
  const prof = profilesFixture(dir, { providers: { acme: ACME } });
  const doc = {
    $schema: "https://opencode.ai/config.json",
    agent: { "gentle-orchestrator": { model: "opencode-go/deepseek-v4-pro" } },
    provider: {
      humain: DEFAULT_PROVIDER.humain,
      acme: { options: { baseURL: "https://stale.example/v0" }, models: { legacy: {} } },
    },
  };
  const cfg = join(dir, "opencode.json");
  writeFileSync(cfg, JSON.stringify(doc, null, 2) + "\n", "utf8");

  const r = run(APPLY, ["--runtime", "opencode", "--config", cfg, "--profiles", prof, "--apply"]);
  assert.equal(r.code, 0, r.stdout);

  // Exact format: the replacement keeps the indentation of the entry it
  // replaces (key-line indent), not a zero-indent flat serialization.
  const applied = readFileSync(cfg, "utf8");
  const expectedEntry = [
    `    "acme": {`,
    `      "options": {`,
    `        "baseURL": "${ACME.baseURL}",`,
    `        "apiKey": "{env:ACME_API_KEY}"`,
    `      },`,
    `      "models": {`,
    `        "acme-fast": {},`,
    `        "acme-pro": {}`,
    `      }`,
    `    }`,
  ].join("\n");
  assert.ok(applied.includes(expectedEntry), `replaced entry lost its indentation:\n${applied}`);
  assert.deepEqual(readJson(cfg).provider.acme, {
    options: { baseURL: ACME.baseURL, apiKey: "{env:ACME_API_KEY}" },
    models: { "acme-fast": {}, "acme-pro": {} },
  });
});

test("a leading JSONC comment with braces: the provider block lands in the root object", (t) => {
  const dir = makeDir(t);
  const beta = { baseURL: "https://api.beta.example/v2", apiKeyEnv: "BETA_TOKEN", models: ["beta-1"] };
  const prof = profilesFixture(dir, { providers: { acme: ACME, beta } });
  const doc = {
    $schema: "https://opencode.ai/config.json",
    agent: { "gentle-orchestrator": { model: "opencode-go/deepseek-v4-pro" } },
  };
  const cfg = join(dir, "opencode.json");
  writeFileSync(cfg, `// opencode config — empty {} defaults are fine\n${JSON.stringify(doc, null, 2)}\n`, "utf8");

  const r = run(APPLY, ["--runtime", "opencode", "--config", cfg, "--profiles", prof, "--apply"]);
  assert.equal(r.code, 0, r.stdout);
  const applied = readFileSync(cfg, "utf8");
  assert.ok(applied.startsWith("// opencode config"), "the leading comment is preserved");
  const parsed = JSON.parse(applied.slice(applied.indexOf("\n") + 1));
  assert.equal(parsed.provider.acme.options.baseURL, ACME.baseURL);
  assert.equal(parsed.provider.beta.options.apiKey, "{env:BETA_TOKEN}");
  assert.deepEqual(parsed.agent, doc.agent, "the rest of the root object is untouched");
});

test("a config without a JSON object root is rejected instead of injecting blindly", (t) => {
  const dir = makeDir(t);
  const prof = profilesFixture(dir, { providers: { acme: ACME } });
  const cfg = join(dir, "opencode.json");
  const original = `// note: { } here\n"agent": { "gentle-orchestrator": { "model": "opencode-go/deepseek-v4-pro" } }\n`;
  writeFileSync(cfg, original, "utf8");

  const r = run(APPLY, ["--runtime", "opencode", "--config", cfg, "--profiles", prof]);
  assert.equal(r.code, 1, r.stdout);
  assert.match(r.stdout, /Cannot locate the root JSON object/);
  assert.equal(readFileSync(cfg, "utf8"), original, "a rejected config is never modified");
});

test("apply refuses a malformed provider entry without touching the config", (t) => {
  const dir = makeDir(t);
  const prof = profilesFixture(dir, { providers: { broken: { baseURL: "https://api.broken.example" } } });
  const cfg = configFixture(dir);
  const original = readFileSync(cfg, "utf8");

  const r = run(APPLY, ["--runtime", "opencode", "--config", cfg, "--profiles", prof, "--apply"]);
  assert.equal(r.code, 2, r.stdout);
  assert.match(r.stdout, /provider "broken" is malformed/);
  assert.equal(readFileSync(cfg, "utf8"), original, "a malformed entry must not write anything");
  assert.equal(backupsIn(dir).length, 0, "no backup without a write");
});

test("dsh reports the custom-provider limitation without failing and preserves the preset", (t) => {
  const dir = makeDir(t);
  const prof = profilesFixture(dir, { providers: { acme: ACME } });
  const presetBefore = readFileSync(DSH_PRESET, "utf8");

  const r = run(APPLY, ["--runtime", "dsh", "--profiles", prof]);
  assert.equal(r.code, 0, r.stdout);
  assert.match(r.stdout, /\[LIMITATION\]/);
  assert.ok(r.stdout.includes("acme"), "the limitation names the provider");

  const js = run(APPLY, ["--runtime", "dsh", "--profiles", prof, "--json"]);
  assert.equal(js.code, 0, js.stdout);
  const parsed = JSON.parse(js.stdout);
  assert.equal(parsed.providerLimitations.length, 1);
  assert.equal(parsed.providerLimitations[0].id, "acme");

  assert.equal(readFileSync(DSH_PRESET, "utf8"), presetBefore, "dsh dry-run must not touch the preset");
});

test("dsh patches DSH_* fallback literals when the profile routes through a custom provider", (t) => {
  const dir = makeDir(t);
  const prof = join(dir, "profiles.json");
  writeFileSync(
    prof,
    JSON.stringify(
      {
        version: 1,
        current: "acme",
        profiles: {
          acme: {
            "sdd-strong": "acme/acme-pro",
            "sdd-mid": "acme/acme-fast",
            "sdd-cheap": "acme/acme-fast",
            strong: "acme/acme-pro",
            mid: "acme/acme-fast",
            cheap: "acme/acme-fast",
            flash: "acme/acme-fast",
          },
        },
        providers: { acme: ACME },
      },
      null,
      2
    ) + "\n",
    "utf8"
  );
  const presetBefore = readFileSync(DSH_PRESET, "utf8");

  const r = run(APPLY, ["--runtime", "dsh", "--profiles", prof, "--json"]);
  assert.equal(r.code, 0, r.stdout);
  const parsed = JSON.parse(r.stdout);
  const byLabel = new Map(parsed.presetChanges.map((c) => [c.label, c.desired]));
  assert.equal(byLabel.get("DSH_STRONG_PROVIDER"), "acme", "custom provider id must reach DSH_STRONG_PROVIDER");
  assert.equal(byLabel.get("DSH_STRONG_MODEL"), "acme-pro");
  assert.equal(byLabel.get("DSH_FLASH_PROVIDER"), "acme", "custom provider id must reach DSH_FLASH_PROVIDER");
  assert.equal(byLabel.get("DSH_FLASH_MODEL"), "acme-fast");
  assert.equal(readFileSync(DSH_PRESET, "utf8"), presetBefore, "dry-run must not touch the preset");
});
