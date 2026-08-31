#!/usr/bin/env node
// token-audit.mjs — generalized design-token audit (design-driven D6 gate).
// Detects: hardcoded hex, non-semantic literals (bg-white/text-black), non-semantic
// Tailwind palette classes, non-8pt spacing, magic durations.
// Usage: node token-audit.mjs [--srcDir <path> ...]   (defaults to cwd)
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';

const args = process.argv.slice(2);
const srcDirs = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--srcDir' && args[i + 1]) { srcDirs.push(resolve(args[++i])); }
}
if (srcDirs.length === 0) srcDirs.push(resolve(process.cwd()));

const EXTS = /\.(t|j)sx?$|\.css$/;
function walk(dir, out) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name === '.git' || e.name === 'dist' || e.name === 'build') continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.isFile() && EXTS.test(e.name)) out.push(p);
  }
  return out;
}

const issues = [];
const hexRe = /#[0-9a-fA-F]{3,8}\b/g;
const literalRe = /\b(bg|text|border)-(white|black)\b/g;
const paletteRe = /\b(bg|text|border|ring|from|to|via)-(gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+\b/g;
const pxRe = /(?:padding|margin|gap|top|bottom|left|right|width|height):\s*(\d+)px/g;
const durRe = /transition[^;]*\b(\d{3,})ms\b/g;

for (const srcDir of srcDirs) {
  for (const file of walk(srcDir, [])) {
    const rel = relative(process.cwd(), file);
    const lines = readFileSync(file, 'utf8').split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const t = line.trim();
      if (t.startsWith('//') || t.startsWith('/*') || t.startsWith('*')) continue;
      for (const m of line.matchAll(hexRe)) {
        if (/--color/.test(line) || /theme|colors/.test(line)) continue;
        issues.push('[' + rel + ':' + (i + 1) + '] hardcoded-hex: ' + m[0] + ' -> use a design token or Tailwind class');
      }
      for (const m of line.matchAll(literalRe)) {
        if (/--color/.test(line)) continue;
        issues.push('[' + rel + ':' + (i + 1) + '] non-semantic-literal: ' + m[0] + ' -> use a semantic class (bg-surface / text-foreground)');
      }
      for (const m of line.matchAll(paletteRe)) {
        issues.push('[' + rel + ':' + (i + 1) + '] non-semantic-palette: ' + m[0] + ' -> prefer a semantic token class');
      }
      for (const m of line.matchAll(pxRe)) {
        const v = parseInt(m[1], 10);
        if (v % 4 !== 0 && v > 0) issues.push('[' + rel + ':' + (i + 1) + '] non-8pt-spacing: ' + v + 'px -> multiple of 4 / spacing token');
      }
      for (const m of line.matchAll(durRe)) {
        const v = parseInt(m[1], 10);
        if (![75, 150, 250, 400, 600, 1000].includes(v) && !/--duration/.test(line)) issues.push('[' + rel + ':' + (i + 1) + '] magic-duration: ' + v + 'ms -> --duration-* token');
      }
    }
  }
}

console.log('token-audit: ' + issues.length + ' issue(s)');
for (const x of issues.slice(0, 200)) console.log('  ' + x);
if (issues.length > 200) console.log('  ... (' + (issues.length - 200) + ' more)');
process.exit(issues.length === 0 ? 0 : 1);
