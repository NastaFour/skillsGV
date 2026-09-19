# Activation kernel v2 + alineación gentle-ai 3.1 — feature doc (ODD)

- **Estado**: en curso (branch `feat/activation-kernel-odd-31`)
- **Fecha**: 2026-09-19
- **Mirror Engram**: PENDING (Engram no pudo resolver proyecto desde `$HOME`: `ambiguous_project: gentle-ai | mattpocock-skills`). Resincronizar cuando el catálogo esté registrado como proyecto en Engram.

## Objetivo

Cerrar la brecha de activación descubierta en el bench Zona del Sonido (2026-09-18, CON vs SIN skills): el catálogo vivía en la capa opt-in (archivos que el agente debe decidir leer) y el agente solo siguió la capa always-on de su harness. Entregar: kernel always-on inyectado por el instalador, blindaje de .gitignore, y alineación ODD-first con gentle-ai 3.1.0.

## Problema / por qué

- Causa raíz verificada en transcript: `skill-router` = 0 ejecuciones, `mem_save` = 0, `.agents/rules/skills-bootstrap.md` nunca leído; `frontend-design` (11 menciones) y `taste-skill` (18) usadas porque llegaban por el índice inyectado del HOME (`~/.gemini/skills`, instalación global previa del propio install-skills.mjs).
- Regla "SDD si 2+ archivos" contradecía el ODD 3.1 inyectado por gentle en el system prompt → jamás se ejecutó (dos jefes de proceso: gana el system prompt).
- Commit gigante (540 archivos, catálogo incluido) por ausencia de .gitignore en el install.

## Tareas

- [x] T1 Kernel always-on: plantillas full/minimal (`_shared/bootstrap-kernel-*.md`) con contrato de salida adaptado de i-have-adhd (MIT).
- [x] T2 Installer v2: `_shared/kernel-inject.mjs` (inyección idempotente por marcadores, canales por harness, detección gentle-ai, guard/unguard .gitignore, remove/restore simétrico) cableado a `install-skills.mjs` (manifest `kernel`, uninstall, rollback, `--no-kernel`, evidencia de activación).
- [x] T3 ODD-first: reglas de arranque de `AGENTS.md` reescritas (v2, gentle 3.x); anuladas reglas SDD-por-archivo-count en `AGENTS.md`, `sdd-orchestrator`, `gentle-orchestrator`.
- [x] T4 Defer al dispatcher nativo (`gentle-ai sdd-status` / `sdd-continue`) documentado en sdd-orchestrator y kernel minimal.
- [x] T5 Vendor `_shared/skill-resolver.md` (antes solo en espejo dsh).
- [x] T6 Canary como procedimiento documentado (`references/canary-activation.md`) — NO como eval offline (un eval declarativo no puede probar la inyección de contexto de otro harness).
- [x] T6b Test suite `test/kernel-inject.test.mjs` (idempotencia, reemplazo, preservación, retención, gitignore, round-trip).
- [x] T8 CHANGELOG.md + bump 2.1.0 + README (one-liner agentes, flags, fix de deriva "no hay package.json").
- [ ] T7 Bench v2 n=3 con home aislado (fuera de este cambio; experimento aparte).

## Alcance autorizado

Repo `C:\Users\j1347\Desktop\skills` (origin `github.com/NastaFour/skillsGV`), branch feature + PR. No tocar `gentle-ai-dsh/AGENTS.md` (preset propio del addon) ni el openspec en vuelo `skills-29-upgrade` (target 2.9.1 → re-apuntar en follow-up).

## Verificación (evidencia)

- `pnpm test` (suite completa incl. kernel-inject + paridad del espejo dsh tras `sync-addon --write`) — ver abajo al ejecutarse.
- `pnpm validate:strict` para SKILL.md editados.
- Round-trip uninstall verificado por test end-to-end.

## Decisiones

1. Kernel solo en installs por proyecto (global queda como follow-up: canales globales gestionados por gentle en `~/.gemini/GEMINI.md`).
2. Sin skill nueva "output contract": las reglas van al kernel (una skill opt-in repetiría el modo de fallo medido).
3. Sin bump blanket de "2.7.0" (37 menciones): solo donde se editó y reverificó; el resto es follow-up del openspec.
4. Bloques editados por el usuario dentro de marcadores: se retienen y se reportan, nunca se revierten silenciosamente.
