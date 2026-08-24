#!/usr/bin/env node
/**
 * apply-journal.mjs — Durable apply-progress journal (slice-2 E3 / design A7).
 *
 * Source of truth for sdd-apply progress, one directory per change:
 *   <repo-root>/openspec/changes/<change>/journal/
 *     snapshot.json  {version:1, change, contractHash, units:{[id]:{status,evidence}}, lastSeq}
 *     events.jsonl   append-only {seq,type,unitId,payload,prevHash}, one unit per event;
 *                    every committed line ends with "\n" (an unterminated tail = interrupted write)
 *     journal.lock   exclusive lock (open flag "wx") holding {pid, ts, host}; an orphan lock
 *                    older than the stale timeout is recovered
 *
 * Invariants (kit E3, Node-only, Windows-first, no Bash):
 *   - Append-only: historical events are never rewritten. Every open re-verifies the
 *     prevHash chain over the raw stored bytes, so any mutation is rejected (exit 4).
 *   - Idempotent IDs: re-recording a completed unit is a no-op (no event, no snapshot
 *     mutation). The only legal transition is "interrupted-retry" -> "completed".
 *   - Crash safety: each event is appended and fsynced BEFORE the snapshot is replaced.
 *     On open, the whole log is re-folded into the canonical state; an unterminated tail
 *     line is discarded, its unit (when identifiable) marked "interrupted-retry" via a
 *     new event, and the file truncated back to the committed prefix. Confirmed units
 *     are always preserved.
 *   - Exclusive lock: a second writer either waits (--wait <ms>) or fails in a
 *     controlled way (exit 3); it never touches state without owning the lock.
 *
 * contractHash: sha256 of openspec/changes/<change>/tasks.md captured on first open;
 * it identifies which version of the task contract this journal tracks.
 *
 * Commands:
 *   record  --change <name> --unit <id> [--evidence <json>|@file]   register a unit (idempotent)
 *   status  --change <name> [--json]                                print consolidated state
 *   report  --change <name>                                         derive markdown apply-progress
 *   verify  --change <name>                                         check integrity, repairs nothing
 *
 * Common options:
 *   --repo-root <dir>      repository root (default: cwd)
 *   --journal-dir <dir>    override the whole journal directory (isolation/testing)
 *   --wait <ms>            wait up to ms for the lock instead of failing fast
 *   --stale-timeout <ms>   orphan-lock recovery threshold (default: 60000)
 *
 * Exit codes: 0 ok | 1 verify found issues | 2 usage/input error |
 *             3 lock busy with no wait budget left | 4 journal corruption
 */
import { createHash } from "node:crypto";
import {
  closeSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync,
  renameSync, statSync, truncateSync, unlinkSync, writeFileSync, writeSync,
} from "node:fs";
import { hostname } from "node:os";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const SNAPSHOT_VERSION = 1;
export const GENESIS_HASH = "genesis";
const POLL_MS = 200;
const DEFAULT_STALE_MS = 60_000;

/** Typed failure: always released through openJournal's catch before exiting. */
class JournalError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

const sha256 = (text) => createHash("sha256").update(text, "utf8").digest("hex");
const nowIso = () => new Date().toISOString();
const sleepSync = (ms) => { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); };
const emit = (msg) => console.error(`apply-journal: ${msg}`);

// --- CLI -----------------------------------------------------------------
function parseArgs(argv) {
  const opts = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--repo-root") opts.repoRoot = argv[++i];
    else if (a === "--journal-dir") opts.journalDir = argv[++i];
    else if (a === "--change") opts.change = argv[++i];
    else if (a === "--unit") opts.unit = argv[++i];
    else if (a === "--evidence") opts.evidence = argv[++i];
    else if (a === "--wait") opts.waitMs = Number(argv[++i]);
    else if (a === "--stale-timeout") opts.staleMs = Number(argv[++i]);
    else if (a === "--json") opts.json = true;
    else if (a === "--help" || a === "-h") opts.help = true;
    else opts._.push(a);
  }
  return opts;
}

function usage() {
  return [
    "Usage: node apply-journal.mjs <command> [options]",
    "",
    "Commands:",
    "  record  --change <name> --unit <id> [--evidence <json>|@file]   register a work unit (idempotent)",
    "  status  --change <name> [--json]                                print consolidated state",
    "  report  --change <name>                                         derive markdown apply-progress",
    "  verify  --change <name>                                         check integrity, repair nothing",
    "",
    "Options: --repo-root <dir> | --journal-dir <dir> | --wait <ms> | --stale-timeout <ms>",
  ].join("\n");
}

