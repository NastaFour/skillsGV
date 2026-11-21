#!/usr/bin/env node
/**
 * verify-backend-gates.mjs — Unified Backend Post-Build Audit Runner (Phase 3).
 *
 * Standalone runner (no _shared module imports, zero external npm dependencies): runs cleanly from
 * the source catalog (04-backend/backend-driven/scripts/) or installed trees.
 *
 * Chains the 8 existing 04-backend domain checkers (when matching stack signals
 * exist) plus 6 built-in deterministic security, contract, and resilience checks.
 *
 * Usage:
 *   node verify-backend-gates.mjs --srcDir <dir> [--rootDir <dir>] [--json] [--strict]
 *
 * Exit codes: 0 = pass, 1 = errors found (or warnings under --strict), 2 = usage error.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const IGNORED_DIRS = new Set(["node_modules", ".git", "dist", "build", "out", "coverage", ".next", ".turbo"]);
const CODE_EXTS = new Set([".ts", ".mts", ".cts", ".js", ".mjs", ".cjs"]);

function printHelp() {
  console.log(`verify-backend-gates — Unified Backend Post-Build Audit Runner (Phase 3)

Usage:
  node verify-backend-gates.mjs --srcDir <dir> [--rootDir <dir>] [--json] [--strict]

Options:
  --srcDir <dir>    Backend source directory to scan (default: ./src, ./apps/api/src, or cwd)
  --rootDir <dir>   Project root directory containing package.json (default: parent of srcDir or cwd)
  --json            Emit structured JSON report
  --strict          Fail with exit code 1 when warnings are present
  --help, -h        Show this help message

Exit codes: 0 = pass, 1 = issues found, 2 = usage error.`);
}

function usageError(msg) {
  console.error(`error: ${msg}`);
  process.exit(2);
}

function walkCodeFiles(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (e.isDirectory()) {
      if (IGNORED_DIRS.has(e.name) || e.name.startsWith(".")) continue;
      walkCodeFiles(join(dir, e.name), out);
    } else if (e.isFile() && CODE_EXTS.has(extname(e.name).toLowerCase())) {
      if (/\.(test|spec)\.[cm]?[jt]s$/i.test(e.name)) continue;
      out.push(join(dir, e.name));
    }
  }
  return out;
}

/**
 * Resolve sibling 04-backend scripts in either flat installed layout or catalog layout.
 */
function resolveSiblingScript(category, skill, file) {
  const flatPath = resolve(__dirname, "..", "..", skill, "scripts", file);
  if (existsSync(flatPath)) return flatPath;
  const catalogPath = resolve(__dirname, "..", "..", "..", category, skill, "scripts", file);
  if (existsSync(catalogPath)) return catalogPath;
  return null;
}

function offsetToLine(content, idx) {
  let line = 1;
  for (let i = 0; i < idx && i < content.length; i++) {
    if (content.charCodeAt(i) === 10) line++;
  }
  return line;
}

function isCommentLine(line) {
  const trimmed = line.trim();
  return trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*");
}

