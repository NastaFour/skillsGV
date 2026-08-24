#!/usr/bin/env node
/**
 * apply-journal.test.mjs — concurrency tests for orphan-lock recovery (L3).
 *
 * Regression target: the naive "check stale -> unlink" recovery had a TOCTOU
 * race where two concurrent openers both passed the staleness check and each
 * unlinked the OTHER's freshly created lock, ending in double ownership.
 * The fix uses an atomic rename-steal verified against the token written
 * inside the lock at creation.
 *
 * Run: node --test 00-meta-skills/sdd-apply/scripts/apply-journal.test.mjs
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const SCRIPT = join(__dirname, "apply-journal.mjs");

let seq = 0;
function makeScratch() {
  const root = join(tmpdir(), `apply-journal-test-${process.pid}-${Date.now()}-${seq++}`);
  const dir = join(root, "journal");
  mkdirSync(dir, { recursive: true });
  return { root, dir, lockPath: join(dir, "journal.lock"), eventsPath: join(dir, "events.jsonl") };
}

/** Plant a lock file whose mtime looks older than any sane stale timeout. */
function plantOrphan(dir, lockPath, content) {
  writeFileSync(lockPath, content, "utf8");
  const old = new Date(Date.now() - 60_000);
  utimesSync(lockPath, old, old);
}

function runJournal(args, cwd) {
  return new Promise((resolveSpawn) => {
    const child = spawn(process.execPath, [SCRIPT, ...args], { cwd, shell: false });
    let stderr = "";
    child.stderr.on("data", (d) => (stderr += d));
    child.on("close", (code) => resolveSpawn({ code, stderr }));
  });
}

function recordedEvents(eventsPath) {
  if (!existsSync(eventsPath)) return [];
  return readFileSync(eventsPath, "utf8")
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => JSON.parse(line))
    .filter((ev) => ev.type === "unit-recorded" && ev.unitId === "U1");
}

test("two concurrent recoverers of one stale orphan lock: exactly one wins", async () => {
  const ROUNDS = 5;
  for (let round = 0; round < ROUNDS; round++) {
    const s = makeScratch();
    try {
      plantOrphan(
        s.dir,
        s.lockPath,
        JSON.stringify({ pid: 999999, ts: "2026-01-01T00:00:00.000Z", host: "dead-host", token: `stale-token-${round}` })
      );
      // Launch two recoverers at the same instant, no wait budget: each must
      // either win cleanly (exit 0) or lose as contention (exit 3). Exactly
      // one 'unit-recorded' event may ever exist afterwards.
      const children = [0, 1].map((i) =>
        runJournal(
          ["record", "--change", "race", "--unit", "U1", "--journal-dir", s.dir, "--stale-timeout", "1000"],
          s.root
        )
      );
      const results = await Promise.all(children);
      for (const r of results) {
        assert.ok([0, 3].includes(r.code), `round ${round}: unexpected exit ${r.code}: ${r.stderr}`);
      }
      assert.ok(results.some((r) => r.code === 0), `round ${round}: nobody recorded the unit`);
      const events = recordedEvents(s.eventsPath);
      assert.equal(events.length, 1, `round ${round}: double ownership detected (${events.length} unit-recorded events)`);
      // The journal must remain fully verifiable after the race.
      const verify = await runJournal(["verify", "--change", "race", "--journal-dir", s.dir], s.root);
      assert.equal(verify.code, 0, `round ${round}: verify failed: ${verify.stderr}`);
    } finally {
      rmSync(s.root, { recursive: true, force: true });
    }
  }
});

test("a FRESH lock held by a live writer is never recovered", async () => {
  const s = makeScratch();
  try {
    const freshToken = "fresh-live-writer-token";
    writeFileSync(s.lockPath, JSON.stringify({ pid: process.pid, ts: new Date().toISOString(), host: "live", token: freshToken }), "utf8");
    const r = await runJournal(
      ["record", "--change", "race", "--unit", "U1", "--journal-dir", s.dir, "--stale-timeout", "60000"],
      s.root
    );
    assert.equal(r.code, 3, `expected busy exit 3, got ${r.code}: ${r.stderr}`);
    assert.ok(readFileSync(s.lockPath, "utf8").includes(freshToken), "fresh lock must stay untouched");
    assert.equal(recordedEvents(s.eventsPath).length, 0, "no event may be appended while another writer holds the lock");
  } finally {
    rmSync(s.root, { recursive: true, force: true });
  }
});

test("an unparseable stale orphan fails closed instead of being blindly removed", async () => {
  const s = makeScratch();
  try {
    plantOrphan(s.dir, s.lockPath, "{corrupted-not-json");
    const r = await runJournal(
      ["record", "--change", "race", "--unit", "U1", "--journal-dir", s.dir, "--stale-timeout", "1000"],
      s.root
    );
    assert.equal(r.code, 3, `expected fail-closed exit 3, got ${r.code}: ${r.stderr}`);
    assert.ok(existsSync(s.lockPath), "unverifiable orphan must not be deleted automatically");
    assert.match(r.stderr, /token/);
  } finally {
    rmSync(s.root, { recursive: true, force: true });
  }
});
