/**
 * catalog-manifest.mjs — shared walk/parse/build/diff library for the catalog
 * manifest (`catalog.json`) and the indexes derived from it (`SKILLS.md`
 * tables, `AGENTS.md` categories table, prose counts).
 *
 * Design contract (change skills-25-upgrade, spec catalog-manifest):
 * - `catalog.json` is the single source of truth for skills, categories and
 *   counts; indexes are generated from it and validated against it.
 * - Derived fields: `name`, `path`, `category` come from the tree + frontmatter;
 *   `tier0` comes from the loader set (`skills-loader.mjs`, TIER0_SKILLS).
 * - Preserved fields: `note` and `autoInvoke` are merge-preserved per skill
 *   (previous manifest first; the current indexes are only used to bootstrap
 *   entries the manifest does not know yet). Category titles are preserved the
 *   same way. New skills enter with defaults (null / false).
 * - Regeneration is idempotent: rendering a consistent file is byte-identical,
 *   and a second `--write` reports no changes. Row order inside a section is
 *   presentation-only and preserved (existing rows keep their place; new rows
 *   are appended in manifest order).
 *
 * The root is always an explicit parameter: the CLI resolves it from the
 * script location (never cwd) and tests pass temp-fixture roots. This module
 * never touches the home directory and never runs git.
 *
 * Node-only, ESM, Windows-first. No external dependencies.
 */

import { existsSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseFrontmatter, readFileUtf8 } from "./script-utils.mjs";

export const MANIFEST_VERSION = 1;
export const MANIFEST_FILE = "catalog.json";
export const SKILLS_INDEX_FILE = "SKILLS.md";
export const AGENTS_FILE = "AGENTS.md";
export const TIER0_SOURCE = "00-meta-skills/skill-loader/scripts/skills-loader.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
/** Catalog root resolved from this file's location: `_shared/` -> one level up. */
export const REPO_ROOT = resolve(__dirname, "..");

/** Directories that are never part of the skill catalog (mirrors the validator). */
export const EXCLUDED_DIRS = new Set(["gentle-ai-dsh", "_shared", "node_modules", ".git"]);

const INDEX_TABLE_HEADER = /^\|\s*Skill\s*\|\s*Path\s*\|\s*$/;
const SKILLS_ROW = /^\|\s*([a-z0-9-]+)\s*\|\s*\[([^\]]+)\]\(([^)]+)\)\s*(.*?)\s*\|\s*$/;
const SECTION_HEADING = /^## (.+?)\s*$/;
const AGENTS_TABLE_HEADER = /^\|\s*Categoría\s*\|\s*Path\s*\|\s*Skills\s*\|\s*$/;
const AGENTS_ROW = /^\|\s*(.+?)\s*\|\s*`([a-z0-9-]+)\/`\s*\|\s*(.*?)\s*\|\s*$/;
const COUNT_PROSE = /Catálogo de \*\*(\d+) skills\*\*/;

const toPosix = (p) => p.replace(/\\/g, "/");

function statSafe(p) {
  try {
    return statSync(p);
  } catch {
    return null;
  }
}

function readIfExists(path) {
  return existsSync(path) ? readFileUtf8(path) : null;
}

const eolOf = (text) => (text.includes("\r\n") ? "\r\n" : "\n");

/** Split into lines keeping each line's own EOL, so EOL-only edits stay visible. */
const linesWithEol = (text) => text.split(/(?<=\n)/);

// --- Walk / frontmatter ----------------------------------------------------

/**
 * Relative POSIX paths of every catalog SKILL.md (sorted), excluding
 * `_shared/`, `gentle-ai-dsh/`, `node_modules/`, `.git/` and
 * `copia-de-seguridad*` directories, exactly like the validator.
 */
export function walkSkillPaths(root) {
  const out = [];
  const visit = (dir) => {
    const stat = statSafe(dir);
    if (!stat || !stat.isDirectory()) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (EXCLUDED_DIRS.has(entry.name) || entry.name.startsWith("copia-de-seguridad")) continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) visit(full);
      else if (entry.isFile() && entry.name === "SKILL.md") out.push(toPosix(relative(root, full)));
    }
  };
  visit(root);
  return out.sort();
}

