#!/usr/bin/env node
/**
 * validate-build-config.mjs
 *
 * Checks that build config files exist and are correct (supports Tailwind CSS v4
 * CSS-first setups, legacy Tailwind v3, Vite & non-Vite stacks, and standalone
 * or monorepo TypeScript strictness).
 *
 * Usage:
 *   node validate-build-config.mjs [--webDir <path>] [--fix] [--json]
 *
 * Exit codes: 0 = pass, 1 = errors found
 */

import { existsSync, writeFileSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { buildResult, printResult, exitFromResultGuarded, findProjectRoot, walkFiles } from "../../../_shared/script-utils.mjs";

// Parse args
const args = process.argv.slice(2);
let webDir = null;
let fix = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--webDir" && args[i + 1]) { webDir = resolve(args[++i]); }
  else if (args[i] === "--fix") { fix = true; }
}

if (!webDir) {
  const cwdRoot = findProjectRoot(process.cwd());
  const monorepoWeb = cwdRoot ? join(cwdRoot, "apps", "web") : null;
  webDir = monorepoWeb && existsSync(monorepoWeb) ? monorepoWeb : process.cwd();
}

const root = findProjectRoot(webDir);
const issues = [];

// Read package.json if present for stack detection
let pkg = null;
const pkgPath = join(webDir, "package.json");
if (existsSync(pkgPath)) {
  try { pkg = JSON.parse(readFileSync(pkgPath, "utf8")); } catch {}
}
const allDeps = { ...(pkg?.dependencies || {}), ...(pkg?.devDependencies || {}) };

const postcssVariants = ["postcss.config.js", "postcss.config.cjs", "postcss.config.mjs"];
const postcssFile = postcssVariants.map((v) => join(webDir, v)).find((p) => existsSync(p)) || null;
const postcssContent = postcssFile ? readFileSync(postcssFile, "utf8") : "";

const tailwindVariants = ["tailwind.config.js", "tailwind.config.cjs", "tailwind.config.ts", "tailwind.config.mjs"];
const tailwindFile = tailwindVariants.map((v) => join(webDir, v)).find((p) => existsSync(p)) || null;

const viteVariants = ["vite.config.ts", "vite.config.js", "vite.config.mts", "vite.config.mjs"];
const viteFile = viteVariants.map((v) => join(webDir, v)).find((p) => existsSync(p)) || null;
const viteContent = viteFile ? readFileSync(viteFile, "utf8") : "";

