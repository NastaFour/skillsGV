#!/usr/bin/env node
/**
 * apply.mjs — Per-runtime generator for the portable agent roster.
 *
 * One declarative source of truth (_shared/agent-roster/roster.json +
 * profiles.json) feeds every runtime adapter. This script never writes
 * anything without --apply; the default is a dry-run plan.
 *
 * Usage:
 *   node apply.mjs --runtime opencode [--config <path>] [--profiles <path>] [--dry-run|--apply] [--json]
 *   node apply.mjs --runtime dsh      [--profiles <path>] [--dry-run|--apply] [--json]
 *   node apply.mjs --runtime list
 *   node apply.mjs --runtime opencode --apply --config "<temp-copy>"   # test-only rule
 *
 * Custom providers (declared in profiles.json under "providers"): the opencode
 * adapter merges a surgical `"<id>": { options: { baseURL, apiKey: "{env:VAR}" },
 * models: {…} }` entry into the config's `"provider"` block (creating the
 * section when absent, timestamped backup first, no write when in sync). The
 * key NEVER appears in clear text: the config stores the `{env:VAR}` literal.
 * dsh has no provider block: it reports the limitation without failing.
 *
 * Overrides (internal, used by set-models.mjs):
 *   --override '{"strong":"provider/model","flash":"provider/model"}'
 *   --profiles <path>   profiles.json override for tests/fixtures
 *
 * Exit codes: 0 = ok, 2 = invalid arguments.
 */

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = resolve(__dirname, "..");
const CATALOG_ROOT = resolve(SKILL_DIR, "../..");
const ROSTER_PATH = join(CATALOG_ROOT, "_shared", "agent-roster", "roster.json");
const PROFILES_PATH = join(CATALOG_ROOT, "_shared", "agent-roster", "profiles.json");
const DSH_PRESET_PATH = join(CATALOG_ROOT, "gentle-ai-dsh", "preset", "agent.cordis.yml");
const DSH_ROUTING_PATH = join(CATALOG_ROOT, "gentle-ai-dsh", "preset", "roster.routing.json");

const DEFAULT_OPENCODE_CONFIG = join(
  homedir(),
  ".config",
  "opencode",
  "opencode.json"
);

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const opts = {
    runtime: "list",
    config: null,
    profilesPath: null,
    dryRun: false,
    apply: false,
    json: false,
    override: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--runtime") opts.runtime = argv[++i];
    else if (a === "--config") opts.config = resolve(argv[++i]);
    else if (a === "--profiles") opts.profilesPath = resolve(argv[++i]);
    else if (a === "--dry-run") opts.dryRun = true;
    else if (a === "--apply") opts.apply = true;
    else if (a === "--json") opts.json = true;
    else if (a === "--override") opts.override = argv[++i];
    else if (a === "--help" || a === "-h") {
      printHelp();
      process.exit(0);
    } else {
      console.error(`Unknown argument: ${a}`);
      process.exit(2);
    }
  }
  if (!["opencode", "dsh", "list"].includes(opts.runtime)) {
    console.error(`--runtime must be one of: opencode, dsh, list (got "${opts.runtime}")`);
    process.exit(2);
  }
  if (!opts.dryRun && !opts.apply) opts.dryRun = true; // never write without --apply
  return opts;
}

function printHelp() {
  console.log(`apply.mjs — per-runtime generator for the agent roster

Usage:
  node apply.mjs --runtime <opencode|dsh|list> [options]

Options:
  --runtime <id>   opencode | dsh | list (default: list)
  --config <path>  Target opencode config file (default: %USERPROFILE%\\.config\\opencode\\opencode.json)
  --profiles <p>   profiles.json override (custom providers live there)
  --dry-run        Print the plan without writing (DEFAULT)
  --apply          Write changes (timestamped backup first)
  --json           Emit the computed patch as JSON (opencode/dsh)
  --override <j>   Internal: inline {"strong","flash"} resolution for set-models.mjs

Rules:
  - Never writes without --apply; dry-run is the default.
  - Custom providers store only the "{env:VAR}" literal in the config; the key
    is never persisted in clear text.
  - Test-only rule: do NOT --apply against the real global opencode.json;
    functional tests must use a temp copy via --config.
`);
}

function readUtf8(p) {
  const buf = readFileSync(p);
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    return buf.subarray(3).toString("utf8");
  }
  return buf.toString("utf8");
}

