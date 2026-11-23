#!/usr/bin/env node
/**
 * check-mobile-antipatterns.mjs — Standalone React Native & Expo anti-pattern gate.
 *
 * Self-contained Node ESM script (zero shared module imports, zero external dependencies):
 * runs identically from source catalog (05-frontend/expo-production-auditor/scripts/)
 * and flat installed projects (.agents/skills/expo-production-auditor/scripts/).
 *
 * Usage:
 *   node check-mobile-antipatterns.mjs [--srcDir <dir>] [--webDir <dir>] [--strict] [--json]
 *
 * Exit codes: 0 = pass, 1 = errors found, 2 = invalid arguments.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const IGNORED_DIRS = new Set(["node_modules", ".git", "dist", "build", "out", "coverage", ".expo", "ios", "android"]);
const CODE_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);

const isCliEntry =
  Boolean(process.argv[1]) &&
  resolve(process.argv[1]).toLowerCase() === resolve(fileURLToPath(import.meta.url)).toLowerCase();

function printHelp() {
  console.log(`check-mobile-antipatterns.mjs — React Native & Expo production anti-pattern scanner

Usage:
  node check-mobile-antipatterns.mjs [--srcDir <dir>] [--webDir <dir>] [--strict] [--json]

Options:
  --srcDir <dir>   Source directory to scan (default: <webDir>/src, <webDir>/app, or cwd)
  --webDir <dir>   Project root containing package.json (default: parent of srcDir or cwd)
  --strict         Treat warnings (e.g. nested-virtualized-list) as errors
  --json           Emit structured JSON report
  --help, -h       Show help

Exit codes: 0 = clean, 1 = errors found, 2 = usage error.`);
}

function usageError(msg) {
  console.error(`error: ${msg}`);
  process.exit(2);
}

function walkMobileFiles(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name) || entry.name.startsWith(".")) continue;
      walkMobileFiles(join(dir, entry.name), out);
    } else if (entry.isFile() && CODE_EXTS.has(extname(entry.name).toLowerCase())) {
      if (/\.(test|spec)\.[cm]?[jt]sx?$/i.test(entry.name)) continue;
      out.push(join(dir, entry.name));
    }
  }
  return out;
}

function detectReanimated4OrWorklets(webDir) {
  const pkgPath = join(webDir, "package.json");
  if (!existsSync(pkgPath)) return true;
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    const deps = { ...(pkg?.dependencies || {}), ...(pkg?.devDependencies || {}) };
    if (deps["react-native-worklets"]) return true;
    const reanimatedVer = deps["react-native-reanimated"];
    if (!reanimatedVer) return true;
    return /^(?:\^|~|>=)?\s*(?:[4-9]|\d{2,})\b/.test(String(reanimatedVer).trim());
  } catch {
    return true;
  }
}

function extractScrollViewAttrs(lines, startIdx) {
  let buf = "";
  for (let i = startIdx; i < Math.min(startIdx + 12, lines.length); i++) {
    buf += lines[i] + "\n";
    if (/>/.test(lines[i])) break;
  }
  return buf;
}

export function scanMobileAntipatterns(content, relFile, opts = {}) {
  const issues = [];
  const lines = String(content ?? "").split(/\r?\n/);
  const hasReanimated4 = opts.hasReanimated4OrWorklets !== false;
  const scrollStack = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || /^\s*(?:\/\/|\/\*|\*)/.test(line)) continue;
    const lineNo = i + 1;

    // 1. Removed Reanimated 4 runOnJS
    if (/\brunOnJS\s*\(/.test(line) && !/\bfunction\s+runOnJS\b/.test(line)) {
      issues.push({
        severity: hasReanimated4 ? "error" : "warning",
        check: "removed-rn-run-on-js",
        file: relFile,
        line: lineNo,
        msg: "runOnJS() is removed in Reanimated 4 — replace with scheduleOnRN(fn, ...args) from 'react-native-worklets'.",
      });
    }

    // 2. Deprecated expo-av import
    if (/(?:from\s+["']expo-av["']|\brequire\s*\(\s*["']expo-av["']\s*\))/.test(line)) {
      issues.push({
        severity: "error",
        check: "deprecated-expo-av",
        file: relFile,
        line: lineNo,
        msg: "'expo-av' is deprecated — migrate to 'expo-audio' or 'expo-video'.",
      });
    }

    // 3. Dynamic require() breaking Metro static asset bundling
    if (/\brequire\s*\(\s*(?:`[^`]*\$\{[^}]+\}|[^)]*\+)/.test(line)) {
      issues.push({
        severity: "error",
        check: "dynamic-require-asset",
        file: relFile,
        line: lineNo,
        msg: "Dynamic require() path breaks Metro production asset bundling — use static require('...') or an explicit asset map.",
      });
    }

    // 4. Nested FlatList/FlashList inside non-horizontal ScrollView
    if (/<ScrollView\b/.test(line)) {
      const tagText = extractScrollViewAttrs(lines, i);
      const isSelfClosing = /\/>/.test(tagText);
      const isHorizontal = /\bhorizontal(?:\s*=\s*\{?\s*true\s*\}?|\b(?!\s*=))/.test(tagText);
      if (!isSelfClosing) {
        scrollStack.push({ isHorizontal });
      }
    }
    if (scrollStack.some((s) => !s.isHorizontal) && /<(?:FlatList|FlashList)\b/.test(line)) {
      issues.push({
        severity: "warning",
        check: "nested-virtualized-list",
        file: relFile,
        line: lineNo,
        msg: "Virtualized FlatList/FlashList nested inside vertical ScrollView degrades windowing and freezes scrolling — use ListHeaderComponent or FlashList.",
      });
    }
    if (/<\/ScrollView\s*>/.test(line) && scrollStack.length > 0) {
      scrollStack.pop();
    }
  }

  return issues;
}

function main() {
  const args = process.argv.slice(2);
  let srcDirArg = null;
  let webDirArg = null;
  let strict = false;
  let jsonOut = false;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--srcDir") { srcDirArg = args[++i]; if (!srcDirArg) usageError("--srcDir requires a path"); }
    else if (a === "--webDir") { webDirArg = args[++i]; if (!webDirArg) usageError("--webDir requires a path"); }
    else if (a === "--strict") strict = true;
    else if (a === "--json") jsonOut = true;
    else if (a === "--help" || a === "-h") { printHelp(); process.exit(0); }
    else usageError(`unknown argument: ${a}`);
  }

  const webDir = resolve(webDirArg || (srcDirArg ? dirname(resolve(srcDirArg)) : process.cwd()));
  let srcDir = srcDirArg ? resolve(srcDirArg) : null;
  if (!srcDir) {
    if (existsSync(join(webDir, "src"))) srcDir = join(webDir, "src");
    else if (existsSync(join(webDir, "app"))) srcDir = join(webDir, "app");
    else srcDir = webDir;
  }
  if (!existsSync(srcDir) || !statSync(srcDir).isDirectory()) {
    usageError(`--srcDir "${srcDir}" is not an existing directory`);
  }

  const hasReanimated4OrWorklets = detectReanimated4OrWorklets(webDir);
  const files = walkMobileFiles(srcDir);
  const issues = [];
  for (const f of files) {
    const rel = relative(srcDir, f).split(sep).join("/");
    let content;
    try { content = readFileSync(f, "utf8"); } catch { continue; }
    issues.push(...scanMobileAntipatterns(content, rel, { hasReanimated4OrWorklets }));
  }

  if (strict) {
    for (const iss of issues) iss.severity = "error";
  }

  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  const info = issues.filter((i) => i.severity === "info").length;
  const result = { ok: errors === 0, errors, warnings, info, issues };

  if (jsonOut) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`check-mobile-antipatterns: ${files.length} file(s) scanned — ${errors} errors · ${warnings} warnings`);
    for (const iss of issues) {
      console.log(`  [${iss.severity.toUpperCase()}] (${iss.check}) ${iss.file}:${iss.line}: ${iss.msg}`);
    }
  }

  process.exit(errors > 0 ? 1 : 0);
}

if (isCliEntry) main();
