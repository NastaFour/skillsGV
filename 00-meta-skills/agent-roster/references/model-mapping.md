# Model Mapping — semántica tier / effort / delegate_only por runtime

> Explicación de cómo el roster declarativo (`_shared/agent-roster/roster.json`) se traduce en cada runtime. Este documento es la referencia canónica para agregar adaptadores nuevos; el comportamiento exacto de cada adaptador vive en `scripts/apply.mjs`.

## Los tres campos del roster

| Campo | Significado | Valores |
|---|---|---|
| `tier` | Clase de modelo para el agente. | `strong` (modelo de razonamiento completo) \| `flash` (modelo económico para trabajo mecánico) |
| `effort` | Intensidad de razonamiento esperada. | `max` \| `high` |
| `delegate_only` | Si el agente solo se ejecuta como sub-agente delegado (nunca como agente principal de sesión). | `true` \| `false` |

`delegate_only: false` solo aparece en dos agentes, por razones distintas:

- `gentle-orchestrator`: es el coordinador principal de la sesión (tier strong, effort max).
- `sdd-onboard`: walkthrough interactivo que corre inline con el usuario (excepción documentada en el SKILL.md).

## OpenCode (`--runtime opencode`)

Mecanismo: `agent.<name>.model` dentro del objeto `"agent"` de `opencode.json`.

| Campo del roster | Traducción OpenCode |
|---|---|
| `tier` | El valor de `agent.<name>.model`: strong → `<profile>.strong`, flash → `<profile>.flash`. |
| `effort` | Informativo: OpenCode lo expresa como `variant` (`max`/`high`), que el adaptador **no** toca — solo se parchea `model`. |
| `delegate_only` | Informativo: corresponde a `hidden: true`, `mode: "subagent"` y `permission` restrictiva en la config; el adaptador no las modifica. |

Comportamiento del adaptador:

- **Merge quirúrgico**: se ubica cada bloque de los 20 agentes por búsqueda textual (`"<name>": {`) con brace-matching; solo se reemplaza el valor de la línea `"model"`. Toda otra clave conserva sus bytes exactos (incluido formato y orden).
- Si un agente del roster no tiene bloque en la config, se reporta como `MISSING-BLOCK` y se omite (no se inventan bloques).
- Si un agente tiene bloque pero sin clave `model`, se inserta una línea `"model"` tras la llave de apertura.
- Backup: `<config>.roster.bak-<timestamp>` antes de escribir; si no hay cambios no se escribe ni se crea backup (idempotencia).

## dsh / DeepSeek Harness (`--runtime dsh`)

Hallazgo del preset (`gentle-ai-dsh/preset/agent.cordis.yml`, inspeccionado al construir el adaptador):

- **No existe campo de modelo por agente**. El preset declara herramientas de delegación con semántica de selección por tier:
  - `subagent` y `subagent_fork`: modelo flash (`DSH_FLASH_PROVIDER`/`DSH_FLASH_MODEL`, `maxTokens: 16000`).
  - `subagent_strong`: modelo fuerte (`DSH_STRONG_PROVIDER`/`DSH_STRONG_MODEL`).
- El orquestador corre en el modelo principal de la sesión (no delegado).
- Los modelos se resuelven en runtime vía variables de entorno con literales fallback en el propio preset (p. ej. `!!js process.env.DSH_FLASH_MODEL || 'deepseek-v4-flash'`).

Traducción en dsh:

| Campo del roster | Traducción dsh |
|---|---|
| `tier` | Selección de herramienta: strong → `subagent_strong`, flash → `subagent` (o `subagent_fork`). |
| `effort` | Informativo: los topes del preset (`maxTokens`, `maxDepth`, `maxRounds`) cumplen ese rol. |
| `delegate_only` | `true` → herramienta de sub-agente según tier; `false` → `"main"` (corre en el modelo principal, no delegado). |

Comportamiento del adaptador:

1. **Emite** `gentle-ai-dsh/preset/roster.routing.json`: artefacto derivado con `agent → { tier, effort, delegate_only, tool }`. Se regenera completo en cada apply (es derivado, no fuente).
2. **Actualiza solo lo trivialmente seguro del preset**: los literales fallback (`DSH_STRONG_PROVIDER`, `DSH_STRONG_MODEL`, `DSH_FLASH_PROVIDER`, `DSH_FLASH_MODEL`). Si el perfil activo difiere, se reemplaza el literal entre comillas simples; nada más del preset se toca. Con backup previo.
3. Nunca se reescribe el preset completo ni se agregan filas nuevas.

## Claude Code (documentado, adaptador futuro)

Mecanismo: frontmatter `model: <alias>` en `.claude/agents/<nombre>.md` por sub-agente.

| Campo del roster | Traducción Claude Code |
|---|---|
| `tier` | `model: <alias-strong>` o `model: <alias-flash>` según el alias disponible en el plan del runtime. |
| `effort` | Informativo: los aliases del plan (p. ej. haiku/sonnet/opus) expresan la clase de esfuerzo. |
| `delegate_only` | `true` → el archivo de agente se usa solo con `Task`/`--agents`; `false` → puede ser agente principal. |

Al implementarlo: leer `list()` del runtime (según el protocolo de `00-meta-skills/sdd-orchestrator/references/model-routing.md`), resolver los dos aliases y parchear solo la línea `model:` de los 20 archivos, con backup.

## Notas de diseño

- El routing por **fase** (`_shared/model-routing/profiles.schema.json`) y el routing por **agente** (este sistema) son ortogonales: el primero decide qué modelo ejecuta cada fase del DAG SDD; el segundo fija qué modelo tiene cada agente delegado. Conviven sin tocarse.
- Ningún adaptador debe editar la fuente de verdad: si un runtime necesita algo que el roster no declara, se agrega al schema del roster (versión mayor) y se actualizan los adaptadores.
