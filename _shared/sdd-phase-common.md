# Protocolo Común de Fase SDD

Contenido compartido, idéntico en todas las skills de fase SDD del catálogo. Los sub-agentes de fase DEBEN cargar este archivo junto con su SKILL.md específico.

Frontera de ejecución: todo agente de fase SDD es EJECUTOR, no orquestador. Realice el trabajo de la fase usted mismo. No lance sub-agentes, no llame `delegate`/`task` ni devuelva trabajo, salvo que la skill de fase indique explícitamente detenerse y reportar un bloqueo.

## A. Carga de skills

1. Verifique si el orquestador inyectó un bloque `## Skills to load before work` en su prompt de lanzamiento. Si existe, lea esos archivos `SKILL.md` exactos antes del trabajo específico de la tarea.
2. Si no hay bloque de skills, verifique instrucciones `SKILL: Load`; si están presentes, cargue esos archivos exactos.
3. Si no hay ninguno, busque el registro de skills como respaldo:
   a. `mem_search(query: "skill-registry", project: "{project}")` — si aparece, `mem_get_observation(id)` para el contenido completo.
   b. Respaldo: lea `.atl/skill-registry.md` de la raíz del proyecto si existe.
   c. Desde el índice del registro, haga match de triggers con su tarea y lea los paths `SKILL.md` exactos listados.
4. Si no existe registro, continúe solo con su skill de fase.

NOTA: el camino preferido es (1) — paths exactos seleccionados por el orquestador. (2) y (3) son respaldos. Buscar en el registro es CARGA DE SKILLS, no delegación. Si `## Skills to load before work` está presente, IGNORE instrucciones redundantes `SKILL: Load`.

## B. Recuperación de artefactos

**CRÍTICO**: `mem_search` devuelve PREVIEWS de ~300 caracteres, no el contenido completo. DEBE llamar `mem_get_observation(id)` por CADA artefacto. **Saltarse este paso produce salida incorrecta.**

**Ejecute todas las búsquedas en paralelo** — no secuencialmente.

```
mem_search(query: "sdd/{change-name}/{artifact-type}", project: "{project}") → guardar ID
```

Luego **ejecute todas las recuperaciones en paralelo**:

```
mem_get_observation(id: {id_guardado}) → contenido completo (OBLIGATORIO)
```

No use previews de búsqueda como material fuente.

## C. Persistencia de artefactos

Toda fase que produce un artefacto DEBE persistirlo. Saltarse esto ROMPE el pipeline — las fases descendentes no encontrarán su salida.

### Modo engram

```
mem_save(
  title: "sdd/{change-name}/{artifact-type}",
  topic_key: "sdd/{change-name}/{artifact-type}",
  type: "architecture",
  project: "{project}",
  capture_prompt: false,
  content: "{su artefacto markdown completo}"
)
```

`topic_key` habilita upserts — volver a guardar actualiza, no duplica.
`capture_prompt: false` es obligatorio para artefactos SDD: son salidas de pipeline automatizadas, no guardados de memoria humanos/proactivos. Si el esquema de la herramienta no expone el campo, omítalo en lugar de fallar.

### Modo openspec

El archivo ya se escribió durante el paso principal de la fase. No se requiere acción adicional.

### Modo hybrid

Haga AMBOS: escriba el archivo en el filesystem Y llame `mem_save` como arriba, con la misma versión.

### Modo none

Devuelva el resultado solo en línea. No escriba archivos ni llame `mem_save`.

## D. Envelope de resultado

> **CRÍTICO — orden de respuesta**: su salida FINAL DEBE ser texto (el envelope), NO una llamada de herramienta. Si necesita guardar en Engram (`mem_save`), hágalo ANTES de su respuesta final de texto. No llame `mem_session_summary` — es solo para agentes de nivel superior. **Por qué**: cuando la última acción de un sub-agente es una llamada de herramienta, el orquestador recibe solo el resultado de la herramienta — su respuesta de texto (el análisis real) se pierde.

Toda fase DEBE devolver un envelope estructurado al orquestador con exactamente seis campos:

- `status`: `success`, `partial` o `blocked`
- `executive_summary`: resumen de 1-3 oraciones de lo realizado
- `artifacts`: lista de claves de artefacto / paths escritos
- `next_recommended`: la siguiente fase SDD a ejecutar, o `none`
- `risks`: riesgos descubiertos, o `None`
- `skill_resolution`: cómo se cargaron las skills — `paths-injected` (recibió paths exactos del orquestador), `fallback-registry` (paths auto-cargados del registro), `fallback-path` (cargado vía path `SKILL: Load`), o `none` (sin skills cargadas)

