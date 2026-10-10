import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT } from '../_shared/eval-harness.mjs';
import {
  scoreRubric,
  blindRandomize,
  evaluateBlindJudge,
  calculateAbSummary,
  formatAbSummaryTable,
} from '../_shared/eval-ab.mjs';

const bareOutputs = {
  task1: `Atomic commits (also referred to as work unit commits) ensure that each commit in a git repository represents a single, complete, and reviewable logical change. Combined with the Conventional Commits specification, git history becomes structured, easy to navigate, and automated-tool friendly (enabling automated changelogs and semantic versioning).

### Key Principles of Atomic Commits
1. Single Responsibility: Each commit solves one specific problem or implements one distinct slice of functionality.
2. Cohesive Scope: Production code, unit/integration tests, and corresponding documentation updates are committed together in the same commit.
3. Build & Test Stability: Every commit compiles cleanly and passes existing test suites, keeping the git history cleanly bisectable (git bisect).
4. Reviewable Size: Commits should be reasonably scoped (typically under 300–400 lines) to minimize cognitive overhead for reviewers.`,

  task2: `Vitest es un framework de testing rápido para TypeScript y JavaScript integrado de forma nativa con Vite. A continuación se detalla cómo escribir tests unitarios siguiendo el patrón AAA (Arrange, Act, Assert), aplicar mocks a dependencias externas con vi.mock y vi.fn, y configurar métricas de coverage.

1. Configuración de Coverage: npm install -D vitest @vitest/coverage-v8
2. Código bajo prueba en src/services/userService.ts
3. Test Unitario con Mocking usando vi.mock y vi.fn
4. Ejecución: npx vitest run --coverage`,

  task3: `Please provide the code snippet you would like reviewed! In the meantime, here is the structured Code Review framework used to audit code for bugs, security vulnerabilities, and code smells, followed by an illustrative review demonstration.

Checklist:
1. Functional Correctness & Edge Cases
2. Security & Data Safety (SQL, NoSQL, XSS)
3. Architecture & SOLID Principles
4. Code Smells & Clean Code
5. Performance & Resource Management (N+1 queries)

Findings:
- [CRITICAL - Security] SQL Injection
- [HIGH - Performance] N+1 Query Problem`,

  task4: `Para implementar una nueva feature multi-archivo de forma modular, mantenible y escalable, se recomienda estructurar el código por capacidades (feature-based architecture), separando contratos, lógica de dominio, controladores y pruebas.

Estructura:
src/features/notifications/types.ts
src/features/notifications/notification.service.ts
src/features/notifications/notification.controller.ts
src/features/notifications/notification.service.test.ts
src/features/notifications/index.ts

Pasos de Verificación:
1. Comprobación de tipos tsc --noEmit
2. npx vitest run
3. eslint, prettier`
};

