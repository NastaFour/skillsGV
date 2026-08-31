#!/usr/bin/env node
// gentle-ai-dsh installer - one command to install the Gentle-AI addon for DeepSeek Harness.
//
//   npx gentle-ai-dsh                 # install (default)
//   npx gentle-ai-dsh --set-default   # install and make gentle-ai the default mode
//   npx gentle-ai-dsh --dry-run       # preview only
//   npx gentle-ai-dsh doctor          # verify an existing install
//   npx gentle-ai-dsh --uninstall     # remove what we installed
//
// What it does (install):
//   1. copy the 152-skill catalog to ~/.agents/skills
//   2. copy the "gentle-ai" agent preset to ~/.dsh/.agent-presets/gentle-ai
//   3. write the bootstrap AGENTS.md to ~/.dsh/AGENTS.md (backed up if it exists)
//   4. optionally set agent-presets.default: gentle-ai
//   5. print the exact MCP API-key / env commands the agent needs

import {
  existsSync, mkdirSync, cpSync, rmSync, readFileSync, writeFileSync, renameSync, copyFileSync, readdirSync, statSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const PKG_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PRESET_ID = 'gentle-ai';
const SKILLS_SRC = join(PKG_ROOT, 'skills');
const PRESET_SRC = join(PKG_ROOT, 'preset');
const AGENTS_SRC = join(PKG_ROOT, 'AGENTS.md');

const step = (m) => console.log('[gentle-ai-dsh] ' + m);
const warn = (m) => console.log('[gentle-ai-dsh] WARN: ' + m);

function printHelp() {
  console.log('gentle-ai-dsh - Gentle-AI addon installer for DeepSeek Harness');
  console.log('');
  console.log('Usage:');
  console.log('  npx gentle-ai-dsh [--set-default] [--dry-run] [--dsh-home <p>] [--agents-home <p>]');
  console.log('  npx gentle-ai-dsh doctor');
  console.log('  npx gentle-ai-dsh --uninstall');
  console.log('');
  console.log('Options:');
  console.log('  --set-default   set agent-presets.default = gentle-ai');
  console.log('  --dry-run       preview without writing');
  console.log('  --dsh-home <p>  override the DeepSeek Harness home (default ~/.dsh)');
  console.log('  --agents-home <p> override the shared agents home (default ~/.agents)');
}

// --- arg parsing -----------------------------------------------------------
let dshHome = null;
let agentsHome = null;
let dryRun = false;
let setDefault = false;
let uninstall = false;
let doctor = false;

for (let i = 0; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a === '--dsh-home' || a === '--agents-home') {
    const v = process.argv[i + 1];
    if (!v || v.startsWith('--')) { console.error(a + ' requires a value'); process.exit(2); }
    if (a === '--dsh-home') dshHome = resolve(v); else agentsHome = resolve(v);
    i++;
  }
  else if (a === '--dry-run') dryRun = true;
  else if (a === '--set-default') setDefault = true;
  else if (a === '--uninstall') uninstall = true;
  else if (a === 'doctor') doctor = true;
  else if (a === '--help' || a === '-h') { printHelp(); process.exit(0); }
}

const home = homedir();
dshHome = dshHome || process.env.DSH_HOME || join(home, '.dsh');
agentsHome = agentsHome || process.env.DSH_AGENTS_HOME || join(home, '.agents');

const skillsDest = join(agentsHome, 'skills');
const presetDest = join(dshHome, '.agent-presets', PRESET_ID);
const agentsDest = join(dshHome, 'AGENTS.md');
const manifestDir = join(dshHome, '.gentle-ai-dsh');
const manifestPath = join(manifestDir, 'manifest.json');