function loadJson(p) {
  try {
    return JSON.parse(readUtf8(p));
  } catch {
    return null;
  }
}

function backupStamp() {
  const d = new Date();
  const p = (n, w = 2) => String(n).padStart(w, "0");
  return (
    `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}` +
    `-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}` +
    `-${p(d.getMilliseconds(), 3)}`
  );
}

// ---------------------------------------------------------------------------
// Roster / profile resolution
// ---------------------------------------------------------------------------

function resolveProfile(profiles, override, profilesPath = PROFILES_PATH) {
  if (override) {
    let o = null;
    try {
      o = JSON.parse(override);
    } catch {
      console.error(`--override is not valid JSON: ${override}`);
      process.exit(2);
    }
    if (!o || typeof o.strong !== "string" || typeof o.flash !== "string") {
      console.error("--override must be {\"strong\":\"...\",\"flash\":\"...\"}");
      process.exit(2);
    }
    return { name: "(override)", strong: o.strong, flash: o.flash };
  }
  if (!profiles || !profiles.profiles || typeof profiles.current !== "string") {
    console.error(`profiles.json is malformed or missing: ${profilesPath}`);
    process.exit(2);
  }
  const current = profiles.profiles[profiles.current];
  if (!current || typeof current.strong !== "string" || typeof current.flash !== "string") {
    console.error(`profiles.json: profile "${profiles.current}" is missing or malformed`);
    process.exit(2);
  }
  return { name: profiles.current, strong: current.strong, flash: current.flash };
}

function desiredModelFor(agent, profile) {
  return agent.tier === "strong" ? profile.strong : profile.flash;
}

function splitProviderModel(full) {
  const i = full.indexOf("/");
  if (i === -1) return { provider: null, model: full };
  return { provider: full.slice(0, i), model: full.slice(i + 1) };
}

// ---------------------------------------------------------------------------
// OpenCode adapter (surgical text merge of agent.<name>.model)
// ---------------------------------------------------------------------------

/**
 * Find the byte range of the JSON object opened by `{` at openIdx.
 * Returns { open, close } or null when unbalanced.
 */
function findObjectRange(text, openIdx) {
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = openIdx; i < text.length; i++) {
    const ch = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') {
      inStr = true;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return { open: openIdx, close: i };
    }
  }
  return null;
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Locate the JSON object for `"name": { ... }` inside a bounded section.
 * Returns { nameIdx, open, close } or null.
 */
function findNamedObject(text, sectionStart, sectionEnd, name) {
  const re = new RegExp(`"${escapeRe(name)}"\\s*:\\s*\\{`, "g");
  re.lastIndex = sectionStart;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index >= sectionEnd) break;
    const range = findObjectRange(text, text.indexOf("{", m.index));
    if (range && range.close <= sectionEnd) {
      return { nameIdx: m.index, open: range.open, close: range.close };
    }
  }
  return null;
}

/**
 * Compute the surgical change for one agent block.
 * Returns { kind: "replace"|"insert", start, end, text, current, desired } or
 * { kind: "none", current, desired }.
 */
function computeAgentEdit(text, block, desired) {
  const content = text.slice(block.open + 1, block.close);
  const modelRe = /^([ \t]*"model"[ \t]*:[ \t]*)("[^"]*")([ \t]*,?)$/m;
  const m = content.match(modelRe);
  if (m) {
    const current = m[2].slice(1, -1);
    if (current === desired) return { kind: "none", current, desired };
    const absStart = block.open + 1 + m.index + m[1].length;
    const absEnd = absStart + m[2].length;
    return {
      kind: "replace",
      start: absStart,
      end: absEnd,
      text: `"${desired}"`,
      current,
      desired,
    };
  }
  // model key missing: insert a line right after the opening brace.
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const lineStart = text.lastIndexOf("\n", block.nameIdx - 1) + 1;
  const indent = text.slice(lineStart, block.nameIdx);
  const insertAt = block.open + 1;
  return {
    kind: "insert",
    start: insertAt,
    end: insertAt,
    text: `${eol}${indent}  "model": "${desired}",`,
    current: null,
    desired,
  };
}

function applySegments(text, segments) {
  const sorted = [...segments].sort((a, b) => a.start - b.start);
  let out = "";
  let last = 0;
  for (const s of sorted) {
    out += text.slice(last, s.start) + s.text;
    last = s.end;
  }
  out += text.slice(last);
  return out;
}

