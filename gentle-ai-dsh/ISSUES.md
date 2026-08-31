# Issues pendientes — gentle-ai-dsh

Estado del plan DSH (fase 2). Cerrados: A1-A5, B, C, F, G5, G6, E4, fix del YAML tag.
Pendientes (para abrir como issues en GitHub):

## E2 · Tests del installer (node:test)
- node:test para: --dry-run sin escritura, instalación en un DSH_HOME temporal
  (env override) + doctor PASS, y --uninstall que restaura el AGENTS.md de backup.
- Gate: pnpm test en verde antes de publish.

## E3 · Bench journey mínimo (gentle-ai-bench)
- Un journey SDD end-to-end sobre un cambio trivial del propio harness que
  demuestre driven execution (proposal → apply → verify → evidencia real).
- Requiere el binario gentle-ai-bench + el harness Go compilado.

## E5 · Judgment Day formal sobre el diff completo
- 2 jueces ciegos (subagent_strong ×2) con el ledger del plan como criterio.
- Veredicto APPROVED/ESCALATED; severos → 2 rondas de fix máx.

## G1 · Screenshot-regression de diseño
- En cada iteración de diseño, capturar antes/después y pasar a Antigravity una
  comparación heurística textual (tokens, contraste AA, jerarquía, anti-slop).

## G2 · Token audit automatizado
- Generalizar check-tokens.mjs (design-system-tokens) para escanear cualquier
  proyecto por hex hardcodeados, bg-white literales y paletas no semánticas.
- Integrarlo como gate opcional del design-review.

## G3 · Budget reporting
- Al cerrar cada fase, registrar en Engram un estimado de coste (tokens
  flash vs strong, nº de subagents) con topic dsh/costes.

## G4 · design-artifacts versionado (script)
- D4 guarda prototipos en design-artifacts/<fecha>-<fase>/ + registro en Engram.

## Config (usuario)
- Setear ENGRAM_MCP_COMMAND, CONTEXT7_API_KEY, DSH_FLASH_MODEL (y opcional
  DSH_STRONG_MODEL) para activar Engram/Context7 y el split flash/strong real.