`status: blocked` con una dependencia insatisfecha → el orquestador NO avanza a la fase dependiente.

Ejemplo:

```markdown
**Status**: success
**Summary**: Propuesta creada para `{change-name}`. Alcance, enfoque y plan de rollback definidos.
**Artifacts**: Engram `sdd/{change-name}/proposal` | `openspec/changes/{change-name}/proposal.md`
**Next**: sdd-spec o sdd-design
**Risks**: None
**Skill Resolution**: paths-injected — 3 skills (react-19, typescript, tailwind-4)
(otros valores: `fallback-registry`, `fallback-path` o `none — no se encontró registro`)
```

Nota: el punto de extensión RDD está integrado y activo (ver sección G): al cerrar el `apply` de cada unidad de trabajo y antes de `sdd-archive` (`sdd-verify` → preflight de review → `sdd-archive`), el harness corre el preflight nativo y rutea solo desde el `next_transition` devuelto. El contrato del ciclo de review vive en `_shared/review-ledger-contract.md` y el mapa del harness en `00-meta-skills/harness-map.md`.

## E. Guard de carga de revisión (400 líneas)

SDD debe proteger la carga cognitiva del reviewer, no solo generar tareas.

- El presupuesto por defecto de review por PR es de **400 líneas cambiadas** (`additions + deletions`).
- Cuando el forecast de `sdd-tasks` excede ese presupuesto, el orquestador DEBE preguntar al usuario ANTES de aplicar: PRs encadenados/apilados vs `size:exception`. El preflight de sesión del usuario puede fijar un presupuesto mayor (p. ej. 800 líneas); sin esa declaración, 400 es el default.
- El orquestador DEBE cachear la estrategia de entrega al inicio de sesión: `ask-on-risk` (default), `auto-chain`, `single-pr` o `exception-ok`. Esos cuatro son todo el dominio; cualquier otro valor es inválido: repórtelo y deténgase.
- El orquestador DEBE pasar `delivery_strategy` a `sdd-tasks` y la decisión resuelta a `sdd-apply`.
- `sdd-tasks` DEBE pronosticar si el trabajo planeado puede exceder el presupuesto e incluir líneas de guarda en texto plano: `Decision needed before apply: Yes|No`, `Chained PRs recommended: Yes|No` y `400-line budget risk: Low|Medium|High`.
- Si el pronóstico es alto, `sdd-tasks` DEBE recomendar PRs encadenados o apilados usando unidades de trabajo entregables.
- `sdd-apply` NO DEBE comenzar trabajo sobredimensionado salvo que la estrategia resuelva a slices de PR encadenados/apilados o a `size:exception` aceptado explícitamente.
- Cada slice de PR encadenado debe tener inicio claro, fin claro, alcance autónomo, verificación incluida y rollback razonable.
- En una Feature Branch Chain, el PR #1 apunta a la rama feature/tracker y los hijos a la rama padre inmediata; si GitHub muestra slices previos en un diff hijo, haga retarget/rebase hasta que el diff quede limpio.

Este guard existe para reducir el agotamiento del reviewer y mantener la entrega segura. No lo trate como ruido de proceso opcional.

## F. Cierre con aprendizajes clave

Cierre su **reporte final** (el envelope) con una sección `## Key Learnings` para habilitar la captura pasiva de Engram.

**Formato**: lista numerada de 1-5 ítems. Cada ítem es una oración factual autónoma de ≥20 caracteres y ≥4 palabras.

**Ejemplo**:

```markdown
## Key Learnings

1. La validación asíncrona en la fase apply detectó una condición de carrera en escrituras concurrentes.
2. La regeneración de goldens requiere el flag `-update` antes de re-ejecutar.
3. Los contratos de review acotado deben mantenerse consistentes entre `sdd-phase-common.md` y el mapa del harness.
```

Esto aplica a su respuesta final de texto al orquestador, no a salidas intermedias ni contenido de artefactos. Engram extraerá y persistirá estos aprendizajes automáticamente.

## G. Contrato RDD — integración con el ciclo de review nativo (gentle-ai 3.4.0)

