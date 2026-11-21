# skillsGV (Español)

> **Documentación en Español** — Para la versión en inglés ver [`README.md`](README.md).

Catálogo multi-agente de **255 skills** (`v3.5.0`) conforme a [agentskills.io](https://agentskills.io/specification), alineado al flujo ODD (Organic-Driven Development) de **Gentle-AI 4.6.0** (Provider Contract `1.6.0`, trabajo autorizado continuo, `## Allowed edit surfaces` adjudicadas por el padre, verificación proporcional en `mktemp -d`), **Motor Frontend v4 en 3 Fases (`design-driven`, `/ui-diff`, `verify-frontend-gates.mjs`)**, **Motor Backend en 3 Fases (`backend-driven`, `verify-backend-gates.mjs`)**, **Auto-EGM Plan Gate**, scoring Tier-1 / multi-harness de **NVIDIA `SkillSpector` v2.12 + `SkillEvaluator`**, auditoría de **Cloudflare `security-audit-skill`**, suite anti-slop frontend (`Hallmark v2`, `Hue`, `Stitch extract-design-md`, `UIZZE`, `Emil Kowalski`, `LottieFiles Disney Motion`, `Jakub Krehel`, `StageShow v1.1.1`, `Interface Design`, `UI UX Pro Max v2`, `shadcn/ui 2026`, `Better Typography`, `Modern Web Guidance 1.0`, `MiniMax Shader Dev`, `Frontend Slides`, `etodanik/deslop`), cuarentena `prompt-shield` ([`safe_read.py`](03-ai-ml/prompt-shield/scripts/safe_read.py)), memoria vía Engram y validación estricta (`validate-skills.mjs --strict --harness-check --quality-score`). Incluye adaptaciones de [Gentleman Programming](https://github.com/Gentleman-Programming), [Google `elephant-goldfish-model`](https://github.com/google/elephant-goldfish-model), [NastaFour `prompt-shield`](https://github.com/NastaFour/prompt-shield), [NVIDIA SkillSpector / SkillEvaluator](https://github.com/nvidia/skillspector), [Cloudflare security-audit-skill](https://github.com/cloudflare/security-audit-skill), [Anthropic](https://github.com/anthropics/skills), [Vercel Labs](https://github.com/vercel-labs/agent-skills), [Matt Pocock](https://github.com/mattpocock), [Nutlope / Together AI `Hallmark`](https://github.com/Nutlope/hallmark), [Dominik Martin `Hue`](https://github.com/dominikmartn/hue), [Google Labs `stitch-skills`](https://github.com/google-labs-code/stitch-skills), [UIZZE](https://github.com/uizze/uizze), [Emil Kowalski](https://github.com/emilkowalski/skills), [LottieFiles `motion-design-skill`](https://github.com/LottieFiles/motion-design-skill), [Jakub Krehel](https://github.com/jakubkrehel/make-interfaces-feel-better), [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), [Benji Taylor `Stageshow`](https://github.com/benjitaylor/skills), [`shadcn/ui`](https://github.com/shadcn-ui/ui), [Dammyjay93 `interface-design`](https://github.com/Dammyjay93/interface-design), [J. Poindexter `typography-skills`](https://github.com/jpoindexter/typography-skills), [pbakaus/impeccable](https://github.com/pbakaus/impeccable), [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill), [MiniMax-AI `shader-dev`](https://github.com/MiniMax-AI/skills), [Zara Zhang `frontend-slides`](https://github.com/zarazhangrui/frontend-slides), [etodanik `deslop`](https://github.com/etodanik/deslop), [Andrej Karpathy](https://github.com/karpathy), [Addy Osmani](https://github.com/addyosmani) y [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents).

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
- **Motor en 3 Fases & `design-driven` D1b (`verify-frontend-gates.mjs`)**: Fase 1 de dirección interactiva D1b en 1 mensaje por defecto (8 Chasis Arquetípicos + `Think Outside the Box` + `Design Read` + `DESIGN_SYSTEM.md`), Fase 2 por capacidades reales sin sobrecargar contexto, y Fase 3 post-build obligatoria con el runner unificado [`verify-frontend-gates.mjs`](05-frontend/design-driven/scripts/verify-frontend-gates.mjs) + crítica visual contra muros de cajas `0–2px`, confetti de pastillas y etiquetas `" / "`. Integra **Hallmark v2.0 + Hue + Google Stitch `extract-design-md` + UIZZE `image-to-ui`** (`hallmark-design-study`), **Emil Kowalski (`mobile-native` + `break-ui`) & Jakub Krehel 19 principios** (`emil-kowalski`, `micro-interactions`), **StageShow v1.1.1** (`ai-design-check-stageshow`), **Interface Design (`design-deslop` + Anti-Reinvention)**, **UI UX Pro Max v2** (192 paletas, WCAG 2.2, `ime-composition-enter`, RTL, DTCG), **`shadcn/ui` 2026** (`tailwind-4`), **Better Typography** (`design-system-tokens`) y Motion Studio 22 repos.
- **Floor, Not Ceiling (Enseñanza > Dogma)**: Hard Invariants para seguridad, accesibilidad y verdad en código, autorizando libremente al modelo a proponer arquitecturas o estéticas superiores (`[Beyond-Baseline]`).
- **MCPs opcionales**: integración no bloqueante con Figma (vía `figma-implement`), 21st.dev y Fal.ai (FLUX Schnell).
- *Nota*: el índice completo de las 52 fuentes vive en `05-frontend/taste-skill/references/full-guide.md`.

## 🛡️ Seguridad Defensiva y Suite de Producción (250 Puntos)

Blindaje integral de runtime, resiliencia distribuida y auditoría pre-lanzamiento:

- **live-cve-security-intel**: consulta en tiempo real de advisories OSV.dev, ciclo de vida de memoria/workers (mitigación de patrones post-2026 tipo PHP2Shell) y `fp-check` obligatorio de Trail of Bits.
- **security-audit (Cloudflare 6-Phase) & NVIDIA SkillSpector/SkillEvaluator**: ledger de cobertura, tupla de 6 elementos (`confirmed` vs `needs_validation`), aislamiento `scratch/` race-safe, chequeo de compatibilidad en 7 harnesses (`--harness-check`), Quality Score Tier 1 (`--quality-score >= 70`), Wilson 95% CI y casos negativos (`should_trigger: false`).
- **ai-safety-agent-guard & prompt-shield**: delimitadores `<untrusted_document>`, wrapper `safe_read.py` ([`NastaFour/prompt-shield`](https://github.com/NastaFour/prompt-shield)) contra prompt injection indirecto en archivos/outputs externos, intercepción mecánica de comandos destructivos (`rm -rf`, `git push -f`, `DROP TABLE`, borrados de PowerShell/Windows) y reglas defensivas `bug-hunter` / `defending-code`.
- **distributed-resilience-sre**: Circuit Breakers, Exponential Backoff con Jitter, Idempotency-Keys, Transactional Outbox + CDC, Dead-Letter Queues (DLQ), Graceful Shutdown (`SIGTERM`), Liveness/Readiness probes y Presigned URLs.
- **production-readiness-250**: checklist maestro de los 250 puntos de ingeniería senior (dinero en centavos `BigInt`/`Decimal` sin floats, UTC/IANA timezones, normalización Unicode `NFC`, protección del Event Loop, GDPR/PII, Audit Logs y SPF/DKIM/DMARC).

## Instalación

El instalador cross-tool es `00-meta-skills/skill-sync/scripts/install-skills.mjs`. Ejecutalo siempre primero con `--dry-run` para revisar el plan antes de escribir.

| Flag | Efecto |
|---|---|
| `--target <ruta>` | Instala dentro de un proyecto concreto. Sin este flag, instala en el entorno global de las herramientas detectadas. |
| `--tool <id>` | Restringe la instalación a herramientas específicas. Repeatable: `claude-code`, `opencode`, `cursor`, `copilot`, `codex`, `gemini-cli`, `antigravity`, `kiro`, `windsurf`, `deepseek`, `dsh`. |
| `--all-tools` | Omitte la detección e instala para todas las herramientas conocidas. |
| `--only <lista>` | Instala solo categorías separadas por comas, por ejemplo `--only "04-backend,05-frontend"`. |
| `--skills <lista>` | Instala solo skills individuales separadas por comas, por ejemplo `--skills "odd-workflow,design-driven"`. |
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

- **Tier 0 (siempre cargadas)**: 9 skills base (~2K tokens): `odd-workflow`, `skill-router`, `skill-loader`, `skill-validator`, `testing-patterns`, `code-reviewer`, `engram-integration`, `dod-checker`, `decision-gate`.
- **Router antes de cada turno**: el resto de las skills se cargan bajo demanda según `tier1toLoad`:

  ```bash
  node ./00-meta-skills/skill-router/scripts/skill-router.mjs --query "<tarea>" [--diff <lineas>] [--json]
  ```

- **Trabajo chico, directo**: fixes de un archivo o consultas puntuales no requieren proceso adicional.
- **ODD exclusivo (Gentle-AI 4.6.0) + Auto-EGM Plan Gate**: todo cambio de código entra en Organic-Driven Development: autorizar, explorar, mantener el trabajo autorizado en marcha (decisiones humanas reales vía herramienta compatible), clasificar por 3 criterios (**Understood** en ≤1 batch de 3 llamadas/~10k tokens, **Contained risk** en los 6 ítems de alto riesgo, **Resumable from `git diff` alone**; nunca contando pasos o archivos), pasar planes **Large**, upgrades mayores o alta lógica/cómputo automáticamente por [`egm-spec-review`](01-planning-process/egm-spec-review/SKILL.md) + `google/elephant-goldfish-model` (3 críticos por defecto, 5 en cambios críticos, 0 overhead en tareas chicas), feature doc en `odd/tasks/<feature>.md` + espejo Engram si es grande, commits en slices revisables de ~400 líneas en la feature branch (unidades de alto riesgo 1-6 en su propio commit aislado, cerrando primero cualquier slice `under_budget` pendiente), y cierre con `Risk: item N (reason)` o `Risk: none`. En runtimes sin binario gentle-ai, `odd-workflow` es el fallback estructurado.
- **Eficiencia de tokens y simplicidad**: compresión de ~41,500 tokens en el catálogo preservando el comportamiento completo, junto con `karpathy-ponytail-simplicity` (supuestos mínimos y diffs quirúrgicos) y `app-resource-efficiency` (presupuestos de batería, memoria y ciclo de vida).
- **Antes de cerrar trabajo serio** → `judgment-day`: revisión adversarial con dos jueces independientes y ciego cruzado.
- **Model routing**: perfiles declarativos en `_shared/model-routing/` que mapean roles de ejecución a modelos.

## Configuración de agentes (agent-roster)

Una fuente de verdad declarativa para los **23 agentes** del ecosistema (tier `strong`/`mid`/`cheap`, effort `max`/`high`/`medium`/`low`, `delegate_only`), con generador por runtime y switcher de proveedor con un comando:

| Archivo | Rol |
|---|---|
| `_shared/agent-roster/roster.json` | **Fuente de verdad**: nombre, grupo, tier, effort y delegate_only de los 23 agentes, más tiers y fases. |
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
| `01-planning-process/` | Planificación y procesos: roadmap, ADRs, Jira, brainstorming, Auto-EGM (`egm-spec-review`), notas de sesión, paralelización. |
| `02-dev-roles/` | Roles de desarrollo: code review, debugging, security audit, PRs, diseño frontend, Judgment Day. |
| `03-ai-ml/` | Integración de IA/LLM en productos: orquestación multi-agente, `ai-safety-agent-guard` (`prompt-shield` / `safe_read.py`), billing de APIs, prompt engineering, MLOps. |
| `04-backend/` | Backend: `backend-driven` (`verify-backend-gates.mjs`), Node/Express, Prisma, PostgreSQL, auth, sockets, jobs, uploads, pagos y stacks adicionales. |
| `05-frontend/` | Frontend: `design-driven` v4 (`Creative Pitch` + `verify-frontend-gates.mjs`), `ui-diff`, `modern-web-guidance` (`legacy-scan.mjs`), `shader-dev`, React/Vite, Next.js 15, Astro, Angular, React Native/Expo, Tailwind, Motion Studio (`web-animation-sources`), `ai-design-check-stageshow`, `hallmark-design-study` y diseño de interfaces. |
| `06-code-quality/` | Calidad, simplicidad y tooling: TypeScript estricto, `karpathy-ponytail-simplicity`, `app-resource-efficiency`, `defending-code`, `bug-hunter`, SOLID, pnpm workspaces, Turborepo, Biome, changesets, env vars. |
| `07-testing/` | Pruebas unitarias, de integración y E2E (Vitest, Playwright, pytest). |
| `08-devops/` | CI/CD, monitoreo, observabilidad, kill switches y despliegue a stores. |
| `09-media-graphics/` | Generación de imágenes y assets visuales con IA (Nano Banana, dirección creativa). |
| `11-mcp-hybrid/` | Skills híbridas que combinan instrucciones con servidores MCP: Figma, scraping de componentes, `motion-video-pipeline` (22 repos), auditoría UX. |
| `12-matt-pocock/` | Suite Matt Pocock adaptada a la especificación de agentskills.io. |
| `professional-planner/` | Metodología histórica de planificación (deprecada, redirige a odd-workflow). |

## Licencias y Reconocimientos

El código de unión (*glue-code*), scripts de instalación, validador y adaptación unificada se distribuyen bajo licencia **MIT**, respetando las licencias originales de cada obra y autor citados (en especial **Apache-2.0** para `impeccable` y `NastaFour/prompt-shield`):

- **[Gentleman Programming](https://github.com/Gentleman-Programming)**: harness ODD, memoria persistente Engram, protocolo Judgment Day, roster de 23 agentes y verificación pre-commit GGA.
- **[Google (`elephant-goldfish-model`)](https://github.com/google/elephant-goldfish-model)**: revisión adversarial zero-context con Goldfishes integrada en [`egm-spec-review`](01-planning-process/egm-spec-review/SKILL.md) y el Auto-EGM Plan Gate.
- **[NastaFour (`prompt-shield`)](https://github.com/NastaFour/prompt-shield)**: escáner de prompt injection indirecto y wrapper `safe_read.py` integrado en `ai-safety-agent-guard` (Apache-2.0).
- **[Anthropic](https://github.com/anthropics/skills)** & **[Vercel Labs](https://github.com/vercel-labs/agent-skills)**: especificación base de Agent Skills, patrones React/Next.js y CLI `skills.sh`.
- **[Matt Pocock](https://github.com/mattpocock)**: las 23 skills de ingeniería en `12-matt-pocock/`.
- **[Paul Bakaus (`impeccable`)](https://github.com/pbakaus/impeccable)** (Apache-2.0) & **[Leonxlnx (`taste-skill`)](https://github.com/Leonxlnx/taste-skill)** (MIT): gobernanza visual anti-slop y diales triaxiales.
- **[Together AI (`Hallmark`)](https://github.com/togethercomputer)**, **`@enmera/ai-design-check`** & **[Benji Taylor (`Stageshow`)](https://github.com/benjitaylor/skills)**: extracción ética de ADN visual, auditoría headless y presentaciones interactivas (`hallmark-design-study`, `ai-design-check-stageshow`).
- **22-Repo Open-Source Motion Studio**: catálogo curado de GSAP, Motion, Theatre.js, Rive, Lottie, Three.js/R3F y video procedural en [`motion-studio-22.md`](11-mcp-hybrid/motion-video-pipeline/references/motion-studio-22.md).
- **[Andrej Karpathy](https://github.com/karpathy)**, **[Addy Osmani](https://addyosmani.com/)**, **Ponytail, Caveman & Graphify**: simplicidad quirúrgica, compresión de `~41,500` tokens sin pérdida de comportamiento y presupuestos de recursos (`karpathy-ponytail-simplicity`, `app-resource-efficiency`).
- **[NVIDIA (`SkillSpector` & `SkillEvaluator`)](https://github.com/nvidia/skillspector)** & **[Cloudflare (`security-audit-skill`)](https://github.com/cloudflare/security-audit-skill)**: seguridad estática MCP/taint, scoring Tier 1 `0–100`, compatibilidad en 7 harnesses, intervalos Wilson 95% y auditoría AppSec en 6 fases con Coverage Ledger.
- **[Nutlope (`hallmark` v2)](https://github.com/Nutlope/hallmark)**, **[Dominik Martin (`hue`)](https://github.com/dominikmartn/hue)**, **[Google Labs (`stitch-skills`)](https://github.com/google-labs-code/stitch-skills)**, **[UIZZE](https://github.com/uizze/uizze)**, **[Jakub Krehel](https://github.com/jakubkrehel/make-interfaces-feel-better)**, **[Dammyjay93 (`interface-design`)](https://github.com/Dammyjay93/interface-design)**, **[UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)**, **[`shadcn/ui`](https://github.com/shadcn-ui/ui)** & **[J. Poindexter (`typography-skills`)](https://github.com/jpoindexter/typography-skills)**: 21 macroestructuras, Hero Stage, extracción `DESIGN_SYSTEM.md`, pulido táctil, Anti-Reinvention, `UI_CONTRACT`, patrones `shadcn` 2026 y Better Typography.
- **[msitarzewski (`agency-agents`)](https://github.com/msitarzewski/agency-agents)**, **[Emil Kowalski](https://animations.dev/)**, **[Adam Wathan & Steve Schoger](https://www.refactoringui.com/)**, **[Corey Haines](https://coreyhaines.com/)**, **[Donald Miller](https://storybrand.com/)** & **[Jesse Vincent](https://github.com/obra/superpowers)**: roles especialistas (`bug-hunter`, `defending-code`), física de animaciones, Refactoring UI, CRO, StoryBrand y capacidades agentic.
- **[Modern Web Guidance 1.0 (`web.dev/baseline`)](https://web.dev/baseline)**, **[MiniMax-AI (`shader-dev`)](https://github.com/MiniMax-AI/skills)**, **[LottieFiles (`motion-design-skill`)](https://github.com/LottieFiles/motion-design-skill)**, **[Zara Zhang (`frontend-slides`)](https://github.com/zarazhangrui/frontend-slides)**, **[etodanik (`deslop`)](https://github.com/etodanik/deslop)**, **[wondelai (`refactoring-ui`)](https://skills.wondel.ai)** & **Dionis (`/ui-diff`)**: guía de features nativas Baseline + escáner `legacy-scan.mjs` (`modern-web-guidance`), 36 técnicas ShaderToy/GLSL/SDF (`shader-dev`), coreografía de 12 principios de Disney (`disney-choreography.md`), presentaciones HTML y diagramas SVG editoriales (`frontend-slides-deck`), deslop psicolingüístico de prosa y código (`humanizer`, `karpathy-ponytail-simplicity`), probe geométrico DOM + diff visual `2×2` sin dependencias (`ui-diff`), SEO local generalizado para Astro (`openseo/references/astro-local-seo.md`) y el Motor Backend en 3 Fases (`backend-driven` + `verify-backend-gates.mjs`).