function writeJson(p, obj) {
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

function readManifest() {
  try { return JSON.parse(readFileSync(manifestPath, 'utf8')); }
  catch { return null; }
}

function backupIfExists(p) {
  if (!existsSync(p)) return null;
  const bak = p + '.bak-' + new Date().toISOString().replace(/[:.]/g, '-');
  copyFileSync(p, bak);
  return bak;
}

// Generate a flat .atl/skill-registry.md index from each SKILL.md frontmatter.
function generateSkillRegistry(dest) {
  const dirs = readdirSync(dest).filter((n) => { try { return statSync(join(dest, n)).isDirectory(); } catch { return false; } }).sort();
  const rows = [];
  for (const name of dirs) {
    const sk = join(dest, name, 'SKILL.md');
    if (!existsSync(sk)) continue;
    const fm = readFileSync(sk, 'utf8');
    const desc = (fm.match(/^description:\s*(.+)$/m) || [])[1] || '';
    rows.push('| ' + name + ' | ' + desc.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ') + ' |');
  }
  const md = '# Skill Registry — gentle-ai-dsh\n\n> Auto-generated index. Total: ' + rows.length + ' skills.\n\n| Skill | Trigger / Description |\n|---|---|\n' + rows.join('\n') + '\n';
  const atlDir = join(dest, '.atl');
  mkdirSync(atlDir, { recursive: true });
  writeFileSync(join(atlDir, 'skill-registry.md'), md, 'utf8');
  step('  generated .atl/skill-registry.md (' + rows.length + ' skills)');
}

// --- install ---------------------------------------------------------------
function doInstall() {
  step('Detect: DSH_HOME=' + dshHome);
  step('        agents home=' + agentsHome);
  if (!existsSync(dshHome)) { warn('DSH_HOME not found (' + dshHome + '); is DeepSeek Harness installed?'); process.exit(1); }
  if (!existsSync(SKILLS_SRC)) { warn('bundled skills missing: ' + SKILLS_SRC); process.exit(1); }
  if (!existsSync(PRESET_SRC)) { warn('bundled preset missing: ' + PRESET_SRC); process.exit(1); }

  const plan = {
    skills: { src: SKILLS_SRC, dest: skillsDest },
    preset: { src: PRESET_SRC, dest: presetDest },
    agents: { src: AGENTS_SRC, dest: agentsDest },
    default: setDefault,
  };

  if (dryRun) {
    console.log('DRY-RUN plan:');
    console.log('  copy skills  -> ' + skillsDest);
    console.log('  copy preset  -> ' + presetDest);
    console.log('  write AGENTS -> ' + agentsDest);
    if (setDefault) console.log('  set default  -> ' + PRESET_ID);
    return;
  }

  // skills
  step('Install skills -> ' + skillsDest);
  cpSync(SKILLS_SRC, skillsDest, { recursive: true, force: true });
  const skillDirs = existsSync(skillsDest) ? readdirSync(skillsDest).filter((n) => { try { return statSync(join(skillsDest, n)).isDirectory(); } catch { return false; } }).length : 0;
  step('  ' + skillDirs + ' skill dirs present');

  // skill registry index (.atl/skill-registry.md)
  generateSkillRegistry(skillsDest);

  // preset
  step('Install preset -> ' + presetDest);
  cpSync(PRESET_SRC, presetDest, { recursive: true, force: true });

  // AGENTS.md (transactional: copy-backup; preserve the FIRST user backup)
  const prevMf = readManifest();
  let bak = null;
  if (existsSync(agentsDest)) {
    if (prevMf && prevMf.agentsBackup && existsSync(prevMf.agentsBackup)) {
      bak = prevMf.agentsBackup;
    } else if (!prevMf) {
      bak = backupIfExists(agentsDest);
      if (bak) step('  backed up previous -> ' + bak);
    }
  }
  try {
    step('Write bootstrap AGENTS.md -> ' + agentsDest);
    cpSync(AGENTS_SRC, agentsDest);

  // default preset
  if (setDefault) {
    const settings = join(dshHome, 'settings.yaml');
    const existing = existsSync(settings) ? readFileSync(settings, 'utf8') : '';
    if (/^agent-presets:/m.test(existing)) {
      warn('settings.yaml already has an agent-presets block; set the default in the UI mode picker instead');
    } else {
      const block = 'agent-presets:\n  default: ' + PRESET_ID + '\n';
      writeFileSync(settings, existing + (existing.endsWith('\n') ? '' : '\n') + block, 'utf8');
      step('  set agent-presets.default = ' + PRESET_ID);
    }
  }

    // manifest
    writeJson(manifestPath, { version: 1, installedAt: new Date().toISOString(), presetId: PRESET_ID, dshHome, agentsHome, agentsBackup: bak || null });

    step('SEALED. Restart the dsh Host and open a new session (mode: gentle-ai).');
    printBootstrap();
  } catch (err) {
    step('FAILED: ' + err.message + ' - rolling back');
    if (bak && existsSync(bak)) { rmSync(agentsDest, { force: true }); renameSync(bak, agentsDest); step('  restored AGENTS.md from backup'); }
    process.exit(1);
  }
}

function printBootstrap() {
  console.log('');
  console.log('----------------------------------------------------------------');
  console.log('BOOTSTRAP - the agent will ask for these. Set them in the dsh Host');
  console.log('environment, then restart the Host.');
  console.log('');
  console.log('  $env:ENGRAM_MCP_COMMAND = "engram"        # Engram MCP (stdio)');
  console.log("  $env:ENGRAM_MCP_ARGS    = '[\"mcp\"]'    # args if needed");
  console.log('  $env:CONTEXT7_API_KEY   = "<ctx7 key>"   # Context7 (HTTP)');
  console.log('  $env:DSH_FLASH_MODEL    = "deepseek-chat" # flash model for subagents');
  console.log('');
  console.log('Missing values are safe: those MCP tools stay disabled and the mode');
  console.log('still mounts. The agent reads the same bootstrap from ~/.dsh/AGENTS.md.');
  console.log('----------------------------------------------------------------');
}

// --- doctor ----------------------------------------------------------------
function doDoctor() {
  let ok = true;
  const check = (label, p) => { const good = existsSync(p); console.log((good ? '  OK   ' : '  MISS ') + label + ' -> ' + p); if (!good) ok = false; };
  console.log('gentle-ai-dsh doctor');
  console.log('  DSH_HOME=' + dshHome);
  check('preset', join(presetDest, 'agent.cordis.yml'));
  check('preset metadata', join(presetDest, 'preset.yml'));
  check('AGENTS.md', agentsDest);
  check('skills root', skillsDest);
  check('sdd-orchestrator skill', join(skillsDest, 'sdd-orchestrator', 'SKILL.md'));
  check('judgment-day skill', join(skillsDest, 'judgment-day', 'SKILL.md'));
  console.log(ok ? 'RESULT: PASS' : 'RESULT: incomplete');
  process.exit(ok ? 0 : 1);
}

// --- uninstall -------------------------------------------------------------
function clearDefaultPreset() {
  const settings = join(dshHome, 'settings.yaml');
  if (!existsSync(settings)) return;
  const raw = readFileSync(settings, 'utf8');
  const lines = raw.split(String.fromCharCode(10));
  const out = [];
  let removed = false;
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].replace(String.fromCharCode(13), '');
    if (line === 'agent-presets:') {
      const next = (lines[i + 1] || '').replace(String.fromCharCode(13), '');
      if (next.trim() === 'default: ' + PRESET_ID) { i += 2; removed = true; continue; }
    }
    out.push(lines[i]);
    i++;
  }
  if (removed) { writeFileSync(settings, out.join(String.fromCharCode(10)), 'utf8'); step('  cleared agent-presets.default = ' + PRESET_ID); }
}

function doUninstall() {
  step('Uninstall');
  if (dryRun) { console.log('DRY-RUN: would remove ' + presetDest + ' and restore AGENTS.md'); return; }
  const mf = readManifest();
  if (existsSync(presetDest)) { rmSync(presetDest, { recursive: true, force: true }); step('  removed preset ' + presetDest); }
  if (existsSync(agentsDest)) {
    if (mf) {
      const bak = mf.agentsBackup;
      if (bak && existsSync(bak)) { rmSync(agentsDest, { force: true }); renameSync(bak, agentsDest); step('  restored AGENTS.md from backup'); }
      else { rmSync(agentsDest, { force: true }); step('  removed AGENTS.md (owned, no backup)'); }
    } else {
      warn('  left AGENTS.md in place (no manifest ownership record)');
    }
  }
  clearDefaultPreset();
  if (existsSync(manifestPath)) { rmSync(manifestPath, { force: true }); }
  step('Done. Skills under ~/.agents/skills are shared and were left in place.');
}

// --- run -------------------------------------------------------------------
if (uninstall) doUninstall();
else if (doctor) doDoctor();
else doInstall();
