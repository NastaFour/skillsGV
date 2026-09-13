#!/usr/bin/env node
/**
 * Skill Validator — agentskills.io spec compliance checker
 *
 * Usage:
 *   node validate-skills.mjs [path] [--json] [--strict] [--skip-index-sync] [--check-deps]
 *
 * Default path: current working directory (recursive)
 *
 * Exit codes:
 *   0 = pass (only warnings or clean)
 *   1 = errors found
 *   2 = invalid arguments
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, basename, relative, resolve, sep, dirname, delimiter } from "node:path";
import { fileURLToPath } from "node:url";
import { checkCatalog, readTier0Set, walkSkillPaths } from "../../../_shared/catalog-manifest.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const args = process.argv.slice(2);
let jsonOutput = false;
let strictMode = false;
let skipIndexSync = false;
let checkDeps = false;
let targetPath = process.cwd();

for (const arg of args) {
  if (arg === "--json") jsonOutput = true;
  else if (arg === "--strict") strictMode = true;
  else if (arg === "--skip-index-sync") skipIndexSync = true;
  else if (arg === "--check-deps") checkDeps = true;
  else if (arg === "--help" || arg === "-h") {
    printHelp();
    process.exit(0);
  } else if (!arg.startsWith("-")) {
    targetPath = resolve(arg);
  }
}

if (!statSafe(targetPath)) {
  console.error(`Path not found: ${targetPath}`);
  process.exit(2);
}

const results = [];
let totalErrors = 0;
let totalWarnings = 0;
let totalInfo = 0;

function statSafe(p) {
  try {
    return statSync(p);
  } catch {
    return null;
  }
}

// Directories that are never part of the skill catalog, with the reason:
// - gentle-ai-dsh: the DeepSeek Harness addon vendors a duplicate copy of the
//   catalog under gentle-ai-dsh/skills/ (206 bundle SKILL.md files). The main
//   catalog is the single source of truth; the bundle is a snapshot consumed
//   by the addon's own installer, not by catalog tooling. Walking it doubled
//   every index-sync/agents-sync finding.
// - _shared: shared resources (scripts, references, conventions). Some bundles
//   carry a SKILL.md marker there, but it is not a skill (name "_shared" is
//   invalid by spec) — the registry protocol already excludes it; the walker
//   must not even treat it as a skill candidate.
const EXCLUDED_DIRS = new Set(["gentle-ai-dsh", "_shared", "node_modules", ".git"]);

function walkSkills(dir) {
  const out = [];
  const stat = statSafe(dir);
  if (!stat) return out;
  if (stat.isFile() && basename(dir) === "SKILL.md") return [dir];
  if (!stat.isDirectory()) return out;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (EXCLUDED_DIRS.has(e.name) || e.name.startsWith("copia-de-seguridad")) continue;
      out.push(...walkSkills(full));
    } else if (e.isFile() && e.name === "SKILL.md") {
      out.push(full);
    }
  }
  return out;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return null;
  return { front: match[1], body: match[2] };
}

function getField(front, field) {
  const re = new RegExp(`^${field}:\\s*(.+?)(?:\\r?\\n[a-z-]+:|$)`, "ms");
  const m = front.match(re);
  return m ? m[1].trim() : null;
}

/**
 * Read a field nested inside a top-level block (e.g. metadata: { field: ... }).
 * Handles 2-space YAML indentation. Returns trimmed string value or null.
 */
function getNestedField(front, parent, field) {
  // Find the parent's start line and capture everything up to the next
  // non-indented line (column 0 key) or end of frontmatter.
  const startRe = new RegExp(`^${parent}:\\s*$`, "m");
  const startMatch = front.match(startRe);
  if (!startMatch) return null;
  const startIdx = startMatch.index + startMatch[0].length;
  // Take everything from startIdx onward, but stop at the first line that
  // has no leading whitespace (i.e. next top-level key) or end of string.
  const rest = front.slice(startIdx);
  const lines = rest.split(/\r?\n/);
  const blockLines = [];
  for (const line of lines) {
    if (line === "") { blockLines.push(line); continue; }
    if (!/^\s/.test(line)) break; // next top-level key
    blockLines.push(line);
  }
  const block = blockLines.join("\n");
  // Now find the field inside the block
  const fieldRe = new RegExp(`^\\s+${field}:\\s*(.+?)(?:\\r?\\n\\s+[a-z_-]+:|\\r?\\n[\\S]|$)`, "ms");
  const fm = block.match(fieldRe);
  if (!fm) return null;
  return fm[1].trim();
}

