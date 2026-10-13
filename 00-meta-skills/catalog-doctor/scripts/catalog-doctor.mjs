#!/usr/bin/env node
/**
 * catalog-doctor.mjs — Unified Catalog Health Check
 *
 * Requirements (spec: catalog-doctor, change skills-25-upgrade WU5b):
 * - Aggregates 7 diagnostic health checks:
 *   1. validate-skills.mjs --strict --json
 *   2. install-skills.mjs --dry-run --all-tools
 *   3. skills-loader.mjs --status
 *   4. generate-indexes.mjs --check
 *   5. validate-skills.mjs --check-deps --json
 *   6. MCP manifest and frontmatter bidirectional parity
 *   7. Skill relative file reference integrity (in-process)
 * - Read-only: MUST NOT mutate filesystem, manifest, or install state.
 * - Constant command table for argv dispatch.
 * - Exit 0 if all checks pass; Exit != 0 with actionable causes if any fails.
 *
 * Usage:
 *   node catalog-doctor.mjs [--root <dir>] [--json] [--check <id>]
 *   pnpm doctor
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const REPO_ROOT = resolve(__dirname, "../../..");

/**
 * Root scope per check:
 * - `target`: the check honors `--root` (the root is forwarded as an argument).
 * - `catalog`: the underlying script resolves the catalog from its own
 *   location, so `--root` cannot relocate it (documented limitation).
 */
export const ROOT_SCOPE = Object.freeze({ TARGET: "target", CATALOG: "catalog" });

/**
 * Constant command table defining all diagnostic health checks.
 * Every command runs in strictly read-only inspection mode.
 */
export const DOCTOR_COMMAND_TABLE = [
  {
    id: "validator-strict",
    name: "Skill validation (strict mode)",
    rootScope: ROOT_SCOPE.TARGET,
    relScript: "00-meta-skills/skill-validator/scripts/validate-skills.mjs",
    buildArgs: (script, root) => [script, root, "--strict", "--json"],
    parseResult: (stdout, code) => {
      if (code !== 0) {
        let cause = "Validator reported errors or strict warnings";
        try {
          const json = JSON.parse(stdout);
          const firstErr = json.results?.flatMap((r) => r.issues)?.find((i) => i.severity === "error" || i.severity === "warning");
          if (firstErr) cause = `[${firstErr.check}] ${firstErr.msg}`;
        } catch {}
        return { pass: false, cause };
      }
      try {
        const json = JSON.parse(stdout);
        return {
          pass: json.errors === 0 && json.warnings === 0,
          summary: `${json.results?.length ?? 0} skills scanned · 0 errors · 0 warnings`,
        };
      } catch {
        return { pass: true, summary: "Clean validation pass" };
      }
    },
  },
  {
    id: "installer-dryrun",
    name: "Installer simulation (dry-run)",
    rootScope: ROOT_SCOPE.CATALOG,
    rootNote: "install-skills.mjs resolves the catalog from its own location; --root does not relocate this check (documented limitation)",
    relScript: "00-meta-skills/skill-sync/scripts/install-skills.mjs",
    buildArgs: (script, _root) => [script, "--dry-run", "--all-tools"],
    parseResult: (stdout, code) => {
      if (code !== 0) {
        return { pass: false, cause: "Installer dry-run failed with non-zero exit code" };
      }
      return { pass: true, summary: "Dry-run plan verified cleanly without disk mutation" };
    },
  },
  {
    id: "loader-status",
    name: "Tier 0 loader status and cache health",
    rootScope: ROOT_SCOPE.CATALOG,
    rootNote: "skills-loader.mjs resolves the catalog from its own location; --root does not relocate this check (documented limitation)",
    relScript: "00-meta-skills/skill-loader/scripts/skills-loader.mjs",
    buildArgs: (script, _root) => [script, "--status"],
    parseResult: (stdout, code) => {
      if (code !== 0) {
        return { pass: false, cause: "Skill loader status check exited with failure" };
      }
      return { pass: true, summary: "Tier 0 loader set and router cache healthy" };
    },
  },
  {
    id: "manifest-consistency",
    name: "Catalog manifest & index consistency",
    rootScope: ROOT_SCOPE.TARGET,
    relScript: "00-meta-skills/skill-registry/scripts/generate-indexes.mjs",
    buildArgs: (script, root) => [script, "--check", "--root", root, "--json"],
    parseResult: (stdout, code) => {
      try {
        const json = JSON.parse(stdout);
        if (code !== 0 || !json.ok) {
          const firstIssue = json.issues?.[0];
          const cause = firstIssue ? `${firstIssue.code}: ${firstIssue.detail}` : "Manifest or index drift detected";
          return { pass: false, cause };
        }
        return {
          pass: true,
          summary: `catalog.json, SKILLS.md, and AGENTS.md consistent (${json.skills} skills)`,
        };
      } catch {
        return { pass: code === 0, cause: code !== 0 ? "generate-indexes --check failed" : null };
      }
    },
  },
  {
    id: "dependency-check",
    name: "Environment and skill dependencies",
    rootScope: ROOT_SCOPE.TARGET,
    relScript: "00-meta-skills/skill-validator/scripts/validate-skills.mjs",
    buildArgs: (script, root) => [script, root, "--check-deps", "--json"],
    parseResult: (stdout, code) => {
      if (code !== 0) {
        let cause = "Unsatisfied declared dependencies found";
        try {
          const json = JSON.parse(stdout);
          const depIssue = json.results?.flatMap((r) => r.issues)?.find((i) => i.check === "check-deps");
          if (depIssue) cause = depIssue.msg;
        } catch {}
        return { pass: false, cause };
      }
      return { pass: true, summary: "All declared skill and runtime dependencies satisfied" };
    },
  },
  {
    id: "mcp-parity",
    name: "MCP manifest and frontmatter parity",
    rootScope: ROOT_SCOPE.TARGET,
    relScript: null, // executed in-process
    buildArgs: null,
    run: (root) => checkMcpParity(root),
  },
  {
    id: "skill-references",
    name: "Skill reference integrity",
    rootScope: ROOT_SCOPE.TARGET,
    relScript: null, // executed in-process
    buildArgs: null,
    run: (root) => checkSkillReferences(root),
  },
];

