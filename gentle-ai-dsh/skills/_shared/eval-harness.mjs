/**
 * eval-harness.mjs — shared engine for the per-skill eval harness
 * (`<skill>/evals.json`, Anthropic eval schema).
 *
 * Design contract (change skills-25-upgrade, spec skill-eval-harness):
 * - Schema: `{ "evals": [{ "id", "prompt", "files", "expected_output",
 *   "expectations" }] }`, at least 2 evals per skill.
 * - Expectations are `"<kind>:<value>"` with kind in
 *   { `contains` | `not-contains` | `regex` | `routes-to` }.
 * - OFFLINE by default (never network, never a model):
 *     - `contains:` / `not-contains:` — substring checks on `expected_output`
 *       (static sanity for the authored gold) or on live stdout (`--live`).
 *     - `regex:` — `new RegExp(value, "i")` against the same candidate text.
 *     - `routes-to:<skill>` — invokes the REAL skill-router CLI
 *       (`--query <prompt> --json`) and asserts it selects `<skill>` as
 *       `primary`. Routing is a local deterministic invariant, not a model
 *       output, so it is checked the same way offline and live.
 * - `pnpm test` runs the offline evaluation via `test/evals.test.mjs`; the
 *   opt-in live loop lives in `scripts/run-evals.mjs` and never gates.
 *
 * The root is always an explicit parameter (never cwd); tests pass temp
 * fixture roots. Node-only, ESM, Windows-first, no external dependencies.
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { walkSkillPaths, readSkillName } from "./catalog-manifest.mjs";

export const EVALS_FILE = "evals.json";
export const EXPECTATION_KINDS = ["contains", "not-contains", "regex", "routes-to"];
export const ROUTER_REL_PATH = "00-meta-skills/skill-router/scripts/skill-router.mjs";
export const ROUTER_TIMEOUT_MS = 60_000;

const __dirname = dirname(fileURLToPath(import.meta.url));
/** Catalog root resolved from this file's location (`_shared/` -> one level up). */
export const REPO_ROOT = join(__dirname, "..");

const toPosix = (p) => p.replace(/\\/g, "/");

// --- Discovery ---------------------------------------------------------------

/**
 * Every skill directory that ships an `evals.json`, discovered with the same
 * walk as the catalog manifest (excludes `gentle-ai-dsh/`, `_shared/`,
 * `node_modules/`, `.git/`). Returns `[{ skill, dir, evalsPath }]` sorted by
 * skill name.
 */
export function findEvalSuites(root) {
  const suites = [];
  for (const skillPath of walkSkillPaths(root)) {
    const dir = toPosix(skillPath).split("/").slice(0, -1).join("/");
    const evalsPath = join(root, ...dir.split("/"), EVALS_FILE);
    if (!existsSync(evalsPath)) continue;
    suites.push({ skill: readSkillName(root, skillPath), dir, evalsPath });
  }
  return suites.sort((a, b) => a.skill.localeCompare(b.skill));
}

// --- Schema ------------------------------------------------------------------

/** Read + parse an `evals.json` file. Never throws. */
export function readEvalJson(evalsPath) {
  try {
    const raw = JSON.parse(readFileSync(evalsPath, "utf8"));
    return { ok: true, raw };
  } catch (err) {
    return { ok: false, error: `cannot read/parse ${evalsPath}: ${err.message}` };
  }
}

function schemaError(skill, evalId, field, message) {
  return { skill, evalId, field, message };
}

/**
 * Validate an evals.json payload. Returns `{ ok, errors: [{ skill, evalId,
 * field, message }] }`; every error names the offending eval (or `(suite)`)
 * and field so the failure points at the exact contract break.
 */
export function validateEvalSuite(raw, { skill = "(suite)" } = {}) {
  const errors = [];
  const push = (evalId, field, message) => errors.push(schemaError(skill, evalId, field, message));

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    push("(suite)", "evals", "top-level object with an 'evals' array is required");
    return { ok: false, errors };
  }
  if (!Array.isArray(raw.evals)) {
    push("(suite)", "evals", "must be an array");
    return { ok: false, errors };
  }
  if (raw.evals.length < 2) {
    push("(suite)", "evals", `at least 2 evals are required (found ${raw.evals.length})`);
  }

  const seenIds = new Set();
  raw.evals.forEach((item, i) => {
    const evalId = item && typeof item.id === "string" && item.id.trim() ? item.id : `evals[${i}]`;
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      push(evalId, `evals[${i}]`, "must be an object");
      return;
    }
    if (typeof item.id !== "string" || !item.id.trim()) {
      push(evalId, "id", "non-empty string required");
    } else if (seenIds.has(item.id)) {
      push(evalId, "id", `duplicate eval id "${item.id}"`);
    } else {
      seenIds.add(item.id);
    }
    if (typeof item.prompt !== "string" || !item.prompt.trim()) {
      push(evalId, "prompt", "non-empty string required");
    }
    if (!Array.isArray(item.files) || item.files.some((f) => typeof f !== "string")) {
      push(evalId, "files", "must be an array of strings (use [] when the eval ships no files)");
    }
    if (typeof item.expected_output !== "string" || !item.expected_output.trim()) {
      push(evalId, "expected_output", "non-empty string required");
    }
    if (!Array.isArray(item.expectations) || item.expectations.length === 0) {
      push(evalId, "expectations", "must be a non-empty array");
      return;
    }
    item.expectations.forEach((exp, j) => {
      const parsed = parseExpectation(exp);
      if (!parsed.ok) push(evalId, `expectations[${j}]`, parsed.error);
    });
  });

  return { ok: errors.length === 0, errors };
}

