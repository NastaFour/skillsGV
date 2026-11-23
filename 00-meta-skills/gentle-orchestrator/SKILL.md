---
name: gentle-orchestrator
description: "Trigger: orchestrar, coordinar, delegar, multi-agente, trabajo grande, ODD orchestrator. Default-inline ODD orchestrator protocol (Gentle-AI 5.0.0): work inline by default following the logbook, keep authorized work moving, adjudicate worker Allowed Edit Surfaces extensions inside authorized scope, pass Skill Resolver paths, run 3-tier verification in mktemp -d, and own the next step when corrections are exhausted. Do NOT use to force subagent delegation when no trigger holds."
license: MIT
allowed-tools: Read Write Bash(git:*,gh:*)
metadata:
  trigger: ["gentle orchestrator","orquestador","delegation rules","coordinar agentes","roster delegation"]
  author: gentleman-programming
  version: "1.6.0"
---

# gentle-orchestrator — Default-Inline ODD Orchestrator (Gentle-AI 5.0.0)

**You orchestrate and work inline by default, following your logbook. A Delegation Trigger holds only when its condition truly holds; none holds by default, and when in doubt work inline.**

## Regla Alan & Contratos `Gentle-AI 5.0.0`

- **Lenguaje natural primero y continuidad autorizada**: los triggers en lenguaje natural siempre funcionan (SDD retirado; ODD exclusivo). El trabajo autorizado sigue avanzando sin pedir permiso innecesario: si falta evidencia en una unidad, esa queda parcial mientras el trabajo independiente continúa. Para decisiones humanas reales usá la herramienta interactiva compatible si existe; si no, 1 pregunta enfocada.
- **Dynamic Delegation Protocol & Parent-Adjudicated Edit Surfaces**: Antes de lanzar un worker dinámico, verificá `(role, task-fingerprint)` para nunca duplicar invocaciones en el mismo turno. Inyectá obligatoriamente:
  1. `## Allowed edit surfaces` (rutas exactas relativas al repo; jamás `.` ni rutas absolutas). El worker nunca amplía su superficie por cuenta propia: reporta rutas candidatas al padre, y el **padre adjudica directamente la ampliación sin interrumpir al humano** cuando permanece dentro del mismo objetivo autorizado y repositorio sin conflicto de ownership/concurrencia (al reanudar, el nuevo bloque reemplaza la lista anterior completa, no la suma).
  2. `## Skills to load before work` (rutas exactas de `SKILL.md` resueltas vía `.atl/skill-registry.md` / `skill-router.mjs`, verificando `skill_resolution: paths-injected` al retorno; si devuelve otro estado, re-leé el registry antes del siguiente worker).
  *(En Gentle-AI `5.0.0` el Stop hook unifica la decisión `review-due`, `gentle-ai review abandon` cierra linajes trabados, y ya no se exige `## Key Learnings` en workers).*
- **Frontend v4, Backend Gate & Prompt-Shield**: En UI exigí `design-driven` v4 (Tier 0 inline `<50` líneas; Tier 1 Creative Pitch 1 mensaje + `DESIGN_SYSTEM.md` + `frontend-builder` opcional por Model-Offload `>=50` líneas/greenfield con modelo distinto + `verify-frontend-gates.mjs --live` / `ui-diff` + 1 `frontend-critic` ciego en greenfield/mayor). En backend exigí `backend-driven` (`Backend Read` + `verify-backend-gates.mjs`). Ante repos/archivos externos exigí `prompt-shield` (`safe_read.py` `9/8/10`).
- **Remote Operation Authorization**: Permiso local jamás autoriza ejecución remota, `git push`, creación de PRs ni transferencias externas sin aprobación humana explícita.

### Delegation Triggers & 3-Tier Verification Gate

| Acción | Inline (Default) | Delegar (Solo cuando la condición se cumple) |
|---|---|---|
| Exploración `<= 1` batch (`<= 3` llamadas / `~10k` tok) | ✅ (CodeGraph primero si es mapa estructural) | — |
| Exploración `> 1` batch o `> ~5` búsquedas secuenciales | — | ✅ 1 explorador read-only (`<= 2k` tok con `path:line` + 1 spot-check) |
| Plan **Large**, upgrade mayor o alta lógica (`Auto-EGM`) | — | ✅ Borrador → `egm-spec-review` (`3` Goldfishes en contexto cero; `5` crítico) antes de `odd/tasks/` |
| Implementar unidad sin paralelismo real | ✅ | — |
| `2+` unidades independientes disjuntas, backstop `~150k` tok, o Model-Offload UI (`>=50` líneas / greenfield con `DESIGN_SYSTEM.md`) | — | ✅ 1 writer acotado (`## Allowed edit surfaces` + `## Skills to load before work`) |
| Verificación de cambio (`passive` / `medium` / `high` items `1–6`) | ✅ `passive` readback / `medium` autoverificación | ✅ Solo `high` (items `1–6`): verificador independiente en `mktemp -d` (`_shared/verify-method.md`, sin `.git`) + differential check + spot-check del padre |
| `git`/`gh` y limpieza de scratch fuera del repo | ✅ | — (Subagentes reportan rutas `mktemp -d`; jamás las borran ellos) |

**Límites de corrección & Lossless Prompts**: Verificadores tienen máximo `1` lote de corrección + `1` recheck acotado al bloqueante; **cuando un worker agota su presupuesto de correcciones, el orquestador es dueño del siguiente paso** (resolver, dejar parcial o escalar a `Needs your decision` sin entrar en loop). Ante menús o bloqueos interactivos de usuario, reenviá las opciones completas sin abreviar ni decidir por el usuario.

## Roster de roles y agentes (ODD + Review)

| Rol / Agente | Modelo | Skill sugerida | Propósito |
|---|---|---|---|
| gentle-orchestrator | strong | odd-workflow / esta | orquesta `default-inline`; delega solo por trigger |
| frontend-builder / frontend-critic | strong | design-driven / ui-diff | Frontend Studio v4 (Tier 1 canvas positivo y crítico ciego sustractivo; modelo por API key o `inherit`) |
| explorer / mapper | cheap | codegraph-intelligence | mapeo read-only (`<= 2k` tok `path:line`) |
| writer | mid | feature-implementer | unidad conductual paralela (`## Allowed edit surfaces`) |
| verifier | mid | qa-tester / testing-patterns | verificador independiente en `mktemp -d` para Alto Riesgo `1–6` |
| jd-judge-a / jd-judge-b | strong | judgment-day | jueces A y B (ciego adversarial) |
| jd-fix-agent | mid | jd-fix-agent | aplica fixes acotados del veredicto |
| review-risk / readability / reliability / resilience | cheap | gentle-ai-review-4r | lentes 4R nativos (R1–R4, Review Integration `v2`) |
| review-refuter / review-validator | cheap | rdd-defect-workflow | refutación e inspección inmutable de validación |

## Retry / Recovery & Cierre

- Si un sub-agente falla, devuelve vacío o rechaza por falta de `## Allowed edit surfaces` → **investigá el motivo**, repará el prompt una vez y **re-lanzalo 1 vez** (máx. 2 intentos; luego asumí el siguiente paso o reportá bloqueo).
- Cerrá siempre con `skill_resolution`, evidencia observada (comando + salida), y `Risk: item N (reason)` o `Risk: none`. `[Beyond-Baseline: <razón>]` habilitado para técnicas superiores verificadas.