/** First top-level `field:` value of a frontmatter block (quotes stripped). */
export function getField(front, field) {
  const re = new RegExp(`^${field}:\\s*(.+?)(?:\\r?\\n[a-z-]+:|$)`, "ms");
  const m = front.match(re);
  if (!m) return null;
  let value = m[1].trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  return value;
}

/** Declared skill name (frontmatter `name`, folder name as fallback). */
export function readSkillName(root, relPath) {
  try {
    const parsed = parseFrontmatter(readFileUtf8(join(root, relPath)));
    const name = parsed ? getField(parsed.front, "name") : null;
    if (name) return name;
  } catch {
    /* fall through to the folder name */
  }
  const parts = relPath.split("/");
  return parts.length >= 2 ? parts[parts.length - 2] : relPath;
}

/** Tier 0 set derived from the loader script (single source: TIER0_SKILLS). */
export function readTier0Set(root) {
  const content = readIfExists(join(root, TIER0_SOURCE));
  if (content === null) return { ok: false, names: new Set(), source: TIER0_SOURCE };
  const block = content.match(/TIER0_SKILLS\s*=\s*\[([\s\S]*?)\]/);
  if (!block) return { ok: false, names: new Set(), source: TIER0_SOURCE };
  const names = new Set([...block[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]));
  return { ok: true, names, source: TIER0_SOURCE };
}

// --- Parsers ---------------------------------------------------------------

