---
name: agent-roster
description: "Trigger: cambiar proveedor/modelo de los agentes, roster de agentes, routing por agente, configurar modelos de sub-agentes, perfiles de modelo, set-models, aplicar roster. Sistema declarativo portable: 20 agentes (tier, effort, delegate_only) en una sola fuente de verdad, generador de configuración por runtime y switcher de proveedor con un comando. Use when changing the model/provider of all agents at once, syncing the agent roster across runtimes, or adding a new runtime adapter."
license: MIT
compatibility: Requiere Node 20+. Windows-first: scripts Node puro sin dependencias externas.
metadata:
  trigger: ["cambiar proveedor agentes", "cambiar modelo agentes", "roster de agentes", "agent roster", "set-models", "routing por agente"]
  scope: [root-only]
  version: "1.0.0"
allowed-tools: Read Write Edit Bash(node:*)
---

# 🤖 agent-roster — Roster de agentes portable

Una fuente de verdad declarativa para los **20 agentes** del ecosistema (tier, effort, delegate_only) que se proyecta a cada runtime con un generador, y se cambia de proveedor/modelo para TODOS los agentes con un solo comando.

## 📋 Cuándo usar

- **Usar cuando** se cambia el proveedor o modelo de todos los agentes de una vez (`set-models`).
- **Usar cuando** se sincroniza el roster con un runtime concreto (`apply.mjs`).
- **Usar cuando** se agrega un adaptador de runtime nuevo al generador.
- **Usar cuando** se audita qué modelo tiene cada agente en cada runtime (`--list`).
- **No usar para** routing por fase SDD (eso es `_shared/model-routing/` + `sdd-orchestrator`) ni para instalar skills (`skill-sync`).

## 🗺️ Arquitectura del sistema

| Archivo | Rol |
|---|---|
| `_shared/agent-roster/roster.json` | **Fuente de verdad**: los 20 agentes con `tier` (strong/flash), `effort` (max/high) y `delegate_only`. |
| `_shared/agent-roster/profiles.json` | Perfiles de proveedor con nombre (`deepseek`, `glm`) + campo `current` (perfil activo). |
| `scripts/apply.mjs` | Generador por runtime: lee el roster + perfil y produce/parchea la configuración de cada runtime. |
| `scripts/set-models.mjs` + `set-models.cmd` | Switcher: resuelve tier→modelo y delega en `apply.mjs` para cada runtime detectado. |
| `references/model-mapping.md` | Explicación de la semántica tier/effort/delegate_only en cada runtime. |

Regla de oro: **`roster.json` es la única fuente de verdad**. Ningún runtime se edita a mano para el routing de agentes; siempre se regenera desde el roster.

## 👥 El roster de 20 agentes

| Grupo | Agentes | Tier | delegate_only |
|---|---|---|---|
| coordinator | `gentle-orchestrator` (effort max) | strong | no (corre inline) |
| judgment-day | `jd-judge-a`, `jd-judge-b` | strong | sí |
| sdd | `sdd-apply` | strong | sí |
| review | `jd-fix-agent`, `review-risk`, `review-readability`, `review-reliability`, `review-resilience`, `review-refuter`, `review-validator` | flash | sí |
| sdd | `sdd-init`, `sdd-explore`, `sdd-propose`, `sdd-spec`, `sdd-design`, `sdd-tasks`, `sdd-verify`, `sdd-archive` | flash | sí |
| sdd | `sdd-onboard` | flash | **no** (excepción documentada: walkthrough interactivo corre inline) |

Solo 4 agentes usan tier strong: el orquestador, los 2 jueces de Judgment Day y `sdd-apply`. El resto son flash.

## 🛠️ Workflow

1. **Inspeccionar** el estado actual:

   ```powershell
   node 00-meta-skills/agent-roster/scripts/set-models.mjs --list
   ```

2. **Cambiar de proveedor** para todos los agentes (siempre revisar el plan primero):

   ```powershell
   node 00-meta-skills/agent-roster/scripts/set-models.mjs --profile glm --dry-run
   node 00-meta-skills/agent-roster/scripts/set-models.mjs --profile glm --apply
   ```

   El wrapper Windows abrevia el comando: `00-meta-skills\agent-roster\scripts\set-models.cmd --profile glm --apply`.

