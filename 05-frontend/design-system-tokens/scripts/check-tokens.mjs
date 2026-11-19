#!/usr/bin/env node
/**
 * check-tokens.mjs
 * Detects hardcoded colors (#hex), arbitrary spacing, and magic duration numbers.
 * Usage: node check-tokens.mjs [--srcDir <path>] [--json]
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

const TOKEN_FILE_RE = /(token|theme|variables)/i;
const CSS_CUSTOM_PROPERTY_RE = /--[\w-]+\s*:/;
// Safe hex matcher: #RGB, #RRGGBB, #RRGGBBAA, or 4-digit #RGBA containing at least one a-f letter
// (avoids false positives on decimal PR/ticket references like #1842 or #2026).
const HEX_COLOR_RE = /#(?:(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![0-9a-fA-F])|(?=[0-9a-fA-F]{4}(?![0-9a-fA-F]))[0-9a-fA-F]*[a-fA-F][0-9a-fA-F]*)/g;
// Actual layout spacing properties (excludes width/height/top/left hairlines & icon dimensions)
const ARBITRARY_SPACING_PX_RE = /(?:padding|margin|gap):\s*(\d+)px/g;
const MAGIC_DURATION_RE = /transition[^;]*\b(\d{3,})ms\b/g;

const issues = [];

for (const srcDir of srcDirs) {
  const files = walkFiles(srcDir, (name) => /\.(t|j)sx?$|\.css$/.test(name));
  for (const file of files) {
    const content = readFileUtf8(file);
    const relFile = relative(process.cwd(), file);
    const isTokenFile = TOKEN_FILE_RE.test(relFile);
    const isCssFile = extname(file).toLowerCase() === ".css";
    const lines = content.split(/\r?\n/);
    let inCssCustomProp = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Track multiline CSS custom-property declarations
      let exemptCssCustomProp = false;
      if (isCssFile) {
        const codePart = line.replace(/\/\*[\s\S]*?\*\//g, "");
        const isCommentOnly = trimmed.startsWith("/*") || trimmed.startsWith("*");
        if (inCssCustomProp && !isCommentOnly && /^\s*[a-zA-Z][\w-]*\s*:/.test(codePart)) {
          inCssCustomProp = false;
        }
        const match = !isCommentOnly ? codePart.match(CSS_CUSTOM_PROPERTY_RE) : null;
        const startsCustomProp = Boolean(match);
        exemptCssCustomProp = startsCustomProp || inCssCustomProp;
        if (startsCustomProp) {
          const afterColon = codePart.slice(match.index + match[0].length);
          inCssCustomProp = !/[;}]/.test(afterColon);
        } else if (inCssCustomProp && !isCommentOnly && /[;}]/.test(codePart)) {
          inCssCustomProp = false;
        }
      }

      // Skip comments
      if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) continue;

      // Hex colors (skip token files and CSS custom-property declarations)
      if (!isTokenFile && !exemptCssCustomProp) {
        for (const m of line.matchAll(HEX_COLOR_RE)) {
          issues.push({
            severity: "warning",
            check: "hardcoded-hex",
            msg: `Hardcoded hex color "${m[0]}" — use var(--surface-* / --text-* / --accent-* / --color-*) token or Tailwind class instead.`,
            file: relFile,
            line: i + 1,
          });
        }
      }

      // Arbitrary px in spacing (not multiples of 4)
      for (const m of line.matchAll(ARBITRARY_SPACING_PX_RE)) {
        const val = parseInt(m[1], 10);
        if (val % 4 !== 0 && val > 0) {
          issues.push({
            severity: "warning",
            check: "non-8pt-spacing",
            msg: `Spacing ${val}px is not a multiple of 4 (8pt system). Use token or Tailwind spacing class.`,
            file: relFile,
            line: i + 1,
          });
        }
      }

      // Magic duration numbers (not in token files or CSS custom-property definitions)
      if (!isTokenFile && !exemptCssCustomProp) {
        for (const m of line.matchAll(MAGIC_DURATION_RE)) {
          const val = parseInt(m[1], 10);
          if (![75, 150, 250, 400, 600, 1000].includes(val) && !/--duration/.test(line)) {
            issues.push({
              severity: "info",
              check: "magic-duration",
              msg: `Duration ${val}ms is not a token value (75/150/250/400/600/1000). Use --duration-* token.`,
              file: relFile,
              line: i + 1,
            });
          }
        }
      }
    }
  }
}

const result = buildResult(issues);
printResult(result, "Design Tokens Checker");
exitFromResultGuarded(result);