export function parseCatalogJson(text) {
  if (text === null) return null;
  try {
    const value = JSON.parse(text);
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
}

/**
 * Parse SKILLS.md: section headings, the `| Skill | Path |` table per section,
 * row order, per-row notes and the prose count.
 * Rows: `{ name, path, note, sectionId, lineIndex }`.
 * Sections: `{ id, headingLine, tableStart, tableEnd }` (-1 when no table).
 */
export function parseSkillsMd(text) {
  const lines = text.split(/\r?\n/);
  const countMatch = text.match(COUNT_PROSE);
  const sections = [];
  const rows = [];
  let current = null;
  for (let i = 0; i < lines.length; i++) {
    const heading = lines[i].match(SECTION_HEADING);
    if (heading) {
      current = { id: heading[1], headingLine: i, tableStart: -1, tableEnd: -1 };
      sections.push(current);
      continue;
    }
    if (!current) continue;
    if (current.tableStart === -1 && INDEX_TABLE_HEADER.test(lines[i])) {
      let end = i;
      while (end + 1 < lines.length && lines[end + 1].startsWith("|")) end++;
      current.tableStart = i;
      current.tableEnd = end;
      continue;
    }
    const row = lines[i].match(SKILLS_ROW);
    if (row) {
      rows.push({ name: row[1], path: toPosix(row[3]), note: row[4] || null, sectionId: current.id, lineIndex: i });
    }
  }
  return { lines, count: countMatch ? Number(countMatch[1]) : null, sections, rows };
}

/**
 * Parse AGENTS.md: the categories table (`| Categoría | Path | Skills |`) and
 * every backticked skill reference inside the Auto-Invoke section.
 * Auto-Invoke refs are classified as `path` (`cat/skill`), `bare` (`skill`) or
 * skipped (files, URLs, template placeholders, fenced code).
 */
export function parseAgentsMd(text) {
  const lines = text.split(/\r?\n/);
  let table = null;
  for (let i = 0; i < lines.length; i++) {
    if (!AGENTS_TABLE_HEADER.test(lines[i])) continue;
    let end = i;
    while (end + 1 < lines.length && lines[end + 1].startsWith("|")) end++;
    const rows = [];
    for (let j = i + 1; j <= end; j++) {
      const m = lines[j].match(AGENTS_ROW);
      if (!m) continue;
      rows.push({
        title: m[1],
        id: m[2],
        names: m[3].split(",").map((s) => s.trim()).filter(Boolean),
        lineIndex: j,
      });
    }
    table = { start: i, end, rows };
    break;
  }

  const autoInvoke = [];
  let inSection = false;
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^## /.test(line)) {
      inSection = /^## .*Auto-Invoke/.test(line);
      inFence = false;
      continue;
    }
    if (!inSection) continue;
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    for (const m of line.matchAll(/`([^`]+)`/g)) {
      const token = m[1].trim();
      const ref = classifyAutoInvokeRef(token);
      if (ref) autoInvoke.push({ ...ref, token, line: i + 1 });
    }
  }
  return { lines, table, autoInvoke };
}

function classifyAutoInvokeRef(token) {
  if (token.includes(".") || token.includes(":") || token.includes("<") || token.includes(">")) return null;
  if (token.includes("/")) {
    const [cat, name] = token.split("/");
    if (!/^[a-z0-9-]+$/.test(cat) || !/^[a-z0-9-]+$/.test(name ?? "")) return null;
    return { kind: "path", cat, name };
  }
  if (/^[a-z][a-z0-9-]*$/.test(token) && token.includes("-")) return { kind: "bare", name: token };
  return null;
}

// --- Build -----------------------------------------------------------------

/**
 * Build the manifest from the tree. `tier0` names come from the loader set;
 * `note`/`autoInvoke` and category titles are merge-preserved per skill from
 * `previous` (the committed catalog.json), falling back to values parsed from
 * the current indexes only for entries the previous manifest does not have.
 */
export function buildManifest(root, { tier0 = new Set(), previous = null, notes = new Map(), autoInvoke = new Set(), titles = new Map() } = {}) {
  const prevSkills = new Map((previous?.skills ?? []).map((s) => [s.name, s]));
  const prevTitles = new Map((previous?.categories ?? []).map((c) => [c.id, c.title]));
  const skills = walkSkillPaths(root).map((path) => {
    const name = readSkillName(root, path);
    const prev = prevSkills.get(name);
    return {
      name,
      path,
      category: path.includes("/") ? path.split("/")[0] : "(root)",
      tier0: tier0.has(name),
      note: prev ? (prev.note ?? null) : (notes.get(name) ?? null),
      autoInvoke: prev ? Boolean(prev.autoInvoke) : autoInvoke.has(name),
    };
  });
  const counts = new Map();
  for (const s of skills) counts.set(s.category, (counts.get(s.category) ?? 0) + 1);
  const categories = [...counts.keys()].sort().map((id) => ({
    id,
    title: prevTitles.get(id) ?? titles.get(id) ?? id,
    count: counts.get(id),
  }));
  return { version: MANIFEST_VERSION, totals: { skills: skills.length }, categories, skills };
}

// --- Render (generated indexes) ---------------------------------------------

const skillRow = (s) => `| ${s.name} | [${s.path}](${s.path})${s.note ? ` ${s.note}` : ""} |`;

function orderSkills(skills, existingNames) {
  const byName = new Map(skills.map((s) => [s.name, s]));
  const ordered = [];
  const seen = new Set();
  for (const name of existingNames) {
    const skill = byName.get(name);
    if (skill && !seen.has(skill.name)) {
      ordered.push(skill);
      seen.add(skill.name);
    }
  }
  for (const skill of skills) {
    if (!seen.has(skill.name)) {
      ordered.push(skill);
      seen.add(skill.name);
    }
  }
  return ordered;
}

/** Regenerate SKILLS.md: category tables, missing sections, prose count. */
export function renderSkillsMd(text, manifest) {
  const parsed = parseSkillsMd(text);
  const eol = eolOf(text);
  const lines = [...parsed.lines];
  const byCategory = new Map();
  for (const s of manifest.skills) {
    if (!byCategory.has(s.category)) byCategory.set(s.category, []);
    byCategory.get(s.category).push(s);
  }
  const categoryIds = new Set(manifest.categories.map((c) => c.id));

  // Existing sections: regenerate tables, drop stale category sections.
  for (const section of [...parsed.sections].reverse()) {
    const isCategory = categoryIds.has(section.id);
    if (!isCategory) {
      if (section.tableStart >= 0) {
        // A skills table under a section that is no longer a category: stale.
        const end = section.tableEnd >= 0 ? section.tableEnd : section.headingLine;
        lines.splice(section.headingLine, end - section.headingLine + 1);
        if (lines[section.headingLine] === "" && lines[section.headingLine - 1] === "") {
          lines.splice(section.headingLine, 1);
        }
      }
      continue;
    }
    const existing = parsed.rows.filter((r) => r.sectionId === section.id).map((r) => r.name);
    const table = ["| Skill | Path |", "|---|---|", ...orderSkills(byCategory.get(section.id) ?? [], existing).map(skillRow)];
    if (section.tableStart >= 0) {
      lines.splice(section.tableStart, section.tableEnd - section.tableStart + 1, ...table);
    } else {
      lines.splice(section.headingLine + 1, 0, "", ...table);
    }
  }

  // Categories that have no section yet: append at the end.
  const present = new Set(parsed.sections.map((s) => s.id));
  for (const id of categoryIds) {
    if (present.has(id)) continue;
    if (lines.length > 0 && lines[lines.length - 1] !== "") lines.push("");
    lines.push(`## ${id}`, "", "| Skill | Path |", "|---|---|", ...(byCategory.get(id) ?? []).map(skillRow), "");
  }

  return lines.join(eol).replace(COUNT_PROSE, `Catálogo de **${manifest.totals.skills} skills**`);
}