function validate(file, catalogNames) {
  const issues = [];
  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch (err) {
    return [{ severity: "error", check: "read", msg: `Cannot read file: ${err.message}` }];
  }

  const parsed = parseFrontmatter(content);
  if (!parsed) {
    issues.push({ severity: "error", check: "frontmatter", msg: "Missing or malformed YAML frontmatter (must start with --- and end with ---)" });
    return issues;
  }
  const { front, body } = parsed;

  // Duplicate key check in YAML frontmatter (e.g. repeated keys or "compatibility: compatibility:")
  const seenFrontmatterKeys = new Set();
  for (const line of front.split(/\r?\n/)) {
    const inlineDup = line.match(/^([a-z0-9_-]+):\s*\1:/i);
    if (inlineDup) {
      issues.push({ severity: "error", check: "frontmatter-duplicate-key", msg: `Duplicate inline key prefix detected: "${inlineDup[1]}: ${inlineDup[1]}:"` });
    }
    const topKeyMatch = line.match(/^([a-z0-9_-]+):/);
    if (topKeyMatch) {
      const k = topKeyMatch[1].toLowerCase();
      if (seenFrontmatterKeys.has(k)) {
        issues.push({ severity: "error", check: "frontmatter-duplicate-key", msg: `Duplicate frontmatter key: "${k}"` });
      } else {
        seenFrontmatterKeys.add(k);
      }
    }
  }

  const name = getField(front, "name");
  if (!name) {
    issues.push({ severity: "error", check: "name-present", msg: "Missing required field: name" });
  } else {
    if (name.length < 1 || name.length > 64) {
      issues.push({ severity: "error", check: "name-length", msg: `name length ${name.length} not in 1-64` });
    }
    if (!/^[a-z0-9-]+$/.test(name)) {
      issues.push({ severity: "error", check: "name-regex", msg: `name "${name}" must be lowercase letters, digits, and hyphens only` });
    }
    if (name.startsWith("-") || name.endsWith("-")) {
      issues.push({ severity: "error", check: "name-hyphen", msg: `name "${name}" cannot start or end with hyphen` });
    }
    if (name.includes("--")) {
      issues.push({ severity: "error", check: "name-double-hyphen", msg: `name "${name}" cannot contain consecutive hyphens` });
    }
    const parentName = basename(resolve(file, ".."));
    if (name !== parentName) {
      issues.push({ severity: "error", check: "name-folder-match", msg: `name "${name}" does not match parent folder "${parentName}"` });
    }
  }

  const desc = getField(front, "description");
  if (!desc) {
    issues.push({ severity: "error", check: "desc-present", msg: "Missing required field: description" });
  } else {
    if (desc.length < 1 || desc.length > 1024) {
      issues.push({ severity: "error", check: "desc-length", msg: `description length ${desc.length} not in 1-1024` });
    }
    const hasWhat = /[A-Za-z]/.test(desc);
    const hasWhen = /(when|use|if|trigger|úsala|usala|cuando usar)/i.test(desc);
    if (hasWhat && !hasWhen) {
      issues.push({ severity: "warning", check: "desc-when", msg: "description should mention when to use the skill (e.g. 'Use when...', 'Triggers on...')" });
    }
  }

  const compat = getField(front, "compatibility");
  if (compat && compat.length > 500) {
    issues.push({ severity: "error", check: "compatibility-length", msg: `compatibility length ${compat.length} > 500` });
  }

  const meta = getField(front, "metadata");
  if (!meta) {
    issues.push({ severity: "info", check: "metadata-missing", msg: "metadata field recommended (include trigger, scope, version)" });
  }

  if (!getField(front, "license")) {
    issues.push({ severity: "info", check: "license-missing", msg: "license field recommended (e.g. MIT)" });
  }

  // pnpm-only rule (STRICT): npm/npx are rejected catalog-wide. A skill that
  // legitimately needs to mention npm (e.g. migration docs, config detection)
  // must document the reason in frontmatter `allows-npm: <reason>`; the check
  // then demotes to info instead of failing the catalog.
  const npmJustified = Boolean(getField(front, "allows-npm"));
  const npmHits = (body.match(/\bnpm\s/g) || []).length;
  const npxHits = (body.match(/\bnpx\s/g) || []).length;
  const npmSeverity = npmJustified ? "info" : "error";
  if (npmHits > 0) {
    issues.push({ severity: npmSeverity, check: "no-npm", msg: `Found ${npmHits} mention(s) of 'npm' — use 'pnpm' instead${npmJustified ? " (justified via allows-npm)" : ""}` });
  }
  if (npxHits > 0) {
    issues.push({ severity: npmSeverity, check: "no-npx", msg: `Found ${npxHits} mention(s) of 'npx' — use 'pnpm dlx' instead${npmJustified ? " (justified via allows-npm)" : ""}` });
  }

  if (/\bany\b(?!\w)/.test(body) && /typescript/i.test(body)) {
    const codeBlocks = body.match(/```[\s\S]*?```/g) || [];
    const codeText = codeBlocks.join("\n");
    if (/\bany\b/.test(codeText)) {
      issues.push({ severity: "warning", check: "no-any", msg: "Found 'any' in code blocks — use 'unknown' + narrowing with Zod for TS code" });
    }
  }

  const storesTokenLocally = /(?:use|store|save|persist)\s+(?:in\s+)?(?:localStorage|AsyncStorage)/i.test(body) && /(token|jwt)/i.test(body);
  const recommendsCookieInstead = /(?:never|no|nunca|prohibid)\s+.*(?:localStorage|AsyncStorage)/i.test(body) || /HTTP-Only\s+cookie/i.test(body);
  if (storesTokenLocally && !recommendsCookieInstead) {
    issues.push({ severity: "warning", check: "no-localstorage-tokens", msg: "Storing tokens in LocalStorage/AsyncStorage detected — use in-memory + HTTP-only cookies" });
  }

  // Reference checking: verify [text](path) links point to existing files
  // Skip references inside code blocks (templates, examples)
  const bodyWithoutCode = body.replace(/```[\s\S]*?```/g, "").replace(/`[^`]+`/g, "");
  const refMatches = bodyWithoutCode.matchAll(/\[([^\]]*)\]\(([^)]+)\)/g);
  const fileDir = dirname(file);
  for (const match of refMatches) {
    const refPath = match[2];
    // Skip external URLs, anchors, mailto, and template placeholders
    if (refPath.match(/^(https?:|mailto:|#|<)/)) continue;
    if (refPath.includes("<") || refPath.includes(">")) continue;
    // Resolve relative path from the SKILL.md location
    const resolved = resolve(fileDir, refPath);
    if (!existsSync(resolved)) {
      issues.push({ severity: "warning", check: "broken-reference", msg: `Reference "${match[1]}" points to non-existent file: ${refPath}` });
    }
  }

  // License file check: if license references a file, verify it exists
  const licenseVal = getField(front, "license");
  if (licenseVal && licenseVal.match(/\.(txt|md|LICENSE)/i)) {
    const licPath = resolve(fileDir, licenseVal.replace(/^.*?(\S+\.(txt|md))$/i, "$1"));
    if (!existsSync(licPath)) {
      issues.push({ severity: "error", check: "license-file-missing", msg: `License references file "${licenseVal}" but file does not exist` });
    }
  }

  // === Strict schema rules (Blinding hardening, Bloque 3) ===
  // allowed-tools required (error, not warning) — open tool surface risk
  const allowedTools = getField(front, "allowed-tools");
  if (!allowedTools) {
    issues.push({ severity: "error", check: "allowed-tools-required", msg: "Missing required field: allowed-tools (open tool surface is a security risk)" });
  }
  // version must be a quoted semver string "X.Y.Z"
  const versionField = getField(front, "version");
  if (versionField) {
    const v = versionField.trim().replace(/^["']|["']$/g, "");
    if (!/^\d+\.\d+\.\d+$/.test(v)) {
      issues.push({ severity: "error", check: "version-semver", msg: `version "${versionField}" must be a quoted semver string like "1.0.0"` });
    }
  }

  // === Router-relevant metadata schema (F7) ===
  // Fields that the skill-router and skills-loader depend on having a
  // strict shape. Each check fails loud (error) — silent acceptance is
  // what produced the "metadata custom sin contrato" risk that F7 closes.

  // min_diff_lines (metadata.min_diff_lines) must be a positive integer.
  const minDiffLines = getNestedField(front, "metadata", "min_diff_lines");
  if (minDiffLines !== null) {
    const raw = String(minDiffLines).replace(/^["']|["']$/g, "").trim();
    const n = parseInt(raw, 10);
    if (!Number.isFinite(n) || String(n) !== raw || n <= 0) {
      issues.push({ severity: "error", check: "min-diff-lines-int", msg: `metadata.min_diff_lines "${minDiffLines}" must be a positive integer` });
    }
  }

  // time_budget_sec (metadata.time_budget_sec) must be a positive integer.
  const timeBudget = getNestedField(front, "metadata", "time_budget_sec");
  if (timeBudget !== null) {
    const raw = String(timeBudget).replace(/^["']|["']$/g, "").trim();
    const n = parseInt(raw, 10);
    if (!Number.isFinite(n) || String(n) !== raw || n <= 0) {
      issues.push({ severity: "error", check: "time-budget-sec-int", msg: `metadata.time_budget_sec "${timeBudget}" must be a positive integer` });
    }
  }

  // critical_markers (metadata.critical_markers) must be a non-empty array of
  // non-empty strings.
  const criticalMarkers = getNestedField(front, "metadata", "critical_markers");
  if (criticalMarkers !== null) {
    // Strip leading [ and trailing ]
    const inner = criticalMarkers.replace(/^\[/, "").replace(/\]$/, "").trim();
    if (!inner) {
      issues.push({ severity: "error", check: "critical-markers-empty", msg: "metadata.critical_markers must be a non-empty array" });
    } else {
      const items = inner.split(",").map((s) => s.trim().replace(/^["']|["']$/g, ""));
      const bad = items.filter((s) => !s);
      if (bad.length > 0) {
        issues.push({ severity: "error", check: "critical-markers-empty-strings", msg: `metadata.critical_markers contains empty string(s)` });
      }
    }
  }

  // deprecated: true requires redirect: pointing to a known skill (supported top-level or inside metadata).
  const deprecatedFlag = getField(front, "deprecated") || getNestedField(front, "metadata", "deprecated");
  if (deprecatedFlag === "true") {
    const redirectTarget = getField(front, "redirect") || getNestedField(front, "metadata", "redirect");
    if (!redirectTarget) {
      issues.push({ severity: "error", check: "deprecated-redirect-required", msg: "deprecated: true requires a non-empty redirect: field" });
    } else if (catalogNames && !catalogNames.has(redirectTarget)) {
      issues.push({ severity: "error", check: "deprecated-redirect-unknown", msg: `redirect "${redirectTarget}" does not match any skill in the catalog` });
    }
  }

  return issues;
}

// === Quality gates (change skills-25-upgrade, WU3a; spec skill-quality-gates) ===
// Thresholds ratified by the change design. Severity policy under the existing
// strict escalation (warnings count as errors): checks that must never block a
// strict run on the current catalog are reported as `info` advisories
// (desc-exclusion, skill-token-guidance), exactly like metadata/license hints.
const SKILL_BODY_LINE_BUDGET = 500;
const TIER0_TOKEN_BUDGET = 2048;
const SKILL_TOKEN_GUIDANCE = 5120;
const TIER0_CONTEXT_MD = "00-meta-skills/skill-loader/tier0-context.md";
const DESC_EXCLUSION_RE = /(do not use|don't use|not for|no usar|no para|not intended for|not meant for)/i;
const AUDIT_EXTENSION_RE = /\.(mjs|js|cjs|ps1|sh|py)$/i;
const estTokens = (text) => Math.ceil(String(text).length / 4);

/** Recursively collect auditable script files (by extension) under a directory. */
function walkAuditFiles(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkAuditFiles(full, out);
    else if (entry.isFile() && AUDIT_EXTENSION_RE.test(entry.name)) out.push(full);
  }
  return out;
}

/**
 * script-audit: scans only <skill>/scripts/** and <skill>/bin/** by extension;
 * docs and references/ are fences, not code. `curl`, `eval(`/`new Function(`
 * and `child_process` are errors unless the skill frontmatter justifies them
 * with `allows-curl: <reason>` / `allows-script-exec: <reason>` (demoted to info).
 */
function auditScripts(file, front) {
  const issues = [];
  const skillDir = dirname(file);
  const allowsCurl = Boolean(getField(front, "allows-curl"));
  const allowsExec = Boolean(getField(front, "allows-script-exec"));
  for (const sub of ["scripts", "bin"]) {
    const dir = join(skillDir, sub);
    const stat = statSafe(dir);
    if (!stat || !stat.isDirectory()) continue;
    for (const scriptPath of walkAuditFiles(dir)) {
      let text;
      try { text = readFileSync(scriptPath, "utf8"); } catch { continue; }
      const rel = relative(process.cwd(), scriptPath);
      const findings = [];
      if (/\bcurl\b/.test(text)) findings.push({ pattern: "curl", allowed: allowsCurl });
      if (/\beval\s*\(/.test(text) || /new\s+Function\s*\(/.test(text)) findings.push({ pattern: "eval/Function", allowed: allowsExec });
      if (/\bchild_process\b/.test(text)) findings.push({ pattern: "child_process", allowed: allowsExec });
      for (const finding of findings) {
        issues.push({
          severity: finding.allowed ? "info" : "error",
          check: "script-audit",
          msg: `${rel} uses ${finding.pattern}${finding.allowed ? " (justified in the skill frontmatter)" : " — declare allows-curl/allows-script-exec with the reason"}`,
        });
      }
    }
  }
  return issues;
}

/** Inline (`[a, b]`) or block (`- a`) YAML list values -> trimmed string array. */
function parseListValue(raw) {
  let value = String(raw ?? "").trim();
  if (value.startsWith("[")) value = value.replace(/^\[/, "").replace(/\]$/, "");
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim().replace(/^-\s*/, "").replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

/**
 * requires-mcp: top-level declarations are rejected (the agentskills.io
 * frontmatter allows them only inside metadata); a metadata declaration needs
 * `metadata.mcp-fallback`; each declared server must be in mcp-manifest.json
 * and list this skill in `servers[].requiredBy`.
 */
function validateRequiresMcp(front, skillName, mcpServers) {
  const issues = [];
  if (/^requires-mcp:/m.test(front)) {
    issues.push({ severity: "error", check: "requires-mcp-top-level", msg: "requires-mcp must live inside metadata (agentskills.io frontmatter), not as a top-level field" });
  }
  const declared = parseListValue(getNestedField(front, "metadata", "requires-mcp"));
  if (declared.length === 0) return { issues, declared };
  if (!getNestedField(front, "metadata", "mcp-fallback")) {
    issues.push({ severity: "error", check: "requires-mcp-fallback-missing", msg: "metadata.requires-mcp declared without metadata.mcp-fallback (the degradation path must be documented)" });
  }
  for (const serverId of declared) {
    const requiredBy = mcpServers?.get(serverId);
    if (!requiredBy) {
      issues.push({ severity: "error", check: "requires-mcp-parity", msg: `server "${serverId}" is not in mcp-manifest.json` });
    } else if (!requiredBy.includes(skillName)) {
      issues.push({ severity: "error", check: "requires-mcp-parity", msg: `mcp-manifest.json server "${serverId}" does not list "${skillName}" in requiredBy` });
    }
  }
  return { issues, declared };
}

/** mcp-manifest.json -> Map<serverId, requiredBy[]>; null when absent; "invalid" when unparsable. */
function loadMcpManifest(root) {
  const manifestPath = join(root, "mcp-manifest.json");
  if (!existsSync(manifestPath)) return null;
  try {
    const servers = JSON.parse(readFileSync(manifestPath, "utf8"))?.servers;
    const map = new Map();
    if (Array.isArray(servers)) {
      for (const server of servers) {
        if (server && server.id) map.set(String(server.id), Array.isArray(server.requiredBy) ? server.requiredBy.map(String) : []);
      }
    } else if (servers && typeof servers === "object") {
      for (const [id, server] of Object.entries(servers)) {
        map.set(id, Array.isArray(server?.requiredBy) ? server.requiredBy.map(String) : []);
      }
    }
    return map;
  } catch {
    return "invalid";
  }
}

/** Bidirectional parity: manifest requiredBy entries must exist and declare the server. */
function checkMcpParity(mcpServers, catalogNames, declaredMcp) {
  const issues = [];
  for (const [serverId, requiredBy] of mcpServers) {
    for (const skillName of requiredBy) {
      if (!catalogNames.has(skillName)) {
        issues.push({ severity: "error", check: "requires-mcp-parity", msg: `mcp-manifest.json server "${serverId}" lists unknown skill "${skillName}" in requiredBy` });
      } else if (!(declaredMcp.get(skillName) ?? []).includes(serverId)) {
        issues.push({ severity: "error", check: "requires-mcp-parity", msg: `skill "${skillName}" is listed in requiredBy of "${serverId}" but does not declare metadata.requires-mcp: ["${serverId}"]` });
      }
    }
  }
  return issues;
}

/** Per-skill quality gates: body line budget, token guidance, description, scripts. */
function validateQualityGates(file, mcpServers) {
  const issues = [];
  let content;
  try { content = readFileSync(file, "utf8"); } catch { return { issues, name: null, mcp: [] }; }
  const parsed = parseFrontmatter(content);
  if (!parsed) return { issues, name: null, mcp: [] };
  const { front, body } = parsed;

  const bodyLines = body.replace(/\r?\n$/, "").split(/\r?\n/).length;
  if (bodyLines > SKILL_BODY_LINE_BUDGET) {
    issues.push({ severity: "warning", check: "skill-lines-budget", msg: `Body has ${bodyLines} lines > ${SKILL_BODY_LINE_BUDGET} budget (frontmatter excluded)` });
  }

  const tokens = estTokens(front + body);
  if (tokens > SKILL_TOKEN_GUIDANCE) {
    issues.push({ severity: "info", check: "skill-token-guidance", msg: `SKILL.md is ~${tokens} estimated tokens > ${SKILL_TOKEN_GUIDANCE} guidance — consider moving depth into references/` });
  }

  const desc = getField(front, "description");
  if (desc && !DESC_EXCLUSION_RE.test(desc.replace(/^["']|["']$/g, ""))) {
    issues.push({ severity: "info", check: "desc-exclusion", msg: "description has no exclusion clause (e.g. 'Do NOT use for...')" });
  }

  issues.push(...auditScripts(file, front));
  const name = getField(front, "name");
  const mcp = validateRequiresMcp(front, name, mcpServers);
  issues.push(...mcp.issues);
  return { issues, name, mcp: mcp.declared };
}

/**
 * Estimated Tier 0 context tokens: `tier0-context.md` when present, else the
 * TIER0_SKILLS set rebuilt with the loader formula (`## name\n description`).
 */
function estimateTier0Tokens(root) {
  const contextPath = join(root, TIER0_CONTEXT_MD);
  if (existsSync(contextPath)) return { tokens: estTokens(readFileSync(contextPath, "utf8")), source: TIER0_CONTEXT_MD };
  const tier0 = readTier0Set(root);
  if (!tier0.ok || tier0.names.size === 0) return null;
  const descriptions = new Map();
  for (const rel of walkSkillPaths(root)) {
    let parsed;
    try { parsed = parseFrontmatter(readFileSync(join(root, rel), "utf8")); } catch { continue; }
    if (!parsed) continue;
    const name = getField(parsed.front, "name");
    if (name && !descriptions.has(name)) descriptions.set(name, getField(parsed.front, "description") || "");
  }
  const plainText = [...tier0.names].filter((n) => descriptions.has(n)).map((n) => `## ${n}\n${descriptions.get(n)}`).join("\n\n");
  if (!plainText) return null;
  return { tokens: estTokens(plainText), source: "TIER0_SKILLS set" };
}

function runTier0TokenCheck(root) {
  const issues = [];
  const tier0 = estimateTier0Tokens(root);
  if (tier0 && tier0.tokens > TIER0_TOKEN_BUDGET) {
    issues.push({ severity: "warning", check: "tier0-token-budget", msg: `Tier 0 context is ~${tier0.tokens} estimated tokens > ${TIER0_TOKEN_BUDGET} budget (${tier0.source})` });
  }
  return issues;
}

// Prose totals (change design, WU3a): a declared catalog total that does not
// match the manifest is drift. Counts below PROSE_TOTAL_MIN are tier/wave
// numbers (e.g. "14 skills" Tier 0), not catalog totals.
const PROSE_TOTAL_MIN = 50;
const PROSE_COUNT_DOCS = [
  "SKILLS.md",
  "AGENTS.md",
  "README.md",
  "openspec/config.yaml",
  "00-meta-skills/harness-map.md",
  "gentle-ai-dsh/AGENTS.md",
  "gentle-ai-dsh/README.md",
  "gentle-ai-dsh/ISSUES.md",
];
const PROSE_COUNT_RE = /(?<![\d-])(\d{2,4})(?!\d)\s*(?:\*\*)?\s*skills/gi;

function runProseCountChecks(root, total) {
  const issues = [];
  for (const rel of PROSE_COUNT_DOCS) {
    const docPath = join(root, rel);
    if (!existsSync(docPath)) continue;
    const text = readFileSync(docPath, "utf8");
    const reported = new Set();
    for (const match of text.matchAll(PROSE_COUNT_RE)) {
      const declared = Number(match[1]);
      if (declared < PROSE_TOTAL_MIN || declared === total || reported.has(declared)) continue;
      reported.add(declared);
      issues.push({ severity: "error", check: "manifest-prose-count", msg: `${rel}: declares ${declared} skills but the manifest has ${total}` });
    }
  }
  return issues;
}

const MANIFEST_CHECK_NAMES = {
  "skill-missing-from-manifest": "manifest-skill-missing",
  "index-drift": "manifest-index-drift",
  "index-orphan-section": "manifest-index-orphan-section",
  "auto-invoke-unknown": "manifest-auto-invoke-unknown",
  "skills-index-missing": "manifest-skills-index-missing",
  "agents-index-missing": "manifest-agents-index-missing",
  "agents-table-missing": "manifest-agents-table-missing",
  "tier0-source-missing": "manifest-tier0-source-missing",
  "tier0-unknown": "manifest-tier0-unknown",
};
const mapManifestCheck = (code) => MANIFEST_CHECK_NAMES[code] ?? (code.startsWith("manifest-") ? code : `manifest-${code}`);

/** manifest-*: tree<->catalog.json, generated indexes, Auto-Invoke, prose totals. */
function runManifestChecks(root) {
  const issues = [];
  const result = checkCatalog(root);
  for (const issue of result.issues) {
    issues.push({ severity: "error", check: mapManifestCheck(issue.code), msg: `${issue.code}: ${issue.detail}` });
  }
  if (Number.isFinite(result.skills)) issues.push(...runProseCountChecks(root, result.skills));
  return issues;
}

// --check-deps (change design, WU3a): resolves `metadata.requires` entries
// (`bin:<name>`, `env:<NAME>`, `node:>=N`) with a best-effort fallback over
// `compatibility` ("Node 20+", "pnpm 9+"). Runs only under the flag; it never
// blocks a normal validation run.
const NODE_REQUIREMENT_RE = /Node(?:\.js)?\s+(\d+)\s*\+/i;
const PNPM_REQUIREMENT_RE = /pnpm\s+(\d+)\s*\+/i;

function findBinaryOnPath(name) {
  const extensions = process.platform === "win32" ? ["", ".cmd", ".exe", ".bat", ".ps1"] : [""];
  for (const dir of (process.env.PATH || "").split(delimiter)) {
    if (!dir) continue;
    for (const ext of extensions) {
      const candidate = join(dir, name + ext);
      const stat = statSafe(candidate);
      if (stat && stat.isFile()) return candidate;
    }
  }
  return null;
}

function resolveDependency(dep) {
  if (dep.startsWith("bin:")) {
    const name = dep.slice(4);
    return findBinaryOnPath(name) ? null : `binary "${name}" not found on PATH`;
  }
  if (dep.startsWith("env:")) {
    const name = dep.slice(4);
    return process.env[name] ? null : `environment variable ${name} is not set`;
  }
  if (dep.startsWith("node:")) {
    const required = parseInt(dep.slice(5).replace(/^>=?\s*/, "").split(".")[0], 10);
    const actual = parseInt(process.versions.node.split(".")[0], 10);
    return Number.isFinite(required) && actual < required ? `node ${process.versions.node} does not satisfy ${dep.slice(5)}` : null;
  }
  if (dep.startsWith("pnpm:")) {
    const required = parseInt(dep.slice(5).replace(/^>=?\s*/, "").split(".")[0], 10);
    const match = (process.env.npm_config_user_agent || "").match(/pnpm\/(\d+)\./);
    if (!match || !Number.isFinite(required)) return null; // best effort: undetectable outside pnpm
    return Number(match[1]) >= required ? null : `pnpm ${match[1]} does not satisfy ${dep.slice(5)}`;
  }
  return null; // unknown namespace: best effort, never a false failure
}

function declaredDependencies(front) {
  const explicit = getNestedField(front, "metadata", "requires");
  if (explicit !== null) return parseListValue(explicit);
  const compatibility = getField(front, "compatibility") || "";
  const fallback = [];
  const node = compatibility.match(NODE_REQUIREMENT_RE);
  if (node) fallback.push(`node:>=${node[1]}`);
  const pnpm = compatibility.match(PNPM_REQUIREMENT_RE);
  if (pnpm) fallback.push(`pnpm:>=${pnpm[1]}`);
  return fallback;
}

function runCheckDeps(skillFiles) {
  const issues = [];
  for (const file of skillFiles) {
    let parsed;
    try { parsed = parseFrontmatter(readFileSync(file, "utf8")); } catch { continue; }
    if (!parsed) continue;
    const name = getField(parsed.front, "name") || basename(dirname(file));
    for (const dep of declaredDependencies(parsed.front)) {
      const cause = resolveDependency(dep);
      if (cause) issues.push({ severity: "error", check: "check-deps", msg: `skill "${name}" declares "${dep}": ${cause}` });
    }
  }
  return issues;
}

function printHelp() {
  console.log(`Skill Validator — agentskills.io compliance checker

Usage:
  node validate-skills.mjs [path] [--json] [--strict] [--skip-index-sync] [--check-deps]

Options:
  path                 Directory to scan (default: cwd)
  --json               Output JSON for CI
  --strict             Treat warnings as errors
  --skip-index-sync    Skip catalog checks against SKILLS.md, AGENTS.md, catalog.json, prose docs and the registry
  --check-deps         Resolve metadata.requires (bin:/env:/node:) with a compatibility fallback; exit 1 on unsatisfied deps
  --help               Show this help

Quality gates (change skills-25-upgrade):
  skill-lines-budget   SKILL.md body > 500 lines -> warning (strict error)
  tier0-token-budget   Tier 0 context > ~2048 estimated tokens -> warning
  skill-token-guidance SKILL.md > ~5120 estimated tokens -> info guidance
  desc-exclusion       description without an exclusion clause -> info advisory
  script-audit         curl / eval / Function / child_process in <skill>/scripts|bin/** -> error
                       unless justified via frontmatter allows-curl / allows-script-exec
  requires-mcp-*       metadata.requires-mcp rules + mcp-manifest.json parity -> error
  manifest-*           catalog.json <-> tree/indexes/prose totals -> error (skipped with --skip-index-sync)

Scope:
  Directories named gentle-ai-dsh (vendored addon bundle) and _shared (shared
  resources) are excluded from the walk; they are not part of the catalog.

Pnpm-only rule:
  'npm'/'npx' mentions are errors. A skill that must mention them documents
  the reason in frontmatter 'allows-npm: <reason>' (check demoted to info).

Exit codes:
  0  pass
  1  errors found
  2  invalid arguments
`);
}

function runIndexSyncChecks(catalogNames, skills, targetPath) {
  const issues = [];
  const skillsMdPath = join(targetPath, "SKILLS.md");
  const agentsMdPath = join(targetPath, "AGENTS.md");

  // Verify SKILLS.md exists
  if (!existsSync(skillsMdPath)) {
    issues.push({ severity: "error", check: "index-sync-skills-missing", msg: "SKILLS.md file not found in target path" });
    return issues;
  }
  // Verify AGENTS.md exists
  if (!existsSync(agentsMdPath)) {
    issues.push({ severity: "error", check: "index-sync-agents-missing", msg: "AGENTS.md file not found in target path" });
    return issues;
  }

  const skillsMdContent = readFileSync(skillsMdPath, "utf8");
  const agentsMdContent = readFileSync(agentsMdPath, "utf8");

  // Find all skill files
  const relativeSkillPaths = skills.map(f => relative(targetPath, f).replace(/\\/g, "/"));

  // Check 1: Every skill in the catalog must be in SKILLS.md
  for (const relPath of relativeSkillPaths) {
    const escaped = relPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(escaped);
    if (!re.test(skillsMdContent)) {
      issues.push({ severity: "error", check: "index-sync-missing-skill", msg: `Skill ${relPath} is present in catalog but missing in SKILLS.md` });
    }
  }

  // Check 2: Every skill name in catalog must be in AGENTS.md
  for (const name of catalogNames) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp("\\b" + escaped + "\\b");
    if (!re.test(agentsMdContent)) {
      issues.push({ severity: "error", check: "agents-sync-missing-skill", msg: `Skill name "${name}" is present in catalog but missing in AGENTS.md` });
    }
  }

  // Check 3: Every SKILL.md link in SKILLS.md must exist in catalog (orphan check)
  const linkMatches = skillsMdContent.matchAll(/\[([^\]]*)\]\(([^)]+SKILL\.md)\)/g);
  for (const match of linkMatches) {
    const relLink = match[2];
    if (relLink.startsWith("http")) continue;
    const resolvedPath = resolve(targetPath, relLink);
    if (!existsSync(resolvedPath)) {
      issues.push({ severity: "error", check: "index-sync-orphan", msg: `SKILLS.md references orphan skill link: ${relLink}` });
    }
  }

  return issues;
}

