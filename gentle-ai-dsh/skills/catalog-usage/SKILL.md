---
name: catalog-usage
description: Trigger: instalar skills, catálogo de skills, usar el catálogo, skill-sync, install-skills, onboarding, rollback, uninstall. Onboarding y operación del catálogo para agentes: instalación, uso diario y mantenimiento.
license: MIT
compatibility: Requires Node 20+. Windows-first (pure Node scripts, no Bash). Cross-platform (Windows, macOS, Linux).
metadata:
  trigger: ["catalogo", "catálogo", "catalogo de skills", "usar el catalogo", "onboarding"]
  scope: [global, project]
  version: "1.0.0"
allowed-tools: Read Bash(node:*)
---

# Catalog Usage — Onboarding y Operación del Catálogo

## Cuándo usar esta skill

- Primer contacto con el catálogo: un agente recién instalado necesita saber cómo instalar, usar y mantener el sistema.
- El usuario pregunta cómo instalar skills, qué es el catálogo, cómo usarlo día a día o cómo mantenerlo.
- Delimitación: esta skill da el mapa del sistema; la ejecución detallada de una sincronización cross-tool vive en [skill-sync](../skill-sync/SKILL.md), y crear skills nuevas en `skill-creator`.

## Instalación

Ejecutar siempre `--dry-run` primero. Desde la raíz del catálogo:

```bash
node 00-meta-skills/skill-sync/scripts/install-skills.mjs --dry-run
node 00-meta-skills/skill-sync/scripts/install-skills.mjs
```

Variantes del instalador:

- `--target <ruta>`: instalar dentro de un proyecto concreto (sin el flag: entorno global de las herramientas detectadas).
- `--tool <id>` (repeatable): `claude-code`, `opencode`, `cursor`, `copilot`, `codex`, `gemini-cli`, `antigravity`, `kiro`, `windsurf`, `deepseek`.
- `--all-tools`: omitir la detección e instalar para todas las herramientas conocidas.
- `--only <lista>`: solo categorías separadas por comas (`--only "04-backend,05-frontend"`).
- `--symlink`: symlinks/junctions en lugar de copia (una única fuente de verdad; los cambios se propagan al instante).

### Si algo sale mal

- `--rollback`: revierte la última generación de instalación completa (restaura lo sobrescrito, elimina lo nuevo); queda registrado en el historial del manifiesto.
- `--uninstall`: elimina únicamente archivos propios registrados como owned en el manifiesto; los archivos ajenos, editados por el usuario o symlinked se conservan y se listan.
- Ambos requieren el manifiesto que el instalador deja en cada destino. Sin manifiesto, eliminar manualmente las carpetas creadas bajo `<herramienta>/skills/`.

## Cableado Engram

La memoria persistente entre sesiones se cablea con el binario Engram, no con una skill:

```bash
engram setup claude-code
```

Sustituir `<agente>` según corresponda. Después, seguir la convención de `engram-integration`: guardar decisiones y bugs con `mem_save` apenas ocurren, y buscar con `mem_search` antes de asumir que no existe contexto previo.

## Flujo diario

1. Correr el router antes de cualquier turno que pueda invocar otra skill:
   ```bash
   node ./00-meta-skills/skill-router/scripts/skill-router.mjs --query "<tarea>" [--diff <lineas>] [--json]
   ```
2. Tier 0 (14 skills base, ~2K tokens) ya está siempre cargado; leer únicamente los cuerpos de las skills listadas en `tier1toLoad`.
3. Trabajo chico (1 archivo, sin dominios críticos) va directo. Features de 2+ archivos o dominios van por `sdd-orchestrator`, que rutea las fases `proposal -> specs -> design -> tasks -> apply -> verify -> archive` en modo automático o interactivo.
4. Antes de cerrar trabajo serio, correr `judgment-day` (dos jueces ciegos independientes sobre el mismo objetivo).

## Mantenimiento

Actualizar el catálogo local y reinstalar:

```bash
git pull
node 00-meta-skills/skill-sync/scripts/install-skills.mjs --dry-run
node 00-meta-skills/skill-sync/scripts/install-skills.mjs
```

Agregar una skill nueva (los gates son obligatorios y viven en el mismo commit):

1. Crearla con `skill-creator`: nombre lowercase-hyphen igual a la carpeta, descripción de una línea trigger-first, `allowed-tools` presente.
2. Registrarla en `SKILLS.md` (tabla de su categoría + contador actualizado) y en `AGENTS.md` (tabla de categorías + Auto-Invoke List) en el mismo PR: el validador estricto falla si los índices quedan desincronizados.
3. Gate mecánico: `node 00-meta-skills/skill-validator/scripts/validate-skills.mjs --strict` debe terminar en exit 0.
4. Regenerar los índices derivados: `node 00-meta-skills/skill-loader/scripts/skills-loader.mjs --emit-registry` (actualiza `.atl/skill-registry.md`; si cambió el texto de una skill Tier 0, también `--emit-tier0`).
5. Si la skill solapa semánticamente con otra, delimitar el grupo en `00-meta-skills/skill-router/references/overlap-matrix.json` y agregar el fixture correspondiente en `overlap-smoke-tests.json`.

## Solución de problemas

| Síntoma | Fix |
|---|---|
| `--strict` falla con `index-sync-missing-skill` o `registry-entry-missing` | La skill nueva no está registrada: sumarla a `SKILLS.md` y `AGENTS.md` en el mismo commit y regenerar el registro con `--emit-registry`. |
| Contador desactualizado en prosa («N skills») tras alta o baja | Actualizar el contador en `SKILLS.md`, `AGENTS.md`, `README.md`, `openspec/config.yaml` y `harness-map.md`, y regenerar con `--emit-registry`; grep del número viejo para cazar residuos. |
| Router devuelve un primario equivocado | Trigger demasiado genérico compartido entre skills: afilar los triggers del frontmatter y cubrir el caso con un fixture. |

## Referencias

- [skill-sync](../skill-sync/SKILL.md) — instalador cross-tool y estrategias de sincronización.
- [AGENTS.md](../../AGENTS.md) — reglas globales, arranque del harness y Auto-Invoke List.
- [SKILLS.md](../../SKILLS.md) — índice completo del catálogo.