export function resolvePaths(opts) {
  const repoRoot = opts.repoRoot ? resolve(opts.repoRoot) : process.cwd();
  const dir = opts.journalDir
    ? resolve(opts.journalDir)
    : join(repoRoot, "openspec", "changes", opts.change, "journal");
  return {
    dir,
    snapshotPath: join(dir, "snapshot.json"),
    eventsPath: join(dir, "events.jsonl"),
    lockPath: join(dir, "journal.lock"),
    tasksPath: join(repoRoot, "openspec", "changes", opts.change, "tasks.md"),
  };
}

// --- Exclusive lock ------------------------------------------------------
function isStaleLock(lockPath, staleMs) {
  try {
    return Date.now() - statSync(lockPath).mtimeMs > staleMs;
  } catch {
    return false;
  }
}

function acquireLock(paths, { waitMs = 0, staleMs = DEFAULT_STALE_MS } = {}) {
  const deadline = Date.now() + Math.max(0, waitMs);
  for (;;) {
    try {
      // Exclusive creation ("wx"): the second concurrent writer gets EEXIST.
      const fd = openSync(paths.lockPath, "wx");
      try {
        writeSync(fd, JSON.stringify({ pid: process.pid, ts: nowIso(), host: hostname() }));
        fsyncSync(fd);
      } finally {
        closeSync(fd);
      }
      return;
    } catch (err) {
      if (err.code !== "EEXIST") throw err;
      if (isStaleLock(paths.lockPath, staleMs)) {
        emit(`recovering orphan lock older than ${staleMs} ms: ${paths.lockPath}`);
        unlinkSync(paths.lockPath);
        continue;
      }
      if (Date.now() >= deadline) {
        throw new JournalError(3, `journal is locked by another writer: ${paths.lockPath} (use --wait <ms>)`);
      }
      sleepSync(POLL_MS);
    }
  }
}

function releaseLock(paths) {
  try {
    unlinkSync(paths.lockPath);
  } catch {
    /* lock already gone */
  }
}

// --- Event log (append-only, hash-chained over raw bytes) ----------------
function readCommittedEvents(eventsPath) {
  if (!existsSync(eventsPath)) {
    return { events: [], rawLines: [], committedBytes: 0, fragment: "", lastHash: GENESIS_HASH };
  }
  const raw = readFileSync(eventsPath, "utf8");
  const terminated = raw.endsWith("\n");
  const body = terminated ? raw.slice(0, -1) : raw;
  const parts = body === "" ? [] : body.split("\n");
  const tailCount = terminated ? 0 : 1;
  const committedParts = parts.slice(0, parts.length - tailCount);
  const fragment = tailCount ? parts[parts.length - 1] : "";
  const events = [];
  const rawLines = [];
  let committedBytes = 0;
  for (let i = 0; i < committedParts.length; i++) {
    const line = committedParts[i];
    committedBytes += Buffer.byteLength(line, "utf8") + 1;
    rawLines.push(line);
    let ev;
    try {
      ev = JSON.parse(line);
    } catch {
      throw new JournalError(4, `corrupt committed event at ${basename(eventsPath)}:${i + 1} — append-only history must not be edited; restore it from git`);
    }
    if (typeof ev.seq !== "number" || typeof ev.type !== "string") {
      throw new JournalError(4, `malformed event at ${basename(eventsPath)}:${i + 1}: missing seq/type`);
    }
    events.push(ev);
  }
  let expected = GENESIS_HASH;
  for (let i = 0; i < events.length; i++) {
    if (events[i].prevHash !== expected) {
      throw new JournalError(4, `hash chain broken at ${basename(eventsPath)}:${i + 1} — recorded history was mutated`);
    }
    expected = sha256(rawLines[i]);
  }
  return { events, rawLines, committedBytes, fragment, lastHash: expected };
}

