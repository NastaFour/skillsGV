#!/usr/bin/env node
/**
 * token-audit.mjs — design token audit gate (design-driven D6).
 *
 * Scans a project source directory for anti-slop token violations:
 *   1. hardcoded-hex        literal #RGB/#RRGGBB/#RRGGBBAA colors in source files
 *   2. raw-tailwind-color   raw Tailwind palette literals (bg-white, bg-black,
 *                           text-white, text-black, and the non-semantic
 *                           bg-gray-N / text-gray-N / bg-slate-N / text-slate-N
 *                           families) used in class contexts
 *
 * Allowlist:
 *   - Files whose path matches /token|theme|variables/i are token definitions.
 *   - In .css files, hex values on CSS custom-property lines (`--name: ...`)
 *     are token definitions and are exempt.
 *   - A `data-token-audit-ignore` attribute on an element line — or anywhere
 *     in the opening-tag region of a multiline `class={` / `className="`
 *     opening — suppresses Tailwind literal findings for that element.
 *   - Hex inside comments is deliberately NOT exempt: slop hides in comments.
 *
 * Usage:
 *   node 05-frontend/design-driven/scripts/token-audit.mjs --srcDir <project-dir> [--json]
 *
 * Exit codes: 0 = clean, 1 = findings, 2 = usage error.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";

const SOURCE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".vue",
  ".svelte",
  ".html",
  ".astro",
  ".css",
]);

const TOKEN_FILE_RE = /(token|theme|variables)/i;

// #RGB / #RRGGBB / #RRGGBBAA, never a prefix of a longer hex run.
// The 4-digit #RGBA form must contain at least one hex letter so decimal
// issue/ticket references like `#1234` are not reported as colors.
const HEX_COLOR_RE = /#(?:(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![0-9a-fA-F])|(?=[0-9a-fA-F]{4}(?![0-9a-fA-F]))[0-9a-fA-F]*[a-fA-F][0-9a-fA-F]*)/;

const CLASS_CONTEXT_RE = /\bclass(?:Name)?\s*=/;
const TAILWIND_ALWAYS_RE = /(?<![\w-])(?:bg|text|border|ring|divide|fill|stroke)-(?:white|black)(?![\w-])/;
const TAILWIND_NONSEMANTIC_RE = /(?<![\w-])(?:bg|text|border|ring|divide|fill|stroke)-(?:gray|slate|zinc|neutral|stone)-[\w/]+/;

const IGNORE_ATTRIBUTE = "data-token-audit-ignore";
const CSS_CUSTOM_PROPERTY_RE = /--[\w-]+\s*:/;

// A class attribute whose value opens on this line and may continue below:
// `class="flex items-center` / `className={` / className={`...`} / className={clsx( —
// any quote, brace, backtick, or helper-call opener starts the tag region.
const MULTILINE_CLASS_OPEN_RE = /class(?:Name)?\s*=\s*(?:["'`{]|(?:clsx|cn|cva)\s*\()/;
// Hard cap for the opening-tag region scan: malformed input must never read
// the whole file.
const MULTILINE_WINDOW_MAX_LINES = 30;

const RULE_HEX = "hardcoded-hex";
const RULE_TAILWIND = "raw-tailwind-color";

function collectSourceFiles(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      collectSourceFiles(join(dir, entry.name), out);
    } else if (entry.isFile() && SOURCE_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
      out.push(join(dir, entry.name));
    }
  }
  return out;
}

/**
 * Region of a multiline opening tag: from the `class=` opener line through
 * the line holding the `>` that closes the tag. A `>` inside quotes or inside
 * a `{...}` expression (`=>`, `a > b`) does not close it, and scanning stops
 * at that closing `>`, so child content is excluded. Hard-capped so malformed
 * input cannot scan the whole file.
 */
/**
 * Extracts ONLY the class/className attribute value region, line by line.
 * Literals are judged inside this region alone, so other attributes
 * (title=, aria-label=, alt=) and child text after the closing `>` can never
 * produce findings. Handles ", ', `{`, and helper-call openers; nested
 * braces/parens are tracked so `className={clsx("bg-white")}` works.
 */
