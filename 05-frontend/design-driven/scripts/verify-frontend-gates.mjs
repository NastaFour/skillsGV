#!/usr/bin/env node
/**
 * verify-frontend-gates.mjs — Unified Frontend Post-Build Audit Runner (Phase 3).
 *
 * Zero _shared imports: executes identically from the source catalog
 * (05-frontend/design-driven/scripts/), flat installed projects
 * (.agents/skills/design-driven/scripts/), and gentle-ai-dsh/skills/.
 *
 * Chains non-overlapping deterministic frontend checkers based on actual
 * project stack signals + a deterministic magic-z-index mechanical check.
 *
 * Usage:
 *   node verify-frontend-gates.mjs --srcDir <dir> [--webDir <dir>] [--json] [--strict-craft] [--skip-build-config]
 *
 * Exit codes: 0 = zero errors, 1 = errors found (or craft warnings under --strict-craft), 2 = usage error.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const IGNORED_DIRS = new Set(["node_modules", ".git", "dist", "build", "out", "coverage", ".ui-diff"]);
const CODE_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".vue", ".svelte", ".astro"]);
const TOKEN_FILE_RE = /(token|theme|variables)/i;

function printHelp() {
  console.log(`verify-frontend-gates — Unified Frontend Post-Build Audit Runner (Phase 3)

Usage:
  node verify-frontend-gates.mjs --srcDir <dir> [--webDir <dir>] [--live <url>] [--json] [--strict-craft] [--skip-build-config]

Options:
  --srcDir <dir>        Source directory to scan (default: <webDir>/src or ./src)
  --webDir <dir>        Project root directory containing package.json (default: parent of srcDir or cwd)
  --live <url>          Run live Playwright DOM-geometry & /ui-diff audit against running URL
  --json                Emit structured JSON report
  --strict-craft        Treat mechanical craft warnings (e.g. magic-z-index) as errors
  --skip-build-config   Skip validate-build-config check
  --help, -h            Show this help message

Exit codes: 0 = pass, 1 = errors found, 2 = usage error.`);
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
      out.push(join(dir, e.name));
    }
  }
  return out;
}

/**
 * Resolve a sibling skill script in either:
 *   1. Flat installed layout:  <skillsRoot>/<skill>/scripts/<file>
 *   2. Source catalog layout:  <catalogRoot>/<category>/<skill>/scripts/<file>
 */
function resolveSiblingScript(category, skill, file) {
  const flatPath = resolve(__dirname, "..", "..", skill, "scripts", file);
  if (existsSync(flatPath)) return flatPath;
  const catalogPath = resolve(__dirname, "..", "..", "..", category, skill, "scripts", file);
  if (existsSync(catalogPath)) return catalogPath;
  return null;
}

