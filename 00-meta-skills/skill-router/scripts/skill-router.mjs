#!/usr/bin/env node
/**
 * skill-router.mjs — Deterministic router that replaces ~80% of stochastic
 * "which skill do I load?" LLM reasoning with exact trigger matching.
 *
 * v2 hardening:
 *   - Word-boundary regex for trigger matching (no substring traps like
 *     "ref as prop" matching the query "rename a prop").
 *   - Min trigger length 4 (so "a", "to", "adr" are ignored).
 *   - Confidence=1.0 requires an exact trigger word match (not keyword overlap).
 *   - All output is validated by validate-output.mjs before being emitted.
 *
 * Usage:
 *   node skill-router.mjs --query "add OAuth login" [--diff <n>] [--json]
 *
 * Output: { primary, secondary[], confidence, trivial, skipJudgmentDay,
 *           deprecatedHit, tier1toLoad[] }
 *
 * Exit codes: 0 = routed (primary may be null if confidence <0.6),
 *             2 = contract violation (JSON output suppressed).
 */
import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from "node:fs";
import { join, basename, dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { validateRouterOutput } from "./validate-output.mjs";
import { parseFrontmatter, getField, getNestedField, parseTriggers } from "../../../_shared/frontmatter.mjs";
import { getTurnCachePath } from "../../../_shared/script-utils.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CATALOG_ROOT = resolve(__dirname, "../../..");

const args = process.argv.slice(2);
let query = null, diffLines = null, jsonOut = false, turnCache = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--") continue;
  if (args[i] === "--query") query = args[++i];
  else if (args[i] === "--diff") diffLines = parseInt(args[++i], 10);
  else if (args[i] === "--json") jsonOut = true;
  else if (args[i] === "--turn-cache") turnCache = args[++i];
  else if (args[i] === "--help" || args[i] === "-h") {
    console.log("Usage: skill-router.mjs --query \"<text>\" [--diff <n>] [--json] [--turn-cache <path>]");
    process.exit(0);
  }
}

if (!query) { console.error("Missing --query"); process.exit(2); }

function statSafe(p) { try { return statSync(p); } catch { return null; } }

// Directories that are never part of the skill catalog: gentle-ai-dsh is the
// DeepSeek Harness addon that vendors a duplicate copy of the catalog under
// gentle-ai-dsh/skills/; _shared holds shared resources, not skills. Walking
// the bundle made every skill score twice and duplicated "secondary" entries.
const EXCLUDED_DIRS = new Set(["gentle-ai-dsh", "_shared", "node_modules", ".git"]);

function walkSkills(dir, out = []) {
  const stat = statSafe(dir); if (!stat) return out;
  if (stat.isFile() && basename(dir) === "SKILL.md") return [dir];
  if (!stat.isDirectory()) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDED_DIRS.has(e.name) || e.name.startsWith("copia-de-seguridad")) continue;
    if (e.isDirectory()) walkSkills(join(dir, e.name), out);
    else if (e.isFile() && e.name === "SKILL.md") out.push(join(dir, e.name));
  }
  return out;
}

const getTriggerArray = parseTriggers;

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Normalizes text by decomposing Unicode characters (NFD), stripping
 * combining diacritical marks, and lowercasing so accented and unaccented
 * queries/triggers match identically.
 */
