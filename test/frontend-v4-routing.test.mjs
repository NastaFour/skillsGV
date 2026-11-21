/**
 * test/frontend-v4-routing.test.mjs — Bilingual (EN + ES) natural-language routing tests
 * for situational frontend skills, UI slot-starvation fix, and pure backend classification.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const ROUTER_CLI = join(REPO_ROOT, "00-meta-skills", "skill-router", "scripts", "skill-router.mjs");

function runRouter(query) {
  const stdout = execFileSync(process.execPath, [ROUTER_CLI, "--query", query, "--json"], {
    cwd: REPO_ROOT,
    encoding: "utf8",
  });
  return JSON.parse(stdout);
}

const SITUATIONAL_CASES = [
  // refactoring-ui
  { query: "improve visual hierarchy and spacing scale on this dashboard", expected: "refactoring-ui" },
  { query: "clean up ui polish with layered shadows on cards", expected: "refactoring-ui" },
  { query: "mejorar la jerarquia visual y contraste sutil del panel", expected: "refactoring-ui" },
  // three-js-web
  { query: "build an interactive 3d product showcase with webgl", expected: "three-js-web" },
  { query: "render a 3D model viewer using R3F on the landing", expected: "three-js-web" },
  { query: "crear una escena 3d interactiva en la pagina principal", expected: "three-js-web" },
  // motion-gsap
  { query: "add scroll trigger pinning and scrub timeline to the hero", expected: "motion-gsap" },
  { query: "animacion al hacer scroll con timeline complejo en landing", expected: "motion-gsap" },
  { query: "sequence an svg morph and text reveal animation", expected: "motion-gsap" },
  // scroll-world-storytelling
  { query: "design a scroll storytelling narrative landing page", expected: "scroll-world-storytelling" },
  { query: "crear una historia interactiva con animacion por scroll", expected: "scroll-world-storytelling" },
  { query: "apple scroll effect with 3d diorama frames", expected: "scroll-world-storytelling" },
  // frontend-slides-deck
  { query: "create an interactive pitch deck as html presentation slides", expected: "frontend-slides-deck" },
  { query: "armar una presentacion web con diapositivas sin dependencias", expected: "frontend-slides-deck" },
  { query: "draw an editorial architecture diagram in svg", expected: "frontend-slides-deck" },
  // ai-design-check-stageshow
  { query: "run a visual polish layout audit on this frontend page", expected: "ai-design-check-stageshow" },
  { query: "hacer ui critique y revisar diseño antes de entregar", expected: "ai-design-check-stageshow" },
  // web-animation-sources
  { query: "find animation inspiration and wow animation ideas for hero", expected: "web-animation-sources" },
  { query: "buscar efectos interactivos de hover y transiciones de entrada", expected: "web-animation-sources" },
  // Multi-skill UI query must NOT starve situational skills when design-driven is injected
  { query: "build a landing hero with scroll trigger pinning and 3D scene", expected: "three-js-web" },
];

test("bilingual natural-language UI prompts achieve >= 90% recall in tier1toLoad without slot starvation", () => {
  let hits = 0;
  const misses = [];
  for (const c of SITUATIONAL_CASES) {
    const res = runRouter(c.query);
    if (res.tier1toLoad.includes(c.expected)) {
      hits++;
    } else {
      misses.push({ query: c.query, expected: c.expected, got: res.tier1toLoad, primary: res.primary });
    }
  }
  const recall = hits / SITUATIONAL_CASES.length;
  assert.ok(
    recall >= 0.9,
    `Expected >= 90% recall across ${SITUATIONAL_CASES.length} situational UI queries, got ${(recall * 100).toFixed(1)}% (${hits}/${SITUATIONAL_CASES.length}). Misses: ${JSON.stringify(misses, null, 2)}`
  );
});

test("multi-capability UI prompt retains both situational skills alongside design-driven", () => {
  const res = runRouter("landing page con scroll trigger y escena 3d interactiva en hero");
  assert.equal(res.isUiTask, true);
  assert.ok(res.tier1toLoad.includes("design-driven"), `missing design-driven in ${JSON.stringify(res.tier1toLoad)}`);
  assert.ok(res.tier1toLoad.includes("motion-gsap"), `motion-gsap starved out of ${JSON.stringify(res.tier1toLoad)}`);
  assert.ok(res.tier1toLoad.includes("three-js-web"), `three-js-web starved out of ${JSON.stringify(res.tier1toLoad)}`);
  assert.ok(res.tier1toLoad.length <= 5, `tier1toLoad exceeded 5-skill cap: ${res.tier1toLoad.length}`);
});

test("pure backend prompts have zero UI false positives and set isBackendTask = true", () => {
  const backendQueries = [
    "database migration postgres schema indexes",
    "express middleware jwt authentication endpoint",
    "rate limit and prisma transaction for backend api",
    "definir interfaces typescript y resolver graphql en backend",
  ];
  for (const q of backendQueries) {
    const res = runRouter(q);
    assert.equal(res.isUiTask, false, `UI false positive on backend query "${q}"`);
    assert.equal(res.isBackendTask, true, `Expected isBackendTask=true on "${q}", got ${JSON.stringify(res)}`);
  }
});