function detectStackSignals(webDir, srcDir) {
  let pkg = null;
  const pkgPath = join(webDir, "package.json");
  if (existsSync(pkgPath)) {
    try { pkg = JSON.parse(readFileSync(pkgPath, "utf8")); } catch {}
  }
  const deps = { ...(pkg?.dependencies || {}), ...(pkg?.devDependencies || {}) };
  const files = walkCodeFiles(srcDir);
  let hasUseForm = false;
  let hasRouter = false;
  let hasScrollApi = false;
  let hasHeavySdk = false;
  let hasInteractiveJsx = false;
  let hasThreeCode = false;
  let hasGsapCode = false;
  let hasShaders = false;
  let hasAstro = existsSync(join(webDir, "astro.config.mjs")) || existsSync(join(webDir, "astro.config.ts"));

  for (const f of files) {
    let txt;
    try { txt = readFileSync(f, "utf8"); } catch { continue; }
    if (f.endsWith(".astro")) hasAstro = true;
    if (/\buseForm\s*\(/.test(txt)) hasUseForm = true;
    if (/\buseLocation\s*\(|<Routes\b/.test(txt)) hasRouter = true;
    if (/ScrollTrigger|addEventListener\s*\(\s*["']scroll["']/.test(txt)) hasScrollApi = true;
    if (/loadStripe\s*\(|\bL\.map\s*\(|mapboxgl\.Map|maplibregl\.Map|google\.maps\.Map/.test(txt)) hasHeavySdk = true;
    if (/\.(tsx|jsx|astro|vue|svelte)$/.test(f) && /<button\b|<a\b|onClick=|@click=/.test(txt)) hasInteractiveJsx = true;
    if (/from\s+["'](?:three|@react-three\/fiber)["']/.test(txt)) hasThreeCode = true;
    if (/from\s+["']gsap(?:\/[^"']*)?["']/.test(txt)) hasGsapCode = true;
    if (/ShaderMaterial|gl_FragColor|\.glsl|\.wgsl/.test(txt)) hasShaders = true;
  }

  return {
    hasPkg: Boolean(pkg),
    hasMotion: Boolean(deps.motion || deps["framer-motion"]),
    hasGsap: Boolean(deps.gsap || hasGsapCode),
    hasThree: Boolean(deps.three || deps["@react-three/fiber"] || hasThreeCode),
    hasShaders,
    hasAstro,
    hasLottie: Boolean(deps["lottie-react"] || deps["lottie-web"] || deps["@lottiefiles/dotlottie-react"] || deps["lottie-react-native"]),
    hasForms: Boolean(deps["react-hook-form"] || hasUseForm),
    hasRouter: Boolean(deps["react-router"] || deps["react-router-dom"] || hasRouter),
    hasScrollApi,
    hasHeavySdk: Boolean(deps["@stripe/stripe-js"] || deps.leaflet || deps["mapbox-gl"] || hasHeavySdk),
    hasI18n: Boolean(deps.i18next || deps["react-i18next"] || deps["react-intl"] || deps["next-intl"]),
    hasMobile: Boolean(deps["react-native"] || deps.expo),
    hasInteractiveJsx,
    files,
  };
}

function extractOpeningTagAttrs(lines, startLineIdx, tagNameRegex) {
  const rawWindow = lines.slice(startLineIdx, Math.min(startLineIdx + 30, lines.length)).join("\n");
  const startMatch = rawWindow.match(tagNameRegex);
  if (!startMatch || startMatch.index === undefined) return null;
  const startIdx = startMatch.index + startMatch[0].length;
  let quote = null;
  let escaped = false;
  let inLineComment = false;
  let inBlockComment = false;
  let braceDepth = 0;
  for (let j = startIdx; j < rawWindow.length; j++) {
    const ch = rawWindow[j];
    const next = rawWindow[j + 1];
    if (inLineComment) {
      if (ch === "\n") inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (ch === "*" && next === "/") {
        inBlockComment = false;
        j++;
      }
      continue;
    }
    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "/" && next === "/") {
      inLineComment = true;
      j++;
      continue;
    }
    if (ch === "/" && next === "*") {
      inBlockComment = true;
      j++;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      continue;
    }
    if (ch === "{") {
      braceDepth++;
      continue;
    }
    if (ch === "}") {
      if (braceDepth > 0) braceDepth--;
      continue;
    }
    if (ch === ">" && braceDepth === 0 && rawWindow[j - 1] !== "=") {
      return rawWindow.slice(startIdx, j);
    }
  }
  return null;
}

function runV4StaticChecks(srcDir, files, signals) {
  const findings = [];
  let hasReducedMotionAnywhere = false;
  let hasKineticCleanupAnywhere = false;
  let firstKineticFile = null;

  for (const f of files) {
    const rel = relative(srcDir, f).split(sep).join("/");
    let txt;
    try { txt = readFileSync(f, "utf8"); } catch { continue; }

    if (/prefers-reduced-motion|useReducedMotion/.test(txt)) hasReducedMotionAnywhere = true;
    if (/\.revert\s*\(|\.dispose\s*\(|ScrollTrigger\.getAll|astro:before-swap/.test(txt)) hasKineticCleanupAnywhere = true;
    if (!firstKineticFile && /from\s+["'](?:gsap|three|@react-three\/fiber)/.test(txt)) firstKineticFile = rel;

    const lines = txt.split(/\r?\n/);
    const isUiFile = /\.(tsx|jsx|astro|vue|svelte|html)$/.test(f);
    const hasModernVh = /\b100[ds]vh\b/.test(txt);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^\s*(?:\/\/|\/\*|\*|<!--)/.test(line)) continue;

      if (isUiFile && /<(?:div|span)\b/i.test(line)) {
        const attrs = extractOpeningTagAttrs(lines, i, /<(?:div|span)\b/i);
        if (attrs !== null && /\bonClick\s*=/i.test(attrs) && !/\b(?:role|tabIndex|tabindex|onKeyDown|onKeyUp)\s*=/.test(attrs)) {
          findings.push({
            severity: "error",
            check: "non-semantic-clickable",
            file: rel,
            line: i + 1,
            msg: "Interactive <div>/<span> with onClick lacks role/tabIndex/keyboard handler — use <button> or add full keyboard semantics.",
          });
        }
      }

      if (!TOKEN_FILE_RE.test(rel) && !hasModernVh && /(?:\bh-screen\b|\b100vh\b)/.test(line)) {
        findings.push({
          severity: "error",
          check: "legacy-100vh",
          file: rel,
          line: i + 1,
          msg: "Legacy 100vh/h-screen clips on mobile browser bars — use 100svh (heroes) or 100dvh (app shells).",
        });
      }

      if (/<meta\b[^>]*name=["']viewport["'][^>]*>/i.test(line) && /(?:maximum-scale\s*=\s*1(?:\.0)?\b|user-scalable\s*=\s*no)/i.test(line)) {
        findings.push({
          severity: "error",
          check: "zoom-disabled-viewport",
          file: rel,
          line: i + 1,
          msg: "Never disable pinch-to-zoom (maximum-scale=1 / user-scalable=no violates WCAG).",
        });
      }

      if (isUiFile && /<p\b/i.test(line)) {
        const pAttrs = extractOpeningTagAttrs(lines, i, /<p\b/i);
        if (pAttrs !== null && /\bclass(?:Name)?=["'][^"']*\bfont-mono\b/i.test(pAttrs)) {
          findings.push({
            severity: "error",
            check: "mono-prose",
            file: rel,
            line: i + 1,
            msg: "font-mono used on <p> prose — reserve monospace strictly for numeric/code telemetry.",
          });
        }
      }

      if (isUiFile && /<img\b/i.test(line)) {
        const attrs = extractOpeningTagAttrs(lines, i, /<img\b/i);
        if (attrs !== null) {
          const hasAlt = /\balt\s*=/.test(attrs);
          const hasSize = /\b(?:width|height)\s*=|\baspect-|\bfill\b/.test(attrs);
          if (!hasAlt || !hasSize) {
            findings.push({
              severity: "error",
              check: "img-missing-alt-or-size",
              file: rel,
              line: i + 1,
              msg: "<img> must declare both alt and explicit dimensions (width/height or aspect-*) to prevent CLS.",
            });
          }
        }
      }
    }
  }

  if ((signals.hasThree || signals.hasGsap || signals.hasShaders) && firstKineticFile && (!hasReducedMotionAnywhere || !hasKineticCleanupAnywhere)) {
    findings.push({
      severity: "error",
      check: "kinetic-missing-cleanup-or-reduced-motion",
      file: firstKineticFile,
      line: 1,
      msg: "GSAP/Three.js/Shader usage requires both prefers-reduced-motion support and lifecycle cleanup (.revert() / .dispose() / astro:before-swap).",
    });
  }

  return findings;
}

function runMagicZIndexCheck(srcDir, files) {
  const findings = [];
  const zRe = /(?:z-index\s*:\s*(\d{4,})|z-\[(\d{4,})\]|zIndex\s*:\s*(\d{4,}))/g;
  for (const f of files) {
    const rel = relative(srcDir, f).split(sep).join("/");
    if (TOKEN_FILE_RE.test(rel)) continue;
    let txt;
    try { txt = readFileSync(f, "utf8"); } catch { continue; }
    const lines = txt.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^\s*(?:\/\/|\/\*|\*)/.test(line)) continue;
      if (/--z-[\w-]+\s*:/.test(line)) continue;
      for (const m of line.matchAll(zRe)) {
        const val = m[1] || m[2] || m[3];
        findings.push({
          severity: "warning",
          check: "magic-z-index",
          file: rel,
          line: i + 1,
          msg: `Magic z-index "${val}" — replace with a named semantic layer token (--z-sticky / --z-drawer / --z-modal / --z-toast).`,
        });
      }
    }
  }
  return findings;
}

function parseChildResult(name, stdout, stderr, exitCode, dedupeChecks = []) {
  const trimmed = stdout.trim();
  if (trimmed) {
    try {
      const parsed = JSON.parse(trimmed);
      // token-audit shape: { findings, total }
      if (Array.isArray(parsed.findings)) {
        const issues = parsed.findings.map((f) => ({
          severity: "error",
          check: f.rule,
          file: f.file,
          line: f.line,
          msg: f.snippet,
        }));
        return {
          name,
          status: issues.length > 0 ? "fail" : "pass",
          errors: issues.length,
          warnings: 0,
          info: 0,
          issues,
        };
      }
      // _shared ScriptResult shape: { issues, errors, warnings, info, ok }
      if (Array.isArray(parsed.issues)) {
        const dedupeSet = new Set(dedupeChecks);
        const filtered = parsed.issues.filter((i) => !dedupeSet.has(i.check));
        let errors = 0, warnings = 0, info = 0;
        for (const i of filtered) {
          if (i.severity === "error") errors++;
          else if (i.severity === "warning") warnings++;
          else info++;
        }
        return {
          name,
          status: errors > 0 ? "fail" : warnings > 0 ? "warn" : "pass",
          errors,
          warnings,
          info,
          issues: filtered,
        };
      }
    } catch {}
  }

  return {
    name,
    status: exitCode === 0 ? "pass" : "fail",
    errors: exitCode === 0 ? 0 : 1,
    warnings: 0,
    info: 0,
    issues: exitCode === 0 ? [] : [{ severity: "error", check: "script-exec-error", msg: (stderr || stdout || `exit ${exitCode}`).trim().slice(0, 300) }],
  };
}

function main() {
  const args = process.argv.slice(2);
  let srcDirArg = null;
  let webDirArg = null;
  let jsonOut = false;
  let strictCraft = false;
  let skipBuildConfig = false;
  let liveUrl = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--srcDir") {
      srcDirArg = args[++i];
      if (!srcDirArg || srcDirArg.startsWith("--")) usageError("--srcDir requires a path");
    } else if (arg === "--webDir") {
      webDirArg = args[++i];
      if (!webDirArg || webDirArg.startsWith("--")) usageError("--webDir requires a path");
    } else if (arg === "--live") {
      liveUrl = args[++i];
      if (!liveUrl || liveUrl.startsWith("--")) usageError("--live requires a URL");
    } else if (arg === "--json") {
      jsonOut = true;
    } else if (arg === "--strict-craft") {
      strictCraft = true;
    } else if (arg === "--skip-build-config") {
      skipBuildConfig = true;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      usageError(`unknown argument: ${arg}`);
    }
  }

  const webDir = webDirArg
    ? resolve(webDirArg)
    : srcDirArg
      ? dirname(resolve(srcDirArg))
      : process.cwd();
  const srcDir = srcDirArg ? resolve(srcDirArg) : join(webDir, "src");

  if (!existsSync(srcDir) || !statSync(srcDir).isDirectory()) {
    usageError(`--srcDir "${srcDir}" is not an existing directory`);
  }

  const signals = detectStackSignals(webDir, srcDir);

  const plan = [
    { name: "token-audit", category: "05-frontend", skill: "design-driven", file: "token-audit.mjs", args: ["--srcDir", srcDir, "--json"], run: true, dedupe: [] },
    { name: "check-tokens", category: "05-frontend", skill: "design-system-tokens", file: "check-tokens.mjs", args: ["--srcDir", srcDir, "--json"], run: true, dedupe: ["hardcoded-hex"] },
    { name: "check-motion-a11y", category: "05-frontend", skill: "motion-accessibility", file: "check-motion-a11y.mjs", args: ["--srcDir", srcDir, "--json"], run: true, dedupe: [] },
    { name: "check-effects", category: "05-frontend", skill: "visual-effects", file: "check-effects.mjs", args: ["--srcDir", srcDir, "--json"], run: true, dedupe: [] },
    { name: "check-interactions", category: "02-dev-roles", skill: "micro-interactions", file: "check-interactions.mjs", args: ["--srcDir", srcDir, "--json"], run: signals.hasInteractiveJsx, dedupe: ["transition-all", "animate-layout-prop"] },
    { name: "validate-build-config", category: "06-code-quality", skill: "build-config-validator", file: "validate-build-config.mjs", args: ["--webDir", webDir, "--json"], run: !skipBuildConfig && signals.hasPkg, dedupe: [] },
    { name: "check-motion", category: "05-frontend", skill: "motion-framer", file: "check-motion.mjs", args: ["--srcDir", srcDir, "--json"], run: signals.hasMotion, dedupe: [] },
    { name: "check-gsap", category: "05-frontend", skill: "motion-gsap", file: "check-gsap.mjs", args: ["--srcDir", srcDir, "--json"], run: signals.hasGsap, dedupe: [] },
    { name: "check-lottie", category: "05-frontend", skill: "lottie-animations", file: "check-lottie.mjs", args: ["--srcDir", srcDir, "--json"], run: signals.hasLottie, dedupe: [] },
    { name: "check-forms", category: "05-frontend", skill: "forms-validation-react", file: "check-forms.mjs", args: ["--srcDir", srcDir, "--json"], run: signals.hasForms, dedupe: [] },
    { name: "check-transitions", category: "05-frontend", skill: "page-transitions", file: "check-transitions.mjs", args: ["--srcDir", srcDir, "--json"], run: signals.hasRouter, dedupe: [] },
    { name: "check-scroll", category: "05-frontend", skill: "scroll-animations", file: "check-scroll.mjs", args: ["--srcDir", srcDir, "--json"], run: signals.hasScrollApi, dedupe: [] },
    { name: "check-module-level-loads", category: "05-frontend", skill: "lazy-loading-patterns", file: "check-module-level-loads.mjs", args: ["--srcDir", srcDir, "--json"], run: signals.hasHeavySdk, dedupe: [] },
    { name: "check-hardcoded-strings", category: "05-frontend", skill: "i18n-localization", file: "check-hardcoded-strings.mjs", args: ["--srcDir", srcDir, "--json"], run: signals.hasI18n, dedupe: [] },
    { name: "check-offline-sync", category: "05-frontend", skill: "offline-sync-mobile", file: "check-offline-sync.mjs", args: ["--srcDir", srcDir, "--json"], run: signals.hasMobile, dedupe: [] },
    { name: "legacy-scan", category: "05-frontend", skill: "modern-web-guidance", file: "legacy-scan.mjs", args: ["--srcDir", srcDir, "--json"], run: Boolean(resolveSiblingScript("05-frontend", "modern-web-guidance", "legacy-scan.mjs")), dedupe: ["legacy-100vh"] },
  ];

  const scriptResults = [];
  for (const item of plan) {
    if (!item.run) continue;
    const scriptPath = resolveSiblingScript(item.category, item.skill, item.file);
    if (!scriptPath) {
      scriptResults.push({ name: item.name, status: "skipped", reason: "not installed", errors: 0, warnings: 0, info: 0, issues: [] });
      continue;
    }
    const execRes = spawnSync(process.execPath, [scriptPath, ...item.args], {
      cwd: webDir,
      encoding: "utf8",
      timeout: 30000,
    });
    scriptResults.push(
      parseChildResult(item.name, execRes.stdout ?? "", execRes.stderr ?? "", execRes.status ?? 1, item.dedupe)
    );
  }

  const craftChecks = [...runMagicZIndexCheck(srcDir, signals.files), ...runV4StaticChecks(srcDir, signals.files, signals)];
  if (strictCraft) {
    for (const c of craftChecks) c.severity = "error";
  }

  let liveAudit = null;
  if (liveUrl) {
    const uiDiffScript = resolveSiblingScript("05-frontend", "ui-diff", "ui-diff.mjs");
    if (uiDiffScript) {
      const liveExec = spawnSync(process.execPath, [uiDiffScript, "--url", liveUrl, "--mode", "auto", "--json"], {
        cwd: webDir,
        encoding: "utf8",
        timeout: 60000,
      });
      const rawOut = (liveExec.stdout || "").trim();
      try {
        if (liveExec.error || !rawOut) {
          throw new Error((liveExec.stderr || liveExec.error?.message || `ui-diff exited with code ${liveExec.status ?? 1}`).trim());
        }
        const parsed = JSON.parse(rawOut);
        if (liveExec.status !== 0 && (typeof parsed.errors !== "number" || parsed.errors === 0)) {
          liveAudit = {
            ...parsed,
            status: "error",
            ok: false,
            errors: 1,
            warnings: parsed.warnings || 0,
            issues: [
              ...(Array.isArray(parsed.issues) ? parsed.issues : []),
              {
                severity: "error",
                check: "ui-diff-exec",
                msg: (liveExec.stderr || `ui-diff exited with status ${liveExec.status}`).trim().slice(0, 200),
              },
            ],
          };
        } else {
          liveAudit = parsed;
        }
      } catch (err) {
        liveAudit = {
          status: "error",
          ok: false,
          errors: 1,
          warnings: 0,
          issues: [{ severity: "error", check: "ui-diff-parse", msg: (liveExec.stderr || err?.message || "invalid json").trim().slice(0, 200) }],
        };
      }
    } else {
      liveAudit = { status: "skipped", reason: "ui-diff not installed", ok: true, errors: 0, warnings: 0, issues: [] };
    }
  }

  let totalErrors = 0;
  let totalWarnings = 0;
  let totalInfo = 0;
  let totalSkipped = 0;

  for (const r of scriptResults) {
    if (r.status === "skipped") totalSkipped++;
    totalErrors += r.errors;
    totalWarnings += r.warnings;
    totalInfo += r.info;
  }
  for (const c of craftChecks) {
    if (c.severity === "error") totalErrors++;
    else if (c.severity === "warning") totalWarnings++;
    else totalInfo++;
  }
  if (liveAudit && typeof liveAudit.errors === "number") {
    totalErrors += liveAudit.errors;
    totalWarnings += liveAudit.warnings || 0;
  }

  const report = {
    srcDir,
    webDir,
    ok: totalErrors === 0,
    summary: {
      scriptsRun: scriptResults.filter((r) => r.status !== "skipped").length,
      skipped: totalSkipped,
      errors: totalErrors,
      warnings: totalWarnings,
      info: totalInfo,
    },
    scripts: scriptResults,
    craftChecks,
    ...(liveAudit ? { liveAudit } : {}),
  };

  if (jsonOut) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`\n🛡️  verify-frontend-gates — ${report.summary.scriptsRun} script(s) run, ${report.summary.skipped} skipped\n`);
    for (const r of scriptResults) {
      const icon = r.status === "fail" ? "🔴" : r.status === "warn" ? "🟡" : r.status === "skipped" ? "⏭️" : "✅";
      const detail = r.status === "skipped"
        ? `skipped (${r.reason})`
        : `${r.errors} errors · ${r.warnings} warnings · ${r.info} info`;
      console.log(`  ${icon} ${r.name}: ${detail}`);
      for (const issue of r.issues.slice(0, 8)) {
        const loc = issue.file ? ` ${issue.file}${issue.line ? `:${issue.line}` : ""}` : "";
        console.log(`      - [${issue.check}]${loc} ${issue.msg}`);
      }
      if (r.issues.length > 8) {
        console.log(`      ... and ${r.issues.length - 8} more`);
      }
    }
    if (craftChecks.length > 0) {
      const hasCraftErrors = strictCraft || craftChecks.some((c) => c.severity === "error");
      console.log(`\n  ${hasCraftErrors ? "🔴" : "🟡"} mechanical-craft (${craftChecks.length}):`);
      for (const c of craftChecks) {
        console.log(`      - [${c.check}] ${c.file}:${c.line} ${c.msg}`);
      }
    }
    if (liveAudit) {
      console.log(`\n  🌐 live-audit (ui-diff): ${liveAudit.status} (${liveAudit.errors || 0} errors · ${liveAudit.warnings || 0} warnings)`);
      for (const issue of (liveAudit.issues || []).slice(0, 8)) {
        console.log(`      - [${issue.check}] ${issue.viewport || ""} ${issue.msg}`);
      }
    }
    console.log(`\n📊 Total: ${totalErrors} errors · ${totalWarnings} warnings · ${totalInfo} info\n`);
  }

  process.exit(totalErrors > 0 ? 1 : 0);
}

main();