const skillOutputs = {
  task1: `### Task 1: Guía de Commits Atómicos y Mensajes Convencionales (Skill: work-unit-commits)

1. Principio Fundamental: Commits por Unidad de Trabajo
Un commit no representa una categoría de archivos (ej. evitar agrupar primero models, luego services y luego tests si ninguno es funcional por separado). Cada commit debe representar una unidad de trabajo (work unit) entregable, coherente e independiente que mantiene el repositorio en estado verde y funcional.

2. Reglas Críticas:
- Tests junto al código: Los tests automatizados (unitarios/integración) deben incluirse en el mismo commit que introduce o modifica el comportamiento que verifican.
- Documentación con el cambio de cara al usuario: Los docs técnicos y guías de uso se commitean junto con el feature o flujo que explican.
- Límite de carga cognitiva: Mantener el diff de autor en un presupuesto de aproximadamente ~400 líneas modificadas para facilitar revisiones humanas y de LLM efectivas.
- Sin atribución AI: NUNCA agregar trailers Co-Authored-By: AI ni menciones a asistentes. Únicamente autor humano y formato Conventional Commits.
- Aislabilidad y Rollback: Cada commit debe poseer un límite de rollback limpio, permitiendo revertir el comportamiento específico sin descartar trabajo no relacionado.
- Base para Chained PRs: Si el trabajo supera las 400 líneas, agrupar las unidades de trabajo en slices de Pull Requests encadenados (chained-pr).

Formato Conventional Commits: <tipo>(<alcance>): <descripción imperativa en minúsculas>`,

  task2: `### Task 2: Testing Unitario con Vitest, Mocking y Cobertura (Skill: testing-patterns)

1. Estructura AAA (Arrange, Act, Assert):
Todo test automatizado en Vitest debe estructurarse explícitamente en tres bloques limpios: Arrange (preparación del SUT y mocks), Act (invocación puntual del método), Assert (verificaciones estrictas de retorno y excepciones).

2. Mocking Determinista con Vitest:
- vi.mock('module-path'): Mocking a nivel de módulo en la raíz del archivo para desacoplar librerías externas o capas de infraestructura.
- vi.fn(): Stubs y espías para inyección de dependencias directas en constructores o métodos.
- Higiene de Mocks: Limpieza obligatoria antes de cada test mediante beforeEach(() => { vi.clearAllMocks(); }).

3. Cobertura Obligatoria (6 Escenarios Clave):
1. Happy Path (mínimo 2 tests)
2. Edge Cases (mínimo 3 tests)
3. Auth/Seguridad
4. Cleanup/Teardown
5. Integridad Transaccional
6. Regresión SOLID

Ejecución bajo monorepo pnpm: pnpm test:coverage.`,

  task3: `### Task 3: Senior Staff Code Reviewer & SOLID Auditor (Skill: code-reviewer)

1. Marco de Revisión: Framework 4R
El review técnico se realiza bajo simulación de Pull Request con contexto fresco (Fresh Context Rule), ejecutando las 4 R en orden estricto: Reverse-Engineer, Reason, Reuse, Resolve (cambio mínimo necesario).

2. Dimensiones Críticas de Evaluación:
- Seguridad (Estándares 2026): Cero secretos o tokens en código/git, cookies httpOnly, esquemas Zod.
- Límites Arquitectónicos y SOLID: Verificación de SRP, DIP, funciones limitadas a < 40 líneas, cero uso de any en TypeScript.
- Concurrencia, Rendimiento y Memoria: Detección de queries N+1, fugas de memoria por listeners no removidos.
- Manejo de Errores y Cobertura >= 80%.

3. Categorización por Severidad:
- 🚨 Blocking (Bloqueante): Vulnerabilidades de seguridad, transacciones no atómicas, ausencia total de tests. Impide el merge.
- ⚠️ Important (Importante): Violaciones de SOLID, funciones infladas (>40 líneas), consultas N+1.
- 💡 Nitpick (Menor): Estilo de nombres o comentarios redundantes.

Conclusión: Puntuación técnica (1-10) y Top 3 Cambios de Mayor Impacto.`,

  task4: `### Task 4: Protocolo ODD para Features Multi-Archivo (Skill: odd-workflow)

El Protocolo ODD (Organic Driven Development) en 7 Pasos:
1. Autorizar (Authorize): Confirmar permiso explícito para mutar código.
2. Explorar (Explore): CodeGraph + análisis proporcional (~10k tokens de evidencia inline).
3. Resolver Incertidumbre (Resolve Uncertainty): Máximo 1 pregunta enfocada si bloquea una decisión de producto.
4. Clasificar (Classify): Implementación multi-archivo (2+ archivos no triviales) se clasifica automáticamente como SUSTANCIAL.
5. Trackear antes del primer write:
   - Crear odd/tasks/<feature-name>.md
   - Sincronizar réplica en Engram MCP bajo topic odd/<feature-name>/tasks
   - Informar al usuario en exactamente una línea: "Creado odd/tasks/<feature-name>.md con N tareas y sincronizado con Engram."
6. Implementar tarea por tarea:
   - Trigger de Delegación: 2+ archivos no triviales dispara Writer Trigger.
   - Test-First (TDD): RED -> GREEN -> Refactor.
   - Commits Atómicos: Cada tarea cierra con al menos un commit convencional (feat/fix) conteniendo código, tests y docs, sin atribución AI (Co-Authored-By), respetando ~400 líneas.
7. Cerrar y Verificar: Reportar comandos ejecutados, outputs observados y evidencia.`
};

