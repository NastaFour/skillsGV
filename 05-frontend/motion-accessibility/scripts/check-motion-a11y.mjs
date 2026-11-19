#!/usr/bin/env node
/**
 * check-motion-a11y.mjs
 * Detects animations without prefers-reduced-motion, transition: all, and layout property animations.
 * Recognizes project-wide `@media (prefers-reduced-motion: reduce)` in CSS for CSS transitions,
 * while still enforcing JS reduced-motion hooks on Framer Motion / GSAP / Reanimated files.
 * Usage: node check-motion-a11y.mjs [--srcDir <path>] [--json]
 */
import { existsSync } from "node:fs";
import { resolve, join, relative, extname } from "node:path";
import { walkFiles, readFileUtf8, buildResult, printResult, exitFromResultGuarded, findProjectRoot } from "../../../_shared/script-utils.mjs";

const args = process.argv.slice(2);
let srcDirs = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--srcDir" && args[i + 1]) srcDirs.push(resolve(args[++i]));
}
if (srcDirs.length === 0) {
  const root = findProjectRoot(process.cwd());
  const candidates = [
    root ? join(root, "apps", "web", "src") : null,
    resolve(process.cwd(), "src"),
  ].filter((p) => p && existsSync(p));
  srcDirs = candidates.length > 0 ? [candidates[0]] : [resolve(process.cwd(), "src")];
}

const GLOBAL_REDUCED_MOTION_CSS_RE = /@media\s*\([^)]*prefers-reduced-motion\s*:\s*reduce[^)]*\)/i;
const CSS_MOTION_RE = /transition\s*:|animation\s*:|@keyframes/i;
const JS_MOTION_RE = /framer-motion|motion\/react|\bgsap\b|reanimated/i;
const FILE_REDUCED_MOTION_RE = /prefers-reduced-motion|useReducedMotion|MotionConfig|motion-reduce|motion-safe|gsap\.matchMedia/i;

const issues = [];

for (const srcDir of srcDirs) {
  const files = walkFiles(srcDir, (name) => /\.(t|j)sx?$|\.css$/.test(name));

  // Detect project-wide CSS prefers-reduced-motion rule (strip comments first)
  let hasGlobalReducedMotionCss = false;
  let hasGlobalReducedMotionConfig = false;
  for (const file of files) {
    const content = readFileUtf8(file);
    const noComments = content.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
    if (extname(file).toLowerCase() === ".css" && GLOBAL_REDUCED_MOTION_CSS_RE.test(noComments)) {
      hasGlobalReducedMotionCss = true;
    }
    if (/\.(t|j)sx?$/.test(file) && /<MotionConfig\b[^>]*reducedMotion\s*=\s*["']user["']/.test(noComments)) {
      hasGlobalReducedMotionConfig = true;
    }
  }

  for (const file of files) {
    const content = readFileUtf8(file);
    const relFile = relative(process.cwd(), file);
    const lines = content.split(/\r?\n/);

    const hasJsMotion = JS_MOTION_RE.test(content);
    const hasCssMotion = CSS_MOTION_RE.test(content);
    const hasFileGuard = FILE_REDUCED_MOTION_RE.test(content);

    if (hasJsMotion && !hasFileGuard && !hasGlobalReducedMotionConfig) {
      issues.push({
        severity: "warning",
        check: "no-reduced-motion",
        msg: `File uses JS motion library without useReducedMotion() or <MotionConfig reducedMotion="user">. WCAG 2.1 SC 2.3.3.`,
        file: relFile,
      });
    } else if (hasCssMotion && !hasJsMotion && !hasGlobalReducedMotionCss && !hasFileGuard) {
      issues.push({
        severity: "warning",
        check: "no-reduced-motion",
        msg: `File has CSS animations without prefers-reduced-motion fallback. Add @media (prefers-reduced-motion: reduce) or useReducedMotion() hook. WCAG 2.1 SC 2.3.3.`,
        file: relFile,
      });
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // transition: all
      if (/transition\s*:\s*all/i.test(line) || /transition-all/i.test(line)) {
        issues.push({
          severity: "warning",
          check: "transition-all",
          msg: `transition: all animates every property (performance killer). Specify: transition: transform, opacity.`,
          file: relFile,
          line: i + 1,
        });
      }

      // Animating layout properties
      if (/transition[^;]*\b(width|height|top|left|margin|padding)\b/i.test(line)) {
        issues.push({
          severity: "warning",
          check: "animate-layout-prop",
          msg: `Animating layout property forces reflow (janky). Use transform: scale/translate instead.`,
          file: relFile,
          line: i + 1,
        });
      }

      // Animations > 500ms
      if (/(?:animation|transition)[^;]*\b(\d{3,})ms\b/i.test(line)) {
        const match = line.match(/(?:animation|transition)[^;]*\b(\d{3,})ms\b/i);
        if (match && parseInt(match[1], 10) > 500) {
          issues.push({
            severity: "info",
            check: "long-duration",
            msg: `Animation duration ${match[1]}ms is > 500ms. Keep UI animations under 400ms (feels slow).`,
            file: relFile,
            line: i + 1,
          });
        }
      }
    }
  }
}

const result = buildResult(issues);
printResult(result, "Motion Accessibility Checker");
exitFromResultGuarded(result);