// Detect Tailwind v4 CSS-first setup
let cssUsesTw4Import = false;
const srcPath = join(webDir, "src");
if (existsSync(srcPath)) {
  for (const cssFile of walkFiles(srcPath, (n) => n.endsWith(".css"))) {
    try {
      const c = readFileSync(cssFile, "utf8");
      if (/@import\s+["']tailwindcss["']/.test(c)) { cssUsesTw4Import = true; break; }
    } catch {}
  }
}

const twDep = String(allDeps.tailwindcss || "");
const isTailwindV4 = Boolean(
  allDeps["@tailwindcss/vite"] ||
  allDeps["@tailwindcss/postcss"] ||
  /^[\^~>=]*4(?:\.|$)/.test(twDep) ||
  viteContent.includes("@tailwindcss/vite") ||
  postcssContent.includes("@tailwindcss/postcss") ||
  cssUsesTw4Import
);
const usesTailwind = isTailwindV4 || Boolean(allDeps.tailwindcss) || Boolean(tailwindFile) || !pkg;
const usesVite = Boolean(allDeps.vite) || Boolean(viteFile) || (!pkg && !existsSync(join(webDir, "next.config.js")) && !existsSync(join(webDir, "next.config.mjs")) && !existsSync(join(webDir, "next.config.ts")));

// --- Checks 1 & 2: Tailwind CSS (v4 vs legacy v3) ---
if (isTailwindV4) {
  const hasViteTw4 = viteContent.includes("@tailwindcss/vite");
  const hasPostcssTw4 = postcssContent.includes("@tailwindcss/postcss");
  if (!hasViteTw4 && !hasPostcssTw4) {
    issues.push({
      severity: "error",
      check: "tailwind-v4-plugin-missing",
      msg: `Tailwind CSS v4 detected in ${webDir}, but neither @tailwindcss/vite (in vite.config.*) nor @tailwindcss/postcss (in postcss.config.*) is configured.`,
      file: webDir,
    });
  }
} else if (usesTailwind) {
  // Legacy Tailwind v3 checks
  if (!postcssFile) {
    issues.push({
      severity: "error",
      check: "postcss-missing",
      msg: `postcss.config.js not found in ${webDir}. Tailwind @tailwind directives will NOT be processed → CSS appears as plain text. Fix: create postcss.config.js with { plugins: { tailwindcss: {}, autoprefixer: {} } }${fix ? " (--fix will create it)" : ""}`,
      file: webDir,
    });
    if (fix) {
      const template = `export default {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n};\n`;
      writeFileSync(join(webDir, "postcss.config.js"), template, "utf8");
      issues.push({ severity: "info", check: "postcss-fixed", msg: "Created postcss.config.js with tailwindcss + autoprefixer plugins", file: join(webDir, "postcss.config.js") });
    }
  } else {
    if (!postcssContent.includes("tailwindcss")) {
      issues.push({ severity: "error", check: "postcss-no-tailwind", msg: `postcss config at ${postcssFile} does not include 'tailwindcss' plugin. @tailwind directives won't process.`, file: postcssFile });
    }
    if (!postcssContent.includes("autoprefixer")) {
      issues.push({ severity: "warning", check: "postcss-no-autoprefixer", msg: `postcss config at ${postcssFile} does not include 'autoprefixer'. Some vendor prefixes may be missing.`, file: postcssFile });
    }
  }

  if (!tailwindFile) {
    issues.push({
      severity: "error",
      check: "tailwind-missing",
      msg: `tailwind.config.{js,cjs,ts} not found in ${webDir}. Utility classes like bg-primary won't resolve. Fix: create tailwind.config.js with theme.extend.colors containing palettes with DEFAULT shades.`,
      file: webDir,
    });
  } else {
    const content = readFileSync(tailwindFile, "utf8");
    if (content.includes("primary") && !content.match(/primary:\s*\{[\s\S]*?DEFAULT/s)) {
      issues.push({
        severity: "error",
        check: "tailwind-no-default",
        msg: `tailwind config at ${tailwindFile} has 'primary' palette but no 'DEFAULT' shade. bg-primary / text-primary won't apply color. Fix: add DEFAULT: "#0ea5e9" to the primary object.`,
        file: tailwindFile,
      });
    }
    if (content.includes("border") && !content.match(/border\s*:/) && !content.includes("borderColor")) {
      issues.push({
        severity: "warning",
        check: "tailwind-no-border-var",
        msg: `tailwind config may be missing 'border' color variable. If using border-primary or similar, ensure border color is defined.`,
        file: tailwindFile,
      });
    }
  }
}

// --- Check 3: vite.config exists (only when project uses Vite) ---
if (usesVite) {
  if (!viteFile) {
    issues.push({
      severity: "error",
      check: "vite-missing",
      msg: `vite.config.{ts,js} not found in ${webDir}. Vite won't start without it.`,
      file: webDir,
    });
  } else if (allDeps.react && !viteContent.includes("@vitejs/plugin-react") && !viteContent.includes("plugin-react")) {
    issues.push({ severity: "warning", check: "vite-no-react-plugin", msg: `vite config at ${viteFile} may be missing @vitejs/plugin-react. React Fast Refresh won't work.`, file: viteFile });
  }
}

// --- Check 4: TypeScript strict mode (monorepo tsconfig.base.json OR standalone tsconfig.json / tsconfig.app.json) ---
function hasStrictTrue(filePath) {
  try {
    const content = readFileSync(filePath, "utf8");
    return /"strict"\s*:\s*true/.test(content);
  } catch {
    return false;
  }
}

const tsconfigBase = root ? join(root, "tsconfig.base.json") : null;
const localTsconfig = join(webDir, "tsconfig.json");
const localAppTsconfig = join(webDir, "tsconfig.app.json");

if (tsconfigBase && existsSync(tsconfigBase)) {
  if (!hasStrictTrue(tsconfigBase)) {
    issues.push({ severity: "warning", check: "tsconfig-not-strict", msg: `tsconfig.base.json at ${tsconfigBase} does not have "strict": true. AGENTS.md rule violation.`, file: tsconfigBase });
  }
} else if (existsSync(localTsconfig)) {
  const localContent = readFileSync(localTsconfig, "utf8");
  const isStrictHere = hasStrictTrue(localTsconfig);
  const referencesApp = /"references"\s*:/.test(localContent) && existsSync(localAppTsconfig);
  const isStrictApp = referencesApp && hasStrictTrue(localAppTsconfig);
  if (!isStrictHere && !isStrictApp) {
    const targetFile = referencesApp ? localAppTsconfig : localTsconfig;
    issues.push({ severity: "warning", check: "tsconfig-not-strict", msg: `${targetFile} does not have "strict": true. Enable strict mode for type safety.`, file: targetFile });
  }
} else {
  issues.push({ severity: "warning", check: "tsconfig-missing", msg: `Neither tsconfig.base.json nor tsconfig.json found for ${webDir}.`, file: webDir });
}

const result = buildResult(issues);
printResult(result, "Build Config Validator");
exitFromResultGuarded(result);
