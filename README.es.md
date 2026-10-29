# skillsGV (Español)

> **Documentación en Español** — Para la versión en inglés ver [`README.md`](README.md).

Catálogo multi-agente de **237 skills** conforme a la especificación de [agentskills.io](https://agentskills.io/specification), alineado al flujo ODD (Organic-Driven Development) de Gentle-AI 4.3.1: fallback `odd-workflow`, routing determinista por turno (`skill-router` con matriz de overlap), revisión adversarial ciega con dos jueces (`judgment-day`), memoria persistente entre sesiones vía Engram y validación mecánica del catálogo (`validate-skills.mjs --strict`). Incluye metodologías y frameworks adaptados de [Gentleman Programming](https://github.com/Gentleman-Programming) (Engram, gentle-ai, GGA, Gentleman.Dots, gentleman-skills), [Anthropic `skills`](https://github.com/anthropics/skills), [Vercel Labs `agent-skills`](https://github.com/vercel-labs/agent-skills), [Matt Pocock](https://github.com/mattpocock), [Corey Haines](https://coreyhaines.com/) (Conversion Factory), [Donald Miller](https://storybrand.com/) (StoryBrand), [Adam Wathan & Steve Schoger](https://www.refactoringui.com/) (Refactoring UI), [Emil Kowalski](https://animations.dev/) (animations.dev), [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (Apache-2.0), [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) (MIT), [NousResearch](https://github.com/NousResearch/Hermes-Function-Calling) (Hermes) y [obra `superpowers`](https://github.com/obra/superpowers).

Las skills son portables a OpenCode, Antigravity, Claude Code, Cursor, Codex, Copilot, Gemini CLI, Kiro, Windsurf y DeepSeek. El proyecto es **Windows-first**: todo el tooling es Node puro, sin dependencia de Bash.

> **pnpm only — `npm`/`npx` rechazados**: el catálogo exige `pnpm` (y `pnpm dlx` en lugar de `npx`). El validador estricto falla ante cualquier mención de `npm`/`npx` en los cuerpos de las skills, salvo excepción documentada vía frontmatter `allows-npm`.

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

Requisito: Node.js 20 o superior. Los scripts `.mjs` no tienen dependencias externas (el `package.json` solo define scripts de conveniencia).

### Instalación por un agente (one-liner)

Cualquier agente que aterrice en un repo puede instalar el catálogo con:

```
Cloná https://github.com/NastaFour/skillsGV y corré `node install.mjs --target .` — seguí su AGENTS.md.
```

En installs por proyecto, el instalador además **activa la capa always-on**: inyecta el kernel `skillsGV:kernel` en los archivos que el harness autocarga (`AGENTS.md` / `GEMINI.md` / `CLAUDE.md` / `.github/copilot-instructions.md`), blinda el `.gitignore` (las skills instaladas nunca se commiteen) y deja evidencia con hash en `.skills-install/manifest.json`.

## 🎨 Sistema Anti-Slop de Diseño Frontend

Gobernanza visual determinista y erradicación de sesgos genéricos de IA en interfaces web y móviles:

- **impeccable** (`05-frontend/impeccable`): gobernanza por 23 comandos especializados (`shape`, `craft`, `critique`, `audit`, `polish`...), manteniendo `PRODUCT.md` (contexto durable) y `DESIGN.md` (tokens visuales en formato Google Stitch).
- **taste-skill** (`05-frontend/taste-skill`): Design Read obligatorio previo a la implementación, diales triaxiales 1-10 (`DESIGN_VARIANCE`, `MOTION_INTENSITY`, `VISUAL_DENSITY`), 10 Absolute Bans de fallo automático y preflight mecánico.
- **design-driven D1b**: entrevista de unicidad en 5 bloques secuenciales (3 P's, diales, referencias reales, firma visual, anti-slop) que alimenta el Design DNA del producto.
- **MCPs opcionales**: integración no bloqueante con Figma (vía `figma-implement`), 21st.dev y Fal.ai (FLUX Schnell).
- *Nota*: el índice completo de las 52 fuentes vive en `05-frontend/taste-skill/references/full-guide.md`.

## Instalación

El instalador cross-tool es `00-meta-skills/skill-sync/scripts/install-skills.mjs`. Ejecutalo siempre primero con `--dry-run` para revisar el plan antes de escribir.

| Flag | Efecto |
|---|---|
| `--target <ruta>` | Instala dentro de un proyecto concreto. Sin este flag, instala en el entorno global de las herramientas detectadas. |
| `--tool <id>` | Restringe la instalación a herramientas específicas. Repeatable: `claude-code`, `opencode`, `cursor`, `copilot`, `codex`, `gemini-cli`, `antigravity`, `kiro`, `windsurf`, `deepseek`, `dsh`. |
| `--all-tools` | Omitte la detección e instala para todas las herramientas conocidas. |
| `--only <lista>` | Instala solo categorías separadas por comas, por ejemplo `--only "04-backend,05-frontend"`. |
| `--symlink` | Usa symlinks (junctions en Windows) en lugar de copiar: una única fuente de verdad. |
| `--dry-run` | Muestra qué haría sin escribir nada. |
| `--uninstall` | Elimina únicamente archivos propios registrados en el manifiesto. |
| `--rollback` | Revierte la última generación de instalación. |
| `--no-kernel` | Saltea la capa de activación (kernel + `.gitignore`) en installs por proyecto. |

```bash
# Proyecto concreto, solo dos herramientas
node 00-meta-skills/skill-sync/scripts/install-skills.mjs --target "C:\ruta\al\proyecto" --tool claude-code --tool cursor

# Solo dos categorías, con symlinks
node 00-meta-skills/skill-sync/scripts/install-skills.mjs --only "04-backend,05-frontend" --symlink

# Deshacer la última instalación o retirar el catálogo
node 00-meta-skills/skill-sync/scripts/install-skills.mjs --rollback
node 00-meta-skills/skill-sync/scripts/install-skills.mjs --uninstall
```

## Uso diario

- **Tier 0 (siempre cargadas)**: skills base (~2K tokens): `skill-router`, `skill-validator`, `skill-creator`, `skill-sync`, `skill-loader`, `odd-workflow`, `idea-to-prd-express`, `agents`, `project-tracker`, `session-notes`, `engram-integration`, `decision-gate`, `kill-switches`, `dod-checker`.
- **Router antes de cada turno**: el resto de las skills se cargan bajo demanda según `tier1toLoad`:

  ```bash
  node ./00-meta-skills/skill-router/scripts/skill-router.mjs --query "<tarea>" [--diff <lineas>] [--json]
  ```

- **Trabajo chico, directo**: fixes de un archivo o consultas puntuales no requieren proceso adicional.
- **ODD exclusivo (Gentle-AI 4.3.1)**: todo cambio de código entra en Organic-Driven Development: autorizar, explorar, clasificar por 3 criterios (**Understood** en ≤1 batch de 3 llamadas/~10k tokens, **Contained risk** en los 6 ítems de alto riesgo, **Resumable from `git diff` alone**; nunca contando pasos o archivos), feature doc en `odd/tasks/<feature>.md` + espejo Engram si es grande, commits en slices revisables de ~400 líneas en la feature branch (unidades de alto riesgo 1-6 en su propio commit aislado, cerrando primero cualquier slice `under_budget` pendiente), y cierre con `Risk: item N (reason)` o `Risk: none`. En runtimes sin binario gentle-ai, `odd-workflow` es el fallback estructurado.
- **Antes de cerrar trabajo serio** → `judgment-day`: revisión adversarial con dos jueces independientes y ciego cruzado.
- **Model routing**: perfiles declarativos en `_shared/model-routing/` que mapean roles de ejecución a modelos.

## Configuración de agentes (agent-roster)

Una fuente de verdad declarativa para los **21 agentes** del ecosistema (tier `strong`/`mid`/`cheap`, effort `max`/`high`/`medium`/`low`, `delegate_only`), con generador por runtime y switcher de proveedor con un comando:

| Archivo | Rol |
|---|---|
| `_shared/agent-roster/roster.json` | **Fuente de verdad**: nombre, grupo, tier, effort y delegate_only de los 21 agentes, más tiers y fases. |
| `_shared/agent-roster/profiles.json` | Perfiles de proveedor con nombre (`deepseek`, `glm`) y perfil activo (`current`). |
| `00-meta-skills/agent-roster/scripts/apply.mjs` | Generador por runtime (`opencode`, `dsh`, `list`). `--dry-run` por defecto; nunca escribe sin `--apply`. |
| `00-meta-skills/agent-roster/scripts/set-models.mjs` (+ `set-models.cmd`) | Cambia el proveedor/modelo de TODOS los agentes de una vez. |

## 📊 Benchmark: Con vs Sin Harness skillsGV

Benchmark offline determinista sobre las suites de skills core que incluyen `evals.json` — evals de routing de `skill-router` más checks de expectativas. La columna "Sin skillsGV" es una referencia histórica fija, nunca un brazo re-medido; cada cifra de "Con skillsGV" se calcula en runtime con `pnpm benchmark`.

| Métrica | Sin skillsGV (Línea Base Histórica) | Con skillsGV (Harness) | Delta Medido |
|---|---|---|---|
| **Costo de Contexto Always-On** | ~6.167 tokens (kernel monolítico histórico, referencia fija) | tamaño actual de `AGENTS.md`, medido por `pnpm benchmark` | reducción de tokens calculada en runtime |
| **Determinismo de Routing** | suposición ad-hoc por prompt (sin medir) | evals deterministas de `skill-router`, resultados medidos por `pnpm benchmark` | precisión de routing calculada en runtime |
| **Skills Core Evaluadas** | sin evals offline | las suites core que incluyen `evals.json`, contadas en runtime | cantidad de suites calculada en runtime |
| **Checks de Invariantes y Calidad** | sin ejecutar | checks offline de expectativas, tasa medida por `pnpm benchmark` | tasa de éxito calculada en runtime |

Ejecutar benchmark localmente:
```bash
pnpm benchmark
```

#### ⚖️ Prueba A/B en Vivo: Modelo Base vs Modelo con Skills (Medido)

Ensayo A/B aleatorizado y a doble ciego ejecutado sobre skills clave con Gemini Flash en benchmarks con trampas de ingeniería:

| Brazo | Win Rate | Puntuación de Calidad (1-5) | Cumplimiento de Protocolos y Estándares |
|---|---|---|---|
| **Modelo Base (Control)** | 0% (0/5) | 2.46 | Cayó en trampas: trailers de atribución AI, comandos no autorizados, sin taxonomía de severidad, generación prematura de código |
| **Con skillsGV (Tratamiento)** | **100%** (5/5) | **4.72** (+2.26 lift) | Restricciones absolutas respetadas: commits atómicos convencionales, tests AAA bajo pnpm, taxonomía 4R de review, tracking ODD previo, límites de Clean Architecture |
| **Empates** | 0% (0/5) | - | Desambiguado por restricciones negativas estrictas |

*Evaluado a través de 5 tareas con trampas bajo asignación aleatorizada a doble ciego. Registro en `evals/results/ab-*.json`.*
Consultar el resumen medido:
```bash
node scripts/run-evals.mjs --ab-summary
```

## Categorías

| Directorio | Propósito |
|---|---|
| `00-meta-skills/` | Harness propio del catálogo: routing, validación, instalación, carga por tiers, flujo ODD y meta-skills. |
| `01-planning-process/` | Planificación y procesos: roadmap, ADRs, Jira, brainstorming, notas de sesión, paralelización. |
| `02-dev-roles/` | Roles de desarrollo: code review, debugging, security audit, PRs, diseño frontend, Judgment Day. |
| `03-ai-ml/` | Integración de IA/LLM en productos: orquestación multi-agente, billing de APIs, prompt engineering, MLOps. |
| `04-backend/` | Backend: Node/Express, Prisma, PostgreSQL, auth, sockets, jobs, uploads, pagos y stacks adicionales. |
| `05-frontend/` | Frontend: React/Vite, Next.js 15, Angular, React Native/Expo, Tailwind, animaciones y diseño de interfaces. |
| `06-code-quality/` | Calidad y tooling: TypeScript estricto, SOLID, pnpm workspaces, Turborepo, Biome, changesets, gestión de env vars. |
| `07-testing/` | Pruebas unitarias, de integración y E2E (Vitest, Playwright, pytest). |
| `08-devops/` | CI/CD, monitoreo, observabilidad, kill switches y despliegue a stores. |
| `09-media-graphics/` | Generación de imágenes y assets visuales con IA (Nano Banana, dirección creativa). |
| `11-mcp-hybrid/` | Skills híbridas que combinan instrucciones con servidores MCP: Figma, scraping de componentes, auditoría UX. |
| `12-matt-pocock/` | Suite Matt Pocock adaptada a la especificación de agentskills.io. |
| `professional-planner/` | Metodología histórica de planificación (deprecada, redirige a odd-workflow). |

## Licencias y Reconocimientos

El código de unión (*glue-code*), scripts de instalación, validador y adaptación unificada se distribuyen bajo licencia **MIT**, respetando las licencias originales de cada obra y autor citados.