/**
 * Parses frontmatter YAML block without third-party dependencies.
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return null;
  return { front: match[1], body: match[2] };
}

function getNestedField(front, parent, field) {
  const startRe = new RegExp(`^${parent}:\\s*$`, "m");
  const startMatch = front.match(startRe);
  if (!startMatch) return null;
  const startIdx = startMatch.index + startMatch[0].length;
  const rest = front.slice(startIdx);
  const lines = rest.split(/\r?\n/);
  const blockLines = [];
  for (const line of lines) {
    if (line === "") { blockLines.push(line); continue; }
    if (!/^\s/.test(line)) break;
    blockLines.push(line);
  }
  const block = blockLines.join("\n");
  const fieldRe = new RegExp(`^\\s+${field}:\\s*(.+?)(?:\\r?\\n\\s+[a-z_-]+:|\\r?\\n[\\S]|$)`, "ms");
  const fm = block.match(fieldRe);
  return fm ? fm[1].trim() : null;
}

function parseListValue(raw) {
  let value = String(raw ?? "").trim();
  if (value.startsWith("[")) value = value.replace(/^\[/, "").replace(/\]$/, "");
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim().replace(/^-\s*/, "").replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

function walkSkillFiles(dir) {
  const out = [];
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort(byEntryName)) {
      if (EXCLUDED_DIR_NAMES.has(entry.name)) continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        out.push(...walkSkillFiles(full));
      } else if (entry.isFile() && entry.name === "SKILL.md") {
        out.push(full);
      }
    }
  } catch {}
  return out;
}

/**
 * Walks every file (not only SKILL.md) for the catalog-wide suffix index used
 * as the last resolution step. Same deterministic order and exclusions as
 * walkSkillFiles.
 */
function walkCatalogFiles(dir, out = []) {
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort(byEntryName)) {
      if (EXCLUDED_DIR_NAMES.has(entry.name)) continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        walkCatalogFiles(full, out);
      } else if (entry.isFile()) {
        out.push(full);
      }
    }
  } catch {}
  return out;
}

/**
 * Recursively walks markdown files within a directory in deterministic order.
 */
function walkMarkdownFiles(dir) {
  const out = [];
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort(byEntryName)) {
      if (EXCLUDED_DIR_NAMES.has(entry.name)) continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        out.push(...walkMarkdownFiles(full));
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        out.push(full);
      }
    }
  } catch {}
  return out;
}

/**
 * Discovers all SKILL.md and references/*.md files inside skill directories.
 */
function walkSkillDocFiles(dir) {
  const out = [];
  const skillFiles = walkSkillFiles(dir);
  for (const skillFile of skillFiles) {
    out.push(skillFile);
    const refDir = join(dirname(skillFile), "references");
    if (existsSync(refDir)) {
      out.push(...walkMarkdownFiles(refDir));
    }
  }
  return out;
}

