# skillsGV

Catálogo multi-agente de **152 skills** conforme a la especificación de [agentskills.io](https://agentskills.io/specification), con harness SDD nativo: un orquestador que rutea las fases del ciclo de vida (`proposal → specs → design → tasks → apply → verify → archive`), routing determinista por turno (`skill-router` con matriz de overlap), revisión adversarial ciega con dos jueces (`judgment-day`), memoria persistente entre sesiones vía Engram y validación mecánica del catálogo (`validate-skills.mjs --strict`).

Las skills son portables a OpenCode, Antigravity, Claude Code, Cursor, Codex, Copilot, Gemini CLI, Kiro, Windsurf y DeepSeek. El proyecto es **Windows-first**: todo el tooling es Node puro, sin dependencia de Bash.

## Quick start

```bash
# 1. Clonar
git clone https://github.com/NastaFour/skillsGV.git
cd skillsGV

# 2. Previsualizar qué se instalaría en las herramientas detectadas (recomendado siempre)
node 00-meta-skills/skill-sync/scripts/install-skills.mjs --dry-run

# 3. Instalar globalmente para todos los agentes detectados
node 00-meta-skills/skill-sync/scripts/install-skills.mjs
```

Requisito: Node.js 20 o superior. No hay `package.json`: los scripts `.mjs` no tienen dependencias externas.

## Instalación

El instalador cross-tool es `00-meta-skills/skill-sync/scripts/install-skills.mjs`. Ejecutalo siempre primero con `--dry-run` para revisar el plan antes de escribir.

| Flag | Efecto |
|---|---|
| `--target <ruta>` | Instala dentro de un proyecto concreto. Sin este flag, instala en el entorno global de las herramientas detectadas. |
| `--tool <id>` | Restringe la instalación a herramientas específicas. Repeatable: `claude-code`, `opencode`, `cursor`, `copilot`, `codex`, `gemini-cli`, `antigravity`, `kiro`, `windsurf`, `deepseek`. |
| `--all-tools` | Omitte la detección e instala para todas las herramientas conocidas. |
| `--only <lista>` | Instala solo categorías separadas por comas, por ejemplo `--only "04-backend,05-frontend"`. |
| `--symlink` | Usa symlinks (junctions en Windows) en lugar de copiar: una única fuente de verdad. |
| `--dry-run` | Muestra qué haría sin escribir nada. |
| `--uninstall` | Elimina únicamente archivos propios registrados en el manifiesto. Los archivos ajenos, editados por el usuario o symlinked se conservan y se listan. Requiere manifiesto. |
| `--rollback` | Revierte la última generación de instalación (restaura el estado previo sobrescrito y elimina lo nuevo). Queda registrado en el historial del manifiesto. |

```bash
# Proyecto concreto, solo dos herramientas
node 00-meta-skills/skill-sync/scripts/install-skills.mjs --target "C:\ruta\al\proyecto" --tool claude-code --tool cursor

# Solo dos categorías, con symlinks
node 00-meta-skills/skill-sync/scripts/install-skills.mjs --only "04-backend,05-frontend" --symlink

# Deshacer la última instalación o retirar el catálogo
node 00-meta-skills/skill-sync/scripts/install-skills.mjs --rollback
node 00-meta-skills/skill-sync/scripts/install-skills.mjs --uninstall
```

Si una instalación sale mal: `--rollback` revierte la última generación completa; `--uninstall` retira los archivos propios del catálogo sin tocar nada ajeno. Ambos requieren el manifiesto que el instalador deja en cada destino.

## Uso diario

- **Tier 0 (siempre cargadas)**: 14 skills base (~2K tokens): `skill-router`, `skill-validator`, `skill-creator`, `skill-sync`, `skill-loader`, `professional-planner`, `idea-to-prd-express`, `agents`, `project-tracker`, `session-notes`, `engram-integration`, `decision-gate`, `kill-switches`, `dod-checker`.
- **Router antes de cada turno**: el resto de las skills se cargan bajo demanda según `tier1toLoad`:

  ```bash
  node ./00-meta-skills/skill-router/scripts/skill-router.mjs --query "<tarea>" [--diff <lineas>] [--json]
  ```

- **Trabajo chico, directo**: fixes de un archivo o consultas puntuales no requieren proceso adicional.
- **Features de 2+ archivos o dominios** → `sdd-orchestrator`, que rutea las fases SDD sin ejecutarlas, con modo automático (gatekeeper entre fases) o interactivo (aprobación fase a fase).
- **Antes de cerrar trabajo serio** → `judgment-day`: revisión adversarial con dos jueces independientes y ciego cruzado.
- **Model routing** (activo desde Slice 2): perfiles declarativos en `_shared/model-routing/` que mapean cada fase SDD a un modelo; un runtime sin catálogo cae al modelo por defecto.

## Categorías

| Directorio | Propósito |
|---|---|
| `00-meta-skills/` | Harness propio del catálogo: routing, validación, instalación, carga por tiers, orquestación SDD y sus fases. |
| `01-planning-process/` | Planificación y procesos: roadmap, ADRs, Jira, brainstorming, notas de sesión, paralelización. |
| `02-dev-roles/` | Roles de desarrollo: code review, debugging, security audit, PRs, diseño frontend, Judgment Day. |
| `03-ai-ml/` | Integración de IA/LLM en productos: orquestación multi-agente, billing de APIs, prompt engineering, MLOps. |
| `04-backend/` | Backend: Node/Express, Prisma, PostgreSQL, auth, sockets, jobs, uploads, pagos y stacks adicionales (Django, Java, Spring). |
| `05-frontend/` | Frontend: React/Vite, Next.js 15, Angular, React Native/Expo, Tailwind, animaciones y diseño de interfaces. |
| `06-code-quality/` | Calidad y tooling: TypeScript estricto, SOLID, pnpm workspaces, Turborepo, Biome, changesets, gestión de env vars. |
| `07-testing/` | Pruebas unitarias, de integración y E2E (Vitest, Playwright, pytest). |
| `08-devops/` | CI/CD, monitoreo, observabilidad, kill switches y despliegue a stores. |
| `09-media-graphics/` | Generación de imágenes y assets visuales con IA (Nano Banana, dirección creativa). |
| `11-mcp-hybrid/` | Skills híbridas que combinan instrucciones con servidores MCP: Figma, scraping de componentes, auditoría UX, video. |
| `professional-planner/` | Metodología SDD de referencia (Spec-Driven Development en 6 fases). |

## Mantenimiento del catálogo

Actualizar desde upstream y reinstalar en las herramientas locales:

```bash
git pull
node 00-meta-skills/skill-sync/scripts/install-skills.mjs --dry-run
node 00-meta-skills/skill-sync/scripts/install-skills.mjs
```

Agregar una skill nueva (los gates son obligatorios y van en el mismo commit):

1. Crearla con `skill-creator` respetando la spec agentskills.io (nombre lowercase-hyphen, descripción de una línea trigger-first, `allowed-tools` presente).
2. Registrarla en `SKILLS.md` (tabla de su categoría + contador actualizado) y en `AGENTS.md` (tabla de categorías y Auto-Invoke List) en el mismo PR: el validador en modo estricto falla si el índice queda desincronizado.
3. Validar mecánicamente:

   ```bash
   node 00-meta-skills/skill-validator/scripts/validate-skills.mjs --strict
   ```

4. Regenerar los índices derivados:

   ```bash
   node 00-meta-skills/skill-loader/scripts/skills-loader.mjs --emit-registry
   ```

5. Si la skill solapa semánticamente con otra, delimitarla en `00-meta-skills/skill-router/references/overlap-matrix.json` y agregar el fixture correspondiente en `overlap-smoke-tests.json`.

Verificación completa del harness:

```bash
# Validación de spec (exit 0 = limpio)
node 00-meta-skills/skill-validator/scripts/validate-skills.mjs --strict

# Smoke test del router determinista
node 00-meta-skills/skill-router/scripts/skill-router.mjs --query "<tarea>" --json

# Estado de la caché Tier 0/1 y telemetría
node 00-meta-skills/skill-loader/scripts/skills-loader.mjs --status
```

## Companion tooling (opcional)

Binarios complementarios del mismo ecosistema (no son skills):

| Herramienta | Qué aporta | macOS/Linux (brew) | Windows (scoop) |
|---|---|---|---|
| [Engram](https://github.com/Gentleman-Programming/engram) | Memoria persistente cross-session vía MCP. | `brew install gentleman-programming/tap/engram && engram setup <agente>` | `scoop bucket add gentleman https://github.com/Gentleman-Programming/scoop-bucket && scoop install engram` |
| [Gentle-AI](https://github.com/Gentleman-Programming/gentle-ai) | Configura agentes con Engram + workflow SDD + skills + persona. | `brew install gentleman-programming/tap/gentle-ai && gentle-ai install` | `scoop install gentle-ai` |
| [GGA](https://github.com/Gentleman-Programming/gentleman-guardian-angel) | Code review pre-commit agnóstico del proveedor (requiere Git Bash o WSL). | `brew install gentleman-programming/tap/gga && gga init && gga install` | Clonar y ejecutar `bash install.sh` en Git Bash o WSL. Alternativa nativa: `engram` + `gentle-ai`. |

## Estructura del repo

```
skillsGV/
├── AGENTS.md                  # Reglas globales y Auto-Invoke List para agentes
├── SKILLS.md                  # Índice completo del catálogo
├── README.md                  # Esta guía
├── _shared/                   # Utilidades compartidas y perfiles de model-routing
├── .atl/skill-registry.md     # Registro generado desde el frontmatter (--emit-registry)
├── openspec/                  # Especificaciones y cambios SDD del propio catálogo
│   ├── config.yaml            # Almacén de artefactos y comandos de verificación
│   └── specs/
├── 00-meta-skills/            # Meta-skills y fases SDD
├── 01-planning-process/       # … categorías 01 a 09 y 11
├── 11-mcp-hybrid/
└── professional-planner/      # Metodología SDD de referencia
```

Documentación de referencia:

- [`AGENTS.md`](AGENTS.md) — reglas globales, arranque del harness y Auto-Invoke List.
- [`SKILLS.md`](SKILLS.md) — índice completo con paths por categoría.
- [`.atl/skill-registry.md`](.atl/skill-registry.md) — registro generado automáticamente (índice, no fuente de verdad).
- [`openspec/specs/`](openspec/specs/) — especificaciones de los cambios aplicados al catálogo.