function renderAgentsRow(title, categoryId, skills, existingNames) {
  const byName = new Map(skills.map((s) => [s.name, s]));
  const ordered = [];
  const seen = new Set();
  for (const name of existingNames) {
    if (byName.has(name) && !seen.has(name)) {
      ordered.push(name);
      seen.add(name);
    }
  }
  for (const s of skills) {
    if (!seen.has(s.name)) {
      ordered.push(s.name);
      seen.add(s.name);
    }
  }
  return `| ${title} | \`${categoryId}/\` | ${ordered.join(", ")} |`;
}

/** Regenerate the AGENTS.md categories table (rows, order, skill cells). */
export function renderAgentsMd(text, manifest) {
  const parsed = parseAgentsMd(text);
  if (!parsed.table) return null;
  const eol = eolOf(text);
  const lines = [...parsed.lines];
  const catById = new Map(manifest.categories.map((c) => [c.id, c]));
  const byCategory = new Map();
  for (const s of manifest.skills) {
    if (!byCategory.has(s.category)) byCategory.set(s.category, []);
    byCategory.get(s.category).push(s);
  }
  const rows = [];
  for (const row of parsed.table.rows) {
    const category = catById.get(row.id);
    if (!category) continue; // stale category row
    rows.push(renderAgentsRow(category.title, row.id, byCategory.get(row.id) ?? [], row.names));
  }
  const present = new Set(parsed.table.rows.map((r) => r.id));
  for (const category of manifest.categories) {
    if (!present.has(category.id)) {
      rows.push(renderAgentsRow(category.title, category.id, byCategory.get(category.id) ?? [], []));
    }
  }
  const bodyStart = parsed.table.start + 2; // header + separator
  lines.splice(bodyStart, parsed.table.end - bodyStart + 1, ...rows);
  return lines.join(eol);
}

// --- Diff ------------------------------------------------------------------

/** Summarized line diff: count + first differing line, expected vs actual. */
export function diffText(expected, actual) {
  if (expected === actual) return { changed: false, summary: "" };
  const a = linesWithEol(expected);
  const b = linesWithEol(actual);
  const max = Math.max(a.length, b.length);
  let first = -1;
  let count = 0;
  for (let i = 0; i < max; i++) {
    if (a[i] !== b[i]) {
      if (first === -1) first = i;
      count++;
    }
  }
  const exp = a[first] ?? "(missing line)";
  const act = b[first] ?? "(missing line)";
  return {
    changed: true,
    summary: `${count} line(s) differ (first at line ${first + 1}): expected ${JSON.stringify(exp.slice(0, 120))}, found ${JSON.stringify(act.slice(0, 120))}`,
  };
}