/**
 * Checks bidirectional parity between mcp-manifest.json and skill frontmatters.
 */
export function checkMcpParity(root) {
  const manifestPath = join(root, "mcp-manifest.json");
  if (!existsSync(manifestPath)) {
    return { pass: false, cause: "mcp-manifest.json does not exist in catalog root" };
  }

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch (err) {
    return { pass: false, cause: `mcp-manifest.json is invalid JSON: ${err.message}` };
  }

  if (manifest.version !== 1 || !manifest.servers || typeof manifest.servers !== "object") {
    return { pass: false, cause: "mcp-manifest.json must declare version 1 and a servers object" };
  }

  const serverMap = new Map();
  for (const [id, s] of Object.entries(manifest.servers)) {
    if (!s.purpose) return { pass: false, cause: `Server "${id}" missing required "purpose" field` };
    if (!Array.isArray(s.requiredBy)) return { pass: false, cause: `Server "${id}" missing required "requiredBy" array` };
    serverMap.set(id, s.requiredBy.map(String));
  }

  // Collect all skills declaring metadata.requires-mcp
  const skillFiles = walkSkillFiles(root);
  const declaredSkills = new Map(); // skillName -> { serverIds, file, fallback }
  const allSkillNames = new Set();

  for (const file of skillFiles) {
    let content;
    try { content = readFileSync(file, "utf8"); } catch { continue; }
    const parsed = parseFrontmatter(content);
    if (!parsed) continue;

    const nameMatch = parsed.front.match(/^name:\s*(.+)$/m);
    const skillName = nameMatch ? nameMatch[1].trim() : null;
    if (skillName) allSkillNames.add(skillName);

    // Reject top-level requires-mcp
    if (/^requires-mcp:/m.test(parsed.front)) {
      return { pass: false, cause: `Skill "${skillName}" declares requires-mcp as a top-level field instead of inside metadata` };
    }

    const reqRaw = getNestedField(parsed.front, "metadata", "requires-mcp");
    if (reqRaw) {
      const serverIds = parseListValue(reqRaw);
      const fallback = getNestedField(parsed.front, "metadata", "mcp-fallback");
      if (!fallback) {
        return { pass: false, cause: `Skill "${skillName}" declares requires-mcp without metadata.mcp-fallback` };
      }
      declaredSkills.set(skillName, { serverIds, file, fallback });
    }
  }

  // Check 1: Every server requiredBy skill must exist in the catalog and declare the server
  for (const [serverId, requiredBy] of serverMap) {
    for (const skillName of requiredBy) {
      if (!allSkillNames.has(skillName)) {
        return { pass: false, cause: `mcp-manifest.json server "${serverId}" lists non-existent skill "${skillName}" in requiredBy` };
      }
      const decl = declaredSkills.get(skillName);
      if (!decl || !decl.serverIds.includes(serverId)) {
        return { pass: false, cause: `mcp-manifest.json server "${serverId}" lists "${skillName}" in requiredBy, but the skill does not declare metadata.requires-mcp: ["${serverId}"]` };
      }
    }
  }

  // Check 2: Every skill declaring metadata.requires-mcp must have its server in mcp-manifest.json
  for (const [skillName, { serverIds }] of declaredSkills) {
    for (const serverId of serverIds) {
      const requiredBy = serverMap.get(serverId);
      if (!requiredBy) {
        return { pass: false, cause: `Skill "${skillName}" requires MCP server "${serverId}", which is not declared in mcp-manifest.json` };
      }
      if (!requiredBy.includes(skillName)) {
        return { pass: false, cause: `Skill "${skillName}" requires MCP server "${serverId}", but is not listed in server's requiredBy array` };
      }
    }
  }

  return {
    pass: true,
    summary: `mcp-manifest.json in bidirectional parity with skill frontmatters (${serverMap.size} server(s))`,
  };
}