El catálogo NO reimplementa el mecanismo de review: se integra al ciclo nativo del binario `gentle-ai` (Native Compact Review Orchestration). El contrato completo del ciclo vive en `_shared/review-ledger-contract.md` y es SOLO para el orquestador y el CLI nativo — nunca se pasa a lentes, refuters, jueces, correctores ni validadores.

**Dos posiciones activas:**

1. **Post-apply, por unidad de trabajo**: al cerrar el `apply` de una WU, el harness corre el preflight selectorless (`gentle-ai review status --cwd <repo> --contract gentle-ai.review-integration/v2 --agent <runtime> --next-transition`) sobre el candidato del worktree actual y rutea SOLO desde el `next_transition` devuelto — nunca desde prosa, gates ni estado ambiente. No abre un presupuesto de review por su cuenta.
2. **Pre-archive**: el pipeline es `sdd-verify` → preflight de review → `sdd-archive`; mismo preflight, mismo ruteo.

**Regla de entrada**: se entra al ciclo una vez por candidato, tras una implementación autorizada que muta fuente y antes de reportarla completa, cuando el interruptor de review del usuario está activo (`gentle-ai review mode status` lo lee sin mutarlo). El envelope de consentimiento del START decide por candidato; un runtime que corre el preflight él mismo entrega al agente los tokens START exactos y nunca corre START.

**Ciclo atómico (4 pasos)**: (1) *preflight-only* — STATUS solo preflightea el candidato actual y devuelve exactamente un START; (2) *freeze-once* — se invoca solo el START devuelto con sus tokens exactos (lineage, revisión, target); (3) *stay-bound* — toda transición posterior se satisface con los tokens exactos que nombra cada `next_transition`; (4) *acknowledge-exactly* — solo el acknowledgement exacto quema autoridad y artefactos (envelope `gentle-ai.review-acknowledged/v1`); un acknowledgement errado, viejo o re-lanzado se rechaza sin crear recibo ni autoridad de entrega. Un target ya acknowledged está consumido (`target_already_acknowledged`): no se re-revisiona; la entrega sigue la política ordinaria del repositorio.

**Assessment de solo lectura**: `gentle-ai review assess --cwd <repo> --json` (envelope `gentle-ai.review-assessment/v1`) expone el tier de riesgo (`passive|medium|high`), `review_due` y `review_due_reason` SIN crear autoridad de review. Sirve para graduar la verificación (p. ej. verifier independiente en tier alto) sin entrar al lifecycle.

**Presupuestos y stops**: START congela los lentes, el presupuesto de corrección y el presupuesto de contexto por rol (200 KiB en 3.4.0). Stops clave: `correction_context_budget_exceeded` → liberar autoridad con `gentle-ai review abandon` y revisar como candidatos más chicos; `managed_assets_outdated` → correr el `sync` que nombra el continuation y re-consultar STATUS; `lens_context_budget_exceeded` → reducir scope y transacción nueva. La tabla completa de stops vive en el contrato.

**Gates informativos**: los comandos `review validate`/gates (`post-apply`, `pre-commit`, `pre-push`, `pre-pr`, `release`) son compatibility/informational only — NUNCA descubren autoridad ni deciden la entrega (habilitados devuelven `invalidated/unmanaged`; deshabilitados, `disabled/unmanaged`). Commit, push, PR y release quedan FUERA del lifecycle: son decisiones humanas bajo la política ordinaria del repositorio.

**Responsabilidad del harness**: el chequeo y el ruteo del ciclo son del orquestador vía los comandos nativos; ningún agente de fase lanza lentes, refuters, correcciones ni presupuestos. En OpenCode, la captura de cada lente se relaya vía una Task con el `provider_task` opaco del input (agente y prompt se copian exactos; el contrato detalla el transporte).

**Retoma de sesión**: antes de continuar, resuelva el estado del candidato con el STATUS nativo y siga su `next_transition` (recibe el mismo binding; un target consumido no se re-ofrece).

**Opt-in**: la activación es propiedad del usuario y se realiza con el comando nativo (`gentle-ai review mode enable --scope global`; `status` y `disable` aceptan scope `global|clone`). El catálogo NO DEBE activarlo ni desactivarlo por sí mismo. Con el modo inactivo no se entra al ciclo y el pipeline no falla por su ausencia.

**Lentes**: la ejecución de lentes la decide la capa nativa. Las skills del catálogo (`02-dev-roles/code-reviewer` — lentes 4R; `02-dev-roles/judgment-day` — doble juez adversarial) son mapeables a los lentes nativos, pero el catálogo no ejecuta lentes propios.