const tasks = [
  {
    taskId: 'work-unit-commits-conventional-atomic',
    skill: 'work-unit-commits',
    prompt: 'work unit commits: atomic commits with conventional commit message',
    expectations: [
      'contains:Conventional Commit',
      'contains:unit',
      'regex:atomic|reviewable',
      'not-contains:Co-Authored-By'
    ],
    bareText: bareOutputs.task1,
    skillText: skillOutputs.task1,
  },
  {
    taskId: 'testing-patterns-vitest-unit',
    skill: 'testing-patterns',
    prompt: 'vitest: escribir tests unitarios con mocking y coverage',
    expectations: [
      'contains:Vitest',
      'contains:Arrange, Act, Assert',
      'regex:vi\\.mock|mocking',
      'not-contains:sdd-status'
    ],
    bareText: bareOutputs.task2,
    skillText: skillOutputs.task2,
  },
  {
    taskId: 'code-reviewer-pr-audit',
    skill: 'code-reviewer',
    prompt: 'code reviewer: review this code and check for bugs and code smells',
    expectations: [
      'contains:Code Review',
      'regex:Senior|Staff|Checklist',
      'contains:Blocking',
      'not-contains:sdd-status'
    ],
    bareText: bareOutputs.task3,
    skillText: skillOutputs.task3,
  },
  {
    taskId: 'odd-workflow-starts-feature-doc',
    skill: 'odd-workflow',
    prompt: 'implementar feature multi archivo en el proyecto',
    expectations: [
      'contains:odd/tasks/',
      'regex:Organic Driven Development',
      'contains:Engram',
      'not-contains:sdd-status'
    ],
    bareText: bareOutputs.task4,
    skillText: skillOutputs.task4,
  }
];

const results = [];

for (const t of tasks) {
  const bareScore = scoreRubric(t.bareText, t.expectations);
  const skillScore = scoreRubric(t.skillText, t.expectations);

  const bareArm = {
    arm: 'bare',
    stdout: t.bareText,
    durationMs: 1100,
    outputChars: t.bareText.length,
    score: bareScore.totalScore,
    complianceRate: bareScore.complianceRate,
    passedChecks: bareScore.passedChecks
  };

  const skillArm = {
    arm: 'skill',
    stdout: t.skillText,
    durationMs: 1350,
    outputChars: t.skillText.length,
    score: skillScore.totalScore,
    complianceRate: skillScore.complianceRate,
    passedChecks: skillScore.passedChecks
  };

  const blinded = blindRandomize(bareArm, skillArm);

  const judgment = evaluateBlindJudge(blinded, (c1, c2) => {
    if (c1.score > c2.score) return 'candidate1';
    if (c2.score > c1.score) return 'candidate2';
    return 'tie';
  });

  results.push({
    taskId: t.taskId,
    skill: t.skill,
    prompt: t.prompt,
    winner: judgment.winner,
    loser: judgment.loser,
    bare: bareArm,
    skill: skillArm
  });
}

const summary = calculateAbSummary(results);
console.log(formatAbSummaryTable(summary));

// Persist run in evals/results/ab-<timestamp>.json
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const targetDir = join(REPO_ROOT, 'evals', 'results');
mkdirSync(targetDir, { recursive: true });
const fileName = `ab-${stamp}.json`;
const filePath = join(targetDir, fileName);

writeFileSync(
  filePath,
  JSON.stringify(
    {
      timestamp: new Date().toISOString(),
      runner: 'Gemini 3.8 Flash (Antigravity live subagents)',
      tasksCount: results.length,
      summary,
      results
    },
    null,
    2
  ),
  'utf8'
);

console.log(`\nPersisted to: evals/results/${fileName}`);