function detectSignals(rootDir, srcDir, files) {
  let pkg = null;
  const pkgPath = join(rootDir, "package.json");
  if (existsSync(pkgPath)) {
    try { pkg = JSON.parse(readFileSync(pkgPath, "utf8")); } catch {}
  }
  const deps = { ...(pkg?.dependencies || {}), ...(pkg?.devDependencies || {}) };
  const signals = {
    hasExpressOrRouter: Boolean(deps.express || deps.fastify || deps.hono),
    hasRateLimiter: Boolean(deps["express-rate-limit"] || deps["@fastify/rate-limit"]),
    hasQueues: Boolean(deps.bullmq || deps["pg-boss"] || deps.agenda),
    hasBooking: false,
    hasUploads: Boolean(deps.multer || deps.busboy || deps.formidable || deps["@aws-sdk/client-s3"]),
    hasNotifications: Boolean(deps.nodemailer || deps.resend || deps.twilio || deps["web-push"]),
    hasReports: Boolean(deps.pdfkit || deps.exceljs || deps["csv-stringify"]),
    hasDotenv: Boolean(deps.dotenv),
  };

  for (const file of files) {
    const text = readFileSync(file, "utf8");
    if (/(?:router|app|fastify)\.(?:get|post|put|patch|delete)\s*\(|req\.params\b/.test(text)) signals.hasExpressOrRouter = true;
    if (/\b(?:rateLimit|authLimiter|sessionLimiter)\b|rate-limit/i.test(text)) signals.hasRateLimiter = true;
    if (/new\s+(?:Queue|Worker)\s*\(|bullmq|pg-boss|agenda/i.test(text)) signals.hasQueues = true;
    if (/\b(?:booking|appointment|reservation)\b/i.test(text)) signals.hasBooking = true;
    if (/\b(?:multer|busboy|PutObjectCommand|multipart\/form-data)\b/i.test(text)) signals.hasUploads = true;
    if (/\b(?:createTransport|sendMail|resend\.emails|webpush)\b/i.test(text)) signals.hasNotifications = true;
    if (/\b(?:PDFDocument|ExcelJS|pdfkit|exceljs|csv-stringify)\b/i.test(text)) signals.hasReports = true;
    if (/dotenv/i.test(text)) signals.hasDotenv = true;
  }
  return signals;
}

function runBuiltinChecks(rootDir, files) {
  const issues = [];
  for (const file of files) {
    const content = readFileSync(file, "utf8");
    const rel = relative(rootDir, file).replace(/\\/g, "/");
    const lines = content.split(/\r?\n/);

    const hasMutationHandler = /(?:router|app|fastify)\.(?:post|put|patch)\s*\(/i.test(content);
    const hasSchemaValidation = /\.(?:parse|safeParse|validate|validateAsync)\s*\(|\bz\.\w+|\b(?:joi|yup|valibot|arktype|ajv)\b|class-validator|\b(?:validateBody|parseBody|BodySchema)\b/i.test(content);
    let flaggedUnvalidatedBody = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (isCommentLine(line)) continue;
      const lineNo = i + 1;

      // 1. Raw SQL string interpolation or concatenation
      const sqlCallTpl = /\.(?:query|execute|\$queryRawUnsafe|\$executeRawUnsafe|raw)\s*\(\s*`[^`]*\$\{[^}]+\}/.test(line);
      const sqlVerbConcat = /\b(?:SELECT|INSERT|UPDATE|DELETE)\b[\s\S]*?(?:\$\{[^}]+\}|\+\s*(?:req\.|params\.|query\.|body\.|args\.|input\.|\w+Id\b))/i.test(line);
      const safePlaceholder = /\$\d+|\?\s*,|\?\s*\)/.test(line) && !/\$\{/.test(line) && !/\+\s*(?:req\.|params\.|query\.|body\.)/.test(line);
      if ((sqlCallTpl || (sqlVerbConcat && !safePlaceholder))) {
        issues.push({
          severity: "error",
          check: "raw-sql-interpolation",
          msg: "Dynamic SQL interpolation or concatenation detected; use bound parameters ($1, ?) or typed query builder APIs.",
          file: rel,
          line: lineNo,
        });
      }

      // 2. Hardcoded secret/token/key/password fallback literal
      const secretFallback = /process\.env\.[A-Z0-9_]*(?:SECRET|TOKEN|KEY|PASSWORD|PASS|PRIVATE|SIGNING|SALT|WEBHOOK)[A-Z0-9_]*\s*(?:\?\?|\|\|)\s*(['"`])([^'"`]{3,})\1/;
      if (secretFallback.test(line)) {
        issues.push({
          severity: "error",
          check: "hardcoded-secret-fallback",
          msg: "Hardcoded fallback string for a sensitive env secret; fail fast at startup if the variable is missing.",
          file: rel,
          line: lineNo,
        });
      }

      // 3. Unsafe CORS wildcard/reflected origin paired with credentials: true
      const window4 = lines.slice(i, Math.min(i + 4, lines.length)).join(" ");
      if (/(?:cors\s*\(|setHeader|Access-Control)/i.test(line)) {
        const hasWildcardOrigin = /origin\s*:\s*(?:true|['"]\*['"])|Access-Control-Allow-Origin['"`]?\s*[,:]\s*['"]\*['"]/i.test(window4);
        const hasCredentialsTrue = /credentials\s*:\s*true|Access-Control-Allow-Credentials['"`]?\s*[,:]\s*['"]?true/i.test(window4);
        if (hasWildcardOrigin && hasCredentialsTrue) {
          issues.push({
            severity: "error",
            check: "unsafe-cors-wildcard-credentials",
            msg: "Wildcard or reflected CORS origin paired with credentials: true weakens cross-origin isolation; specify an explicit origin allowlist.",
            file: rel,
            line: lineNo,
          });
        }
      }

      // 5. Unvalidated mutation body (file has POST/PUT/PATCH + reads req.body without schema validation)
      if (!flaggedUnvalidatedBody && hasMutationHandler && /\b(?:req|request)\.body\b/.test(line) && !hasSchemaValidation) {
        flaggedUnvalidatedBody = true;
        issues.push({
          severity: "warning",
          check: "unvalidated-mutation-body",
          msg: "Mutation handler accesses req.body directly without visible schema validation (zod/valibot/joi/parse); validate payloads before persistence.",
          file: rel,
          line: lineNo,
        });
      }

      // 6. Unbounded ORM/SQL list queries
      if (/\.findMany\s*\(/.test(line)) {
        const window6 = lines.slice(i, Math.min(i + 6, lines.length)).join(" ");
        if (!/\b(?:take|limit|cursor|pageSize|first|last)\s*:/.test(window6)) {
          issues.push({
            severity: "warning",
            check: "unbounded-list-query",
            msg: "ORM findMany() call lacks an explicit take/limit/cursor bound; enforce pagination caps to prevent memory spikes.",
            file: rel,
            line: lineNo,
          });
        }
      } else if (/\bSELECT\b[\s\S]*\bFROM\b/i.test(line)) {
        const window4Sql = lines.slice(i, Math.min(i + 4, lines.length)).join(" ");
        if (!/\b(?:WHERE|LIMIT|TOP\s+\d+|FETCH\s+FIRST|COUNT\s*\(|EXISTS\s*\()\b/i.test(window4Sql)) {
          issues.push({
            severity: "warning",
            check: "unbounded-list-query",
            msg: "Unfiltered SQL SELECT without LIMIT detected; add bounded LIMIT/OFFSET or cursor pagination.",
            file: rel,
            line: lineNo,
          });
        }
      }
    }

    // 4. Empty catch blocks (handles multi-line or commented empty catches)
    const emptyCatchRe = /\bcatch\s*(?:\([^)]*\))?\s*\{(?:\s|\/\*[\s\S]*?\*\/|\/\/[^\n]*)*\}/g;
    let m;
    while ((m = emptyCatchRe.exec(content)) !== null) {
      issues.push({
        severity: "warning",
        check: "empty-catch-block",
        msg: "Empty or comment-only catch block swallows errors silently; log structured context or propagate a typed error.",
        file: rel,
        line: offsetToLine(content, m.index),
      });
    }
  }
  return issues;
}

function runSiblingCheckers(srcDir, signals, rootDir) {
  const specs = [
    { skill: "api-response-normalizer", file: "check-id-consistency.mjs", flag: "--apiDir", active: signals.hasExpressOrRouter },
    { skill: "rate-limiting-design", file: "check-limiters.mjs", flag: "--apiDir", active: signals.hasRateLimiter },
    { skill: "background-jobs-queues", file: "check-jobs.mjs", flag: "--apiDir", active: signals.hasQueues },
    { skill: "booking-scheduling-domain", file: "check-booking-queries.mjs", flag: "--apiDir", active: signals.hasBooking },
    { skill: "file-uploads-storage", file: "check-uploads.mjs", flag: "--apiDir", active: signals.hasUploads },
    { skill: "notifications-multichannel", file: "check-notifications.mjs", flag: "--apiDir", active: signals.hasNotifications },
    { skill: "reports-exports", file: "check-reports.mjs", flag: "--apiDir", active: signals.hasReports },
    { skill: "nodejs-module-loading", file: "check-env-loading.mjs", flag: "--srcDir", active: signals.hasDotenv },
  ];

  const siblingResults = [];
  const siblingIssues = [];

  for (const spec of specs) {
    const scriptPath = resolveSiblingScript("04-backend", spec.skill, spec.file);
    if (!scriptPath) {
      siblingResults.push({ skill: spec.skill, script: spec.file, status: "skipped", reason: "script-not-installed" });
      continue;
    }
    if (!spec.active) {
      siblingResults.push({ skill: spec.skill, script: spec.file, status: "skipped", reason: "signal-not-present" });
      continue;
    }

    const res = spawnSync(process.execPath, [scriptPath, spec.flag, srcDir, "--json"], {
      cwd: rootDir,
      encoding: "utf8",
      timeout: 10000,
    });

    let parsed = null;
    try { parsed = JSON.parse((res.stdout || "").trim()); } catch {}
    if (parsed && Array.isArray(parsed.issues)) {
      for (const iss of parsed.issues) {
        siblingIssues.push({ ...iss, source: spec.skill });
      }
      siblingResults.push({
        skill: spec.skill,
        script: spec.file,
        status: parsed.errors > 0 ? "failed" : "passed",
        errors: parsed.errors || 0,
        warnings: parsed.warnings || 0,
      });
    } else {
      siblingResults.push({
        skill: spec.skill,
        script: spec.file,
        status: res.status === 0 ? "passed" : "failed",
        reason: res.status === 0 ? "no-json" : (res.stderr || `exit-${res.status}`).slice(0, 200),
      });
    }
  }

  return { siblingResults, siblingIssues };
}

function main() {
  const args = process.argv.slice(2);
  let srcDirArg = null;
  let rootDirArg = null;
  let jsonOut = false;
  let strict = false;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--help" || a === "-h") { printHelp(); process.exit(0); }
    else if (a === "--json") jsonOut = true;
    else if (a === "--strict") strict = true;
    else if (a === "--srcDir") { srcDirArg = args[++i]; if (!srcDirArg) usageError("Missing value for --srcDir"); }
    else if (a === "--rootDir") { rootDirArg = args[++i]; if (!rootDirArg) usageError("Missing value for --rootDir"); }
    else usageError(`Unknown option: ${a}`);
  }

  const cwd = process.cwd();
  const rootDir = resolve(rootDirArg || (srcDirArg ? dirname(resolve(srcDirArg)) : cwd));
  let srcDir = srcDirArg ? resolve(srcDirArg) : null;
  if (!srcDir) {
    if (existsSync(join(rootDir, "src"))) srcDir = join(rootDir, "src");
    else if (existsSync(join(rootDir, "apps", "api", "src"))) srcDir = join(rootDir, "apps", "api", "src");
    else srcDir = rootDir;
  }
  if (!existsSync(srcDir)) usageError(`Source directory not found: ${srcDir}`);

  const files = walkCodeFiles(srcDir);
  const stackSignals = detectSignals(rootDir, srcDir, files);
  const builtinIssues = runBuiltinChecks(rootDir, files);
  const { siblingResults, siblingIssues } = runSiblingCheckers(srcDir, stackSignals, rootDir);
  const issues = [...builtinIssues, ...siblingIssues];

  let errors = 0;
  let warnings = 0;
  let info = 0;
  for (const iss of issues) {
    if (iss.severity === "error") errors++;
    else if (iss.severity === "warning") warnings++;
    else info++;
  }

  const ok = errors === 0 && (!strict || warnings === 0);
  const report = {
    script: "verify-backend-gates",
    srcDir,
    rootDir,
    filesScanned: files.length,
    strict,
    ok,
    errors,
    warnings,
    info,
    stackSignals,
    siblings: siblingResults,
    issues,
  };

  if (jsonOut) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`\nverify-backend-gates — scanned ${files.length} file(s) in ${basename(srcDir)}`);
    console.log(`  Errors: ${errors} | Warnings: ${warnings} | Info: ${info} | Strict: ${strict}`);
    for (const iss of issues) {
      const loc = iss.file ? ` ${iss.file}${iss.line ? `:${iss.line}` : ""}` : "";
      console.log(`  [${iss.severity.toUpperCase()}] (${iss.check})${loc}: ${iss.msg}`);
    }
  }

  process.exit(ok ? 0 : 1);
}

main();