/** Parse one expectation string into `{ ok, kind, value }` or `{ ok: false, error }`. */
export function parseExpectation(expectation) {
  if (typeof expectation !== "string") return { ok: false, error: "expectation must be a string" };
  const match = expectation.match(/^(contains|not-contains|regex|routes-to):(.*)$/s);
  if (!match) {
    return { ok: false, error: `unknown expectation kind (expected ${EXPECTATION_KINDS.join(" | ")})` };
  }
  const [, kind, value] = match;
  if (!value.trim()) return { ok: false, error: `empty value for "${kind}:"` };
  return { ok: true, kind, value };
}

// --- Router bridge -----------------------------------------------------------

/**
 * Run the REAL skill-router CLI for a prompt. Returns
 * `{ ok, primary, secondary, tier1toLoad }` or `{ ok: false, error }`.
 * Deterministic, local-only: no network, no model.
 */
export function runRouter(root, prompt) {
  const routerPath = join(root, ROUTER_REL_PATH);
  if (!existsSync(routerPath)) return { ok: false, error: `skill-router not found at ${ROUTER_REL_PATH}` };
  const result = spawnSync(process.execPath, [routerPath, "--query", prompt, "--json"], {
    encoding: "utf8",
    timeout: ROUTER_TIMEOUT_MS,
  });
  if (result.error) return { ok: false, error: `skill-router spawn failed: ${result.error.message}` };
  if (result.status !== 0) {
    return { ok: false, error: `skill-router exit ${result.status}: ${(result.stderr || "").trim()}` };
  }
  try {
    const output = JSON.parse(result.stdout);
    return {
      ok: true,
      primary: output.primary ?? null,
      secondary: output.secondary ?? [],
      tier1toLoad: output.tier1toLoad ?? [],
    };
  } catch (err) {
    return { ok: false, error: `skill-router output is not JSON: ${err.message}` };
  }
}

// --- Evaluation --------------------------------------------------------------

/**
 * Evaluate one expectation against a candidate text (offline: the eval's
 * `expected_output`; live: the agent stdout). `routes-to` ignores the text and
 * consults the real router for the eval prompt instead.
 * Returns `{ ok, expectation, kind, detail }`.
 */
export function evaluateExpectation(expectation, { text = "", prompt = "", root }) {
  const parsed = parseExpectation(expectation);
  if (!parsed.ok) return { ok: false, expectation, kind: null, detail: parsed.error };
  const { kind, value } = parsed;

  if (kind === "contains") {
    const ok = text.includes(value);
    return { ok, expectation, kind, detail: `expected output to contain ${JSON.stringify(value)}` };
  }
  if (kind === "not-contains") {
    const ok = !text.includes(value);
    return { ok, expectation, kind, detail: `expected output NOT to contain ${JSON.stringify(value)}` };
  }
  if (kind === "regex") {
    let re;
    try {
      re = new RegExp(value, "i");
    } catch (err) {
      return { ok: false, expectation, kind, detail: `invalid regex: ${err.message}` };
    }
    const ok = re.test(text);
    return { ok, expectation, kind, detail: `expected output to match /${value}/i` };
  }
  // routes-to:<skill>
  const router = runRouter(root, prompt);
  if (!router.ok) return { ok: false, expectation, kind, detail: router.error };
  const ok = router.primary === value;
  return {
    ok,
    expectation,
    kind,
    detail: `skill-router primary="${router.primary}" expected="${value}"`,
  };
}

/** Evaluate every expectation of one eval item. Returns `{ evalId, prompt, ok, checks }`. */
export function evaluateEval(root, evalItem) {
  const text = String(evalItem.expected_output ?? "");
  const prompt = String(evalItem.prompt ?? "");
  const checks = (evalItem.expectations ?? []).map((exp) => evaluateExpectation(exp, { text, prompt, root }));
  return { evalId: evalItem.id, prompt, ok: checks.every((c) => c.ok), checks };
}

/**
 * Run the full offline evaluation over every discovered suite (optionally
 * filtered by `skills`). Invalid suites short-circuit to schemaErrors with no
 * evaluation results. Returns:
 * `{ suites: [{ skill, evalsPath, schemaErrors, results, ok }], summary }`
 * where `summary.failed` counts schema errors + failed expectation checks.
 */
export function runOfflineEvaluations(root, { skills = null } = {}) {
  const suites = [];
  let evals = 0;
  let checks = 0;
  let failed = 0;
  for (const suite of findEvalSuites(root)) {
    if (skills && !skills.includes(suite.skill)) continue;
    const loaded = readEvalJson(suite.evalsPath);
    if (!loaded.ok) {
      failed += 1;
      suites.push({ ...suite, schemaErrors: [schemaError(suite.skill, "(suite)", EVALS_FILE, loaded.error)], results: [], ok: false });
      continue;
    }
    const { ok, errors } = validateEvalSuite(loaded.raw, { skill: suite.skill });
    if (!ok) {
      failed += errors.length;
      suites.push({ ...suite, schemaErrors: errors, results: [], ok: false });
      continue;
    }
    const results = loaded.raw.evals.map((item) => evaluateEval(root, item));
    evals += results.length;
    for (const result of results) {
      checks += result.checks.length;
      failed += result.checks.filter((c) => !c.ok).length;
    }
    suites.push({ ...suite, schemaErrors: [], results, ok: results.every((r) => r.ok) });
  }
  return {
    suites,
    summary: { suites: suites.length, evals, checks, failed },
  };
}