function computeOpenCodePlan(text, roster, profile) {
  const sectionRe = /"agent"\s*:\s*\{/;
  const sectionMatch = sectionRe.exec(text);
  const changes = [];
  if (!sectionMatch) {
    return { sectionFound: false, changes };
  }
  const sectionOpen = text.indexOf("{", sectionMatch.index);
  const sectionRange = findObjectRange(text, sectionOpen);
  if (!sectionRange) return { sectionFound: false, changes };

  for (const agent of roster.agents) {
    const desired = desiredModelFor(agent, profile);
    const block = findNamedObject(
      text,
      sectionOpen,
      sectionRange.close,
      agent.name
    );
    if (!block) {
      changes.push({
        agent: agent.name,
        kind: "missing-block",
        current: null,
        desired,
        edit: null,
      });
      continue;
    }
    const edit = computeAgentEdit(text, block, desired);
    changes.push({ agent: agent.name, kind: edit.kind, current: edit.current, desired, edit });
  }
  return { sectionFound: true, changes };
}

// ---------------------------------------------------------------------------
// Custom providers (declared in profiles.json "providers"; key by env-var name)
// ---------------------------------------------------------------------------

function deepEqual(a, b) {
  if (a === b) return true;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, b[i]));
  }
  if (a && b && typeof a === "object" && typeof b === "object") {
    const ka = Object.keys(a);
    const kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    return ka.every((k) => Object.prototype.hasOwnProperty.call(b, k) && deepEqual(a[k], b[k]));
  }
  return false;
}

function loadProviders(profiles) {
  const raw = profiles ? profiles.providers : undefined;
  if (raw === undefined) return {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    console.error('❌ profiles.json: "providers" must be an object keyed by provider id');
    process.exit(2);
  }
  for (const [id, entry] of Object.entries(raw)) {
    const ok =
      entry &&
      typeof entry === "object" &&
      typeof entry.baseURL === "string" &&
      entry.baseURL.length > 0 &&
      typeof entry.apiKeyEnv === "string" &&
      entry.apiKeyEnv.length > 0 &&
      Array.isArray(entry.models) &&
      entry.models.length > 0 &&
      entry.models.every((m) => typeof m === "string" && m.length > 0);
    if (!ok) {
      console.error(`❌ profiles.json: provider "${id}" is malformed (expected baseURL, apiKeyEnv, models[])`);
      process.exit(2);
    }
  }
  return raw;
}

/** Desired opencode entry: the apiKey is the documented "{env:VAR}" literal. */
function desiredProviderEntry(entry) {
  return {
    options: { baseURL: entry.baseURL, apiKey: `{env:${entry.apiKeyEnv}}` },
    models: Object.fromEntries(entry.models.map((m) => [m, {}])),
  };
}

function serializeEntry(desired, indent, eol = "\n") {
  return JSON.stringify(desired, null, 2)
    .split("\n")
    .map((line, i) => (i === 0 ? line : indent + line))
    .join(eol);
}

/**
 * Compute the surgical plan for the config's top-level "provider" block.
 * Returns { changes: [{id, kind: none|replace|insert, desired}], segments }.
 * Segments apply to the original text (brace-matching, same as "agent").
 */
