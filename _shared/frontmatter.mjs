/**
 * _shared/frontmatter.mjs — Single shared YAML frontmatter parser for skills catalog.
 *
 * Provides robust extraction of frontmatter, top-level and nested fields,
 * folded/literal block scalars, and trigger/list parsing across tooling:
 * - skill-router
 * - skill-validator (validate-skills)
 * - catalog-manifest
 * - skills-loader
 */

/**
 * Extracts raw frontmatter string between opening ^---\r?\n and closing \r?\n---.
 * Returns null if missing or malformed.
 * @param {string} content
 * @returns {string | null}
 */
export function parseFrontmatter(content) {
  if (typeof content !== 'string') return null;
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/);
  return m ? m[1] : null;
}

/**
 * Splits markdown content into frontmatter string and body string.
 * Returns null if frontmatter delimiters are missing or malformed.
 * @param {string} content
 * @returns {{ front: string, body: string } | null}
 */
export function splitFrontmatter(content) {
  if (typeof content !== 'string') return null;
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n([\s\S]*))?$/);
  if (!m) return null;
  return { front: m[1], body: m[2] ?? '' };
}

/**
 * Normalizes frontmatter input (string or { front: string }).
 * @param {string | { front: string } | null | undefined} fm
 * @returns {string | null}
 */
function toFmString(fm) {
  if (!fm) return null;
  if (typeof fm === 'object' && 'front' in fm && typeof fm.front === 'string') {
    return fm.front;
  }
  return typeof fm === 'string' ? fm : String(fm);
}

/**
 * Unwraps outer quotes ("..." or '...').
 * @param {string} s
 * @returns {string}
 */
function unwrapQuotes(s) {
  const trimmed = s.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

/**
 * Extracts a top-level field value from frontmatter.
 * Supports:
 * - Key lookahead: stops at next top-level key or end / closing delimiter
 * - Folded (>) and literal (|) block scalars
 * - Quoted string unwrapping
 * - Does not match indented child keys
 *
 * @param {string | { front: string }} fm
 * @param {string} field
 * @returns {string | null}
 */
export function getField(fm, field) {
  const front = toFmString(fm);
  if (!front || !field) return null;

  const escapedField = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Match key anchored at column 0
  const keyRe = new RegExp(`^${escapedField}:[ \\t]*(.*)$`, 'm');
  const keyMatch = front.match(keyRe);
  if (!keyMatch) return null;

  const sameLineVal = keyMatch[1].trim();
  const afterKey = front.slice(keyMatch.index + keyMatch[0].length);

  // Block scalar on next lines (> folded or | literal)
  if (sameLineVal.startsWith('>') || sameLineVal.startsWith('|')) {
    const isFolded = sameLineVal.startsWith('>');
    const isLiteral = sameLineVal.startsWith('|');
    const lines = afterKey.split(/\r?\n/);
    const parts = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (i === 0 && line === '') continue; // immediate newline after key
      if (line.trim() === '') {
        if (isLiteral) parts.push('');
        continue;
      }
      // Stop at next top-level key (column 0) or closing delimiter
      if (/^[A-Za-z0-9_-]+:/.test(line) || /^---$/.test(line.trim())) break;
      if (/^\s/.test(line)) {
        parts.push(line.trim());
      } else {
        break;
      }
    }
    return (isFolded ? parts.join(' ') : parts.join('\n')).trim();
  }

  // Key has empty value on its own line (e.g. block list or multiline block)
  if (sameLineVal === '') {
    const lines = afterKey.split(/\r?\n/);
    const parts = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (i === 0 && line === '') continue;
      if (line.trim() === '') {
        parts.push('');
        continue;
      }
      if (/^[A-Za-z0-9_-]+:/.test(line) || /^---$/.test(line.trim())) break;
      if (/^\s/.test(line)) {
        parts.push(line);
      } else {
        break;
      }
    }
    return parts.length > 0 ? parts.join('\n').trim() : '';
  }

  // Key has value on same line; check for indented multiline continuation
  const lines = afterKey.split(/\r?\n/);
  const continuation = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i === 0 && line === '') continue;
    if (line.trim() === '') continue;
    if (/^[A-Za-z0-9_-]+:/.test(line) || /^---$/.test(line.trim())) break;
    if (/^\s/.test(line)) {
      continuation.push(line.trim());
    } else {
      break;
    }
  }

  let finalVal = sameLineVal;
  if (continuation.length > 0) {
    finalVal = `${sameLineVal} ${continuation.join(' ')}`;
  }
  return unwrapQuotes(finalVal);
}

/**
 * Extracts a nested field value (e.g. metadata.trigger, metadata.version).
 *
 * @param {string | { front: string }} fm
 * @param {string} parent - e.g. "metadata" or "metadata.trigger" if child omitted
 * @param {string} [child] - e.g. "trigger"
 * @returns {string | null}
 */