function diffManifest(expected, actual, { checkTier0 = true } = {}) {
  const issues = [];
  if (actual.version !== expected.version) {
    issues.push({ code: "manifest-version-mismatch", detail: `${actual.version} != ${expected.version}` });
  }
  if (actual.totals?.skills !== expected.totals.skills) {
    issues.push({ code: "manifest-totals-mismatch", detail: `${actual.totals?.skills} != ${expected.totals.skills}` });
  }
  const actSkills = new Map((actual.skills ?? []).map((s) => [s.path, s]));
  const expSkills = new Map(expected.skills.map((s) => [s.path, s]));
  for (const [path, skill] of expSkills) {
    const current = actSkills.get(path);
    if (!current) {
      issues.push({ code: "skill-missing-from-manifest", detail: `${skill.name} (${path})` });
      continue;
    }
    if (current.name !== skill.name) {
      issues.push({ code: "manifest-name-mismatch", detail: `${path}: "${current.name}" != "${skill.name}"` });
    }
    if ((current.category ?? null) !== skill.category) {
      issues.push({ code: "manifest-category-mismatch", detail: `${path}: "${current.category}" != "${skill.category}"` });
    }
    if (checkTier0 && Boolean(current.tier0) !== skill.tier0) {
      issues.push({ code: "manifest-tier0-mismatch", detail: `${skill.name}: ${Boolean(current.tier0)} != ${skill.tier0}` });
    }
  }
  for (const [path, skill] of actSkills) {
    if (!expSkills.has(path)) issues.push({ code: "manifest-entry-orphan", detail: `${skill.name} (${path})` });
  }
  const actCats = new Map((actual.categories ?? []).map((c) => [c.id, c]));
  for (const category of expected.categories) {
    const current = actCats.get(category.id);
    if (!current) {
      issues.push({ code: "manifest-category-missing", detail: category.id });
    } else if (current.count !== category.count) {
      issues.push({ code: "manifest-category-count-mismatch", detail: `${category.id}: ${current.count} != ${category.count}` });
    }
  }
  for (const id of actCats.keys()) {
    if (!expected.categories.some((c) => c.id === id)) issues.push({ code: "manifest-category-orphan", detail: id });
  }
  return issues;
}

// --- Check -----------------------------------------------------------------

const refResolves = (ref, manifest) =>
  ref.kind === "path"
    ? manifest.skills.some((s) => s.path === `${ref.cat}/${ref.name}/SKILL.md`)
    : manifest.skills.some((s) => s.name === ref.name);

/** Read-only gate: manifest ↔ tree, indexes ↔ manifest, Tier 0, Auto-Invoke. */
export function checkCatalog(root) {
  const issues = [];
  const tier0 = readTier0Set(root);
  if (!tier0.ok) issues.push({ code: "tier0-source-missing", detail: TIER0_SOURCE });

  const catalogText = readIfExists(join(root, MANIFEST_FILE));
  const catalog = parseCatalogJson(catalogText);
  if (catalogText === null) issues.push({ code: "manifest-missing", detail: MANIFEST_FILE });
  else if (!catalog) issues.push({ code: "manifest-invalid-json", detail: MANIFEST_FILE });

  const expected = buildManifest(root, { tier0: tier0.names, previous: catalog });
  if (tier0.ok) {
    for (const name of tier0.names) {
      if (!expected.skills.some((s) => s.name === name)) issues.push({ code: "tier0-unknown", detail: name });
    }
  }
  if (catalog) issues.push(...diffManifest(expected, catalog, { checkTier0: tier0.ok }));

  const skillsText = readIfExists(join(root, SKILLS_INDEX_FILE));
  if (skillsText === null) {
    issues.push({ code: "skills-index-missing", detail: SKILLS_INDEX_FILE });
  } else {
    const categoryIds = new Set(expected.categories.map((c) => c.id));
    const parsedSkills = parseSkillsMd(skillsText);
    for (const section of parsedSkills.sections) {
      const rows = parsedSkills.rows.filter((r) => r.sectionId === section.id);
      if (!categoryIds.has(section.id) && rows.length > 0) {
        issues.push({ code: "index-orphan-section", detail: `${SKILLS_INDEX_FILE}: ## ${section.id} (${rows.length} row(s))` });
      }
    }
    if (catalog) {
      const diff = diffText(renderSkillsMd(skillsText, expected), skillsText);
      if (diff.changed) issues.push({ code: "index-drift", detail: `${SKILLS_INDEX_FILE}: ${diff.summary}` });
    }
  }

  const agentsText = readIfExists(join(root, AGENTS_FILE));
  if (agentsText === null) {
    issues.push({ code: "agents-index-missing", detail: AGENTS_FILE });
  } else {
    const parsedAgents = parseAgentsMd(agentsText);
    if (!parsedAgents.table) issues.push({ code: "agents-table-missing", detail: AGENTS_FILE });
    else if (catalog) {
      const diff = diffText(renderAgentsMd(agentsText, expected), agentsText);
      if (diff.changed) issues.push({ code: "index-drift", detail: `${AGENTS_FILE}: ${diff.summary}` });
    }
    for (const ref of parsedAgents.autoInvoke) {
      if (!refResolves(ref, expected)) {
        issues.push({ code: "auto-invoke-unknown", detail: `"${ref.token}" (line ${ref.line})` });
      }
    }
  }

  return { ok: issues.length === 0, issues, skills: expected.totals.skills, categories: expected.categories.length };
}

