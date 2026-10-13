import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseFrontmatter,
  splitFrontmatter,
  getField,
  getNestedField,
  parseList,
  parseTriggers
} from '../_shared/frontmatter.mjs';

test('parseFrontmatter extracts YAML block between opening and closing delimiters', () => {
  const content = `---
name: test-skill
description: A test skill
---

# Body
Content here.
`;
  const fm = parseFrontmatter(content);
  assert.equal(fm, 'name: test-skill\ndescription: A test skill');
});

test('parseFrontmatter handles CRLF line endings', () => {
  const content = '---\r\nname: crlf-skill\r\nallowed_tools: Read\r\n---\r\n\r\n# Body\r\n';
  const fm = parseFrontmatter(content);
  assert.equal(fm, 'name: crlf-skill\r\nallowed_tools: Read');
});

test('parseFrontmatter returns null for missing or malformed frontmatter', () => {
  assert.equal(parseFrontmatter(''), null);
  assert.equal(parseFrontmatter('# No frontmatter here'), null);
  assert.equal(parseFrontmatter('---\nname: unclosed\n# Missing closing delimiter'), null);
  assert.equal(parseFrontmatter(null), null);
});

test('splitFrontmatter splits into front and body', () => {
  const content = `---
name: test-split
---

# Title
Some markdown body.`;
  const split = splitFrontmatter(content);
  assert.ok(split);
  assert.equal(split.front, 'name: test-split');
  assert.equal(split.body.trim(), '# Title\nSome markdown body.');
});

test('splitFrontmatter returns null when delimiters are missing', () => {
  assert.equal(splitFrontmatter('Just markdown text'), null);
});

test('getField extracts top-level fields and unwraps quotes', () => {
  const fm = `name: sample-skill
description: "Sample description for testing."
license: 'MIT'
version: 1.0.0`;

  assert.equal(getField(fm, 'name'), 'sample-skill');
  assert.equal(getField(fm, 'description'), 'Sample description for testing.');
  assert.equal(getField(fm, 'license'), 'MIT');
  assert.equal(getField(fm, 'version'), '1.0.0');
  assert.equal(getField(fm, 'non_existent'), null);
});

test('getField extracts folded scalar (>) descriptions', () => {
  const fm = `name: jira-epic
description: >
  Creates well-structured Jira Epics with user-facing descriptions, acceptance criteria, and
  child task breakdown. Trigger when the user asks to create a Jira epic, organize a feature
  into epics, or structure a large initiative into parent tasks with children.
license: MIT
allowed-tools: Read`;

  const desc = getField(fm, 'description');
  assert.equal(
    desc,
    'Creates well-structured Jira Epics with user-facing descriptions, acceptance criteria, and child task breakdown. Trigger when the user asks to create a Jira epic, organize a feature into epics, or structure a large initiative into parent tasks with children.'
  );
  assert.equal(getField(fm, 'license'), 'MIT');
});

test('getField extracts folded scalar with chomp (>-)', () => {
  const fm = `name: chomp-skill
description: >-
  First line of description.
  Second line of description.
allowed_tools: Read`;

  const desc = getField(fm, 'description');
  assert.equal(desc, 'First line of description. Second line of description.');
  assert.equal(getField(fm, 'allowed_tools'), 'Read');
});

test('getField extracts literal scalar (|) descriptions preserving newlines', () => {
  const fm = `name: literal-skill
description: |
  Line 1 of explanation.
  Line 2 of explanation.
  Line 3 of explanation.
allowed_tools: Read`;

  const desc = getField(fm, 'description');
  assert.equal(desc, 'Line 1 of explanation.\nLine 2 of explanation.\nLine 3 of explanation.');
});

test('getField handles keys with underscores and numbers without lookahead truncation', () => {
  const fm = `name: underscore-skill
allowed_tools: Read, Edit
time_budget_sec: 120
min_diff_lines: 10
STEP_1: initialize
2nd_option: fallback`;

  assert.equal(getField(fm, 'name'), 'underscore-skill');
  assert.equal(getField(fm, 'allowed_tools'), 'Read, Edit');
  assert.equal(getField(fm, 'time_budget_sec'), '120');
  assert.equal(getField(fm, 'min_diff_lines'), '10');
  assert.equal(getField(fm, 'STEP_1'), 'initialize');
  assert.equal(getField(fm, '2nd_option'), 'fallback');
});

test('getField does not match nested child keys as top-level fields', () => {
  const fm = `metadata:
  version: 2.0.0
  name: inner-name
license: MIT`;

  assert.equal(getField(fm, 'name'), null);
  assert.equal(getField(fm, 'version'), null);
  assert.equal(getField(fm, 'license'), 'MIT');
});

test('getNestedField extracts metadata fields', () => {
  const fm = `name: meta-test
metadata:
  trigger: ["jira epic", "crear epic"]
  scope: [global, project]
  version: "1.0.0"
  min_diff_lines: 15
  time_budget_sec: 300
  critical_markers: ["security", "auth"]
license: MIT`;

  assert.equal(getNestedField(fm, 'metadata', 'version'), '1.0.0');
  assert.equal(getNestedField(fm, 'metadata', 'min_diff_lines'), '15');
  assert.equal(getNestedField(fm, 'metadata', 'time_budget_sec'), '300');
  assert.equal(getNestedField(fm, 'metadata.version'), '1.0.0');
  assert.equal(getNestedField(fm, 'metadata', 'non_existent'), null);
  assert.equal(getNestedField(fm, 'missing_parent', 'field'), null);
});

test('parseList parses YAML bulleted lists, inline JSON arrays, and comma-separated lists', () => {
  // YAML bulleted
  const yamlList = `
  - "first item"
  - 'second item'
  - third item
`;
  assert.deepEqual(parseList(yamlList), ['first item', 'second item', 'third item']);

  // Inline JSON array
  assert.deepEqual(parseList('["alpha", "beta", "gamma"]'), ['alpha', 'beta', 'gamma']);

  // Unquoted brackets
  assert.deepEqual(parseList('[alpha, beta, gamma]'), ['alpha', 'beta', 'gamma']);

  // Comma-separated string
  assert.deepEqual(parseList('alpha, beta, gamma'), ['alpha', 'beta', 'gamma']);

  // Single item
  assert.deepEqual(parseList('single-item'), ['single-item']);

  // Empty / null
  assert.deepEqual(parseList(''), []);
  assert.deepEqual(parseList(null), []);
  assert.deepEqual(parseList([]), []);
});

test('parseTriggers extracts triggers from various frontmatter shapes', () => {
  // 1. Top-level inline array
  const fm1 = `name: s1\ntrigger: ["add auth", "oauth login"]`;
  assert.deepEqual(parseTriggers(fm1), ['add auth', 'oauth login']);

  // 2. Nested under metadata
  const fm2 = `name: s2\nmetadata:\n  trigger: ["deploy app", "production release"]`;
  assert.deepEqual(parseTriggers(fm2), ['deploy app', 'production release']);

  // 3. YAML bulleted list under metadata
  const fm3 = `name: s3\nmetadata:\n  trigger:\n    - "first trigger"\n    - second trigger\n  version: 1.0.0`;
  assert.deepEqual(parseTriggers(fm3), ['first trigger', 'second trigger']);

  // 4. No triggers
  const fm4 = `name: s4\nlicense: MIT`;
  assert.deepEqual(parseTriggers(fm4), []);
});
