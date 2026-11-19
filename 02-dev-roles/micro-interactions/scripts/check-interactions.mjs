#!/usr/bin/env node
/**
 * check-interactions.mjs
 * Detects interactive elements without hover/focus/active states, and `transition: all`.
 * Usage: node check-interactions.mjs [--srcDir <path>] [--json]
 */
import { existsSync } from "node:fs";
import { resolve, join, relative } from "node:path";
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

const MAX_TAG_LINES = 30;

/**
 * Extracts the complete JSX opening tag from `<button` or `<a ` through its closing `>`.
 * Respects nested `{...}` expressions and quotes so `=>` arrows or `a > b` never truncate early.
 */
function extractOpeningTag(lines, startIndex) {
  const collected = [];
  let quote = null;
  let escaped = false;
  let braceDepth = 0;

  for (let idx = startIndex; idx < lines.length && collected.length < MAX_TAG_LINES; idx++) {
    const line = lines[idx];
    let sliceEnd = line.length;
    let closed = false;

    for (let j = idx === startIndex ? line.search(/<(?:button|a)\b/i) : 0; j < line.length; j++) {
      if (j < 0) break;
      const ch = line[j];
      if (escaped) {
        escaped = false;
      } else if (quote) {
        if (ch === "\\") escaped = true;
        else if (ch === quote) quote = null;
      } else if (ch === '"' || ch === "'" || ch === "`") {
        quote = ch;
      } else if (ch === "{") {
        braceDepth++;
      } else if (ch === "}") {
        braceDepth = Math.max(0, braceDepth - 1);
      } else if (ch === ">" && braceDepth === 0 && line[j - 1] !== "=") {
        sliceEnd = j + 1;
        closed = true;
        break;
      }
    }

    collected.push(line.slice(0, sliceEnd));
    if (closed) break;
  }

  return collected.join(" ");
}

const issues = [];

for (const srcDir of srcDirs) {
  const files = walkFiles(srcDir, (name) => /\.(t|j)sx?$/.test(name));
  for (const file of files) {
    const content = readFileUtf8(file);
    const relFile = relative(process.cwd(), file);
    const lines = content.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detect `transition: all` (performance killer)
      if (/transition\s*:\s*all/i.test(line) || /transition-all/i.test(line)) {
        issues.push({
          severity: "warning",
          check: "transition-all",
          msg: `transition: all animates every property (expensive). Specify exact properties: transition: transform, opacity. See micro-interactions skill.`,
          file: relFile,
          line: i + 1,
        });
      }

      // Detect <button> or <a> without hover/focus/active feedback across full multiline opening tag
      if (/<(?:button|a)(?=[\s>])/i.test(line)) {
        const openingTag = extractOpeningTag(lines, i);
        if (!/hover:|focus-visible:|focus:|active:|:hover|:focus|:active|\b(?:onPress|onClick|hover|focus|active)\b/i.test(openingTag)) {
          issues.push({
            severity: "info",
            check: "dead-interactive",
            msg: `Interactive element (<button>/<a>) without hover/focus/active state. Add hover:-translate-y, focus-visible:ring, active:scale for tactile feedback.`,
            file: relFile,
            line: i + 1,
          });
        }
      }

      // Detect animating layout properties (width, height, top, left, margin, padding)
      if (/transition[^;]*\b(width|height|top|left|margin|padding)\b/i.test(line)) {
        issues.push({
          severity: "warning",
          check: "animate-layout-prop",
          msg: `Animating layout property (width/height/top/left/margin) forces browser reflow (janky). Use transform: scale/translate instead.`,
          file: relFile,
          line: i + 1,
        });
      }
    }
  }
}

const result = buildResult(issues);
printResult(result, "Micro-Interactions Checker");
exitFromResultGuarded(result);
