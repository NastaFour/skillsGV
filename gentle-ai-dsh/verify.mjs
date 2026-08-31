#!/usr/bin/env node
// Portable preset verifier: YAML structure check + !!js expression evaluation.
// No hardcoded paths. Usage:
//   node verify.mjs [path/to/agent.cordis.yml]
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = here; // verify.mjs lives at the package root

function loadYaml() {
  const candidates = [
    'js-yaml',
    join(homedir(), '.dsh', 'profiles', 'node_modules', 'js-yaml'),
  ];
  for (const c of candidates) {
    try { return require(c); } catch {}
  }
  return null;
}
const yaml = loadYaml();
if (!yaml) {
  console.error('FAIL: js-yaml not found (npm i in this package, or a dsh runtime, is required).');
  process.exit(1);
}

const file = process.argv[2] || join(pkgRoot, 'preset', 'agent.cordis.yml');
const metaFile = join(dirname(file), 'preset.yml');
const src = readFileSync(file, 'utf8');

// 0) guard: `!!js` immediately followed by a YAML tag indicator is a
//    "duplication of a tag property" parse error in the real loader.
const doubleTag = src.match(/!!js\s*[!&*|>%@]/g);
if (doubleTag) {
  console.error('FAIL: double tag — !!js followed by a tag indicator: ' + doubleTag.join(', '));
  process.exit(1);
}

// 1) extract and evaluate every !!js expression
const exprs = [];
const re = /!!js\s+([^\n]+)/g;
let m;
while ((m = re.exec(src)) !== null) exprs.push(m[1]);
console.log('!!js expressions: ' + exprs.length);
let errors = 0;
for (const e of exprs) {
  try {
    let expr = e.trim();
    if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
      expr = expr.slice(1, -1);
    }
    const v = Function('process', 'JSON', 'return (' + expr + ')')(process, JSON);
    console.log('  OK   ' + e + '   => ' + JSON.stringify(v));
  } catch (err) {
    console.error('  BAD  ' + e + '   => ' + err.message);
    errors++;
  }
}

// 2) structure check: neutralize !!js then parse with js-yaml
const neutral = src.replace(/!!js\s+[^\n]+/g, '"__JS__"');
let doc;
try { doc = yaml.load(neutral); } catch (err) { console.error('YAML STRUCTURE FAIL: ' + err.message); process.exit(1); }
if (!Array.isArray(doc)) { console.error('FAIL: not a top-level list'); process.exit(1); }

console.log('\nrows: ' + doc.length);
for (const row of doc) {
  if (!row || !row.id || !row.name) { console.error('FAIL: row missing id/name: ' + JSON.stringify(row)); errors++; continue; }
  console.log('  ' + row.id + ' -> ' + row.name);
  if (row.config && Array.isArray(row.config)) {
    row.config.forEach((c) => console.log('      - ' + c.id + ' -> ' + c.name));
  }
}

// duplicate id / serverName checks (top-level + nested group rows)
const ids = new Map();
const servers = new Map();
(function walk(rows) {
  for (const row of rows) {
    if (!row || !row.id) continue;
    if (ids.has(row.id)) { console.error('FAIL: duplicate id: ' + row.id); errors++; } else ids.set(row.id, 1);
    if (row.serverName) { if (servers.has(row.serverName)) { console.error('FAIL: duplicate serverName: ' + row.serverName); errors++; } else servers.set(row.serverName, 1); }
    if (row.config && Array.isArray(row.config)) walk(row.config);
  }
})(doc);

try { yaml.load(readFileSync(metaFile, 'utf8')); console.log('\npreset.yml: OK'); }
catch (e) { console.error('preset.yml FAIL: ' + e.message); errors++; }

console.log(errors === 0 ? '\nRESULT: PASS' : '\nRESULT: FAIL (' + errors + ' errors)');
process.exit(errors === 0 ? 0 : 1);