/**
 * Skills excluded from the registry index (skill-registry-protocol):
 * _shared, skill-registry and sdd-*.
 */
function isRegistryExcluded(name) {
  return name === "_shared" || name === "skill-registry" || name.startsWith("sdd-");
}

/**
 * Parse SKILLS.md into a Map of skill name → relative SKILL.md path.
 * Rows look like: | skill-name | [00-meta-skills/foo/SKILL.md](...) | ...
 */
function parseSkillsMdEntries(content) {
  const entries = new Map();
  const rows = content.matchAll(/^\|\s*([a-z0-9-]+)\s*\| \[([^\]]+SKILL\.md)\]/gm);
  for (const m of rows) {
    entries.set(m[1], m[2].trim().replace(/\\/g, "/"));
  }
  return entries;
}

/**
 * Parse .atl/skill-registry.md into a Map of skill name → relative SKILL.md path.
 * Rows look like: | `skill-name` | <description> | `scope` | `00-meta-skills/foo/SKILL.md` |
 * (legacy 3-column rows without scope are also accepted).
 */
function parseRegistryEntries(content) {
  const entries = new Map();
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) continue;
    const nameMatch = trimmed.match(/^\|\s*`([a-z0-9-]+)`\s*\|/);
    if (!nameMatch) continue;
    const pathMatches = [...trimmed.matchAll(/`([^`]+SKILL\.md)`/g)];
    if (pathMatches.length === 0) continue;
    const path = pathMatches[pathMatches.length - 1][1].trim().replace(/\\/g, "/");
    entries.set(nameMatch[1], path);
  }
  return entries;
}

/**
 * Consistency check SKILLS.md ↔ .atl/skill-registry.md (skill-registry-protocol).
 * Both indexes must agree on name and path per skill. Skills excluded from the
 * registry (_shared, skill-registry, sdd-*) are not expected in the registry.
 */
function runRegistryConsistencyCheck(skills, targetPath) {
  const issues = [];
  const skillsMdPath = join(targetPath, "SKILLS.md");
  const registryPath = join(targetPath, ".atl", "skill-registry.md");

  if (!existsSync(registryPath)) {
    issues.push({ severity: "error", check: "registry-missing", msg: ".atl/skill-registry.md not found in target path" });
    return issues;
  }

  const skillsMdEntries = parseSkillsMdEntries(readFileSync(skillsMdPath, "utf8"));
  const registryEntries = parseRegistryEntries(readFileSync(registryPath, "utf8"));

  // 1. Every registry entry must exist in SKILLS.md with the same path.
  for (const [name, path] of registryEntries) {
    const skillsPath = skillsMdEntries.get(name);
    if (skillsPath === undefined) {
      issues.push({ severity: "error", check: "registry-entry-missing-in-skills", msg: `Registry entry "${name}" is missing in SKILLS.md` });
    } else if (skillsPath !== path) {
      issues.push({ severity: "error", check: "registry-entry-path-mismatch", msg: `Registry path for "${name}" (${path}) does not match SKILLS.md (${skillsPath})` });
    }
  }

  // 2. Every non-excluded skill in SKILLS.md must exist in the registry.
  for (const [name, path] of skillsMdEntries) {
    if (isRegistryExcluded(name)) continue;
    const registryPath2 = registryEntries.get(name);
    if (registryPath2 === undefined) {
      issues.push({ severity: "error", check: "registry-entry-missing", msg: `Skill "${name}" is in SKILLS.md but missing in .atl/skill-registry.md` });
    } else if (registryPath2 !== path) {
      issues.push({ severity: "error", check: "registry-entry-path-mismatch", msg: `SKILLS.md path for "${name}" (${path}) does not match registry (${registryPath2})` });
    }
  }

  return issues;
}

const skills = walkSkills(targetPath);

function countIssues(issues) {
  for (const issue of issues) {
    if (issue.severity === "error") totalErrors++;
    else if (issue.severity === "warning") totalWarnings++;
    else totalInfo++;
  }
}

// First pass: collect all skill names so redirect targets can be validated
// against the catalog. Done before any per-skill validation so redirects
// can point forward to skills defined later in the walk.
const catalogNames = new Set();
for (const file of skills) {
  try {
    const content = readFileSync(file, "utf8");
    const parsed = parseFrontmatter(content);
    if (parsed) {
      const n = getField(parsed.front, "name");
      if (n) catalogNames.add(n);
    }
  } catch {}
}

const mcpServers = loadMcpManifest(targetPath);
const declaredMcp = new Map(); // skill name -> declared server ids (MCP parity)

for (const file of skills) {
  const rel = relative(process.cwd(), file);
  const issues = validate(file, catalogNames);
  const gates = validateQualityGates(file, mcpServers === "invalid" ? null : mcpServers);
  issues.push(...gates.issues);
  if (gates.name && gates.mcp.length > 0) declaredMcp.set(gates.name, gates.mcp);
  countIssues(issues);
  results.push({ file: rel, issues });
}

// Tier 0 token budget: catalog-level advisory (warning; strict escalates it).
const tier0Issues = runTier0TokenCheck(targetPath);
if (tier0Issues.length > 0) {
  countIssues(tier0Issues);
  results.push({ file: `Tier 0 context (${TIER0_CONTEXT_MD})`, issues: tier0Issues });
}

// MCP manifest parity: mcp-manifest.json is born in WU5b; absent means clean.
if (mcpServers === "invalid") {
  const invalidIssue = { severity: "error", check: "requires-mcp-parity", msg: "mcp-manifest.json exists but is not valid JSON" };
  countIssues([invalidIssue]);
  results.push({ file: "mcp-manifest.json", issues: [invalidIssue] });
} else if (mcpServers) {
  const parityIssues = checkMcpParity(mcpServers, catalogNames, declaredMcp);
  if (parityIssues.length > 0) {
    countIssues(parityIssues);
    results.push({ file: "mcp-manifest.json", issues: parityIssues });
  }
}

// --check-deps never runs outside the flag (design WU3a).
if (checkDeps) {
  const depIssues = runCheckDeps(skills);
  if (depIssues.length > 0) {
    countIssues(depIssues);
    results.push({ file: "dependency check (--check-deps)", issues: depIssues });
  }
}

if (!skipIndexSync) {
  const syncIssues = runIndexSyncChecks(catalogNames, skills, targetPath);
  if (syncIssues.length > 0) {
    countIssues(syncIssues);
    results.push({ file: "SKILLS.md / AGENTS.md", issues: syncIssues });
  }

  // Consistency check SKILLS.md ↔ .atl/skill-registry.md (skill-registry-protocol)
  const registryIssues = runRegistryConsistencyCheck(skills, targetPath);
  if (registryIssues.length > 0) {
    countIssues(registryIssues);
    results.push({ file: "SKILLS.md / .atl/skill-registry.md", issues: registryIssues });
  }

  // manifest-*: catalog.json ↔ tree/indexes/prose docs (change skills-25-upgrade, WU3a).
  const manifestIssues = runManifestChecks(targetPath);
  if (manifestIssues.length > 0) {
    countIssues(manifestIssues);
    results.push({ file: "catalog.json / indexes / prose counts", issues: manifestIssues });
  }
}

const effectiveErrors = strictMode ? totalErrors + totalWarnings : totalErrors;

if (jsonOutput) {
  console.log(JSON.stringify({ errors: totalErrors, warnings: totalWarnings, info: totalInfo, results }, null, 2));
} else {
  // A file "passes" when it has no error/warning; info-only advisories do not
  // break the pass count (they are hints, not gate failures).
  const blocking = (r) => r.issues.some((i) => i.severity !== "info");
  const ok = results.filter((r) => !blocking(r));
  const bad = results.filter((r) => blocking(r));
  console.log(`\n📋 Skill Validator — ${skills.length} SKILL.md files scanned\n`);
  for (const r of results) {
    if (r.issues.length === 0) {
      console.log(`  ✅ ${r.file}`);
    } else {
      console.log(`  ${blocking(r) ? "❌" : "🔵"} ${r.file}`);
      for (const i of r.issues) {
        const icon = i.severity === "error" ? "🔴" : i.severity === "warning" ? "🟡" : "🔵";
        console.log(`     ${icon} [${i.check}] ${i.msg}`);
      }
    }
  }
  console.log(`\n📊 Summary: ${ok.length} pass · ${bad.length} with issues`);
  console.log(`   ${totalErrors} errors · ${totalWarnings} warnings · ${totalInfo} info`);
  if (strictMode) console.log("   (strict mode: warnings counted as errors)");
}

process.exit(effectiveErrors > 0 ? 1 : 0);