// --- Generate (--write) ------------------------------------------------------

/**
 * Regenerate `catalog.json`, `SKILLS.md` and `AGENTS.md` in `root`.
 * Validates Tier 0 and Auto-Invoke references BEFORE writing anything; fails
 * closed without touching files. Writes a file only when its content changes.
 */
export function generateIndexes(root) {
  const issues = [];
  const tier0 = readTier0Set(root);
  if (!tier0.ok) issues.push({ code: "tier0-source-missing", detail: TIER0_SOURCE });

  const catalogPath = join(root, MANIFEST_FILE);
  const skillsMdPath = join(root, SKILLS_INDEX_FILE);
  const agentsMdPath = join(root, AGENTS_FILE);
  const catalogText = readIfExists(catalogPath);
  const skillsText = readIfExists(skillsMdPath);
  const agentsText = readIfExists(agentsMdPath);
  if (skillsText === null) issues.push({ code: "skills-index-missing", detail: SKILLS_INDEX_FILE });
  if (agentsText === null) issues.push({ code: "agents-index-missing", detail: AGENTS_FILE });
  if (issues.length) return { ok: false, issues, written: [], skills: 0, categories: 0 };

  const parsedSkills = parseSkillsMd(skillsText);
  const parsedAgents = parseAgentsMd(agentsText);
  if (!parsedAgents.table) {
    return { ok: false, issues: [{ code: "agents-table-missing", detail: AGENTS_FILE }], written: [], skills: 0, categories: 0 };
  }

  // Bootstrap sources: consulted only for entries the previous manifest lacks.
  const previous = parseCatalogJson(catalogText);
  const notes = new Map();
  for (const row of parsedSkills.rows) if (row.note && !notes.has(row.name)) notes.set(row.name, row.note);
  const titles = new Map(parsedAgents.table.rows.map((row) => [row.id, row.title]));

  const manifest = buildManifest(root, { tier0: tier0.names, previous, notes, titles });
  if (!previous) {
    const refNames = new Set(parsedAgents.autoInvoke.filter((ref) => refResolves(ref, manifest)).map((ref) => ref.name));
    for (const skill of manifest.skills) skill.autoInvoke = refNames.has(skill.name);
  }

  if (tier0.ok) {
    for (const name of tier0.names) {
      if (!manifest.skills.some((s) => s.name === name)) issues.push({ code: "tier0-unknown", detail: name });
    }
  }
  for (const ref of parsedAgents.autoInvoke) {
    if (!refResolves(ref, manifest)) issues.push({ code: "auto-invoke-unknown", detail: `"${ref.token}" (line ${ref.line})` });
  }
  if (issues.length) {
    return { ok: false, issues, written: [], skills: manifest.totals.skills, categories: manifest.categories.length };
  }

  const catalogOut = `${JSON.stringify(manifest, null, 2)}\n`;
  const skillsOut = renderSkillsMd(skillsText, manifest);
  const agentsOut = renderAgentsMd(agentsText, manifest);
  const written = [];
  if (catalogText !== catalogOut) {
    writeFileSync(catalogPath, catalogOut, "utf8");
    written.push(MANIFEST_FILE);
  }
  if (skillsOut !== skillsText) {
    writeFileSync(skillsMdPath, skillsOut, "utf8");
    written.push(SKILLS_INDEX_FILE);
  }
  if (agentsOut !== agentsText) {
    writeFileSync(agentsMdPath, agentsOut, "utf8");
    written.push(AGENTS_FILE);
  }
  return { ok: true, issues: [], written, skills: manifest.totals.skills, categories: manifest.categories.length };
}