function appendEvent(paths, state, { type, unitId, payload }, prevHashRef) {
  const ev = { seq: state.lastSeq + 1, type, unitId, payload, prevHash: prevHashRef.hash };
  const line = JSON.stringify(ev); // fixed key order: seq,type,unitId,payload,prevHash
  const fd = openSync(paths.eventsPath, "a");
  try {
    writeSync(fd, `${line}\n`); // the trailing newline is what marks the event committed
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  state.lastSeq = ev.seq;
  prevHashRef.hash = sha256(line);
}

function foldEvent(state, ev) {
  if (ev.type === "unit-recorded") {
    state.units[ev.unitId] = { status: ev.payload.status, evidence: ev.payload.evidence ?? null };
  } else if (ev.type === "unit-interrupted") {
    if (state.units[ev.unitId]?.status !== "completed") {
      state.units[ev.unitId] = { status: "interrupted-retry", evidence: null };
    }
  }
}

// --- Snapshot ------------------------------------------------------------
export function emptyState(change) {
  return { version: SNAPSHOT_VERSION, change, contractHash: null, units: {}, lastSeq: 0 };
}

export function loadSnapshot(snapshotPath) {
  if (!existsSync(snapshotPath)) return null;
  try {
    const snap = JSON.parse(readFileSync(snapshotPath, "utf8"));
    if (snap.version !== SNAPSHOT_VERSION) {
      throw new JournalError(4, `unsupported snapshot version ${snap.version} in ${snapshotPath}`);
    }
    return snap;
  } catch (err) {
    if (err instanceof JournalError) throw err;
    emit(`warning: unreadable snapshot (${err.message}); rebuilding from events`);
    return null;
  }
}

export function persistSnapshot(paths, state) {
  const tmp = `${paths.snapshotPath}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  renameSync(tmp, paths.snapshotPath); // atomic replace (MoveFileEx REPLACE_EXISTING)
}

const stableStringify = (value) => {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(",")}}`;
  }
  return JSON.stringify(value);
};

// --- Open / recover --------------------------------------------------------
/**
 * Acquires the exclusive lock and returns a live handle.
 * Canonical state is ALWAYS re-folded from the full event log (events are the
 * authoritative history; the snapshot is a cache of it).
 *   repair=true  recovers an interrupted tail and persists a stale/missing snapshot
 *   repair=false reports issues without writing anything (used by `verify`)
 */
export function openJournal(paths, opts = {}, { repair = true } = {}) {
  mkdirSync(paths.dir, { recursive: true });
  acquireLock(paths, opts);
  try {
    const { events, committedBytes, fragment, lastHash } = readCommittedEvents(paths.eventsPath);
    const prevHashRef = { hash: lastHash };

    // Canonical fold from the authoritative log.
    const state = emptyState(opts.change);
    for (const ev of events) {
      foldEvent(state, ev);
      state.lastSeq = Math.max(state.lastSeq, ev.seq);
    }

    const stored = loadSnapshot(paths.snapshotPath);
    if (!state.contractHash && existsSync(paths.tasksPath)) {
      state.contractHash = sha256(readFileSync(paths.tasksPath, "utf8"));
    }
    if (stored?.contractHash) state.contractHash = stored.contractHash;

    const issues = [];
    if (fragment !== "") {
      issues.push({ code: "interrupted-tail", detail: "events.jsonl ends with an unterminated line (interrupted write)" });
      if (repair) {
        truncateSync(paths.eventsPath, committedBytes); // back to the committed prefix
        emit(`discarded unterminated tail (${Buffer.byteLength(fragment, "utf8")} bytes); truncated to committed prefix`);
        const m = fragment.match(/"unitId"\s*:\s*"([^"]+)"/);
        if (m && state.units[m[1]]?.status !== "completed") {
          appendEvent(paths, state, {
            type: "unit-interrupted",
            unitId: m[1],
            payload: { reason: "unterminated-line-discarded", ts: nowIso() },
          }, prevHashRef);
          foldEvent(state, { type: "unit-interrupted", unitId: m[1], payload: {} });
          issues.push({ code: "unit-marked-interrupted", detail: m[1] });
        }
      }
    }

    if (repair) {
      const stale = !stored
        || stored.lastSeq !== state.lastSeq
        || stableStringify(stored.units) !== stableStringify(state.units);
      if (stale) persistSnapshot(paths, state);
    } else {
      if (!stored) issues.push({ code: "snapshot-missing", detail: "snapshot.json absent (rebuildable from events)" });
      if (stored && stored.lastSeq !== state.lastSeq) {
        issues.push({ code: "lastseq-mismatch", detail: `snapshot ${stored.lastSeq} vs events ${state.lastSeq}` });
      }
      if (stored && stableStringify(stored.units) !== stableStringify(state.units)) {
        issues.push({ code: "units-mismatch", detail: "snapshot units differ from the replayed event state" });
      }
    }

    return {
      state,
      issues,
      release: () => releaseLock(paths),
      /** Idempotent register: completed -> no-op; interrupted-retry -> legal retry. */
      record: (unitId, status = "completed", evidence = null) => {
        const existing = state.units[unitId];
        if (existing?.status === "completed") return { applied: false, reason: "already-completed" };
        if (existing && existing.status === status) return { applied: false, reason: "unchanged" };
        appendEvent(paths, state, {
          type: "unit-recorded",
          unitId,
          payload: { status, evidence: evidence ?? null, ts: nowIso() },
        }, prevHashRef);
        state.units[unitId] = { status, evidence: evidence ?? null };
        persistSnapshot(paths, state);
        return { applied: true };
      },
    };
  } catch (err) {
    releaseLock(paths);
    throw err;
  }
}