const REFERENCE_EXTENSIONS = "(?:md|mjs|cjs|js|jsx|ts|tsx|json|yaml|yml|toml|sh|cmd|ps1|png|svg|css)";
const REFERENCE_FILE_RE = /\.(?:md|mjs|cjs|js|jsx|ts|tsx|json|yaml|yml|toml|sh|cmd|ps1|png|svg|css)\b/i;
const SKILL_LINK_RE = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const INLINE_CODE_SPAN_RE = /`([^`\n]+)`/g;
const CODE_PATH_RE = new RegExp(
  `[A-Za-z0-9_@.~-]+(?:\\/[A-Za-z0-9_@.~-]+)+\\.${REFERENCE_EXTENSIONS}\\b`,
  "g"
);
const SKIPPED_REFERENCE_PREFIXES = ["design-artifacts/", "odd/", ".atl/"];

/**
 * Skill-local path shapes: these only make sense relative to the owning skill
 * directory (or the catalog root), so catalog-wide suffix search must never
 * let an unrelated skill's same-named file mask a broken reference.
 */
const SKILL_LOCAL_PREFIXES = ["references/", "scripts/", "assets/", "docs/"];

/**
 * Directories excluded from every catalog walk: VCS metadata, dependencies,
 * the vendored addon mirror, and shared non-skill resources.
 */
const EXCLUDED_DIR_NAMES = new Set([".git", "node_modules", "gentle-ai-dsh", "_shared"]);

/**
 * Dot-directories owned by this catalog (validated like any other path).
 * Every other dot-prefixed first segment denotes target-project layout
 * (`.cursor/`, `.changeset/`, `.sessions/`, ...) and is skipped.
 */
const CATALOG_OWNED_DOTDIRS = new Set([".github", ".atl"]);

/**
 * Target-application source roots (Expo/Next/Vite monorepos and their
 * conventional layout). These first segments belong to the projects the
 * skills are applied to, never to this catalog (which keeps sources inside
 * numbered category folders, `00-meta-skills/`, and `scripts/`), so
 * references into them are target layouts rather than catalog files.
 */
const TARGET_PROJECT_SOURCE_ROOTS = new Set([
  "app",
  "components",
  "hooks",
  "lib",
  "node_modules",
  "packages",
  "pages",
  "public",
  "src",
  "styles",
]);

/**
 * All-caps placeholder segments such as `YYYY-MM-DD` or `PROJECT_TRACKER`:
 * document templates, not concrete catalog files.
 */
const PLACEHOLDER_SEGMENT_RE = /^[A-Z]{2,}(?:[-_][A-Z0-9]+)+$/;

/** Byte-stable directory-entry ordering (code-unit compare, locale-independent). */
function byEntryName(a, b) {
  return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
}

function hasPlaceholderSegment(refPath) {
  return refPath.split("/").some((segment) => {
    if (!segment || !/^[A-Z]/.test(segment)) return false;
    return PLACEHOLDER_SEGMENT_RE.test(segment.replace(/\.[A-Za-z0-9]+$/, ""));
  });
}

function isSkippableReference(refPath) {
  if (/^(https?:|mailto:|#|~|\/)/.test(refPath)) return true;
  if (refPath.includes("://") || refPath.startsWith("//")) return true;
  if (/[<>{}]/.test(refPath)) return true;
  const firstSegment = refPath.split("/")[0];
  if (TARGET_PROJECT_SOURCE_ROOTS.has(firstSegment)) return true;
  if (hasPlaceholderSegment(refPath)) return true;
  // `..` is a parent-relative cross-skill reference, not a target-project
  // dotdir: it must flow through the normal resolution ladder instead of
  // being silently skipped by the dot-prefix rule below.
  if (firstSegment === "..") return false;
  if (firstSegment.startsWith(".") && !CATALOG_OWNED_DOTDIRS.has(firstSegment)) return true;
  return SKIPPED_REFERENCE_PREFIXES.some((prefix) => refPath.startsWith(prefix));
}

/**
 * Extracts candidate relative file references from a SKILL.md body:
 * markdown link targets and inline-code paths with known file extensions.
 * Fenced code blocks hold templates/examples, not references.
 */
function extractSkillReferences(content) {
  const withoutFences = content.replace(/```[\s\S]*?```/g, "");
  const refs = [];

  for (const match of withoutFences.matchAll(SKILL_LINK_RE)) {
    if (REFERENCE_FILE_RE.test(match[1])) refs.push({ ref: match[1], context: "link" });
  }

  for (const match of withoutFences.matchAll(INLINE_CODE_SPAN_RE)) {
    const span = match[1];
    for (const pathMatch of span.matchAll(CODE_PATH_RE)) {
      const idx = pathMatch.index ?? 0;
      if (idx > 0 && span[idx - 1] === "/") continue; // URL or absolute-path tail
      refs.push({ ref: pathMatch[0], context: "code" });
    }
  }

  return refs;
}

/**
 * Resolution ladder for a reference candidate. A path is OK if ANY step resolves:
 *   (a) relative to the owning skill directory;
 *   (b) relative to the catalog root;
 *   (c) install layout: strip a leading `skills/` segment, then (b) again
 *       (installed trees place the whole catalog under `skills/`);
 *   (d) catalog-wide suffix search: segment-aligned match against every
 *       repo-relative file path (with leading `../`/`skills/` normalized),
 *       so unique basenames like `project-tracker/SKILL.md` resolve regardless
 *       of depth.
 * Skill-local shapes (`references/`, `scripts/`, `assets/`, `docs/`) and
 * dot-relative markdown link targets (`./x.md`) are explicitly local: only
 * (a) and (b) apply, so suffix collisions cannot mask broken references.
 */
function resolvesReference(refPath, skillDir, root, suffixIndex, localOnly = false) {
  if (existsSync(resolve(skillDir, refPath)) || existsSync(resolve(root, refPath))) {
    return true;
  }
  if (localOnly) return false;

  const strippedSkills = refPath.replace(/^skills\//, "");
  if (strippedSkills !== refPath && existsSync(resolve(root, strippedSkills))) return true;

  const variants = new Set([
    refPath,
    strippedSkills,
    refPath.replace(/^(?:\.\.\/)+/, ""),
    strippedSkills.replace(/^(?:\.\.\/)+/, ""),
  ]);
  for (const variant of variants) {
    if (!variant) continue;
    if (suffixIndex.has(variant)) return true;
    for (const file of suffixIndex) {
      if (file.endsWith(`/${variant}`)) return true;
    }
  }
  return false;
}

/**
 * Verifies that every relative file reference in SKILL.md and references/*.md files resolves
 * through the documented resolution ladder. Findings are sorted by
 * (skill, path) so the reported cause is byte-stable across runs and
 * filesystems.
 */
export function checkSkillReferences(root) {
  const docFiles = walkSkillDocFiles(root);
  const suffixIndex = new Set(
    walkCatalogFiles(root).map((file) => relative(root, file).split(sep).join("/"))
  );
  const findings = [];
  const seen = new Set();

  for (const file of docFiles) {
    let content;
    try {
      content = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const skill = relative(root, file).split(sep).join("/");
    const fileDir = dirname(file);

    for (const { ref, context } of extractSkillReferences(content)) {
      const rawRef = ref.split("#")[0].split("?")[0];
      if (!rawRef) continue;
      // `./` inside a backtick span is a code example (`import db from './db.js'`),
      // not a reference. A dot-relative markdown link IS a reference and is
      // explicitly local: skill directory or catalog root only.
      if (rawRef.startsWith("./") && context === "code") continue;
      const refPath = rawRef.startsWith("./") ? rawRef.slice(2) : rawRef;
      if (!refPath || isSkippableReference(refPath)) continue;
      const key = `${skill}::${refPath}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const localOnly =
        refPath !== rawRef ||
        refPath.startsWith("../") ||
        SKILL_LOCAL_PREFIXES.some((prefix) => refPath.startsWith(prefix));
      if (!resolvesReference(refPath, fileDir, root, suffixIndex, localOnly)) {
        findings.push({ skill, file: skill, path: refPath, context });
      }
    }
  }

  findings.sort((a, b) =>
    a.skill < b.skill ? -1 : a.skill > b.skill ? 1 : a.path < b.path ? -1 : a.path > b.path ? 1 : 0
  );

  if (findings.length === 0) {
    return {
      pass: true,
      summary: `All relative file references resolve (${docFiles.length} file(s) scanned across skills and references)`,
    };
  }

  const details = findings.map((finding) => `${finding.skill} -> ${finding.path}`).join("; ");
  return {
    pass: false,
    cause: `${findings.length} dangling reference(s): ${details}`,
  };
}

