# Model Mapping — semántica tier / effort / delegate_only por runtime

> Explicación de cómo el roster declarativo (`_shared/agent-roster/roster.json`) se traduce en cada runtime. Este documento es la referencia canónica para agregar adaptadores nuevos; el comportamiento exacto de cada adaptador vive en `../scripts/apply.mjs`.

## Los tres campos del roster

| Campo | Significado | Valores |
|---|---|---|
| `tier` | Clase de modelo para el agente. | `strong` (modelo de razonamiento completo) \| `mid` (modelo balanceado para código/fixes) \| `cheap` / `flash` (modelo económico/rápido) — retrocompatible con aliases heredados `sdd-strong`, `sdd-mid`, `sdd-cheap` |
| `effort` | Intensidad de razonamiento esperada. | `max` \| `high` \| `medium` \| `low` |
| `delegate_only` | Si el agente solo se ejecuta como sub-agente delegado (nunca como agente principal de sesión). | `true` \| `false` |

`delegate_only: false` solo aparece en dos agentes, por razones distintas:

- `gentle-orchestrator`: es el coordinador principal de la sesión (tier strong, effort max).
- `sdd-onboard`: walkthrough interactivo que corre inline con el usuario (excepción documentada en el SKILL.md).

## Alineación con perfiles nativos (`gentle-ai sync`) y no-duplicación

El catálogo define la economía de modelos por fase y por agente en `roster.json`, utilizando la nomenclatura canónica:
- **`strong`** (alias legacy `sdd-strong`): investigación (`research-first`), propuesta, diseño, orquestador (`gentle-orchestrator`) y jueces (`jd-judge-a`, `jd-judge-b`).
- **`mid`** (alias legacy `sdd-mid`): implementación (`feature-implementer`), verificación (`testing-patterns`, `qa-tester`) y agente de fixes quirúrgicos (`jd-fix-agent`).
- **`cheap` / `flash`** (alias legacy `sdd-cheap`): exploración, mappers, tareas atómicas y lentes de revisión (`review-*`).

**Principio de no-duplicación**:
1. Para **perfiles de fase**: el catálogo **no** implementa un motor propio de aplicación. En su lugar, `set-models.mjs --emit-sync-args` emite los argumentos exactos:
   `gentle-ai sync --profile sdd-strong:<model> --profile sdd-mid:<model> --profile sdd-cheap:<model> --profile-phase <perfil>:<fase>:<model> ...`
   La aplicación efectiva en los entornos la ejecuta el binario nativo `gentle-ai sync`.
2. Para los **agentes declarados en `roster.json`**: `apply.mjs` sigue siendo el mecanismo responsable de proyectar la configuración concreta a cada runtime soportado (`agent.<name>.model` en OpenCode, `model:` en `.claude/agents/*.md` para Claude Code, preset en dsh).

## Escalera L1–L4 y Override por API Key del Usuario

- **Protocolo de API key**: si el usuario indica un modelo explícito (`--frontend <model>` o `--agent <name>:<model>`), se respeta primero `profile.overrides[agent.name]`. Si la API key o el runtime del usuario rechaza o no expone ese ID, **fallar rápido y pedir un modelo válido (o `inherit`)** — jamás degradar en silencio a `cheap`.
- **Niveles**:
  - **L1**: override exacto por llamada (OpenCode / harnesses con string libre).
  - **L2**: mapeo a enum/tier nativo (`opus`/`sonnet`/`haiku`, `pro`/`flash`).
  - **L3**: materialización estática en disco vía `apply.mjs` (`.claude/agents/*.md`, `opencode.json`, `dsh`).
  - **L4**: herencia transparente del modelo fuerte de sesión en runtimes sin override por subagente (Antigravity, Codex, Cursor), registrando `[ModelDispatch: role=<r> requested=<p> resolved=<m> level=L<1-4>]`.

## OpenCode (`--runtime opencode`)

Mecanismo: `agent.<name>.model` dentro del objeto `"agent"` de `opencode.json`.

| Campo del roster | Traducción OpenCode |
|---|---|
| `tier` | `profile.overrides[agent.name]` > `frontend`/`strong` → `<profile>.strong`, `mid` → `<profile>.mid`, `cheap` → `<profile>.cheap`. |
| `effort` | Informativo: OpenCode lo expresa como `variant` (`max`/`high`/`medium`), que el adaptador **no** toca — solo se parchea `model`. |
| `delegate_only` | Informativo: corresponde a `hidden: true`, `mode: "subagent"` y `permission` restrictiva en la config; el adaptador no las modifica. |