function computeProviderPlan(text, providers) {
  const ids = Object.keys(providers);
  const changes = [];
  const segments = [];
  if (ids.length === 0) return { changes, segments };
  const eol = text.includes("\r\n") ? "\r\n" : "\n";

  let sectionOpen = -1;
  let sectionClose = -1;
  const sectionMatch = /"provider"\s*:\s*\{/.exec(text);
  if (sectionMatch) {
    const range = findObjectRange(text, text.indexOf("{", sectionMatch.index));
    if (range) {
      sectionOpen = range.open;
      sectionClose = range.close;
    }
  }

  const missing = [];
  for (const id of ids) {
    const desired = desiredProviderEntry(providers[id]);
    if (sectionOpen === -1) {
      missing.push({ id, desired });
      continue;
    }
    const block = findNamedObject(text, sectionOpen, sectionClose, id);
    if (!block) {
      missing.push({ id, desired });
      continue;
    }
    let existing = null;
    try {
      existing = JSON.parse(text.slice(block.open, block.close + 1));
    } catch {
      existing = null;
    }
    if (existing && deepEqual(existing, desired)) {
      changes.push({ id, kind: "none", desired });
      continue;
    }
    const lineStart = text.lastIndexOf("\n", block.nameIdx - 1) + 1;
    const indent = text.slice(lineStart, block.nameIdx);
    segments.push({ start: block.open, end: block.close + 1, text: serializeEntry(desired, indent, eol) });
    changes.push({ id, kind: "replace", desired });
  }

  if (missing.length === 0) return { changes, segments };

  if (sectionOpen !== -1) {
    // Append the missing entries to the existing section (comma-aware).
    const content = text.slice(sectionOpen + 1, sectionClose);
    const closeLineStart = text.lastIndexOf("\n", sectionClose - 1) + 1;
    const closeIndent = (text.slice(closeLineStart, sectionClose).match(/^[ \t]*/) || [""])[0];
    const entryIndent = closeIndent + "  ";
    const joined = missing
      .map(({ id, desired }) => `"${id}": ${serializeEntry(desired, entryIndent, eol)}`)
      .join(`,${eol}${entryIndent}`);
    if (content.trim() === "") {
      segments.push({ start: sectionOpen + 1, end: sectionClose, text: `${eol}${entryIndent}${joined}${eol}${closeIndent}` });
    } else {
      let insertAt = sectionClose - 1;
      while (insertAt > sectionOpen && /\s/.test(text[insertAt])) insertAt--;
      segments.push({ start: insertAt + 1, end: insertAt + 1, text: `,${eol}${entryIndent}${joined}` });
    }
  } else {
    // No provider section yet: create it at the top level of the root object.
    const rootOpen = text.search(/\{/);
    const rootRange = rootOpen === -1 ? null : findObjectRange(text, rootOpen);
    if (!rootRange) {
      console.error("❌ Cannot locate the root JSON object; the provider block was not injected.");
      process.exit(1);
    }
    const sectionIndent = "  ";
    const entryIndent = "    ";
    const joined = missing
      .map(({ id, desired }) => `"${id}": ${serializeEntry(desired, entryIndent, eol)}`)
      .join(`,${eol}${entryIndent}`);
    const sectionText = `"provider": {${eol}${entryIndent}${joined}${eol}${sectionIndent}}`;
    const rootContent = text.slice(rootOpen + 1, rootRange.close);
    if (rootContent.trim() === "") {
      segments.push({ start: rootOpen + 1, end: rootRange.close, text: `${eol}${sectionIndent}${sectionText}${eol}` });
    } else {
      segments.push({ start: rootOpen + 1, end: rootOpen + 1, text: `${eol}${sectionIndent}${sectionText},` });
    }
  }
  for (const { id, desired } of missing) changes.push({ id, kind: "insert", desired });
  return { changes, segments };
}

function backupAndWrite(target, content) {
  const backup = `${target}.roster.bak-${backupStamp()}`;
  copyFileSync(target, backup);
  writeFileSync(target, content);
  return backup;
}

function runOpenCode(opts, roster, profile, providers) {
  const target = opts.config || DEFAULT_OPENCODE_CONFIG;
  if (!existsSync(target)) {
    console.error(`❌ OpenCode config not found: ${target}`);
    process.exit(1);
  }
  const text = readUtf8(target);
  const plan = computeOpenCodePlan(text, roster, profile);
  if (!plan.sectionFound) {
    console.error(`❌ No "agent" section found in ${target}; nothing to patch.`);
    process.exit(1);
  }
  const providerPlan = computeProviderPlan(text, providers);

  const patch = {};
  const providerPatch = {};
  const segments = [];
  const lines = [];
  for (const c of plan.changes) {
    if (c.kind === "none") {
      lines.push({ agent: c.agent, status: "ok", current: c.current, desired: c.desired });
      continue;
    }
    if (c.kind === "missing-block") {
      lines.push({ agent: c.agent, status: "missing-block", current: null, desired: c.desired });
      continue;
    }
    lines.push({ agent: c.agent, status: "changed", current: c.current, desired: c.desired });
    patch[c.agent] = { model: c.desired };
    segments.push({ start: c.edit.start, end: c.edit.end, text: c.edit.text });
  }
  for (const c of providerPlan.changes) {
    if (c.kind !== "none") providerPatch[c.id] = c.desired;
  }
  segments.push(...providerPlan.segments);
  const providerChanged = providerPlan.changes.filter((c) => c.kind !== "none").length;

  if (opts.json) {
    console.log(
      JSON.stringify(
        { runtime: "opencode", config: target, profile: profile.name, patch: { agent: patch, provider: providerPatch } },
        null,
        2
      )
    );
    return;
  }

  console.log(`\nRuntime: opencode`);
  console.log(`Target:   ${target}`);
  console.log(`Profile:  ${profile.name} (strong=${profile.strong}, flash=${profile.flash})`);
  console.log(`Mode:     ${opts.apply ? "apply" : "dry-run"}\n`);
  console.log("Agents (20):");
  for (const l of lines) {
    if (l.status === "changed") {
      console.log(`  [CHANGED] ${l.agent}: ${l.current} -> ${l.desired}`);
    } else if (l.status === "missing-block") {
      console.log(`  [MISSING-BLOCK] ${l.agent}: (no agent block in config) -> ${l.desired} (skipped)`);
    } else {
      console.log(`  [OK] ${l.agent}: ${l.current}`);
    }
  }

  const changedCount = lines.filter((l) => l.status === "changed").length;
  const missingCount = lines.filter((l) => l.status === "missing-block").length;
  console.log(
    `\n${changedCount} agent model(s) would change${missingCount ? `, ${missingCount} agent block(s) missing` : ""}.`
  );

  if (providerPlan.changes.length > 0) {
    console.log(`\nCustom providers (${providerPlan.changes.length} declared in profiles.json):`);
    for (const c of providerPlan.changes) {
      if (c.kind === "none") {
        console.log(`  [OK] ${c.id}: in sync`);
      } else if (c.kind === "replace") {
        console.log(`  [CHANGED] ${c.id}: options/models merged surgically`);
      } else {
        console.log(`  [INSERT] ${c.id}: added to the "provider" block`);
      }
    }
    console.log(`\n${providerChanged} provider entr${providerChanged === 1 ? "y" : "ies"} would change.`);
  }

  const totalChanged = changedCount + providerChanged;

  if (opts.apply && totalChanged > 0) {
    const newText = applySegments(text, segments);
    const backup = backupAndWrite(target, newText);
    console.log(`✅ Applied ${totalChanged} change(s) to ${target}`);
    console.log(`💾 Backup created: ${backup}`);
  } else if (opts.apply) {
    console.log("✅ Already in sync — nothing written, no backup created.");
  } else {
    console.log("✨ Dry-run complete. No changes written (use --apply to write).");
  }
}

// ---------------------------------------------------------------------------
// dsh adapter (subagent vs subagent_strong semantics)
// ---------------------------------------------------------------------------

function dshRoutingFor(agent) {
  let tool = "main";
  if (agent.delegate_only) {
    tool = agent.tier === "strong" ? "subagent_strong" : "subagent";
  }
  return {
    tier: agent.tier,
    effort: agent.effort,
    delegate_only: agent.delegate_only,
    tool,
  };
}

function buildRoutingJson(roster) {
  const routing = {};
  for (const a of roster.agents) routing[a.name] = dshRoutingFor(a);
  return {
    version: 1,
    source: "_shared/agent-roster/roster.json",
    generatedAt: new Date().toISOString(),
    routing,
  };
}

/**
 * The preset routes delegated work through env-var fallbacks
 * (DSH_FLASH_PROVIDER/MODEL, DSH_STRONG_PROVIDER/MODEL). Only those literal
 * defaults are trivially safe to patch; everything else stays untouched.
 */
function extractFallback(text, varName) {
  const re = new RegExp(`DSH_${varName} \\|\\| '([^']*)'`);
  const m = text.match(re);
  return m ? m[1] : null;
}

function computeDshPresetChanges(text, profile) {
  const strong = splitProviderModel(profile.strong);
  const flash = splitProviderModel(profile.flash);
  const current = {
    strongProvider: extractFallback(text, "STRONG_PROVIDER"),
    strongModel: extractFallback(text, "STRONG_MODEL"),
    flashProvider: extractFallback(text, "FLASH_PROVIDER"),
    flashModel: extractFallback(text, "FLASH_MODEL"),
  };
  const changes = [];
  const pairs = [
    { label: "DSH_STRONG_PROVIDER", current: current.strongProvider, desired: strong.provider },
    { label: "DSH_STRONG_MODEL", current: current.strongModel, desired: strong.model },
    { label: "DSH_FLASH_PROVIDER", current: current.flashProvider, desired: flash.provider },
    { label: "DSH_FLASH_MODEL", current: current.flashModel, desired: flash.model },
  ];
  for (const p of pairs) {
    if (p.current === null) {
      changes.push({ label: p.label, current: null, desired: p.desired, note: "fallback literal not found in preset (skipped)" });
    } else if (p.current !== p.desired) {
      changes.push({ label: p.label, current: p.current, desired: p.desired });
    }
  }
  return { current, changes };
}

function patchPresetFallbacks(text, changes) {
  let out = text;
  for (const c of changes) {
    if (c.current === null) continue;
    const from = `'${c.current}'`;
    if (!out.includes(from)) continue;
    out = out.replace(from, `'${c.desired}'`);
  }
  return out;
}

function runDsh(opts, roster, profile, providers) {
  if (!existsSync(DSH_PRESET_PATH)) {
    console.error(`❌ dsh preset not found: ${DSH_PRESET_PATH}`);
    process.exit(1);
  }
  const presetText = readUtf8(DSH_PRESET_PATH);
  const routing = buildRoutingJson(roster);
  const presetPlan = computeDshPresetChanges(presetText, profile);
  const providerLimitations = Object.keys(providers).map((id) => ({
    id,
    reason:
      "dsh has no provider block; model routing flows through DSH_* env literals in the preset, so baseURL/apiKeyEnv are not injected (limitation reported, pipeline continues)",
  }));

  // Sync state of an existing routing file.
  let routingState = "missing";
  let routingExists = existsSync(DSH_ROUTING_PATH);
  if (routingExists) {
    const existing = loadJson(DSH_ROUTING_PATH);
    if (existing && existing.version === 1 && existing.routing) {
      let same = true;
      for (const a of roster.agents) {
        const got = existing.routing[a.name];
        const want = dshRoutingFor(a);
        if (!got || got.tier !== want.tier || got.tool !== want.tool) {
          same = false;
          break;
        }
      }
      routingState = same ? "in-sync" : "stale";
    } else {
      routingState = "stale";
    }
  }

  const routingDiffers = routingState !== "in-sync";
  const presetChanged = presetPlan.changes.filter((c) => c.current !== null).length;

  if (opts.json) {
    console.log(
      JSON.stringify(
        {
          runtime: "dsh",
          preset: DSH_PRESET_PATH,
          routing: DSH_ROUTING_PATH,
          profile: profile.name,
          routingState,
          presetChanges: presetPlan.changes,
          providerLimitations,
        },
        null,
        2
      )
    );
    return;
  }

  console.log(`\nRuntime: dsh (DeepSeek Harness)`);
  console.log(`Preset:  ${DSH_PRESET_PATH}`);
  console.log(`Profile: ${profile.name} (strong=${profile.strong}, flash=${profile.flash})`);
  console.log(`Mode:    ${opts.apply ? "apply" : "dry-run"}\n`);

  console.log(`Routing file (${DSH_ROUTING_PATH}):`);
  if (routingState === "in-sync") {
    console.log(`  [OK] already in sync with roster.json (no write needed)`);
  } else {
    console.log(`  [${routingState === "missing" ? "CREATE" : "OVERWRITE"}] agent → tier/effort/tool for the 20 agents`);
  }

  console.log("\nPreset fallback defaults (trivially-safe literal updates only):");
  const changedLiterals = presetPlan.changes.filter((c) => c.current !== null);
  if (changedLiterals.length === 0) {
    console.log("  [OK] fallback defaults already match the current profile");
  }
  for (const c of presetPlan.changes) {
    if (c.current === null) {
      console.log(`  [WARN] ${c.label}: ${c.note}`);
    } else {
      console.log(`  [CHANGED] ${c.label}: '${c.current}' -> '${c.desired}'`);
    }
  }

  if (providerLimitations.length > 0) {
    console.log("\nCustom providers (unsupported on dsh — limitation reported, not fatal):");
    for (const l of providerLimitations) {
      console.log(`  [LIMITATION] "${l.id}": ${l.reason}`);
    }
  }

  if (opts.apply) {
    // 1. routing.json (derived artifact, regenerated freely)
    if (routingDiffers) {
      mkdirSync(dirname(DSH_ROUTING_PATH), { recursive: true });
      writeFileSync(DSH_ROUTING_PATH, JSON.stringify(routing, null, 2) + "\n");
      console.log(`\n✅ Wrote ${DSH_ROUTING_PATH}`);
    } else {
      console.log(`\n✅ ${DSH_ROUTING_PATH} already in sync.`);
    }
    // 2. preset fallback literals (backup first, only when a literal changes)
    if (changedLiterals.length > 0) {
      const patched = patchPresetFallbacks(presetText, changedLiterals);
      const backup = backupAndWrite(DSH_PRESET_PATH, patched);
      console.log(`✅ Updated ${changedLiterals.length} fallback literal(s) in ${DSH_PRESET_PATH}`);
      console.log(`💾 Backup created: ${backup}`);
    } else {
      console.log("✅ Preset unchanged.");
    }
  } else {
    console.log("\n✨ Dry-run complete. No changes written (use --apply to write).");
  }
}

// ---------------------------------------------------------------------------
// list mode (detected runtimes + current vs roster mapping)
// ---------------------------------------------------------------------------

function runList(opts, roster, profile) {
  const opencodeExists = existsSync(opts.config || DEFAULT_OPENCODE_CONFIG);
  const dshExists = existsSync(DSH_PRESET_PATH);

  console.log("\nDetected runtimes:");
  console.log(
    `  opencode: ${opencodeExists ? "config found" : "not detected"} (${opts.config || DEFAULT_OPENCODE_CONFIG})`
  );
  console.log(`  dsh:      ${dshExists ? "preset found" : "not detected"} (${DSH_PRESET_PATH})`);
  console.log(`\nCurrent profile: ${profile.name} (strong=${profile.strong}, flash=${profile.flash})\n`);

  if (opencodeExists) {
    const text = readUtf8(opts.config || DEFAULT_OPENCODE_CONFIG);
    const plan = computeOpenCodePlan(text, roster, profile);
    if (!plan.sectionFound) {
      console.log("opencode: no \"agent\" section in config — nothing to map.");
    } else {
      console.log("opencode — current vs roster (agent → model):");
      for (const c of plan.changes) {
        if (c.kind === "missing-block") {
          console.log(`  ${c.agent}: (no block) -> ${c.desired} [MISSING]`);
        } else {
          const mark = c.kind === "none" ? "OK" : "DIFF";
          console.log(`  ${c.agent}: ${c.current ?? "(unset)"} -> ${c.desired} [${mark}]`);
        }
      }
      const pending = plan.changes.filter((c) => c.kind !== "none" && c.kind !== "missing-block").length;
      console.log(`  → ${pending} pending model change(s).\n`);
    }
  }

  if (dshExists) {
    const presetText = readUtf8(DSH_PRESET_PATH);
    const presetPlan = computeDshPresetChanges(presetText, profile);
    console.log("dsh — preset fallback defaults (env-var routing: DSH_* wins over defaults):");
    const pairs = [
      { label: "DSH_STRONG_PROVIDER", current: presetPlan.current.strongProvider, desired: splitProviderModel(profile.strong).provider },
      { label: "DSH_STRONG_MODEL", current: presetPlan.current.strongModel, desired: splitProviderModel(profile.strong).model },
      { label: "DSH_FLASH_PROVIDER", current: presetPlan.current.flashProvider, desired: splitProviderModel(profile.flash).provider },
      { label: "DSH_FLASH_MODEL", current: presetPlan.current.flashModel, desired: splitProviderModel(profile.flash).model },
    ];
    for (const p of pairs) {
      const mark = p.current === p.desired ? "OK" : "DIFF";
      console.log(`  ${p.label}: '${p.current}' -> '${p.desired}' [${mark}]`);
    }
    console.log(
      `  roster.routing.json: ${existsSync(DSH_ROUTING_PATH) ? "present" : "missing (generate with --runtime dsh --apply)"}`
    );
  }
  console.log("");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const roster = loadJson(ROSTER_PATH);
  if (!roster || !Array.isArray(roster.agents) || roster.agents.length !== 20) {
    console.error(`❌ roster.json is missing or does not declare exactly 20 agents: ${ROSTER_PATH}`);
    process.exit(1);
  }
  const profilesPath = opts.profilesPath || PROFILES_PATH;
  const profiles = loadJson(profilesPath);
  const profile = resolveProfile(profiles, opts.override, profilesPath);
  const providers = loadProviders(profiles);

  if (opts.runtime === "opencode") runOpenCode(opts, roster, profile, providers);
  else if (opts.runtime === "dsh") runDsh(opts, roster, profile, providers);
  else runList(opts, roster, profile);
}

main();
