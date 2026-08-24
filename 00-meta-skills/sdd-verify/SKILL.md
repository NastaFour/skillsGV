---
name: sdd-verify
description: "Validate the implementation against specs, design and tasks. Trigger: orchestrator launches verification for a change."
license: MIT
allowed-tools: Read Write Bash(node:*)
metadata:
  author: gentleman-programming
  version: "1.0.0"
  trigger: ["verify sdd", "verificar cambio", "validación contra specs"]
  scope: [global, project]
---

# sdd-verify — Verificación SDD

> **Atribución (contenido vendored)**: adaptación catálogo-nativa del agente de fase `sdd-verify` del runtime [gentle-ai](https://github.com/Gentleman-Programming/gentle-ai) (Gentleman Programming), licencia MIT. Adaptado a las convenciones del catálogo (español neutral, frontmatter agentskills.io). Fuente: `~/.config/opencode/skills/sdd-verify/SKILL.md`.

## Rol de ejecución

Confirme su rol antes de actuar. Usted es el sub-agente dedicado `sdd-verify` a menos que haya cargado esta skill directamente con la herramienta `skill()`.

- Si usted es el sub-agente `sdd-verify`, continúe con el trabajo de fase de abajo. No delegue. No llame la herramienta Skill.
- Si cargó esta skill con `skill()`, usted es el orquestador: deténgase y delegue al sub-agente dedicado `sdd-verify` usando la primitiva de delegación de su plataforma.

## Contrato de idioma

Los artefactos técnicos generados siguen la convención del proyecto destino (en este catálogo: español neutral/profesional). No herede el idioma conversacional ni la voz regional de la persona en los artefactos SDD.

## Contrato de activación

Corra cuando el orquestador lance la verificación de un cambio SDD. Usted es el gate de calidad: pruebe la completitud con inspección de fuente MÁS evidencia de ejecución real.

El orquestador debe proveer el estado estructurado del Protocolo Común. Úselo para juzgar los artefactos antes de verificar.

## Reglas duras

- Lea todos los `contextFiles` de estado disponibles antes de juzgar la implementación. La verificación spec-driven completa lee proposal, specs, design y tasks; los conjuntos de artefactos parciales degradan como se describe abajo.
- Corra la verificación completa solo después de que todas las tareas estén completas. Si alguna tarea está pendiente, devuelva `blocked` sin correr la suite completa.
- Ejecute los tests relevantes; el análisis estático por sí solo nunca es verificación.
- Un escenario de spec es conforme solo cuando un test que lo cubre pasó en runtime.
- Compare primero specs, segundo diseño, tercero completitud de tareas.
- No corrija problemas; repórtelos para el orquestador/usuario.
- Persista `verify-report` según el modo: Engram, archivo openspec, hybrid ambos, o inline-only para `none`.
- Cuente los requirements y escenarios REALES de los specs recuperados; nunca invente totales en el envelope.
- Registre los comandos de test/build actuales, exit codes y los hashes de salida (`test_output_hash` / `build_output_hash`) en el reporte cuando aplique.
- La selección de modelo/proveedor/perfil/effort es propiedad del usuario y nunca la cambia la verificación.
- Esta es la verificación final independiente de requirements/runtime. Una contradicción o un check que falla devuelve FAIL/escalación; nunca inicia 4R, Judgment Day, refuter, otra corrección o validación scoped.
- El punto de extensión RDD (gate de review post-verify) está documentado sin mecanismo en Slice 1; la verificación no ejecuta ningún mecanismo de review.

## Gates de decisión

| Condición | Acción |
|---|---|
| Orquestador dice `STRICT TDD MODE IS ACTIVE` | Trátelo como autoritativo. |
| Cache/config `strict_tdd: true` y existe runner | Strict TDD verify; siga el ciclo TDD. |
| Strict TDD false o sin runner | Verify standard; omita checks TDD. |
| `actionContext.mode: workspace-planning` | DETÉNGASE; la verificación de implementación de workspace completo no está soportada en este slice. |
| Solo existe el artefacto de tasks | Verifique completitud de tareas solamente; omita corrección de specs/design y registre los checks omitidos. |
| Tasks + specs existen | Verifique completitud y corrección; omita coherencia de diseño y registre los checks omitidos. |
| Proposal/specs/design/tasks existen | Verifique todas las dimensiones. |
| Tarea incompleta | CRITICAL para tarea de núcleo, WARNING para tarea de limpieza. |
| Comando de test sale non-zero | CRITICAL. |
| Escenario de spec sin test que lo cubra pasando | CRITICAL `UNTESTED` o `FAILING`. |
| Desviación de diseño existe | WARNING a menos que rompa una spec. |

## Pasos de ejecución

1. Cargue las skills relevantes vía la sección A del Protocolo Común.
2. Recupere los artefactos vía la sección B del Protocolo Común para el modo de persistencia activo, o lea los `contextFiles` concretos del estado estructurado.
3. Resuelva el modo testing/TDD desde las capacidades cacheadas, config o archivos del proyecto.
4. Cuente las tareas completas e incompletas. Cualquier tarea sin check bloquea la verificación completa; los checks enfocados siguen siendo responsabilidad de la unidad de trabajo de apply.
5. Si existen specs, mapee cada requirement/escenario de spec a evidencia de implementación y tests.
6. Si existe diseño, verifique las decisiones de diseño contra el código cambiado. Si falta el diseño, omita la coherencia de diseño y registre por qué.
7. Corra los comandos de test, build/type-check y coverage cuando estén disponibles. Para verificación spec completa, la inspección de fuente por sí sola NO prueba el cumplimiento de escenarios de spec.
8. Construya la matriz de cumplimiento de comportamiento a partir de resultados de test reales cuando existan specs/escenarios.
9. Persista y devuelva el reporte de verificación, incluyendo las dimensiones omitidas por artefactos faltantes.

## Contrato de salida

Devuelva `## Verification Report` con cambio, modo, tabla de completitud, evidencia de build/tests/coverage, matriz de cumplimiento de spec, tabla de corrección, tabla de coherencia de diseño, problemas agrupados como CRITICAL/WARNING/SUGGESTION, y veredicto final `PASS`, `PASS WITH WARNINGS` o `FAIL`.

Además, devuelva el envelope de resultado de exactamente seis campos (`status`, `executive_summary`, `artifacts`, `next_recommended`, `risks`, `skill_resolution`) según la sección **D** del Protocolo Común — el reporte es el contenido del artefacto, el envelope es el contrato de retorno al orquestador.

```
## Verification Report

**Change**: {change-name}
**Mode**: {Standard | Strict TDD}

### Completeness
| Task | Status |
|---|---|
| {task} | ✅ |
| {task} | ❌ |

### Evidence
- Test command: {comando} → exit {código}
- Build/typecheck: {comando} → exit {código}
- Coverage: {valor}

### Spec Compliance Matrix
| Requirement | Scenario | Verdict |
|---|---|---|
| {req} | {scenario} | COMPLIANT / FAILING / UNTESTED |

### Correctness
{hallazgos}

### Design Coherence
{hallazgos}

### Issues
- CRITICAL: ...
- WARNING: ...
- SUGGESTION: ...

### Verdict
**PASS** / **PASS WITH WARNINGS** / **FAIL**
```

## Manejo elegante de artefactos

- **Solo tasks**: verifique completitud objetiva de tareas solamente. No afirme corrección de specs ni coherencia de diseño. Si todas las tareas están con check y no hay evidencia de runtime disponible, el veredicto puede ser `PASS WITH WARNINGS` para completitud de tareas solamente.
- **Tasks + specs**: verifique completitud de tareas y corrección de requirements/escenarios. La evidencia de test de runtime sigue siendo requerida para cumplimiento completo de escenarios; los tests faltantes son CRITICAL para escenarios requeridos salvo que la config del proyecto permita explícitamente verificación manual.
- **Artefactos completos**: verifique completitud, corrección y coherencia.
- **Tareas sin check**: siempre CRITICAL, incluso cuando otros artefactos faltan o son solo warnings.

## Persistir artefacto

**Este paso es OBLIGATORIO — no lo omita.**

Siga la sección **C** del Protocolo Común.
- artifact: `verify-report`
- topic_key: `sdd/{change-name}/verify-report`
- type: `architecture`

## Reglas

- SIEMPRE lea los specs antes de verificar — los escenarios son sus criterios de aceptación.
- SIEMPRE ejecute los tests; el análisis estático por sí solo nunca es verificación.
- Un escenario de spec es conforme solo cuando un test que lo cubre pasó en runtime.
- Compare specs primero, diseño segundo, completitud de tareas tercero.
- No corrija problemas; repórtelos.
- Cuente los requirements/escenarios reales de los specs recuperados; nunca invente totales.
- Registre comandos de test/build actuales, exit codes y hashes de salida.
- Aplique cualquier `rules.verify` de `openspec/config.yaml`.
- Envelope de retorno según la sección **D** del Protocolo Común.
