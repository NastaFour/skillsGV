# Canary de activación + follow-ups CHANGELOG 2.1.1 — feature doc (ODD)

- **Estado**: en curso (branch por crear `feat/followups-211` desde `main@6edd3cc`)
- **Fecha**: 2026-09-21
- **Mirror Engram**: `odd/canary-211-followups/tasks` (proyecto `skillsgv`, sesión `skillsGV-2026-09-21-canary-followups`)

## Objetivo

Cerrar el ciclo post-2.1.1: registrar los resultados del canary de activación, ejecutar los follow-ups listados en el CHANGELOG 2.1.1 y dejar diseñado el bench final (skills vs sin skills) que el usuario pidió.

## Problema / por qué

- El canary (`references/canary-activation.md`) existía como procedimiento pero sin resultados registrados.
- El CHANGELOG 2.1.1 deja 5 follow-ups explícitos fuera del release.
- El usuario pidió, al final de todo, un test comparativo skills vs sin skills con `agy` (Gemini flash, effort high) y análisis de session logs para evaluar adherencia a lineamientos en profundidad.

## Hallazgo central del canary (2026-09-21)

**Antigravity CLI (`agy -p`) = KERNEL-MISSING por ambas vías**: no autocarga `GEMINI.md` ni `AGENTS.md` del workspace (probados ambos, sandbox `canary-activacion`, install 2.1.1 desde `main@6edd3cc`, 512 archivos, kernel minimal inyectado). Su capa always-on proviene solo del HOME: `~/.gemini/GEMINI.md` (bloques gentle-ai) + índice de `~/.gemini/skills`. Consecuencia: para `agy`, el único canal de activación verificado es el GLOBAL → el follow-up "kernel en installs globales" es la única vía real de activación para ese harness.

Gemini CLI puro (`gemini -p`): PENDING — sin auth en el entorno (GEMINI_API_KEY/OAuth ausentes).

Dato adicional: uninstall con código 2.1.1 sobre un manifest pre-merge limpió perfecto (19 archivos, kernel, gitignore, `.skills-install/`) — simetría verificada en entorno real, no solo en suite.

## Tareas

- [x] T0 Verificación de estado post-merge: `pnpm test` 111/111 PASS, `pnpm validate:strict` 210/0/0. Repo sano en `main@6edd3cc`.
- [x] T0b Reinstall del sandbox con la versión nueva (uninstall de install pre-merge + install fresco 2.1.1 completo).
- [x] T0c Canary `agy` vía `GEMINI.md` → KERNEL-MISSING; vía `AGENTS.md` → KERNEL-MISSING.
- [ ] T0d Registrar resultados del canary en `references/canary-activation.md` (tabla del paso 5).
- [ ] T1 Follow-up #1 (slice mínimo aprobado): re-vendor del contrato review/RDD **target 3.4.0** (binario local ya 3.4.0; sync ya refrescó `~/.config/opencode/skills/_shared/review-ledger-contract.md`). WU1: contrato + referencias que enseñan la mecánica vieja. WU2: chassis `sdd-phase-common` (§B/§C/§D) + truth-up de menciones "2.7.0 verificado" → 3.4.0 con reverificación. Novedades 3.2.1→3.4.0 a incorporar: `target_already_acknowledged`, `managed_assets_outdated`, `assess` con `review_due`/`next_transition`, presupuesto de contexto 200 KiB + `correction_context_budget_exceeded`, lens-capture vía `provider_task`, delegación ODD obligatoria (3.2.1), **RTK retirado (breaking 3.4.0 — grep y eliminar menciones)**. El resto del change SDD queda abierto.
- [ ] T2+T4 Rama B (aprobada): instalación global completa en `~/.gemini` — reinstall 210 skills + tier0 fresco + kernel minimal en `~/.gemini/GEMINI.md` coexistiendo con bloques gentle-ai. Se ejecuta DESPUÉS del trabajo del repo para instalar la versión final. Verificar soporte de canal global en el instalador (hoy kernel = solo proyecto).
- [ ] T3 (absorbido en T1/WU2): truth-up de las 37 menciones "2.7.0".
- [ ] T6 RTK sweep: grep RTK en catálogo + README; eliminar/no prometer (3.4.0 lo retiró).
- [ ] T7 Bench final del usuario: skills vs sin skills con `agy` (Gemini flash, `--effort high`), tests/validaciones, análisis de session logs (adherencia a lineamientos en profundidad). Requisito del usuario: **borrar los proyectos viejos de las pruebas CON/SIN skills** para evaluar desde 0 — rutas exactas pendientes de confirmar (no encontradas con búsqueda `bench|zona|sonido|con-skills|sin-skills`).

## Alcance autorizado

Repo `C:\Users\j1347\Desktop\skills` (origin `github.com/NastaFour/skillsGV`), branch feature + PR. Sandbox `C:\Users\j1347\Desktop\canary-activacion` (desechable, ya modificado para el canary). No tocar `gentle-ai-dsh/AGENTS.md` (preset del addon) fuera de lo que el sync-addon regenere.

## Verificación (evidencia)

- `pnpm test` (111 tests, incluye kernel-inject + paridad espejo dsh) tras cada tarea de código.
- `pnpm validate:strict` tras tocar SKILL.md.
- Canales verificados con el prompt exacto del runbook (transcript en los outputs de las corridas `agy -p`).

## Estrategia de entrega

`ask-on-risk`. Forecast inicial: T1+T3 juntos pueden superar las 400 líneas (37 menciones + re-vendor) → si se confirma, preguntar cadena vs `size:exception` antes del PR.

## Decisiones

1. No modificar `KERNEL_CHANNELS` en `kernel-inject.mjs` todavía: el hallazgo de agy es "no hay canal de workspace", no "el canal correcto es X" — la vía global es la decisión T2+T4.
2. `AGENTS.md` de prueba queda en el sandbox (desechable); no forma parte del manifest del instalador.
3. Bench final se diseña al final (después de follow-ups) — el usuario definió modelo/agente (agy, flash, high) pero no n ni aislamiento; se propone diseño antes de ejecutar.
4. **Usuario (2026-09-21)**: slice mínimo para el follow-up #1 (WU1+WU2, ~450-600 líneas, 2 PRs si hace falta); absorción completa del change SDD queda diferida.
5. **Usuario (2026-09-21)**: instalación global completa con kernel (sí) — catálogo 210 + tier0 + kernel minimal en `~/.gemini/GEMINI.md`.
6. **Usuario (2026-09-21)**: target de alineación = gentle-ai 3.4.0 (no 3.1.0); adaptar novedades 3.2.1→3.4.0 al harness de skills.
7. Contrato review: re-vendor byte-exacto EN (práctica existente del catálogo); docs de catálogo en ES.