export function getNestedField(fm, parent, child) {
  const front = toFmString(fm);
  if (!front || !parent) return null;

  if (!child && typeof parent === 'string' && parent.includes('.')) {
    const parts = parent.split('.');
    parent = parts[0];
    child = parts[1];
  }
  if (!child) return null;

  const escapedParent = parent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedChild = child.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Match parent key at column 0
  const startRe = new RegExp(`^${escapedParent}:[ \\t]*(.*)$`, 'm');
  const startMatch = front.match(startRe);
  if (!startMatch) return null;

  const afterParent = front.slice(startMatch.index + startMatch[0].length);
  const parentLines = afterParent.split(/\r?\n/);
  const blockLines = [];
  for (let i = 0; i < parentLines.length; i++) {
    const line = parentLines[i];
    if (i === 0 && line === '') continue;
    if (line.trim() === '') {
      blockLines.push(line);
      continue;
    }
    // Stop at the first column-0 line (next top-level key or closing delimiter)
    if (!/^\s/.test(line)) break;
    blockLines.push(line);
  }
  const block = blockLines.join('\n');

  // Find child line inside block
  const childRe = new RegExp(`^([ \\t]+)${escapedChild}:[ \\t]*(.*)$`, 'm');
  const childMatch = block.match(childRe);
  if (!childMatch) return null;

  const childIndent = childMatch[1].length;
  const sameLineVal = childMatch[2].trim();
  const afterChild = block.slice(childMatch.index + childMatch[0].length);

  // Scalar (> or |)
  if (sameLineVal.startsWith('>') || sameLineVal.startsWith('|')) {
    const isFolded = sameLineVal.startsWith('>');
    const isLiteral = sameLineVal.startsWith('|');
    const lines = afterChild.split(/\r?\n/);
    const parts = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (i === 0 && line === '') continue;
      if (line.trim() === '') {
        if (isLiteral) parts.push('');
        continue;
      }
      // Sibling key check: indentation <= childIndent and matches key:
      const indentMatch = line.match(/^(\s+)/);
      if (indentMatch && indentMatch[1].length <= childIndent && /^\s*[A-Za-z0-9_-]+:/.test(line)) break;
      if (/^\s/.test(line)) {
        parts.push(line.trim());
      } else {
        break;
      }
    }
    return (isFolded ? parts.join(' ') : parts.join('\n')).trim();
  }

  // Child key has empty value on same line (e.g. bulleted list or multiline)
  if (sameLineVal === '') {
    const lines = afterChild.split(/\r?\n/);
    const parts = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (i === 0 && line === '') continue;
      if (line.trim() === '') {
        parts.push('');
        continue;
      }
      const indentMatch = line.match(/^(\s+)/);
      if (indentMatch && indentMatch[1].length <= childIndent && /^\s*[A-Za-z0-9_-]+:/.test(line)) break;
      if (/^\s/.test(line)) {
        parts.push(line);
      } else {
        break;
      }
    }
    return parts.length > 0 ? parts.join('\n').trim() : '';
  }

  // Child key has value on same line
  const lines = afterChild.split(/\r?\n/);
  const continuation = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i === 0 && line === '') continue;
    if (line.trim() === '') continue;
    const indentMatch = line.match(/^(\s+)/);
    if (indentMatch && indentMatch[1].length <= childIndent && /^\s*[A-Za-z0-9_-]+:/.test(line)) break;
    if (indentMatch && indentMatch[1].length > childIndent) {
      continuation.push(line.trim());
    } else {
      break;
    }
  }

  let finalVal = sameLineVal;
  if (continuation.length > 0) {
    finalVal = `${sameLineVal} ${continuation.join(' ')}`;
  }
  return unwrapQuotes(finalVal);
}

/**
 * Robustly parses a list from YAML bulleted list, JSON inline array,
 * unquoted bracket list, or comma-separated string.
 *
 * @param {any} raw
 * @returns {string[]}
 */
export function parseList(raw) {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw.map(String).map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
  }
  const str = String(raw).trim();
  if (!str) return [];

  // YAML bulleted list: lines starting with "- "
  if (/^\s*-\s+/m.test(str)) {
    const items = [];
    for (const line of str.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (trimmed.startsWith('-')) {
        const item = trimmed.replace(/^-\s*/, '').trim().replace(/^["']|["']$/g, '');
        if (item) items.push(item);
      }
    }
    if (items.length > 0) return items;
  }

  // Inline array: e.g. ["a", "b"] or [a, b]
  if (str.startsWith('[') && str.endsWith(']')) {
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) {
        return parsed.map(String).map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
      }
    } catch {
      const inner = str.slice(1, -1).trim();
      if (!inner) return [];
      return inner.split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    }
  }

  // Comma-separated list: "a, b, c"
  if (str.includes(',')) {
    return str.split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
  }

  // Single item
  const single = str.replace(/^["']|["']$/g, '').trim();
  return single ? [single] : [];
}

/**
 * Extracts and parses triggers from frontmatter.
 * Checks top-level `trigger`, `triggers`, and nested `metadata.trigger`, `metadata.triggers`.
 *
 * @param {string | { front: string }} fm
 * @returns {string[]}
 */
export function parseTriggers(fm) {
  if (!fm) return [];
  const raw =
    getField(fm, 'trigger') ||
    getField(fm, 'triggers') ||
    getNestedField(fm, 'metadata', 'trigger') ||
    getNestedField(fm, 'metadata', 'triggers');
  return parseList(raw);
}