3. **Ajustar modelos puntuales** (modifica el perfil activo):

   ```powershell
   node 00-meta-skills/agent-roster/scripts/set-models.mjs --all opencode-go/deepseek-v4-pro --apply
   node 00-meta-skills/agent-roster/scripts/set-models.mjs --strong opencode-go/glm-5.3 --apply
   node 00-meta-skills/agent-roster/scripts/set-models.mjs --flash opencode-go/glm-5.2 --apply
   ```

4. **Guardar una combinación** como perfil con nombre (no cambia el perfil activo):

   ```powershell
   node 00-meta-skills/agent-roster/scripts/set-models.mjs --save-profile mi-combinacion --apply
   ```

5. **Generar/sincronizar un runtime específico** sin pasar por el switcher:

   ```powershell
   node 00-meta-skills/agent-roster/scripts/apply.mjs --runtime opencode --dry-run
   node 00-meta-skills/agent-roster/scripts/apply.mjs --runtime opencode --apply
   node 00-meta-skills/agent-roster/scripts/apply.mjs --runtime dsh --dry-run
   ```

## 🚦 Reglas duras

- **Nunca escribir sin `--apply`**: el modo por defecto es `--dry-run` en ambos scripts.
- **Backup antes de escribir**: `apply.mjs` crea `<target>.roster.bak-<timestamp>` antes de tocar una configuración existente.
- **Merge quirúrgico**: en OpenCode solo se parchea `agent.<name>.model` de los 20 agentes; toda otra clave queda byte a byte intacta.
- **Regla de prueba**: NO ejecutar `--apply` contra el `opencode.json` global real en tests; usar una copia temporal con `apply.mjs --config <copia>`.
- **Regenerar, no editar**: `gentle-ai-dsh/preset/roster.routing.json` es un artefacto derivado del roster; se regenera con `--runtime dsh --apply`.
- **Sin dependencias**: todos los scripts son Node puro (Windows-first, sin paquetes externos).

## 🧩 Adaptadores por runtime

| Runtime | Mecanismo | Adapter |
|---|---|---|
| OpenCode | `agent.<name>.model` en `opencode.json` (merge quirúrgico de solo esa clave) | incluido |
| dsh (DeepSeek Harness) | No hay modelo por agente: herramientas `subagent` (flash) vs `subagent_strong` (strong) con env `DSH_FLASH_MODEL`/`DSH_STRONG_MODEL`. Emite `preset/roster.routing.json` y sincroniza los literales fallback del preset | incluido |
| Claude Code | Frontmatter `model: <alias>` por sub-agente en `.claude/agents/*.md` (documentado en references, adaptador futuro) | documentado |

### Cómo agregar un adaptador de runtime nuevo

1. Leer el mecanismo de asignación de modelo del runtime (campo por agente, tier de herramienta o frontmatter).
2. Agregar un caso `--runtime <id>` en `apply.mjs` con dos funciones: una de cálculo del plan y una de escritura con backup (o emisión de artefacto derivado).
3. Registrar la detección del runtime en `apply.mjs --runtime list` y en `set-models.mjs` (función `detectedRuntimes`).
4. Documentar la semántica tier/effort/delegate_only en `references/model-mapping.md`.
5. Verificar: dry-run sale 0, apply es idempotente y el backup preserva los bytes originales.

## 📚 Referencias

- [references/model-mapping.md](references/model-mapping.md) — explicación de tier/effort/delegate_only por runtime y hallazgos del preset dsh.
- [roster.json](../../_shared/agent-roster/roster.json) — fuente de verdad del roster.
- [profiles.json](../../_shared/agent-roster/profiles.json) — perfiles de proveedor.
- [apply.mjs](scripts/apply.mjs) — generador por runtime.
- [set-models.mjs](scripts/set-models.mjs) — switcher de proveedor.
- [sdd-orchestrator — model-routing](../../00-meta-skills/sdd-orchestrator/references/model-routing.md) — routing por fase SDD (sistema complementario).
- [gentle-orchestrator](../../00-meta-skills/gentle-orchestrator/SKILL.md) — protocolo de coordinación que consume este roster.

## 🔄 Relación con otras meta-skills

- `gentle-orchestrator` — describe el uso de los 20 agentes; este sistema materializa su routing en cada runtime.
- `sdd-orchestrator` — rutea fases del DAG SDD; el routing por fase (`_shared/model-routing/`) convive con este routing por agente.
- `skill-sync` — instala skills; este sistema configura los modelos de los agentes que las ejecutan.
- `skill-validator` — valida el catálogo; los scripts de este sistema salen con 0 cuando el roster está íntegro.
