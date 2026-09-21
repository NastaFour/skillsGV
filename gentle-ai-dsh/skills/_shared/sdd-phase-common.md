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

**Excepción del collector `sdd-research`**: ese collector output-only no lee artefactos locales, estado del repositorio ni de Engram, y no usa locators; devuelve su envelope de evidencia al orquestador, que lo valida y persiste por la ruta del store seleccionado. Las secciones B y C no aplican a `sdd-research`; toda otra fase las sigue sin cambios.

El orquestador inyecta el store de artefactos y los locators que el status nativo ya resolvió (`artifactStore` y `artifactPaths` de `gentle-ai sdd-status --json --instructions`). Lea lo que le dan.

**NO detecte el store de artefactos ni ramifique por él.** El dispatcher lo resolvió desde el store que el workspace DECLARA. Un agente que re-deriva el store discrepa con la autoridad que lo lanzó — así una fase termina leyendo un store que el workspace nunca declaró, o no leyendo nada y devolviendo un resultado vacío.

Por cada artefacto que su fase requiere, lea su locator:

| store reportado | forma del locator | cómo leerlo |
|---|---|---|
| `openspec` | path del repo, p. ej. `openspec/changes/{change-name}/tasks.md` | lea el archivo |
| `engram` | topic key, p. ej. `sdd/{change-name}/tasks` | `mem_search(query: "<locator>", project: "{project}")` → `mem_get_observation(id)` |
| `hybrid` | cualquiera de las dos formas | archivo si el locator es un path; observación si es un topic key |

**CRÍTICO para locators topic-key**: `mem_search` devuelve PREVIEWS de ~300 caracteres, no el contenido completo. DEBE llamar `mem_get_observation(id)` por CADA artefacto. **Saltarse este paso produce salida incorrecta.** No use previews de búsqueda como material fuente.

**Ejecute todas las búsquedas y recuperaciones en paralelo** — no secuencialmente.

Un locator requerido reportado como `<unresolved>` significa que el artefacto no existe: repórtelo como blocker. Nunca sustituya la copia de otro store ni salga a buscarla por su cuenta.

## C. Persistencia de artefactos

Toda fase que produce un artefacto — salvo el collector output-only `sdd-research` — DEBE persistirlo. Saltarse esto ROMPE el pipeline — las fases descendentes no encontrarán su salida.

Persista en el store que el orquestador reportó, usando el locator de ese artefacto. Como en la sección B, el store se lo dicen; no lo detecte. Los mecanismos de escritura de abajo difieren porque escribir un archivo y guardar una observación son operaciones genuinamente distintas — no porque el agente elija entre ellas.

Los reportes de verificación son diagnósticos opcionales: persista resultados honestos sin validador ni certificado; preserve los hallazgos históricos y nunca fabrique un PASS para habilitar el archive.

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

Intente AMBAS escrituras declaradas y lea de vuelta cada una exitosa. Las escrituras hybrid NO son atómicas: preserve las exitosas y reporte persistencia parcial con el locator pendiente. No afirme un mirror exitoso, no sustituya silenciosamente otro store ni revierta progreso válido.

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

**Validación de un resultado de fase delegada.** Un runtime cuyo host no valida los task results por sí mismo DEBE correr `gentle-ai sdd-task-result --phase <fase> --cwd <repo> --input <path|->` sobre la salida cruda del hijo antes de tratarla como resultado. Sale cero para un resultado utilizable; cualquier otro caso renderiza el fallo terminal tipado de abajo (idéntico byte a byte al que emite un host que valida, porque ambos leen una sola definición). Nunca clasifique un task result leyéndolo usted mismo.

Si la validación terminal reporta `sdd_task_result_empty` o `sdd_task_result_malformed`, no asuma que este envelope fue entregado. No reintente automáticamente ni inicie otra fase. El valor terminal empieza con `GENTLE_AI_SDD_FAILURE ` seguido de un handoff JSON `gentle-ai.sdd-task-result-failure/v1`: presérvelo sin cambios, siga su `continuation` exactamente una vez y ejecútelo solo si viene provisto como comando. Nunca convierta guía en comando adivinado: use solo el status estructurado retenido del coordinador para el change y el artifact store seleccionados; si no está disponible, reporte el fallo terminal y pida al usuario que seleccione ambos. No infiera ninguno, no corra discovery de status sin scope, no reintente, no lance otra fase. Reporte el fallo tipado al usuario y espere una decisión explícita. Un lanzamiento posterior en la misma sesión recibe `sdd_task_dispatch_latched`: ese lanzamiento nunca se despachó — nombra la fase que pidió, la fase y el código anteriores que fallaron, y su `exit`; inicie una sesión nueva para lanzar fases SDD de nuevo.

Los acknowledgements `background: true` de OpenCode y sus señales de progreso NO son terminales: no deben producir ni fallo de transporte ni latch de sesión; espere a que el hijo termine y use la ruta normal de artefactos/status.

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