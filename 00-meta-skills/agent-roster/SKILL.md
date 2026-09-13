---
name: agent-roster
description: "Trigger: cambiar proveedor/modelo de los agentes, roster de agentes, routing por agente, configurar modelos de sub-agentes, perfiles de modelo, set-models, aplicar roster. Sistema declarativo portable: 21 agentes (tier, effort, delegate_only) en una sola fuente de verdad, generador de configuración por runtime y switcher de proveedor con un comando. Use when changing the model/provider of all agents at once, syncing the agent roster across runtimes, or adding a new runtime adapter."
license: MIT
allows-script-exec: "set-models/apply spawn the runtime CLI to project and patch agent configs"
compatibility: Requiere Node 20+. Windows-first: scripts Node puro sin dependencias externas.
metadata:
  trigger: ["cambiar proveedor agentes", "cambiar modelo agentes", "roster de agentes", "agent roster", "set-models", "routing por agente"]
  scope: [root-only]
  version: "1.0.0"
allowed-tools: Read Write Edit Bash(node:*)
---

# 🤖 agent-roster — Roster de agentes portable

Una fuente de verdad declarativa para los **21 agentes** del ecosistema (tier, effort, delegate_only) que se proyecta a cada runtime con un generador, y se cambia de proveedor/modelo para TODOS los agentes con un solo comando.

## 📋 Cuándo usar

- **Usar cuando** se cambia el proveedor o modelo de todos los agentes de una vez (`set-models`).
- **Usar cuando** se sincroniza el roster con un runtime concreto (`apply.mjs`).
- **Usar cuando** se emiten los argumentos nativos de sincronización (`set-models --emit-sync-args`).
- **Usar cuando** se agrega un adaptador de runtime nuevo al generador.
- **Usar cuando** se audita qué modelo tiene cada agente en cada runtime (`--list`).
- **No usar para** aplicar perfiles de fase nativos directamente (eso lo aplica `gentle-ai sync` con los args emitidos).

## 🗺️ Arquitectura del sistema

| Archivo | Rol |
|---|---|
| `_shared/agent-roster/roster.json` | **Fuente de verdad**: los 21 agentes con `tier` (`sdd-strong`/`sdd-mid`/`sdd-cheap`), `effort` (max/high/medium/low), `delegate_only`, más declaración de tiers y fases. |
| `_shared/agent-roster/profiles.json` | Perfiles de proveedor con nombre (`deepseek`, `glm`) + campo `current` (perfil activo) y proveedores custom. |
| `scripts/apply.mjs` | Generador por runtime: lee el roster + perfil y produce/parchea la configuración de cada runtime. |
| `scripts/set-models.mjs` + `set-models.cmd` | Switcher: resuelve tier→modelo, emite args de sync nativos y delega en `apply.mjs` para cada runtime detectado. |
| `references/model-mapping.md` | Explicación de la semántica tier/effort/delegate_only en cada runtime y alineación con `sync`. |

Regla de oro: **`roster.json` es la única fuente de verdad**. Ningún runtime se edita a mano para el routing de agentes; siempre se regenera desde el roster.

## 👥 El roster de 21 agentes

| Grupo | Agentes | Tier | delegate_only |
|---|---|---|---|
| coordinator | `gentle-orchestrator` (effort max) | sdd-strong | no (corre inline) |
| judgment-day | `jd-judge-a`, `jd-judge-b` | sdd-strong | sí |
| sdd | `sdd-research` | sdd-strong | sí |
| sdd | `sdd-apply` | sdd-mid | sí |
| review | `jd-fix-agent` | sdd-mid | sí |
| review | `review-risk`, `review-readability`, `review-reliability`, `review-resilience`, `review-refuter`, `review-validator` | sdd-cheap | sí |
| sdd | `sdd-init`, `sdd-explore`, `sdd-propose`, `sdd-spec`, `sdd-design`, `sdd-tasks`, `sdd-verify`, `sdd-archive` | sdd-cheap | sí |
| sdd | `sdd-onboard` | sdd-cheap | **no** (excepción documentada: walkthrough interactivo corre inline) |

- **Strong (`sdd-strong`, 4 agentes)**: el orquestador (`gentle-orchestrator`), los 2 jueces de Judgment Day (`jd-judge-a`, `jd-judge-b`) y `sdd-research`.
- **Mid (`sdd-mid`, 2 agentes)**: `sdd-apply` y `jd-fix-agent`.
- **Cheap (`sdd-cheap`, 15 agentes)**: los 6 lentes de review y los 9 agentes SDD restantes.

## 🔄 Alineación con perfiles nativos (`gentle-ai sync`)

El catálogo se alinea con el mecanismo nativo de perfiles de `gentle-ai 2.7.0` (`sync --profile <nombre:modelo>` y `--profile-phase <perfil:fase:modelo>`) y **no duplica su motor de perfiles de fase**:

- El catálogo declara los tiers nativos (`sdd-strong`, `sdd-mid`, `sdd-cheap`) y su razonamiento/economía en `_shared/agent-roster/roster.json`.
- `set-models.mjs --emit-sync-args` emite los argumentos exactos de `gentle-ai sync` listos para invocar el binario nativo.
- La aplicación de los perfiles por fase queda delegada enteramente a la mecánica nativa de `gentle-ai sync`.
- El catálogo se limita a aplicar la asignación de modelos de los **21 agentes** (`agent.<name>.model` en OpenCode, preset en dsh).

## 🛠️ Workflow

1. **Inspeccionar** el estado actual:

   ```powershell
   node 00-meta-skills/agent-roster/scripts/set-models.mjs --list
   ```