/**
 * Runs the doctor suite against a catalog root.
 */
export function runDoctorSuite(root = REPO_ROOT, options = {}) {
  const filterId = options.checkId || null;
  const checksToRun = filterId
    ? DOCTOR_COMMAND_TABLE.filter((c) => c.id === filterId)
    : DOCTOR_COMMAND_TABLE;

  /** Common result fields, including the explicit root scope of each check. */
  const entryBase = (check) => ({
    id: check.id,
    name: check.name,
    rootScope: check.rootScope ?? ROOT_SCOPE.TARGET,
    ...(check.rootNote ? { rootNote: check.rootNote } : {}),
  });

  if (filterId && checksToRun.length === 0) {
    return {
      ok: false,
      totalChecks: 0,
      passed: 0,
      failed: 1,
      checks: [{ id: filterId, name: filterId, rootScope: ROOT_SCOPE.TARGET, pass: false, cause: `Unknown check ID: "${filterId}"` }],
    };
  }

  const results = [];
  let totalPassed = 0;
  let totalFailed = 0;

  for (const check of checksToRun) {
    if (check.run) {
      // In-process check (e.g. mcp-parity)
      const res = check.run(root);
      if (res.pass) {
        totalPassed++;
        results.push({ ...entryBase(check), pass: true, summary: res.summary });
      } else {
        totalFailed++;
        results.push({ ...entryBase(check), pass: false, cause: res.cause });
      }
      continue;
    }

    // Command-based check
    // Find script path in root first, or fall back to REPO_ROOT
    const scriptPath = existsSync(join(root, check.relScript))
      ? join(root, check.relScript)
      : join(REPO_ROOT, check.relScript);

    const args = check.buildArgs(scriptPath, root);
    let stdout = "";
    let stderr = "";
    let code = 0;

    try {
      stdout = execFileSync("node", args, {
        cwd: root,
        encoding: "utf8",
        env: { ...process.env },
      });
    } catch (err) {
      code = err.status ?? 1;
      stdout = err.stdout ?? "";
      stderr = err.stderr ?? "";
    }

    const evaluated = check.parseResult(stdout, code, stderr);
    if (evaluated.pass) {
      totalPassed++;
      results.push({ ...entryBase(check), pass: true, summary: evaluated.summary });
    } else {
      totalFailed++;
      results.push({ ...entryBase(check), pass: false, cause: evaluated.cause });
    }
  }

  return {
    ok: totalFailed === 0,
    totalChecks: results.length,
    passed: totalPassed,
    failed: totalFailed,
    checks: results,
  };
}