// --- Report (derived view) -------------------------------------------------
export function renderReport(state) {
  const ids = Object.keys(state.units).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const rows = ids.map((id) => {
    const u = state.units[id];
    const ev = u.evidence ? ` — \`${JSON.stringify(u.evidence)}\`` : "";
    return `| ${id} | ${u.status}${ev} |`;
  });
  return [
    `# Apply Progress (derivado del journal): ${state.change}`,
    "",
    `> Fuente de verdad: snapshot del journal (version ${state.version}, lastSeq ${state.lastSeq}, contractHash \`${(state.contractHash ?? "n/a").slice(0, 12)}\`).`,
    "",
    "| Unidad | Estado / evidencia |",
    "|---|---|",
    ...(ids.length ? rows : ["| (sin unidades registradas) | — |"]),
    "",
  ].join("\n");
}

// --- CLI -------------------------------------------------------------------
function parseEvidence(spec) {
  if (!spec) return null;
  const text = spec.startsWith("@") ? readFileSync(spec.slice(1), "utf8") : spec;
  try {
    const value = JSON.parse(text);
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      throw new Error("evidence must be a JSON object");
    }
    return value;
  } catch (err) {
    throw new JournalError(2, `invalid --evidence: ${err.message}`);
  }
}

function runCli() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log(usage());
    process.exitCode = 0;
    return;
  }
  const command = opts._[0];
  if (!command) throw new JournalError(2, `missing command\n\n${usage()}`);
  if (!["record", "status", "report", "verify"].includes(command)) {
    throw new JournalError(2, `unknown command '${command}'\n\n${usage()}`);
  }
  if (!opts.change) throw new JournalError(2, "--change <name> is required");
  if (command === "record" && !opts.unit) throw new JournalError(2, "--unit <id> is required");

  const paths = resolvePaths(opts);
  const handle = openJournal(paths, opts, { repair: command !== "verify" });
  try {
    if (command === "record") {
      const result = handle.record(opts.unit, "completed", parseEvidence(opts.evidence));
      console.log(JSON.stringify({ ok: true, command, unitId: opts.unit, ...result, lastSeq: handle.state.lastSeq }));
    } else if (command === "status") {
      if (opts.json) {
        console.log(JSON.stringify(handle.state, null, 2));
      } else {
        console.log(JSON.stringify({
          change: handle.state.change,
          lastSeq: handle.state.lastSeq,
          contractHash: handle.state.contractHash,
          units: Object.fromEntries(
            Object.keys(handle.state.units)
              .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
              .map((id) => [id, handle.state.units[id].status]),
          ),
        }, null, 2));
      }
    } else if (command === "report") {
      console.log(renderReport(handle.state));
    } else if (command === "verify") {
      for (const issue of handle.issues) emit(`${issue.code}: ${issue.detail}`);
      if (handle.issues.length) {
        console.log(JSON.stringify({ ok: false, issues: handle.issues }));
        process.exitCode = 1;
      } else {
        console.log(JSON.stringify({ ok: true, lastSeq: handle.state.lastSeq, units: Object.keys(handle.state.units).length }));
      }
    }
  } finally {
    handle.release();
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  try {
    runCli();
  } catch (err) {
    if (err instanceof JournalError) {
      console.error(`apply-journal: ${err.message}`);
      process.exit(err.code);
    }
    throw err;
  }
}
