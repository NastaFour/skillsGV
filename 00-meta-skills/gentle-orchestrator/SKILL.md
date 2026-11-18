---
name: gentle-orchestrator
description: "Trigger: orchestrar, coordinar, delegar, multi-agente, trabajo grande, ODD orchestrator. Default-inline ODD orchestrator protocol (Gentle-AI 4.5.0): work inline by default following the logbook, delegate only when a named Delegation Trigger truly holds with Allowed Edit Surfaces, Skill Resolver paths, 3-tier verification in mktemp -d, and Key Learnings capture, and preserve authorized work continuity. Do NOT use to force subagent delegation when no trigger holds."
license: MIT
allowed-tools: Read Write Bash(git:*,gh:*)
metadata:
  trigger: ["gentle orchestrator","orquestador","delegation rules","coordinar agentes","roster delegation"]
  author: gentleman-programming
  version: "1.4.0"
---

# gentle-orchestrator — Default-Inline ODD Orchestrator (Gentle-AI 4.5.0)

**You orchestrate and work inline by default, following your logbook. A Delegation Trigger holds only when its condition truly holds; none holds by default, and when in doubt work inline.**

## Regla Alan & Contratos `Gentle-AI 4.5.0`

- **Lenguaje natural primero**: los triggers en lenguaje natural siempre funcionan; los comandos slash son alias opcionales (SDD retirado; ODD exclusivo).
- **Dynamic Delegation Protocol & Deduplication**: Antes de lanzar un worker dinámico, verificá `(role, task-fingerprint)` para nunca duplicar invocaciones en el mismo turno. Inyectá obligatoriamente:
  1. `## Allowed edit surfaces` (rutas exactas relativas al repo; jamás `.` ni rutas absolutas),
  2. `## Skills to load before work` (rutas exactas de `SKILL.md` resueltas vía `.atl/skill-registry.md` / `skill-router.mjs`, verificando `skill_resolution: paths-injected` al retorno; si devuelve otro estado, re-leé el registry antes del siguiente worker),
  3. `## Key Learnings` (bloque de cierre con `1–5` oraciones factuales `>= 20` chars y `>= 4` palabras para captura pasiva en Engram; omitir cuando el worker debe retornar JSON estricto).
- **Frontend Design Gate & Prompt-Shield**: En cualquier tarea UI exigí `design-driven` (D1b + Think Outside the Box + `Design Read` 3 líneas o 1 línea `<50` líneas); ante repos/archivos externos exigí pre-escaneo con `prompt-shield` (`safe_read.py` `9/8/10`).
- **Remote Operation Authorization**: Permiso local jamás autoriza ejecución remota, `git push`, creación de PRs ni transferencias externas sin aprobación humana explícita.

### Delegation Triggers & 3-Tier Verification Gate

| Acción | Inline (Default) | Delegar (Solo cuando la condición se cumple) |
|---|---|---|
| Exploración `<= 1` batch (`<= 3` llamadas / `~10k` tok) | ✅ (CodeGraph primero si es mapa estructural) | — |
| Exploración `> 1` batch o `> ~5` búsquedas secuenciales | — | ✅ 1 explorador read-only (`<= 2k` tok con `path:line` + 1 spot-check) |
| Plan **Large**, upgrade mayor o alta lógica (`Auto-EGM`) | — | ✅ Borrador → `egm-spec-review` (`3` Goldfishes en contexto cero; `5` crítico) antes de `odd/tasks/` |
| Implementar unidad sin paralelismo real | ✅ | — |
| `2+` unidades independientes disjuntas lanzadas juntas o backstop `~150k` tok | — | ✅ 1 writer acotado por unidad conductual (código+tests+docs juntos) |
| Verificación de cambio (`passive` / `medium` / `high` items `1–6`) | ✅ `passive` readback / `medium` autoverificación | ✅ Solo `high` (items `1–6`): verificador independiente en `mktemp -d` (`_shared/verify-method.md`, sin `.git`) + differential check + spot-check del padre |
| `git`/`gh` y limpieza de scratch fuera del repo | ✅ | — (Subagentes reportan rutas `mktemp -d`; jamás las borran ellos) |

**Límites de corrección & Lossless Prompts**: Verificadores tienen máximo `1` lote de corrección + `1` recheck acotado al bloqueante (2º solo si el mismo bloqueante sigue fallando; de lo contrario `Needs your decision`). Ante menús o bloqueos interactivos, reenviá las opciones completas sin abreviar ni decidir por el usuario.

## Roster de roles y agentes (ODD + Review)

| Rol / Agente | Modelo | Skill sugerida | Propósito |
|---|---|---|---|
| gentle-orchestrator | strong | odd-workflow / esta | orquesta `default-inline`; delega solo por trigger |
| explorer / mapper | cheap | codegraph-intelligence | mapeo read-only (`<= 2k` tok `path:line`) |
| writer | mid | feature-implementer | unidad conductual paralela (`## Allowed edit surfaces`) |
| verifier | mid | qa-tester / testing-patterns | verificador independiente en `mktemp -d` para Alto Riesgo `1–6` |
| jd-judge-a / jd-judge-b | strong | judgment-day | jueces A y B (ciego adversarial) |
| jd-fix-agent | mid | jd-fix-agent | aplica fixes acotados del veredicto |
| review-risk / readability / reliability / resilience | cheap | gentle-ai-review-4r | lentes 4R nativos (R1–R4, Contract `1.5`) |
| review-refuter / review-validator | cheap | rdd-defect-workflow | refutación e inspección inmutable de validación |

## Retry / Recovery & Cierre

- Si un sub-agente falla, devuelve vacío o rechaza por falta de `## Allowed edit surfaces` → **investigá el motivo**, repará el prompt una vez y **re-lanzalo 1 vez** (máx. 2 intentos; luego reportá bloqueo).
- Cerrá siempre con `skill_resolution`, evidencia observada (comando + salida), y `Risk: item N (reason)` o `Risk: none`. `[Beyond-Baseline: <razón>]` habilitado para técnicas superiores verificadas.