Comportamiento del adaptador:

- **Merge quirúrgico**: se ubica cada bloque de los agentes del roster por búsqueda textual (`"<name>": {`) con brace-matching; solo se reemplaza el valor de la línea `"model"`. Toda otra clave conserva sus bytes exactos (incluido formato y orden).
- Si un agente del roster no tiene bloque en la config, se reporta como `MISSING-BLOCK` y se omite (no se inventan bloques).
- Si un agente tiene bloque pero sin clave `model`, se inserta una línea `"model"` tras la llave de apertura.
- Backup: `<config>.roster.bak-<timestamp>` antes de escribir; si no hay cambios no se escribe ni se crea backup (idempotencia).

## dsh / DeepSeek Harness (`--runtime dsh`)

Hallazgo del preset (`gentle-ai-dsh/preset/agent.cordis.yml`, inspeccionado al construir el adaptador):

- **No existe campo de modelo por agente**. El preset declara herramientas de delegación con semántica de selección por tier:
  - `subagent` y `subagent_fork`: modelo flash / cheap (`DSH_FLASH_PROVIDER`/`DSH_FLASH_MODEL`, `maxTokens: 16000`).
  - `subagent_strong`: modelo fuerte (`DSH_STRONG_PROVIDER`/`DSH_STRONG_MODEL`).
- El orquestador corre en el modelo principal de la sesión (no delegado).
- Los modelos se resuelven en runtime vía variables de entorno con literales fallback en el propio preset (p. ej. `!!js process.env.DSH_FLASH_MODEL || 'deepseek-v4-flash'`).

Traducción en dsh:

| Campo del roster | Traducción dsh |
|---|---|
| `tier` | Selección de herramienta: strong → `subagent_strong`, mid/cheap → `subagent` (o `subagent_fork`). |
| `effort` | Informativo: los topes del preset (`maxTokens`, `maxDepth`, `maxRounds`) cumplen ese rol. |
| `delegate_only` | `true` → herramienta de sub-agente según tier; `false` → `"main"` (corre en el modelo principal, no delegado). |

Comportamiento del adaptador:

1. **Emite** `gentle-ai-dsh/preset/roster.routing.json`: artefacto derivado con `agent → { tier, effort, delegate_only, tool }` para todos los agentes declarados en `roster.json` (incluidos `frontend-builder` y `frontend-critic` en `subagent_strong`). Se regenera completo en cada apply (es derivado, no fuente).
2. **Actualiza solo lo trivialmente seguro del preset**: los literales fallback (`DSH_STRONG_PROVIDER`, `DSH_STRONG_MODEL`, `DSH_FLASH_PROVIDER`, `DSH_FLASH_MODEL`). Si el perfil activo difiere, se reemplaza el literal entre comillas simples; nada más del preset se toca. Con backup previo.
3. Nunca se reescribe el preset completo ni se agregan filas nuevas.

## Claude Code (`--runtime claude-code`)

Mecanismo: frontmatter `model: <alias>` en `.claude/agents/<nombre>.md` por sub-agente.

| Campo del roster | Traducción Claude Code |
|---|---|
| `tier` | `profile.overrides[agent.name]` o `strong`/`frontend` → `<alias-strong>`, `mid` → `<alias-mid>`, `cheap` → `<alias-cheap>`. |
| `effort` | Informativo: los aliases del plan (p. ej. haiku/sonnet/opus) expresan la clase de esfuerzo. |
| `delegate_only` | `true` → el archivo de agente se usa solo con `Task`/`--agents`; `false` → puede ser agente principal. |

`apply.mjs --runtime claude-code` parcha quirúrgicamente la línea `model:` del frontmatter YAML en cada `<agent>.md` existente bajo `.claude/agents/`, preservando el resto de bytes y creando `.roster.bak-<timestamp>` antes de escribir.

## Notas de diseño

- El routing por **fase** (`_shared/model-routing/profiles.schema.json` y `gentle-ai sync --profile-phase`) y el routing por **agente** (este sistema) son ortogonales: el primero decide qué modelo ejecuta cada fase del DAG SDD; el segundo fija qué modelo tiene cada agente delegado. Conviven sin tocarse.
- Ningún adaptador debe editar la fuente de verdad: si un runtime necesita algo que el roster no declara, se agrega al schema del roster (versión mayor) y se actualizan los adaptadores.
