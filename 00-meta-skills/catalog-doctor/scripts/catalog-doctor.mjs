#!/usr/bin/env node
/**
 * catalog-doctor.mjs — Unified Catalog Health Check
 *
 * Requirements (spec: catalog-doctor, change skills-25-upgrade WU5b):
 * - Aggregates 6 diagnostic health checks:
 *   1. validate-skills.mjs --strict --json
 *   2. install-skills.mjs --dry-run --all-tools
 *   3. skills-loader.mjs --status
 *   4. generate-indexes.mjs --check
 *   5. validate-skills.mjs --check-deps --json
 *   6. MCP manifest and frontmatter bidirectional parity
 * - Read-only: MUST NOT mutate filesystem, manifest, or install state.
 * - Constant command table for argv dispatch.
 * - Exit 0 if all checks pass; Exit != 0 with actionable causes if any fails.
 *
 * Usage:
 *   node catalog-doctor.mjs [--root <dir>] [--json] [--check <id>]
 *   pnpm doctor
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const REPO_ROOT = resolve(__dirname, "../../..");

/**
 * Constant command table defining all diagnostic health checks.
 * Every command runs in strictly read-only inspection mode.
 */
export const DOCTOR_COMMAND_TABLE = [
  {
    id: "validator-strict",
    name: "Skill validation (strict mode)",
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
    relScript: null, // executed in-process
    buildArgs: null,
    run: (root) => checkMcpParity(root),
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
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === ".git" || entry.name === "node_modules" || entry.name === "gentle-ai-dsh" || entry.name === "_shared") continue;
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

/**
 * Runs the doctor suite against a catalog root.
 */
export function runDoctorSuite(root = REPO_ROOT, options = {}) {
  const filterId = options.checkId || null;
  const checksToRun = filterId
    ? DOCTOR_COMMAND_TABLE.filter((c) => c.id === filterId)
    : DOCTOR_COMMAND_TABLE;

  if (filterId && checksToRun.length === 0) {
    return {
      ok: false,
      totalChecks: 0,
      passed: 0,
      failed: 1,
      checks: [{ id: filterId, name: filterId, pass: false, cause: `Unknown check ID: "${filterId}"` }],
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
        results.push({ id: check.id, name: check.name, pass: true, summary: res.summary });
      } else {
        totalFailed++;
        results.push({ id: check.id, name: check.name, pass: false, cause: res.cause });
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
      results.push({ id: check.id, name: check.name, pass: true, summary: evaluated.summary });
    } else {
      totalFailed++;
      results.push({ id: check.id, name: check.name, pass: false, cause: evaluated.cause });
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
      if (c.pass) {
        console.log(`  ✅ [${c.id}] ${c.name} — ${c.summary || "PASS"}`);
      } else {
        console.log(`  ❌ [${c.id}] ${c.name} — ${c.cause || "FAIL"}`);
      }
    }
    console.log(`\n📊 Summary: ${result.passed}/${result.totalChecks} checks passed · ${result.failed} failed\n`);
  }

  process.exit(result.ok ? 0 : 1);
}