export function normalizeText(str) {
  return String(str ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * Builds a Unicode-aware word/phrase boundary regex so triggers containing
 * dots or non-ASCII characters (e.g. "PRD.md", "node.js", "socket.io") match
 * cleanly without substring traps.
 */
function buildWordBoundaryRegex(term) {
  return new RegExp(`(?<![\\p{L}\\p{N}_])${escapeRegex(term)}(?![\\p{L}\\p{N}_])`, "iu");
}

const MIN_TRIGGER_LENGTH = 4;

/**
 * Uppercase acronym triggers (JWT, ORM, E2E, CVE, ADR, ...) shorter than
 * MIN_TRIGGER_LENGTH carry exact routing intent and must not be silenced.
 * Mixed-case short tokens (verbs like "go", "add") stay below the floor.
 */
function passesTriggerLengthGate(rawTrigger, tLower) {
  const trimmed = rawTrigger.trim();
  if (tLower.length >= MIN_TRIGGER_LENGTH) return true;
  return trimmed.length >= 2 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);
}

/**
 * Tier 0 skills are already always-on context; tier1toLoad must never spend
 * its bounded slots on them. Mirror of TIER0_SKILLS in skills-loader.mjs.
 */
const TIER0_SKILLS = new Set([
  "odd-workflow",
  "skill-router",
  "skill-loader",
  "skill-validator",
  "testing-patterns",
  "code-reviewer",
  "engram-integration",
  "dod-checker",
  "decision-gate",
]);

// Build skill index (deduplicated by name: one skill may never appear twice)
const files = walkSkills(CATALOG_ROOT);
const index = [];
const seenNames = new Set();
for (const f of files) {
  const content = readFileSync(f, "utf8");
  const fm = parseFrontmatter(content);
  if (!fm) continue;
  const name = getField(fm, "name") || basename(dirname(f));
  if (seenNames.has(name)) continue; // never score the same skill twice
  seenNames.add(name);
  const desc = getField(fm, "description") || "";
  const triggers = getTriggerArray(fm);
  const depRaw = (getField(fm, "deprecated") || getNestedField(fm, "metadata", "deprecated") || "").replace(/^["']|["']$/g, "").trim();
  const deprecated = depRaw === "true";
  const redirect = (getField(fm, "redirect") || getNestedField(fm, "metadata", "redirect") || "").replace(/^["']|["']$/g, "").trim() || null;
  const rel = relative(CATALOG_ROOT, f).split(sep).join("/");
  const catMatch = rel.match(/^(\d{2}-[a-z-]+|professional-planner)\//i);
  const category = catMatch ? catMatch[1] : "root";
  index.push({ name, desc, triggers, deprecated, redirect, category, file: f });
}

// Build set of valid skill names for tier1toLoad validation
const validSkillNames = new Set(index.map((s) => s.name));

// Scoring
const qLower = normalizeText(query);
let scored = [];
for (const s of index) {
  if (s.deprecated) continue;
  let triggerScore = 0; // from word-boundary exact trigger matches
  let exactHit = false;
  const seenTriggers = new Set();
  const matchedTriggers = [];
  for (const t of s.triggers) {
    if (!t) continue;
    const tLower = normalizeText(t).trim();
    if (seenTriggers.has(tLower)) continue;
    seenTriggers.add(tLower);
    if (!passesTriggerLengthGate(t, tLower)) continue;
    // Unicode-aware word-boundary regex: full-word/phrase match, no substring traps
    const re = buildWordBoundaryRegex(tLower);
    if (re.test(qLower)) {
      triggerScore += 1.0;
      exactHit = true;
      matchedTriggers.push(tLower);
    }
  }
  // Description keyword overlap (subordinate — caps confidence <1.0)
  const descLower = normalizeText(s.desc);
  const queryNouns = qLower
    .split(/\s+/)
    .map((w) => w.replace(/^[^\p{L}\p{N}_]+|[^\p{L}\p{N}_]+$/gu, ""))
    .filter((w) => w.length >= MIN_TRIGGER_LENGTH);
  let kwHits = 0;
  for (const w of queryNouns) {
    const wRe = buildWordBoundaryRegex(w);
    if (wRe.test(descLower)) kwHits++;
  }
  const kwScore = Math.min(kwHits / 3, 0.5);
  const totalScore = triggerScore + kwScore;
  if (totalScore > 0) {
    scored.push({ name: s.name, score: totalScore, triggerScore, kwScore, exactHit, matchedTriggers, category: s.category });
  }
}
scored.sort((a, b) => b.score - a.score);

// When a multi-intent query hits ≥3 distinct exact triggers (e.g. PRD.md +
// APP_FLOW.md + TRD.md + DESIGN_SYSTEM.md), ensure skills that cover a new
// exact trigger rank ahead of skills that duplicate an already-covered trigger
// at the same triggerScore, so one shared trigger doesn't starve another intent.
const coveredExactTriggers = new Set();
const distinctExact = [];
const duplicateExactOrKw = [];
for (const entry of scored) {
  if (entry.triggerScore >= 1 && entry.matchedTriggers.some((t) => !coveredExactTriggers.has(t))) {
    for (const t of entry.matchedTriggers) coveredExactTriggers.add(t);
    distinctExact.push(entry);
  } else {
    duplicateExactOrKw.push(entry);
  }
}
if (distinctExact.length >= 3) {
  scored = [...distinctExact, ...duplicateExactOrKw];
}

// === Overlap-matrix resolution (D4, overlap-matrix spec) ===
// Load references/overlap-matrix.json and break semantic ties: if ≥2 members
// of a group appear in the top-4 scored candidates, promote the group's
// canonical to first place (primary) and keep the other members in secondary.
// Both skills stay routable — the matrix only de-ties, it never hides a skill.
const OVERLAP_MATRIX_PATH = join(__dirname, "../references/overlap-matrix.json");
function loadOverlapGroups() {
  try {
    const parsed = JSON.parse(readFileSync(OVERLAP_MATRIX_PATH, "utf8"));
    return Array.isArray(parsed.groups) ? parsed.groups : [];
  } catch {
    return [];
  }
}
const overlapGroups = loadOverlapGroups();
if (overlapGroups.length > 0 && scored.length > 0) {
  const top4Names = new Set(scored.slice(0, 4).map((s) => s.name));
  const leader = scored[0];
  for (const group of overlapGroups) {
    const members = group.members || [];
    // De-tie only when the group actually leads the routing: the current top-1
    // candidate must be a member of the group. Otherwise the members sitting in
    // the top-4 are keyword noise and must not displace a genuine primary
    // (e.g. "generate an app icon with the asset generator" must not promote
    // nano-banana just because banana-claude and nano-banana both kw-score).
    if (!leader || !members.includes(leader.name)) continue;
    const hitsInTop4 = members.filter((m) => top4Names.has(m)).length;
    if (hitsInTop4 >= 2) {
      const canonicalEntry = scored.find((s) => s.name === group.canonical);
      // Promote only when the canonical earned its place with its own trigger
      // hit (triggerScore >= 1). A canonical that entered the top-4 via keyword
      // overlap alone has no genuine claim to the primary slot: promoting it
      // would force confidence <=0.5 and primary=null. Keep the current leader.
      if (canonicalEntry && canonicalEntry.triggerScore >= 1) {
        scored = [canonicalEntry, ...scored.filter((s) => s.name !== canonicalEntry.name)];
      }
      break;
    }
  }
}

// Determine primary + deprecated hit
let primary = null;
let deprecatedHit = null;
let secondary = [];
let confidence = 0;
let triggeredExact = false;

// Check if query directly mentions a deprecated skill's exact name -> redirect immediately (R4-001)
for (const s of index) {
  if (s.deprecated) {
    const nameRe = buildWordBoundaryRegex(normalizeText(s.name));
    if (nameRe.test(qLower)) {
      primary = s.redirect;
      deprecatedHit = s.name;
      confidence = 1.0;
      triggeredExact = true;
      break;
    }
  }
}

if (!primary && scored.length > 0) {
  const top = scored[0];
  confidence = Math.min(top.score, 1.0);
  triggeredExact = top.exactHit;
  // Confidence=1.0 requires exact trigger match (not just keyword overlap)
  if (top.triggerScore < 1.0) confidence = Math.min(confidence, 0.5);
  if (confidence >= 0.6) primary = top.name;
  secondary = [...new Set(scored.slice(1, 5).map((s) => s.name))];
}

// Check if query mentions a deprecated skill name or trigger → redirect
if (!primary) {
  for (const s of index) {
    if (s.deprecated) {
      const nameRe = buildWordBoundaryRegex(normalizeText(s.name));
      let triggerHit = nameRe.test(qLower);
      if (!triggerHit && Array.isArray(s.triggers)) {
        for (const t of s.triggers) {
          if (!t) continue;
          const tLower = normalizeText(t).trim();
          if (!passesTriggerLengthGate(t, tLower)) continue;
          const tRe = buildWordBoundaryRegex(tLower);
          if (tRe.test(qLower)) {
            triggerHit = true;
            break;
          }
        }
      }
      if (triggerHit) {
        deprecatedHit = s.name;
        primary = s.redirect; // follow redirect deterministically
        confidence = 1.0;
        triggeredExact = true;
        break;
      }
    }
  }
}

// Heuristics (deterministic, no LLM)
const CRITICAL_MARKERS = /\b(auth|payment|billing|migration|security|ssl|secret|jwt|token|password|keys|credentials|database|sql|schema|seed|checkout|env)\b/i;
const trivial = diffLines !== null && diffLines < 20 && !CRITICAL_MARKERS.test(qLower);
const skipJudgmentDay = diffLines !== null && diffLines < 100 && !CRITICAL_MARKERS.test(qLower);
const STRUCTURED_FLOW_MARKERS = /\b(sdd|spec-first|openspec|formal spec|waterfall|rfc document)\b/i;
const suggestsStructuredFlow = STRUCTURED_FLOW_MARKERS.test(qLower);

// UI Surface Markers: auto-trigger design governance for any visual/UI task (Spanish & English)
const UNAMBIGUOUS_UI_MARKERS = /\b(ui|ux|frontend|front-end|css|tailwind|jsx|tsx|boton|botones|button|modal|dialog|drawer|popup|navbar|sidebar|hero|landing|dashboard|formulario|form|pantalla|screen|animaci[oó]n|animation|motion|dark\s*mode|light\s*mode|paleta|palette|tipograf[ií]a|typography|layout|card|tarjeta|toast|tooltip|skeleton|spinner)\b/i;
const AMBIGUOUS_UI_MARKERS = /\b(vista|vistas|view|views|page|pages|p[aá]gina|estado|state|style|styles|estilo|estilos|tema|theme|diseñ[oa]s?|disen[oa]s?|design|interfaz|interfaces|componente|componentes|component|components|tabla|table|icono|icon)\b/i;
const PURE_LOGIC_BACKEND_MARKERS = /\b(backend|api|endpoint|endpoints?|controller|middleware|sql|migration|database|base\s+de\s+datos|schema|esquema|postgres|prisma|reducer|state\s+machine|service|resolver|typescript|ts\b|vista\s+materializada|materialized\s+view)\b/i;

const isUiTask =
  UNAMBIGUOUS_UI_MARKERS.test(query) ||
  UNAMBIGUOUS_UI_MARKERS.test(qLower) ||
  ((AMBIGUOUS_UI_MARKERS.test(query) || AMBIGUOUS_UI_MARKERS.test(qLower)) &&
    !PURE_LOGIC_BACKEND_MARKERS.test(query) &&
    !PURE_LOGIC_BACKEND_MARKERS.test(qLower));

if (isUiTask && validSkillNames.has("design-driven")) {
  if (primary !== "design-driven" && !secondary.includes("design-driven")) {
    secondary = ["design-driven", ...secondary].slice(0, 4);
  }
}

const secondarySliceCount = distinctExact.length >= 4 ? Math.min(distinctExact.length - 1, 4) : 2;
const tier1toLoad = [...new Set(primary ? [primary, ...secondary.slice(0, secondarySliceCount)] : secondary.slice(0, 3))].filter(
  (name) => !TIER0_SKILLS.has(name)
);
if (isUiTask && validSkillNames.has("design-driven") && !tier1toLoad.includes("design-driven") && tier1toLoad.length < 5) {
  tier1toLoad.push("design-driven");
}

const output = {
  primary,
  secondary,
  confidence: Math.round(confidence * 100) / 100,
  suggestsStructuredFlow,
  isUiTask,
  trivial,
  skipJudgmentDay,
  deprecatedHit,
  tier1toLoad,
};

// Validate output against the contract
const validation = validateRouterOutput(output, { validSkillNames, triggeredExact });
if (!validation.ok) {
  const envelope = { primary: null, secondary: [], confidence: 0, error: "contract-violation", violations: validation.violations };
  if (jsonOut) console.log(JSON.stringify(envelope, null, 2));
  else console.error("❌ skill-router contract violation:", validation.violations.join("; "));
  process.exit(2);
}

// Write workspace-scoped turn cache so skills-loader --check can read it
const turnCacheFile = getTurnCachePath(process.cwd(), turnCache);
try {
  writeFileSync(
    turnCacheFile,
    JSON.stringify(
      {
        query,
        diffLines,
        tier1: output.tier1toLoad,
        primary: output.primary,
        ts: Date.now(),
      },
      null,
      2
    ),
    "utf8"
  );
} catch {
  // Gracefully ignore write failures in read-only / restricted environments
}

if (jsonOut) console.log(JSON.stringify(output, null, 2));
else {
  console.log("🎯 Skill Router");
  console.log(`  Query:       "${query}"`);
  console.log(`  Primary:     ${primary || "(none, agent decides)"}`);
  console.log(`  Secondary:   [${secondary.join(", ")}]`);
  console.log(`  Confidence:  ${output.confidence}`);
  console.log(`  isUiTask:    ${isUiTask}`);
  console.log(`  trivial:     ${trivial}`);
  console.log(`  skipJD:      ${skipJudgmentDay}`);
  if (deprecatedHit) console.log(`  deprecatedHit: ${deprecatedHit} -> redirect to ${primary}`);
  console.log(`  Tier1 load:  [${tier1toLoad.join(", ")}]`);
}
