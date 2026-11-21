#!/usr/bin/env node
/**
 * legacy-scan.mjs — Zero-dependency scanner for 2015 web patterns replaceable by
 * native baseline CSS/HTML/Web Platform APIs (modern-web-guidance).
 *
 * Self-contained Node ESM script (zero external npm dependencies, zero shared imports).
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const IGNORED_DIRS = new Set(["node_modules", ".git", "dist", "build", "out", "coverage", ".ui-diff"]);
const CODE_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".astro", ".vue", ".svelte"]);
const TOKEN_FILE_RE = /(token|theme|variables)/i;

const isCliEntry =
  Boolean(process.argv[1]) &&
  resolve(process.argv[1]).toLowerCase() === resolve(fileURLToPath(import.meta.url)).toLowerCase();

function printHelp() {
  console.log(`legacy-scan.mjs — Modern Web Guidance legacy pattern scanner

Usage:
  node legacy-scan.mjs --srcDir <dir> [--strict] [--json]

Options:
  --srcDir <dir>   Source directory to scan (default: ./src or cwd)
  --strict         Exit 1 when legacy warnings are found (default: exit 0 warning report)
  --json           Emit structured JSON output
  --help, -h       Show help`);
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

export function scanLegacyPatterns(txt, relFile) {
  const issues = [];
  const lines = txt.split(/\r?\n/);
  const hasModernVh = /\b100[ds]vh\b/.test(txt);
  const hasScrollTimeline = /animation-timeline\s*:/.test(txt);
  const hasContainerQuery = /@container\b|container-type\s*:/.test(txt);
  const isCssLike = /\.(css|astro|vue|svelte)$/.test(relFile);

  let inKeyframes = false;
  let kfDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || /^\s*(?:\/\/|\/\*|\*|<!--)/.test(line)) continue;

    if (/@keyframes\b/.test(line)) {
      inKeyframes = true;
      kfDepth = 0;
    }
    if (inKeyframes) {
      for (const ch of line) {
        if (ch === "{") kfDepth++;
        else if (ch === "}") kfDepth--;
      }
      if (/\b(?:top|left|right|bottom|width|height|margin|padding)\s*:/.test(line)) {
        issues.push({
          severity: "warning",
          check: "non-composited-keyframes",
          file: relFile,
          line: i + 1,
          guideRef: "references/modern-platform-map.md#gpu-composited-keyframes",
          msg: "Keyframes animate layout properties instead of GPU-composited transform/opacity.",
        });
      }
      if (kfDepth <= 0 && line.includes("}")) inKeyframes = false;
    }

    if (!hasScrollTimeline && /addEventListener\s*\(\s*["']scroll["']/.test(line)) {
      issues.push({
        severity: "warning",
        check: "legacy-scroll-listener",
        file: relFile,
        line: i + 1,
        guideRef: "references/modern-platform-map.md#scroll-driven-animations",
        msg: "Scroll event listener may be replaced by CSS animation-timeline: view() / scroll().",
      });
    }

    if (/\bwindow\.pageYOffset\b/.test(line)) {
      issues.push({
        severity: "warning",
        check: "legacy-page-y-offset",
        file: relFile,
        line: i + 1,
        guideRef: "references/modern-platform-map.md#scroll-driven-animations",
        msg: "Deprecated window.pageYOffset — prefer window.scrollY or CSS scroll-driven animations.",
      });
    }

    if (!hasContainerQuery && /\bnew\s+ResizeObserver\b/.test(line)) {
      issues.push({
        severity: "warning",
        check: "legacy-resize-observer-breakpoint",
        file: relFile,
        line: i + 1,
        guideRef: "references/modern-platform-map.md#container-queries-and-subgrid",
        msg: "ResizeObserver for layout sizing can often be replaced by CSS @container queries.",
      });
    }

    if (/document\.execCommand\s*\(/.test(line)) {
      issues.push({
        severity: "warning",
        check: "legacy-exec-command",
        file: relFile,
        line: i + 1,
        guideRef: "references/modern-platform-map.md#clipboard-api",
        msg: "Deprecated document.execCommand() — migrate to navigator.clipboard.writeText().",
      });
    }

    if (!TOKEN_FILE_RE.test(relFile) && !hasModernVh && /(?:\bh-screen\b|\b100vh\b)/.test(line)) {
      issues.push({
        severity: "warning",
        check: "legacy-100vh",
        file: relFile,
        line: i + 1,
        guideRef: "references/modern-platform-map.md#modern-viewport-units",
        msg: "100vh/h-screen clips on mobile browser bars — use 100svh (hero) or 100dvh (app shell).",
      });
    }

    if (isCssLike && /data-popover-portal|manual-modal-backdrop/.test(line)) {
      issues.push({
        severity: "warning",
        check: "legacy-custom-popover",
        file: relFile,
        line: i + 1,
        guideRef: "references/modern-platform-map.md#popover-and-dialog",
        msg: "Prefer native HTML [popover] / <dialog> + CSS Anchor Positioning.",
      });
    }
  }

  return issues;
}

function main() {
  const args = process.argv.slice(2);
  let srcDirArg = null;
  let strict = false;
  let jsonOut = false;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--srcDir") srcDirArg = args[++i];
    else if (a === "--strict") strict = true;
    else if (a === "--json") jsonOut = true;
    else if (a === "--help" || a === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  const srcDir = srcDirArg ? resolve(srcDirArg) : (existsSync(resolve("src")) ? resolve("src") : process.cwd());
  if (!existsSync(srcDir) || !statSync(srcDir).isDirectory()) {
    console.error(`error: --srcDir "${srcDir}" is not an existing directory`);
    process.exit(2);
  }

  const files = walkCodeFiles(srcDir);
  const issues = [];
  for (const f of files) {
    const rel = relative(srcDir, f).split(sep).join("/");
    let txt;
    try { txt = readFileSync(f, "utf8"); } catch { continue; }
    issues.push(...scanLegacyPatterns(txt, rel));
  }

  if (strict) {
    for (const issue of issues) issue.severity = "error";
  }

  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  const result = { ok: errors === 0, errors, warnings, info: 0, issues };

  if (jsonOut) console.log(JSON.stringify(result, null, 2));
  else console.log(`legacy-scan: ${files.length} file(s) scanned — ${errors} errors · ${warnings} warnings`);

  process.exit(errors > 0 ? 1 : 0);
}

if (isCliEntry) main();