function classValueSegments(lines, openerIndex) {
  const opener = lines[openerIndex];
  const m = opener.match(/\bclass(?:Name)?\s*=\s*/);
  if (!m) return [];
  let pos = m.index + m[0].length;
  const rest = opener.slice(pos);
  const qi = rest.search(/["'`{(]/);
  if (qi < 0) return [];
  const open = rest[qi];
  pos += qi + 1;
  const closeCh = open === "{" ? "}" : open === "(" ? ")" : open;
  const nested = open === "{" || open === "(";
  let depth = nested ? 1 : 0;
  const segments = [];
  let cur = opener.slice(pos);
  for (
    let idx = openerIndex;
    idx < lines.length && idx < openerIndex + MULTILINE_WINDOW_MAX_LINES;
    idx++
  ) {
    let out = "";
    let done = false;
    for (let j = 0; j < cur.length; j++) {
      const ch = cur[j];
      if (nested && (ch === "{" || ch === "(")) {
        depth++;
      } else if (nested && (ch === "}" || ch === ")")) {
        depth--;
        if (depth === 0) {
          done = true;
          break;
        }
      } else if (!nested && ch === closeCh) {
        done = true;
        break;
      }
      out += ch;
    }
    if (out.trim()) segments.push({ lineIndex: idx, text: out });
    if (done) break;
    cur = lines[idx + 1] ?? "";
  }
  return segments;
}

function multilineTagWindow(lines, openerIndex) {  const window = [];
  let quote = null;
  let depth = 0;
  let escaped = false;
  for (let i = openerIndex; i < lines.length && window.length < MULTILINE_WINDOW_MAX_LINES; i++) {
    let text = lines[i];
    let closed = false;
    for (let j = 0; j < text.length; j++) {
      const ch = text[j];
      if (escaped) escaped = false;
      else if (quote) {
        if (ch === "\\") escaped = true;
        else if (ch === quote) quote = null;
      } else if (ch === '"' || ch === "'" || ch === "`") quote = ch;
      else if (ch === "{") depth++;
      else if (ch === "}") depth = Math.max(0, depth - 1);
      else if (ch === ">" && depth === 0 && text[j - 1] !== "=") {
        text = text.slice(0, j);
        closed = true;
        break;
      }
    }
    if (i > openerIndex) window.push(text);
    if (closed) break;
  }
  return window;
}

function scanFile(absPath, srcDir, findings) {
  const file = relative(srcDir, absPath).split(sep).join("/");
  const isTokenFile = TOKEN_FILE_RE.test(file);
  const isCssFile = extname(absPath).toLowerCase() === ".css";

  let content;
  try {
    content = readFileSync(absPath, "utf8");
  } catch {
    return;
  }

  const lines = content.split(/\r?\n/);
  const reportedTailwindLines = new Set();
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;
    const snippet = line.trim();

    const exemptCssTokenLine = isCssFile && CSS_CUSTOM_PROPERTY_RE.test(line);
    if (!isTokenFile && !exemptCssTokenLine && HEX_COLOR_RE.test(line)) {
      findings.push({ file, line: lineNumber, rule: RULE_HEX, snippet });
    }

    if (
      CLASS_CONTEXT_RE.test(line) &&
      !line.includes(IGNORE_ATTRIBUTE) &&
      !reportedTailwindLines.has(lineNumber)
    ) {
      const window = MULTILINE_CLASS_OPEN_RE.test(line) ? multilineTagWindow(lines, i) : [];
      const ignored = window.some((entry) => entry.includes(IGNORE_ATTRIBUTE));
      if (!ignored) {
        for (const seg of classValueSegments(lines, i)) {
          const segLineNumber = seg.lineIndex + 1;
          if (
            !reportedTailwindLines.has(segLineNumber) &&
            (TAILWIND_ALWAYS_RE.test(seg.text) || TAILWIND_NONSEMANTIC_RE.test(seg.text))
          ) {
            reportedTailwindLines.add(segLineNumber);
            findings.push({
              file,
              line: segLineNumber,
              rule: RULE_TAILWIND,
              snippet: seg.text.trim(),
            });
          }
        }
      }
    }
  }
}

function printHumanReport(findings, srcDir) {
  if (findings.length === 0) {
    console.log(`token-audit: clean — no hardcoded design tokens found in ${srcDir}`);
    return;
  }

  console.log(`\ntoken-audit — ${findings.length} finding(s) in ${srcDir}\n`);
  for (const rule of [RULE_HEX, RULE_TAILWIND]) {
    const ruleFindings = findings.filter((f) => f.rule === rule);
    if (ruleFindings.length === 0) continue;
    console.log(`${rule} (${ruleFindings.length}):`);
    for (const finding of ruleFindings) {
      console.log(`  - ${finding.file}:${finding.line}  ${finding.snippet}`);
    }
    console.log("");
  }

  const fileCount = new Set(findings.map((f) => f.file)).size;
  console.log(`Summary: ${findings.length} finding(s) in ${fileCount} file(s)`);
}

function printHelp() {
  console.log(`token-audit — design token audit gate (design-driven D6)

Usage:
  node 05-frontend/design-driven/scripts/token-audit.mjs --srcDir <project-dir> [--json]

Options:
  --srcDir <project-dir>   Project directory to scan recursively
  --json                   Output machine-readable JSON { findings, total }
  --help, -h               Show this help message

Detected rules:
  hardcoded-hex         Literal #RGB/#RRGGBB/#RRGGBBAA colors in source files
  raw-tailwind-color    bg-white/bg-black/text-white/text-black and
                        bg-gray-*/text-gray-*/bg-slate-*/text-slate-* literals
                        (single-line and multiline class attributes)

Allowlist:
  - Files whose path matches token|theme|variables are token definitions.
  - In .css files, hex on a CSS custom-property line (--name: ...) is exempt.
  - data-token-audit-ignore on an element line (or anywhere in a multiline
    opening-tag region) suppresses Tailwind findings.

Exit codes: 0 = clean, 1 = findings, 2 = usage error.`);
}

function usageError(message) {
  console.error(`error: ${message}`);
  console.error(
    "usage: node 05-frontend/design-driven/scripts/token-audit.mjs --srcDir <project-dir> [--json]"
  );
  process.exit(2);
}

function main() {
  const args = process.argv.slice(2);
  let srcDirArg = null;
  let jsonOut = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--srcDir") {
      const value = args[++i];
      if (!value || value.startsWith("--")) usageError("--srcDir requires a directory path");
      srcDirArg = value;
    } else if (arg === "--json") {
      jsonOut = true;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      usageError(`unknown argument: ${arg}`);
    }
  }

  if (!srcDirArg) usageError("--srcDir <project-dir> is required");

  const srcDir = resolve(srcDirArg);
  if (!existsSync(srcDir) || !statSync(srcDir).isDirectory()) {
    usageError(`--srcDir "${srcDirArg}" is not an existing directory`);
  }

  const findings = [];
  for (const file of collectSourceFiles(srcDir).sort()) {
    scanFile(file, srcDir, findings);
  }
  findings.sort(
    (a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.rule.localeCompare(b.rule)
  );

  if (jsonOut) {
    console.log(JSON.stringify({ findings, total: findings.length }, null, 2));
  } else {
    printHumanReport(findings, srcDir);
  }

  process.exit(findings.length > 0 ? 1 : 0);
}

main();
