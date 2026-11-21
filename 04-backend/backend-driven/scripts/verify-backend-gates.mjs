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
const CODE_EXTS = new Set([".ts", ".mts", ".cts", ".js", ".mjs", ".cjs", ".sql", ".prisma"]);

function printHelp() {
  console.log(`verify-backend-gates — Unified Backend Post-Build Audit Runner (Phase 3)

Usage:
  node verify-backend-gates.mjs --srcDir <dir> [--rootDir <dir>] [--live <url>] [--json] [--strict]

Options:
  --srcDir <dir>    Backend source directory to scan (default: ./src, ./apps/api/src, or cwd)
  --rootDir <dir>   Project root directory containing package.json (default: parent of srcDir or cwd)
  --live <url>      Probe a live HTTP endpoint for CORS origin reflection, headers, and 500 leaks
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
    const ext = extname(file).toLowerCase();
    const lines = content.split(/\r?\n/);

    // SQL Migration DDL Safety Check (Analyzer C)
    if (ext === ".sql") {
      if (!/--\s*@allow-destructive/i.test(content)) {
        const dropRe = /\bDROP\s+(?:TABLE|COLUMN)\b/gi;
        let dm;
        while ((dm = dropRe.exec(content)) !== null) {
          issues.push({
            severity: "warning",
            check: "unsafe-migration-ddl",
            msg: "Destructive DROP TABLE/COLUMN in SQL migration without '-- @allow-destructive' annotation; use expand-and-contract migration phases.",
            file: rel,
            line: offsetToLine(content, dm.index),
          });
        }
        const addNotNullRe = /\bALTER\s+TABLE\b[\s\S]{0,160}?\bADD\s+(?:COLUMN\s+)?[\w"`']+\s+[\w()]+\s+NOT\s+NULL\b(?![\s\S]{0,80}?\bDEFAULT\b)/gi;
        let am;
        while ((am = addNotNullRe.exec(content)) !== null) {
          issues.push({
            severity: "warning",
            check: "unsafe-migration-ddl",
            msg: "ALTER TABLE ... ADD COLUMN ... NOT NULL without DEFAULT locks and fails on non-empty tables; add nullable or DEFAULT first.",
            file: rel,
            line: offsetToLine(content, am.index),
          });
        }
      }
      continue;
    }

    if (ext === ".prisma") continue;

    const hasMutationHandler = /(?:router|app|fastify)\.(?:post|put|patch)\s*\(|@(?:Post|Put|Patch)\s*\(/i.test(content);
    const flaggedSqlLines = new Set();
    const flaggedUnboundedLines = new Set();
    let lastFlaggedBodyLine = -100;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (isCommentLine(line)) continue;
      const lineNo = i + 1;

      // 1. Raw SQL string interpolation or concatenation (single-line)
      const sqlCallTpl = /\.(?:query|execute|\$queryRawUnsafe|\$executeRawUnsafe|raw)\s*\(\s*`[^`]*\$\{[^}]+\}/.test(line);
      const sqlVerbConcat = /\b(?:SELECT|INSERT|UPDATE|DELETE)\b[\s\S]*?(?:\$\{[^}]+\}|\+\s*(?:req\.|params\.|query\.|body\.|args\.|input\.|\w+Id\b))/i.test(line);
      const safePlaceholder = /\$\d+|\?\s*,|\?\s*\)/.test(line) && !/\$\{/.test(line) && !/\+\s*(?:req\.|params\.|query\.|body\.)/.test(line);
      if ((sqlCallTpl || (sqlVerbConcat && !safePlaceholder))) {
        flaggedSqlLines.add(lineNo);
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

      // 5. Per-handler unvalidated mutation body (checks +/- 15 lines around each req.body access)
      if (hasMutationHandler && /\b(?:req|request)\.body\b/.test(line) && lineNo - lastFlaggedBodyLine > 15) {
        const handlerWindow = lines.slice(Math.max(0, i - 15), Math.min(lines.length, i + 15)).join("\n");
        const hasLocalValidation =
          /\.(?:parse|safeParse|validate|validateAsync)\s*\(|\bzValidator\s*\(|\bschema\s*:\s*\{[\s\S]*?\bbody\b|\bValidationPipe\b|\b(?:validateBody|parseBody|BodySchema)\b/i.test(
            handlerWindow
          );
        if (!hasLocalValidation) {
          lastFlaggedBodyLine = lineNo;
          issues.push({
            severity: "warning",
            check: "unvalidated-mutation-body",
            msg: "Mutation handler accesses req.body directly without visible schema validation in handler scope (zod/valibot/joi/parse); validate payloads before persistence.",
            file: rel,
            line: lineNo,
          });
        }
      }

      // 6. Unbounded ORM/SQL list queries (single-line + multi-line window + Drizzle .select().from())
      if (/\.findMany\s*\(/.test(line)) {
        const window6 = lines.slice(i, Math.min(i + 6, lines.length)).join(" ");
        if (!/\b(?:take|limit|cursor|pageSize|first|last)\s*:/.test(window6)) {
          flaggedUnboundedLines.add(lineNo);
          issues.push({
            severity: "warning",
            check: "unbounded-list-query",
            msg: "ORM findMany() call lacks an explicit take/limit/cursor bound; enforce pagination caps to prevent memory spikes.",
            file: rel,
            line: lineNo,
          });
        }
      } else if (/\bSELECT\b/i.test(line)) {
        const window6Sql = lines.slice(i, Math.min(i + 6, lines.length)).join(" ");
        if (/\bSELECT\b[\s\S]*?\bFROM\b/i.test(window6Sql) && !/\b(?:WHERE|LIMIT|TOP\s+\d+|FETCH\s+FIRST|COUNT\s*\(|EXISTS\s*\()\b/i.test(window6Sql)) {
          flaggedUnboundedLines.add(lineNo);
          issues.push({
            severity: "warning",
            check: "unbounded-list-query",
            msg: "Unfiltered SQL SELECT without LIMIT detected; add bounded LIMIT/OFFSET or cursor pagination.",
            file: rel,
            line: lineNo,
          });
        }
      } else if (/\.\s*select\s*\([^)]*\)\s*\.\s*from\s*\(/.test(line)) {
        const window5Drizzle = lines.slice(i, Math.min(i + 5, lines.length)).join(" ");
        if (!/\.\s*(?:limit|where)\s*\(/.test(window5Drizzle)) {
          flaggedUnboundedLines.add(lineNo);
          issues.push({
            severity: "warning",
            check: "unbounded-list-query",
            msg: "Query builder .select().from() lacks .limit() or .where(); enforce pagination bounds.",
            file: rel,
            line: lineNo,
          });
        }
      }

      // 7. N+1 query inside loop body (Analyzer A)
      if (/\b(?:for|while)\s*(?:await\s*)?\([^)]*\)\s*\{|\.(?:map|forEach)\s*\(\s*async\b[^)]*=>\s*\{/.test(line)) {
        let depth = 0;
        const maxEnd = Math.min(lines.length, i + 35);
        for (let j = i; j < maxEnd; j++) {
          const l = lines[j];
          if (isCommentLine(l)) continue;
          for (const ch of l) {
            if (ch === "{") depth++;
            else if (ch === "}") depth--;
          }
          if (
            j > i &&
            /\bawait\s+(?:prisma|db|pool|client|knex|supabase|tx|trx)\b[\s\S]*?\.(?:find\w+|query|execute|select|insert|update|delete|create|upsert)\s*\(/.test(l)
          ) {
            issues.push({
              severity: "warning",
              check: "n-plus-one-query-in-loop",
              msg: "Database query awaited inside loop body causes N+1 latency spikes; batch with IN (...), findMany({ where: { id: { in: ids } } }), or bulk insert.",
              file: rel,
              line: j + 1,
            });
            break;
          }
          if (depth <= 0 && j > i) break;
        }
      }
    }

    // 1b. Multi-line SQL template literal interpolation across lines
    const multiSqlRe = /\.(?:query|execute|\$queryRawUnsafe|\$executeRawUnsafe|raw)\s*\(\s*`(?:\\[\s\S]|(?!`)[\s\S])*?\$\{[^}]+\}(?:\\[\s\S]|(?!`)[\s\S])*?`/g;
    let sm;
    while ((sm = multiSqlRe.exec(content)) !== null) {
      const lNo = offsetToLine(content, sm.index);
      if (!flaggedSqlLines.has(lNo)) {
        flaggedSqlLines.add(lNo);
        issues.push({
          severity: "error",
          check: "raw-sql-interpolation",
          msg: "Multi-line dynamic SQL template interpolation detected; use bound parameters ($1, ?) or tagged parameterized helpers.",
          file: rel,
          line: lNo,
        });
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

export async function probeLiveBackend(liveUrl) {
  const issues = [];
  try {
    const preflight = await fetch(liveUrl, {
      method: "OPTIONS",
      headers: {
        Origin: "https://evil.example.com",
        "Access-Control-Request-Method": "POST",
      },
    });
    const allowOrigin = preflight.headers.get("access-control-allow-origin") || "";
    const allowCreds = (preflight.headers.get("access-control-allow-credentials") || "").toLowerCase();
    if ((allowOrigin === "https://evil.example.com" || allowOrigin === "*") && allowCreds === "true") {
      issues.push({
        severity: "error",
        check: "live-cors-origin-reflection",
        msg: `Live endpoint ${liveUrl} reflected untrusted Origin (${allowOrigin}) with Access-Control-Allow-Credentials: true.`,
      });
    }

    const getRes = await fetch(liveUrl, { method: "GET" });
    if (getRes.status >= 500) {
      issues.push({
        severity: "error",
        check: "live-server-error-500",
        msg: `Live endpoint ${liveUrl} returned HTTP ${getRes.status} on GET probe.`,
      });
    }
    const nosniff = (getRes.headers.get("x-content-type-options") || "").toLowerCase();
    if (nosniff !== "nosniff") {
      issues.push({
        severity: "warning",
        check: "live-missing-nosniff-header",
        msg: `Live endpoint ${liveUrl} is missing 'X-Content-Type-Options: nosniff' security header.`,
      });
    }
  } catch (err) {
    issues.push({
      severity: "error",
      check: "live-endpoint-unreachable",
      msg: `Live backend probe failed to reach ${liveUrl}: ${(err?.message || String(err)).slice(0, 160)}`,
    });
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
      const failedExit = (res.status !== 0 || Boolean(res.error)) && !(parsed.errors > 0);
      if (failedExit) {
        siblingIssues.push({
          severity: "error",
          check: "sibling-script-exec",
          source: spec.skill,
          msg: `Sibling checker ${spec.skill}/${spec.file} exited non-zero (${res.status}) without reporting an error issue.`,
        });
      }
      const errCount = (parsed.errors || 0) + (failedExit ? 1 : 0);
      siblingResults.push({
        skill: spec.skill,
        script: spec.file,
        status: errCount > 0 ? "failed" : "passed",
        errors: errCount,
        warnings: parsed.warnings || 0,
      });
    } else {
      const failed = res.status !== 0 || Boolean(res.error);
      const errReason = (res.stderr || res.error?.message || `exit-${res.status}`).trim().slice(0, 200);
      if (failed) {
        siblingIssues.push({
          severity: "error",
          check: "sibling-script-exec",
          source: spec.skill,
          msg: `Sibling checker ${spec.skill}/${spec.file} failed without valid JSON output (${errReason || "non-zero exit"}).`,
        });
      }
      siblingResults.push({
        skill: spec.skill,
        script: spec.file,
        status: failed ? "failed" : "passed",
        errors: failed ? 1 : 0,
        warnings: 0,
        reason: failed ? errReason : "no-json",
      });
    }
  }

  return { siblingResults, siblingIssues };
}

const isCliEntry =
  Boolean(process.argv[1]) &&
  resolve(process.argv[1]).toLowerCase() === resolve(fileURLToPath(import.meta.url)).toLowerCase();

async function main() {
  const args = process.argv.slice(2);
  let srcDirArg = null;
  let rootDirArg = null;
  let liveUrl = null;
  let jsonOut = false;
  let strict = false;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--help" || a === "-h") { printHelp(); process.exit(0); }
    else if (a === "--json") jsonOut = true;
    else if (a === "--strict") strict = true;
    else if (a === "--srcDir") { srcDirArg = args[++i]; if (!srcDirArg) usageError("Missing value for --srcDir"); }
    else if (a === "--rootDir") { rootDirArg = args[++i]; if (!rootDirArg) usageError("Missing value for --rootDir"); }
    else if (a === "--live") { liveUrl = args[++i]; if (!liveUrl) usageError("Missing value for --live"); }
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

  const fileSet = new Set(walkCodeFiles(srcDir));
  for (const migSubdir of ["migrations", "prisma", "drizzle"]) {
    const migPath = join(rootDir, migSubdir);
    if (existsSync(migPath)) {
      for (const mf of walkCodeFiles(migPath)) fileSet.add(mf);
    }
  }
  const files = [...fileSet];
  const stackSignals = detectSignals(rootDir, srcDir, files);
  const builtinIssues = runBuiltinChecks(rootDir, files);
  const { siblingResults, siblingIssues } = runSiblingCheckers(srcDir, stackSignals, rootDir);
  const liveIssues = liveUrl ? await probeLiveBackend(liveUrl) : [];
  const issues = [...builtinIssues, ...siblingIssues, ...liveIssues];

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

if (isCliEntry) {
  main().catch((err) => {
    console.error(`verify-backend-gates fatal error: ${err?.message || err}`);
    process.exit(1);
  });
}