2. **Emitir argumentos para `gentle-ai sync`** (alineación sin duplicación):

   ```powershell
   node 00-meta-skills/agent-roster/scripts/set-models.mjs --emit-sync-args
   node 00-meta-skills/agent-roster/scripts/set-models.mjs --emit-sync-args --json
   ```

3. **Cambiar de proveedor** para todos los agentes (siempre revisar el plan primero):

   ```powershell
   node 00-meta-skills/agent-roster/scripts/set-models.mjs --profile glm --dry-run
   node 00-meta-skills/agent-roster/scripts/set-models.mjs --profile glm --apply
   ```

   El wrapper Windows abrevia el comando: `00-meta-skills\agent-roster\scripts\set-models.cmd --profile glm --apply`.

4. **Ajustar modelos puntuales** (modifica el perfil activo):

   ```powershell
   node 00-meta-skills/agent-roster/scripts/set-models.mjs --all opencode-go/deepseek-v4-pro --apply
   node 00-meta-skills/agent-roster/scripts/set-models.mjs --strong opencode-go/glm-5.3 --apply
   node 00-meta-skills/agent-roster/scripts/set-models.mjs --mid opencode-go/glm-5.2 --apply
   node 00-meta-skills/agent-roster/scripts/set-models.mjs --cheap opencode-go/glm-5.2 --apply
   ```

5. **Guardar una combinación** como perfil con nombre (no cambia el perfil activo):

   ```powershell
   node 00-meta-skills/agent-roster/scripts/set-models.mjs --save-profile mi-combinacion --apply
   ```

6. **Generar/sincronizar un runtime específico** sin pasar por el switcher:

   ```powershell
   node 00-meta-skills/agent-roster/scripts/apply.mjs --runtime opencode --dry-run
   node 00-meta-skills/agent-roster/scripts/apply.mjs --runtime opencode --apply
   node 00-meta-skills/agent-roster/scripts/apply.mjs --runtime dsh --dry-run
   ```

## 🚦 Reglas duras

- **Nunca escribir sin `--apply`**: el modo por defecto es `--dry-run` en ambos scripts.
- **Backup antes de escribir**: `apply.mjs` crea `<target>.roster.bak-<timestamp>` antes de tocar una configuración existente.
- **Merge quirúrgico**: en OpenCode solo se parchea `agent.<name>.model` de los 21 agentes; toda otra clave queda byte a byte intacta.
- **Regla de prueba**: NO ejecutar `--apply` contra el `opencode.json` global real en tests; usar una copia temporal con `apply.mjs --config <copia>`.
- **Regenerar, no editar**: `gentle-ai-dsh/preset/roster.routing.json` es un artefacto derivado del roster; se regenera con `--runtime dsh --apply`.
- **Sin dependencias**: todos los scripts son Node puro (Windows-first, sin paquetes externos).

## 🧩 Adaptadores por runtime

| Runtime | Mecanismo | Adapter |
|---|---|---|
| OpenCode | `agent.<name>.model` en `opencode.json` (merge quirúrgico de solo esa clave) | incluido |
| dsh (DeepSeek Harness) | No hay modelo por agente: herramientas `subagent` (cheap/mid) vs `subagent_strong` (strong) con env `DSH_FLASH_MODEL`/`DSH_STRONG_MODEL`. Emite `preset/roster.routing.json` y sincroniza los literales fallback del preset | incluido |
| Claude Code | Frontmatter `model: <alias>` por sub-agente en `.claude/agents/*.md` (documentado en references, adaptador futuro) | documentado |

### Cómo agregar un adaptador de runtime nuevo

1. Leer el mecanismo de asignación de modelo del runtime (campo por agente, tier de herramienta o frontmatter).
2. Agregar un caso `--runtime <id>` en `apply.mjs` con dos funciones: una de cálculo del plan y una de escritura con backup (o emisión de artefacto derivado).
3. Registrar la detección del runtime en `apply.mjs --runtime list` y en `set-models.mjs` (función `detectedRuntimes`).
4. Documentar la semántica tier/effort/delegate_only en `references/model-mapping.md`.
5. Verificar: dry-run sale 0, apply es idempotente y el backup preserva los bytes originales.

## 📚 Referencias

- [references/model-mapping.md](references/model-mapping.md) — explicación de tier/effort/delegate_only por runtime, tiers nativos y no-duplicación con `sync`.
- [roster.json](../../_shared/agent-roster/roster.json) — fuente de verdad del roster (21 agentes + tiers y fases).
- [profiles.json](../../_shared/agent-roster/profiles.json) — perfiles de proveedor y tiers nativos.
- [apply.mjs](scripts/apply.mjs) — generador por runtime.
- [set-models.mjs](scripts/set-models.mjs) — switcher de proveedor y emisor de args de sync.
- [sdd-orchestrator — model-routing](../../00-meta-skills/sdd-orchestrator/references/model-routing.md) — routing por fase SDD (sistema complementario).
- [gentle-orchestrator](../../00-meta-skills/gentle-orchestrator/SKILL.md) — protocolo de coordinación que consume este roster.

## 🔄 Relación con otras meta-skills

- `gentle-orchestrator` — describe el uso de los 21 agentes; este sistema materializa su routing en cada runtime.
- `sdd-orchestrator` — rutea fases del DAG SDD; el routing por fase (`_shared/model-routing/`) convive con este routing por agente.
- `skill-sync` — instala skills; este sistema configura los modelos de los agentes que las ejecutan.
- `skill-validator` — valida el catálogo; los scripts de este sistema salen con 0 cuando el roster está íntegro.
