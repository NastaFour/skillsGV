---
name: gentle-orchestrator
description: "Trigger: orchestrar, coordinar, delegar, multi-agente, trabajo grande, ODD orchestrator. Default-inline ODD orchestrator protocol (Gentle-AI 4.3.1): work inline by default following the logbook, delegate only when a named Delegation Trigger truly holds, and preserve authorized work continuity. Do NOT use to force subagent delegation when no trigger holds."
license: MIT
allowed-tools: Read Write Bash(git:*,gh:*)
metadata:
  trigger: ["gentle orchestrator","orquestador","delegation rules","coordinar agentes","roster delegation"]
  author: gentleman-programming
  version: "1.3.0"
---

# gentle-orchestrator — Default-Inline ODD Orchestrator (Gentle-AI 4.3.1)

**You orchestrate and work inline by default, following your logbook. A Delegation Trigger holds only when its condition truly holds; none holds by default, and when in doubt work inline.**

## Regla Alan (lenguaje natural primero)

- Preferí triggers en lenguaje natural («implementá la feature X», «continuá el cambio») antes que comandos slash: el NL siempre funciona; el slash es un alias opcional, no un requisito.
- En Gentle-AI 4.3.1, ODD (Organic Driven Development) es el flujo nativo y exclusivo. Los comandos heredados de SDD (`sdd-status`, `sdd-continue`) fueron retirados en upstream 4.0.0. ODD opera mediante autorización, exploración proporcionada, clasificación por 3 criterios, tracking antes del primer write en tareas grandes (`odd/tasks/<feature>.md`), micro-blueprint pre-flight de 5 líneas para one-shot, commits en slices revisables de `~400` líneas (alto riesgo aislado) y cierre con evidencia y línea `Risk:`.

### Delegation Triggers (Gentle-AI 4.3.1)

| Acción | Inline (Default) | Delegar (Solo cuando la condición se cumple) |
|---|---|---|
| Exploración / Lectura en `<= 1` batch paralelo (`<= 3` llamadas / `~10k` tokens) | ✅ | — |
| Exploración / Mapeo que supera 1 batch (`> 3` llamadas / `> ~10k` tokens) o `> ~5` búsquedas secuenciales | — | ✅ 1 explorador read-only (`<= 2k` tokens con `path:line`) |
| Implementar cambio entendido o tarea grande sin paralelismo real | ✅ | — |
| `2+` unidades conductuales independientes con superficies disjuntas lanzadas juntas | — | ✅ 1 writer acotado por unidad conductual |
| Verificación de cambio de Alto Riesgo (ítems `1-6`) | — | ✅ verificador independiente en `mktemp -d` (`--escalate-item <1-6> --escalate-reason`) |
| Backstop de sesión larga (`~150k` tokens de contexto en el padre) | — | ✅ pausar y delegar siguiente unidad acotada |
| bash (`git`/`gh`) y propiedad de commits/ramas | ✅ | — |

**Reglas duras de delegación (Gentle-AI 4.3.1):**
- **Default-Inline**: ningún trigger aplica por defecto; ante la duda, trabajá inline siguiendo `odd/tasks/<feature>.md`. El conteo de archivos, las líneas totales, el tamaño de la tarea o el ratio de precio de modelos **NUNCA** disparan un writer por sí solos.
- **Mapping Trigger**: delegá un único explorador read-only solo cuando entender el problema exceda 1 batch paralelo (`> 3` llamadas o `> ~10k` tokens) o requiera `> ~5` búsquedas secuenciales. El explorador devuelve `<= 2k` tokens con evidencia `path:line`; hacé como máximo 1 spot-check en el padre y nunca explores archivos que igual vas a leer inline antes de editar.
- **Writer Trigger**: delegá writers solo por paralelismo real (`2+` unidades conductuales independientes con superficies de edición disjuntas, cada una claramente más pesada que iniciar un subagente, lanzadas juntas) o por el backstop de `~150k` tokens. **Nunca dividas código, tests y docs de un mismo comportamiento entre distintos writers.**
- **Invariants & Helper Reuse**: al tocar estado compartido, configuración, manifiestos o parsers, reutilizá los helpers existentes del repositorio y preservá las invariantes de ordenamiento, unicidad, validación y normalización.
- **Verification Trigger (en `mktemp -d` aislado)**: delegá un verificador independiente read-only **SOLO** cuando el cambio active un ítem de Alto Riesgo (`1-6`) (`--escalate-item <1-6> --escalate-reason "<razón>"` son flags CLI para `gentle-ai review assess` cuando el binario nativo está activo). El verificador independiente recibe el ítem de Alto Riesgo, el documento completo (`S#`), el commit base y los comandos de probe, ejecuta las pruebas en un directorio temporal aislado (`mktemp -d` / `os.tmpdir()`) y devuelve un veredicto por `S#`.

### Authorized work continuity

- Cuando el usuario autorizó una implementación, continuá ejecutando las tareas autorizadas hasta completarlas o encontrar un bloqueo real de decisión de producto.
- Lenguaje condicional o precautorio del usuario (*«podrías parar si hace falta»*, *«quizás sigamos después»*) pide notas claras en `odd/tasks/<feature>.md` y commits por slice revisables, **no** detener el trabajo prematuramente.
- Una tarea trackeada solo queda pendiente ante un freno explícito del usuario o un único resultado **Needs your decision** nombrando el bloqueante abierto o la prueba faltante.

## Roster de roles y agentes (ODD + Review)

| Rol / Agente | Modelo | Skill sugerida | Propósito |
|---|---|---|---|
| gentle-orchestrator | strong | odd-workflow / esta | orquesta y ejecuta inline por defecto; delega por trigger |
| explorer / mapper | cheap | codegraph-intelligence | mapeo read-only (`<= 2k` tokens `path:line`) |
| writer | mid | feature-implementer | unidad conductual paralela (código+tests+docs) |
| verifier | mid | qa-tester / testing-patterns | verificador independiente para Alto Riesgo `1-6` (`mktemp -d`) |
| jd-judge-a / jd-judge-b | strong | judgment-day | jueces A y B (ciego adversarial) |
| jd-fix-agent | mid | jd-fix-agent | aplica fixes acotados del veredicto |
| review-risk / readability / reliability / resilience | cheap | gentle-ai-review-4r | lentes 4R nativos (R1-R4, Protocol `1.5`) |
| review-refuter / review-validator | cheap | rdd-defect-workflow | refutación e inspección inmutable de validación |

## Retry / Recovery y Scratch State (obligatorio)

- Si un sub-agente falla, devuelve vacío o resultado inválido → **investigá el porqué** y **RE-LANZALO una vez** con contexto exacto del fallo. Si falla 2 veces → reportá el motivo concreto y pará (sin tercer intento automático).
- **Scratch State Discipline**: los sub-agentes deben reportar cualquier archivo o directorio temporal creado fuera del workspace (`mktemp -d` / `os.tmpdir()`); el orquestador padre los elimina antes de cerrar la tarea.

## Skill Resolution & Cierre

Al cerrar cada cambio de código o slice, reportá la resolución de skills (`{injected|fallback-registry|fallback-path|none}`) y cerrá siempre con la línea obligatoria `Risk: item N (reason)` o `Risk: none`.
