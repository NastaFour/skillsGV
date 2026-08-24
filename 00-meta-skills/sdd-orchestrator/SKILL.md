---
name: sdd-orchestrator
description: "Trigger: sdd new, sdd continue, sdd ff, SDD change, feature >1 archivo. Thin orchestrator that routes SDD phases without executing them: DAG, auto/interactive modes, gatekeeper, dedup. Use when starting or continuing an SDD change."
license: MIT
allowed-tools: Read Task Bash(git:*,gh:*)
metadata:
  author: gentleman-programming
  version: "1.0.0"
  trigger: ["sdd new", "sdd continue", "sdd ff", "spec-driven development", "cambio SDD"]
  scope: [global, project]
---

# sdd-orchestrator — Orquestador delgado del pipeline SDD

> **Atribución**: adaptación catálogo-nativa del contrato de orquestación SDD del runtime [gentle-ai](https://github.com/Gentleman-Programming/gentle-ai) (Gentleman Programming, MIT). Los agentes de fase vendored viven en `00-meta-skills/sdd-*`.

## Rol de ejecución

Confirme su rol antes de actuar.

- Si usted es el sub-agente dedicado `sdd-orchestrator`, coordine las fases según este documento. No ejecute el trabajo de fase de forma inline: delegue (multi-agente) o ejecute en orden DAG (solo-agente, ver Portabilidad).
- Si cargó esta skill directamente con la herramienta `skill()`, usted es el orquestador de la sesión: siga este documento como contrato de orquestación.

## Contrato de idioma

Los artefactos técnicos generados siguen la convención del proyecto destino (en este catálogo: español neutral/profesional). No herede el idioma conversacional ni la voz regional de la persona en los artefactos SDD.

## Propósito

Coordina el pipeline SDD de forma delgada: **rutea, no ejecuta**. Mantenga un hilo de conversación fino, delegue TODO el trabajo real a los agentes de fase y sintetice los resultados. Sintetice corto por defecto: reporte la decisión, el resultado y la siguiente acción; expanda solo cuando el usuario lo pida o la situación lo requiera.

## Agentes de fase (roles / lee / escribe)

| Agente | Rol | Lee | Escribe |
|---|---|---|---|
| `sdd-init` | Detecta stack/capacidades de testing | — | `sdd-init/{project}` |
| `sdd-explore` | Mapea el área, compara enfoques | — | `sdd/{change}/explore` |
| `sdd-propose` | Propuesta (intent, scope, approach) | explore (opcional) | `sdd/{change}/proposal` |
| `sdd-spec` | Specs delta Given/When/Then | proposal (requerido) | `sdd/{change}/spec` |
| `sdd-design` | Diseño técnico | proposal (requerido), spec (opcional) | `sdd/{change}/design` |
| `sdd-tasks` | Desglose + forecast de entrega (400 líneas) | spec + design (requeridos) | `sdd/{change}/tasks` |
| `sdd-apply` | Implementa por lotes | tasks + spec + design + apply-progress | `sdd/{change}/apply-progress` (merge) |
| `sdd-verify` | Valida contra specs | spec + tasks + apply-progress | `sdd/{change}/verify-report` |
| `sdd-archive` | Cierra y sincroniza deltas | Todos | `sdd/{change}/archive-report` |
| `sdd-onboard` | Guía el ciclo completo (docente) | Todos (lectura) | — |

## DAG de dependencias

```
proposal → specs → tasks → apply → verify → archive
             ^
           design (ramifica de proposal, en paralelo con specs)
```

`proposal` precede a `specs` y `design`; `specs` y `design` preceden a `tasks`; `tasks` precede a `apply`; `apply` precede a `verify`; `verify` precede a `archive`. `design` puede ramificar desde `proposal` en paralelo con `specs`. Nunca avance una fase sin su dependencia satisfecha: una fase con dependencia insatisfecha devuelve `status: blocked` y usted NO avanza a la fase dependiente.

## Modos de ejecución

- **auto**: las fases corren back-to-back sin pausar; tras cada fase se ejecuta el gatekeeper antes de lanzar la siguiente. El usuario solo ve una interrupción cuando el gatekeeper detecta un problema real; si no, solo el resultado final.
- **interactive** (default): tras cada fase se muestra el resumen y se espera aprobación explícita antes de continuar. La aprobación es por fase: «continuá»/«dale» aprueba solo la fase inmediata, no el resto del pipeline. Un artefacto generado no se considera aprobado hasta que el usuario lo revisó o delegó esa revisión.

Cachee el modo elegido por sesión; no vuelva a preguntar salvo que el usuario pida cambiarlo. Si el usuario no especifica, use `interactive`.

## Gatekeeper (modo auto)

Tras cada fase y ANTES de lanzar la siguiente, valide:

1. **Conformidad de contrato**: la fase devolvió los seis campos (`status`, `executive_summary`, `artifacts`, `next_recommended`, `risks`, `skill_resolution`) y `status` indica éxito (no partial/failed/blocked).
2. **Existencia del artefacto**: el artefacto declarado existe y es legible en el backend activo — lea de vuelta (engram: `mem_search` + `mem_get_observation`; openspec: leer el path). Una fase que reporta éxito sin artefacto recuperable FALLA el gate.
3. **Sin alucinaciones**: todo path, símbolo, comando o artefacto citado resuelve realmente.
4. **Sin deriva**: la salida es consistente con las entradas de la fase (spec dentro del alcance de la propuesta, design responde a la propuesta, tasks cubren spec y design, apply implementa tasks).
5. **Coherencia de ruteo**: `next_recommended` sigue el DAG y no hay riesgos CRITICAL sin abordar.

Fallo → re-ejecute la MISMA fase UNA vez con feedback correctivo que nombre los fallos específicos (no reintento a ciegas). Segundo fallo → DETENGA la cadena y reporte al usuario nombrando la fase, los hallazgos del gatekeeper, ambos intentos y el fix recomendado. No avance a fases dependientes con un artefacto malo: el error se propaga.

## Dedup de lanzamientos

Mantenga un registro de `(fase, fingerprint-de-tarea)` por sesión. El fingerprint es un hash corto o resumen normalizado del texto de instrucción (fase + referencias de artefactos clave). Si el mismo par ya fue lanzado, NO lo lance de nuevo: una sola ejecución por tarea distinta. Esto previene lanzamientos duplicados y conflictos «archivo modificado desde la última lectura».

## Resolución de skills (delegación)

Resuelva el registro de skills UNA vez por sesión y cachee el índice (nombre, trigger, scope, path exacto):

1. `mem_search(query: "skill-registry", project: "{project}")` → `mem_get_observation(id)` para el contenido completo.
2. Respaldo: lea `.atl/skill-registry.md` de la raíz del proyecto.
3. Por cada sub-agente, matchee skills por contexto de código (paths que tocará) Y contexto de tarea (acciones), y pase los paths exactos de `SKILL.md` como `## Skills to load before work` en el prompt del sub-agente. Nunca resúmenes digeridos: los sub-agentes leen el `SKILL.md` completo.

Feedback de resolución: si el sub-agente devolvió `skill_resolution: fallback-registry|fallback-path|none`, el caché de la sesión se perdió (probablemente compactación): re-lea el registro y pase paths en las siguientes delegaciones.

## Portabilidad (executor-first)

Mismas skills y mismo DAG en OpenCode y Antigravity; solo cambia el transporte de ejecución:

- **Multi-agente (OpenCode)**: delegue cada fase a un sub-agente de fase con contexto fresco.
- **Solo-agente (Antigravity)**: ejecute las fases inline en orden DAG y persista el estado entre fases vía Engram (topic key `sdd/{change}/state`).

Regla de oro de delegación: leer para decidir/verificar (1-3 archivos) → inline; leer para explorar (4+ archivos) → delegar exploración; escribir con análisis (2+ archivos no triviales) → delegar; bash para estado (git, gh) → inline; correr tests/builds → delegar.

## Persistencia y recuperación

- Almacén de artefactos por sesión: elección de sesión > `openspec/config.yaml` > default (engram si disponible, si no `none`).
- Modos: `engram` (mem_save con `capture_prompt: false`, topic keys `sdd/{change}/{artifact}`), `openspec` (archivos), `hybrid` (ambos, misma versión), `none` (solo en línea).
- Recuperación SIEMPRE vía `mem_search` → `mem_get_observation` (contenido completo, no previews truncadas).
- Continuidad de apply: antes de lanzar `sdd-apply` para un lote que no es el primero, busque `sdd/{change-name}/apply-progress` y pase al sub-agente la instrucción de MERGE (no sobrescribir).

## Guard de carga de revisión

Cachee `delivery_strategy` al inicio de sesión (`ask-on-risk` default, `auto-chain`, `single-pr`, `exception-ok`) y `chain_strategy` cuando aplique (`stacked-to-main`, `feature-branch-chain`). Pase `delivery_strategy` a `sdd-tasks` y la decisión resuelta a `sdd-apply`. Si el forecast de tasks indica >400 líneas o `Chained PRs recommended: Yes` y la estrategia no está resuelta, pregunte al usuario ANTES de aplicar (ver Protocolo Común, sección E).

## Contrato de resultado

En cada fase, el agente devuelve: `status` (`success|partial|blocked`), `executive_summary`, `artifacts`, `next_recommended`, `risks`, `skill_resolution` (`paths-injected|fallback-registry|fallback-path|none`). `blocked` sin dependencia satisfecha → no avance.

## Referencias

- [Protocolo común de fase SDD](../../_shared/sdd-phase-common.md) — carga de skills, recuperación, persistencia, envelope y guard de 400 líneas.