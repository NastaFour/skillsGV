import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = resolve(import.meta.dirname, "..");
const SCRIPT = resolve(ROOT, "04-backend/backend-driven/scripts/verify-backend-gates.mjs");
const ROUTER = resolve(ROOT, "00-meta-skills/skill-router/scripts/skill-router.mjs");

function runScript(args = [], cwd = ROOT) {
  return spawnSync(process.execPath, [SCRIPT, ...args], {
    cwd,
    encoding: "utf8",
    timeout: 15000,
  });
}

test("verify-backend-gates.mjs has zero _shared imports and supports --help", () => {
  const src = readFileSync(SCRIPT, "utf8");
  assert.doesNotMatch(src, /from\s+['"][^'"]*_shared/, "standalone runner must not import _shared");
  const res = runScript(["--help"]);
  assert.equal(res.status, 0);
  assert.match(res.stdout, /--srcDir/);
  assert.match(res.stdout, /--strict/);
});

test("clean backend project passes verify-backend-gates with zero errors and warnings", () => {
  const tmp = mkdtempSync(join(tmpdir(), "backend-gates-clean-"));
  const srcDir = join(tmp, "src");
  mkdirSync(srcDir, { recursive: true });
  writeFileSync(
    join(tmp, "package.json"),
    JSON.stringify({ name: "clean-api", dependencies: { express: "^4.19.0", zod: "^3.23.0", cors: "^2.8.5" } }),
  );
  writeFileSync(
    join(srcDir, "app.ts"),
    [
      'import cors from "cors";',
      'import { z } from "zod";',
      'export function setup(app, db, logger) {',
      '  app.use(cors({ origin: ["https://app.example.com"], credentials: true }));',
      '  const CreateOrderSchema = z.object({ total: z.number().positive() });',
      '  app.post("/orders", async (req, res) => {',
      '    try {',
      '      const payload = CreateOrderSchema.parse(req.body);',
      '      const rows = await db.query("SELECT id, total FROM orders WHERE org_id = $1 LIMIT 20 OFFSET 0", [payload.total]);',
      '      return res.json({ data: rows });',
      '    } catch (err) {',
      '      logger.error(err);',
      '      return res.status(500).json({ error: "Internal error" });',
      '    }',
      '  });',
      '  app.get("/users", async (prisma) => {',
      '    return prisma.user.findMany({ take: 25, skip: 0 });',
      '  });',
      '  const secret = process.env.JWT_SECRET;',
      '  if (!secret) throw new Error("JWT_SECRET missing");',
      '}',
    ].join("\n"),
  );

  try {
    const res = runScript(["--srcDir", srcDir, "--rootDir", tmp, "--json"]);
    assert.equal(res.status, 0, res.stderr || res.stdout);
    const data = JSON.parse(res.stdout);
    assert.equal(data.ok, true);
    assert.equal(data.errors, 0, JSON.stringify(data.issues));
    assert.equal(data.warnings, 0, JSON.stringify(data.issues));
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("detects all 6 built-in deterministic backend anti-patterns", () => {
  const tmp = mkdtempSync(join(tmpdir(), "backend-gates-buggy-"));
  const srcDir = join(tmp, "src");
  mkdirSync(srcDir, { recursive: true });
  writeFileSync(
    join(srcDir, "bad.routes.ts"),
    [
      'import cors from "cors";',
      'const JWT_SECRET = process.env.JWT_SECRET || "super-dev-secret";',
      'export function badRoutes(app, pool, prisma) {',
      '  app.use(cors({ origin: "*", credentials: true }));',
      '  app.get("/user", async (req, res) => {',
      '    const r = await pool.query(`SELECT * FROM users WHERE id = ${req.query.id}`);',
      '    return res.json(r.rows);',
      '  });',
      '  app.post("/items", async (req, res) => {',
      '    const title = req.body.title;',
      '    const items = await prisma.item.findMany({});',
      '    try {',
      '      return res.json({ title, items, secretLen: JWT_SECRET.length });',
      '    } catch (err) {}',
      '  });',
      '}',
    ].join("\n"),
  );

  try {
    const res = runScript(["--srcDir", srcDir, "--rootDir", tmp, "--json"]);
    assert.equal(res.status, 1);
    const data = JSON.parse(res.stdout);
    const checks = new Set(data.issues.map((i) => i.check));
    for (const expected of [
      "raw-sql-interpolation",
      "hardcoded-secret-fallback",
      "unsafe-cors-wildcard-credentials",
      "empty-catch-block",
      "unvalidated-mutation-body",
      "unbounded-list-query",
    ]) {
      assert.equal(checks.has(expected), true, `Missing expected check ${expected}; got ${[...checks].join(", ")}`);
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("--strict escalates warning-only backend issues to failure exit code 1", () => {
  const tmp = mkdtempSync(join(tmpdir(), "backend-gates-strict-"));
  const srcDir = join(tmp, "src");
  mkdirSync(srcDir, { recursive: true });
  writeFileSync(
    join(srcDir, "warn.ts"),
    [
      'export async function loadAll(prisma) {',
      '  try {',
      '    return await prisma.audit.findMany({});',
      '  } catch (err) { /* swallowed */ }',
      '}',
    ].join("\n"),
  );

  try {
    const normalRes = runScript(["--srcDir", srcDir, "--rootDir", tmp, "--json"]);
    assert.equal(normalRes.status, 0);
    const normalData = JSON.parse(normalRes.stdout);
    assert.ok(normalData.warnings >= 1);

    const strictRes = runScript(["--srcDir", srcDir, "--rootDir", tmp, "--strict", "--json"]);
    assert.equal(strictRes.status, 1);
    const strictData = JSON.parse(strictRes.stdout);
    assert.equal(strictData.ok, false);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test("skill-router routes backend queries to backend-driven with isBackendTask=true", () => {
  const res = spawnSync(
    process.execPath,
    [
      ROUTER,
      "--query",
      "Implementa endpoints Express con JWT, rate limiting y Postgres para reservas",
      "--json",
    ],
    { cwd: ROOT, encoding: "utf8", timeout: 15000 },
  );
  assert.equal(res.status, 0, res.stderr);
  const parsed = JSON.parse(res.stdout);
  assert.equal(parsed.isBackendTask, true);
  const names = parsed.tier1toLoad || [];
  assert.ok(names.includes("backend-driven"), `Expected backend-driven in ${names.join(", ")}`);
});

test("verify-backend-gates chains sibling 04-backend checkers and fails closed on sibling errors", () => {
  const tmp = mkdtempSync(join(tmpdir(), "backend-gates-sibling-"));
  const srcDir = join(tmp, "src");
  mkdirSync(srcDir, { recursive: true });
  writeFileSync(
    join(srcDir, "user.routes.ts"),
    [
      "export function userRoutes(router, prisma) {",
      '  router.get("/users/:id", async (req, res) => {',
      "    const u = await prisma.user.findUnique({",
      "      where: { userId: req.params.id },",
      "    });",
      "    return res.json({ data: u });",
      "  });",
      "}",
    ].join("\n"),
  );

  try {
    const res = runScript(["--srcDir", srcDir, "--rootDir", tmp, "--json"]);
    assert.equal(res.status, 1, "sibling id-mismatch error must fail verify-backend-gates");
    const data = JSON.parse(res.stdout);
    assert.equal(data.ok, false);
    assert.ok(data.issues.some((i) => i.check === "id-mismatch" && i.source === "api-response-normalizer"));
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