function printHelp() {
  console.log(`catalog-doctor — Unified Catalog Health Check

Usage:
  node catalog-doctor.mjs [--root <dir>] [--json] [--check <id>]
  pnpm doctor

Options:
  --root <dir>     Catalog root path (default: resolved from repository root)
  --json           Output machine-readable JSON summary
  --check <id>     Execute only a single diagnostic check
  --help, -h       Show this help message

Checks:
  validator-strict      Validate agentskills.io spec compliance in strict mode
  installer-dryrun      Dry-run cross-tool installer simulation
  loader-status         Check Tier 0 loader status and cache health
  manifest-consistency  Verify catalog.json, SKILLS.md, and AGENTS.md consistency
  dependency-check      Check declared dependencies (bin, env, node)
  mcp-parity            Verify bidirectional parity between mcp-manifest.json and skills
  skill-references      Verify relative file references in SKILL.md files resolve

Root scope:
  --root is forwarded to validator-strict, manifest-consistency,
  dependency-check, mcp-parity and skill-references.
  installer-dryrun and loader-status run the catalog resolved from THIS
  script's location; --root does not relocate them (documented limitation).

Exit codes:
  0 = All diagnostic checks passed
  1 = One or more checks failed
  2 = Usage error
`);
}

// CLI Dispatch
if (process.argv[1] && resolve(process.argv[1]) === resolve(__filename)) {
  const args = process.argv.slice(2);
  let root = REPO_ROOT;
  let jsonOut = false;
  let checkId = null;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--root") root = resolve(args[++i]);
    else if (a === "--json") jsonOut = true;
    else if (a === "--check") checkId = args[++i];
    else if (a === "--help" || a === "-h") {
      printHelp();
      process.exit(0);
    } else {
      console.error(`Unknown argument: ${a}`);
      process.exit(2);
    }
  }

  const result = runDoctorSuite(root, { checkId });

  if (jsonOut) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log("\n🩺 Catalog Doctor — Unified Health Check\n");
    for (const c of result.checks) {
      const scope = c.rootScope === ROOT_SCOPE.CATALOG ? " · root: catalog-fixed" : "";
      if (c.pass) {
        console.log(`  ✅ [${c.id}] ${c.name} — ${c.summary || "PASS"}${scope}`);
      } else {
        console.log(`  ❌ [${c.id}] ${c.name} — ${c.cause || "FAIL"}${scope}`);
      }
    }
    console.log(`\n📊 Summary: ${result.passed}/${result.totalChecks} checks passed · ${result.failed} failed\n`);
  }

  process.exit(result.ok ? 0 : 1);
}
