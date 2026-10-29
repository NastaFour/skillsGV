# SKILLS.md — Índice de Skills · Portable 2026 (pnpm)

Catálogo de **244 skills** compatible con [agentskills.io](https://agentskills.io/specification), Claude Code, Cursor, OpenCode, Copilot, Codex, Gemini CLI, Antigravity, Kiro, Windsurf y DeepSeek IDE. Agnóstico al proyecto: las skills se aplican a cualquier monorepo pnpm. Incluye metodologías adaptadas con permiso de [Anthropic `skills`](https://github.com/anthropics/skills), [Vercel Labs `agent-skills`](https://github.com/vercel-labs/agent-skills), [obra `superpowers`](https://github.com/obra/superpowers) y [Gentleman Programming](https://github.com/Gentleman-Programming) (Engram, gentle-ai, GGA, Gentleman.Dots, gentleman-skills).

> **Convención pnpm-only**: `npm`/`npx` están rechazados en todo el catálogo. Usar `pnpm` para instalar y correr scripts, y `pnpm dlx` como reemplazo de `npx`. El validador (`validate-skills.mjs --strict`) marca toda mención como ERROR salvo excepción documentada vía frontmatter `allows-npm`. El directorio `gentle-ai-dsh/` (addon DeepSeek Harness) es un bundle vendored y no forma parte de este índice.

## 00-meta-skills

| Skill | Path |
|---|---|
| find-skills | [00-meta-skills/find-skills/SKILL.md](00-meta-skills/find-skills/SKILL.md) ← descubrimiento e instalación de skills del ecosistema abierto |
| skill-improver | [00-meta-skills/skill-improver/SKILL.md](00-meta-skills/skill-improver/SKILL.md) ← auditoría, evaluación y refactorización de calidad de skills |
| skill-registry | [00-meta-skills/skill-registry/SKILL.md](00-meta-skills/skill-registry/SKILL.md) ← sincronización y actualización del registro tras cambios en skills |
| agent-roster | [00-meta-skills/agent-roster/SKILL.md](00-meta-skills/agent-roster/SKILL.md) ← declarative 20-agent roster (roster.json) + per-runtime generator (apply.mjs) + provider switcher (set-models) |
| catalog-usage | [00-meta-skills/catalog-usage/SKILL.md](00-meta-skills/catalog-usage/SKILL.md) ← onboarding y operación del catálogo para agentes: instalar, uso diario, mantenimiento |
| skill-creator | [00-meta-skills/skill-creator/SKILL.md](00-meta-skills/skill-creator/SKILL.md) ← Generates new skills following the official agentskills.io spec (name lowercase… |
| skill-loader | [00-meta-skills/skill-loader/SKILL.md](00-meta-skills/skill-loader/SKILL.md) ← two-tier loading, session telemetry, route-first enforcement |
| skill-sync | [00-meta-skills/skill-sync/SKILL.md](00-meta-skills/skill-sync/SKILL.md) ← Distributes skills from this catalog to multiple AI agent configurations using… |
| skill-validator | [00-meta-skills/skill-validator/SKILL.md](00-meta-skills/skill-validator/SKILL.md) ← Validates that all SKILL.md files in the catalog comply with the agentskills.io… |
| skill-router | [00-meta-skills/skill-router/SKILL.md](00-meta-skills/skill-router/SKILL.md) ← deterministic routing, replaces ~80% of LLM skill selection |
| sdd-orchestrator | [00-meta-skills/sdd-orchestrator/SKILL.md](00-meta-skills/sdd-orchestrator/SKILL.md) ← DEPRECATED. Use odd-workflow instead. |
| sdd-init | [00-meta-skills/sdd-init/SKILL.md](00-meta-skills/sdd-init/SKILL.md) ← DEPRECATED. Use odd-workflow instead. |
| sdd-explore | [00-meta-skills/sdd-explore/SKILL.md](00-meta-skills/sdd-explore/SKILL.md) ← DEPRECATED. Use odd-workflow instead. |
| sdd-research | [00-meta-skills/sdd-research/SKILL.md](00-meta-skills/sdd-research/SKILL.md) ← DEPRECATED. Use odd-workflow instead. |
| sdd-propose | [00-meta-skills/sdd-propose/SKILL.md](00-meta-skills/sdd-propose/SKILL.md) ← DEPRECATED. Use odd-workflow instead. |
| sdd-spec | [00-meta-skills/sdd-spec/SKILL.md](00-meta-skills/sdd-spec/SKILL.md) ← DEPRECATED. Use odd-workflow instead. |
| sdd-design | [00-meta-skills/sdd-design/SKILL.md](00-meta-skills/sdd-design/SKILL.md) ← DEPRECATED. Use odd-workflow instead. |
| sdd-tasks | [00-meta-skills/sdd-tasks/SKILL.md](00-meta-skills/sdd-tasks/SKILL.md) ← DEPRECATED. Use odd-workflow instead. |
| sdd-apply | [00-meta-skills/sdd-apply/SKILL.md](00-meta-skills/sdd-apply/SKILL.md) ← DEPRECATED. Use odd-workflow instead. |
| sdd-verify | [00-meta-skills/sdd-verify/SKILL.md](00-meta-skills/sdd-verify/SKILL.md) ← DEPRECATED. Use odd-workflow instead. |
| sdd-archive | [00-meta-skills/sdd-archive/SKILL.md](00-meta-skills/sdd-archive/SKILL.md) ← DEPRECATED. Use odd-workflow instead. |
| sdd-onboard | [00-meta-skills/sdd-onboard/SKILL.md](00-meta-skills/sdd-onboard/SKILL.md) ← DEPRECATED. Use odd-workflow instead. |
| skill-harvest | [00-meta-skills/skill-harvest/SKILL.md](00-meta-skills/skill-harvest/SKILL.md) ← post-project: draft new-skill proposals into _inbox from Engram, never auto-create |
| gentle-orchestrator | [00-meta-skills/gentle-orchestrator/SKILL.md](00-meta-skills/gentle-orchestrator/SKILL.md) ← coordinator: delegation rules + 20-agent roster + retry-on-failure |
| catalog-doctor | [00-meta-skills/catalog-doctor/SKILL.md](00-meta-skills/catalog-doctor/SKILL.md) ← Run unified catalog diagnostic checks: validate --strict, install dry-run, load… |
| skill-spector | [00-meta-skills/skill-spector/SKILL.md](00-meta-skills/skill-spector/SKILL.md) ← Auditoría de seguridad y análisis estático para skills de agentes según Hermes… |
| odd-workflow | [00-meta-skills/odd-workflow/SKILL.md](00-meta-skills/odd-workflow/SKILL.md) ← Use when executing development under Gentle-AI 4.3.1 Organic Driven Development… |
| skill-distiller | [00-meta-skills/skill-distiller/SKILL.md](00-meta-skills/skill-distiller/SKILL.md) ← Analyzes an external project workspace to discover applicable catalog skills an… |
| codegraph-intelligence | [00-meta-skills/codegraph-intelligence/SKILL.md](00-meta-skills/codegraph-intelligence/SKILL.md) ← Use when answering structural, architectural, call-flow, dependency, symbol-ref… |

## 01-planning-process

| Skill | Path |
|---|---|
| cognitive-doc-design | [01-planning-process/cognitive-doc-design/SKILL.md](01-planning-process/cognitive-doc-design/SKILL.md) ← diseño de documentación técnica y guías reduciendo carga cognitiva |
| project-tracker | [01-planning-process/project-tracker/SKILL.md](01-planning-process/project-tracker/SKILL.md) ← Maintain a strict, minimal-token context of the project's state, constraints, a… |
| tech-stack-advisor | [01-planning-process/tech-stack-advisor/SKILL.md](01-planning-process/tech-stack-advisor/SKILL.md) ← Autonomously select the optimal technology stack for a new project or feature b… |
| application-workflow | [01-planning-process/application-workflow/SKILL.md](01-planning-process/application-workflow/SKILL.md) ← Fullstack business-logic and architecture orchestrator |
| master-prompt | [01-planning-process/master-prompt/SKILL.md](01-planning-process/master-prompt/SKILL.md) ← Master prompt template to generate autonomous Expo Go mobile demo applications |
| agents | [01-planning-process/agents/SKILL.md](01-planning-process/agents/SKILL.md) ← Orchestration guide for a team of 9 specialized virtual agents in the applicati… |
| engram-integration | [01-planning-process/engram-integration/SKILL.md](01-planning-process/engram-integration/SKILL.md) ← Persistent cross-session memory for AI coding agents via the Engram binary — on… |
| speckit-integration | [01-planning-process/speckit-integration/SKILL.md](01-planning-process/speckit-integration/SKILL.md) ← DEPRECATED. Use odd-workflow instead. |
| session-notes | [01-planning-process/session-notes/SKILL.md](01-planning-process/session-notes/SKILL.md) ← ECC-inspired session-to-session context transfer |
| parallelization | [01-planning-process/parallelization/SKILL.md](01-planning-process/parallelization/SKILL.md) ← Manages parallel AI agent instances using git worktrees, cascade patterns, and… |
| tech-escalation-adr | [01-planning-process/tech-escalation-adr/SKILL.md](01-planning-process/tech-escalation-adr/SKILL.md) ← Formal protocol to propose, evaluate, and install new technologies outside the… |
| idea-to-prd-express | [01-planning-process/idea-to-prd-express/SKILL.md](01-planning-process/idea-to-prd-express/SKILL.md) ← 20-min compressed SDD for technical decisions |
| jira-epic | [01-planning-process/jira-epic/SKILL.md](01-planning-process/jira-epic/SKILL.md) ← Epic structure, child task breakdown, Jira MCP integration |
| jira-task | [01-planning-process/jira-task/SKILL.md](01-planning-process/jira-task/SKILL.md) ← Bug/feature task templates, title conventions, MCP fields |
| brainstorming | [01-planning-process/brainstorming/SKILL.md](01-planning-process/brainstorming/SKILL.md) ← explores user intent, requirements, design & specs before implementation (Superpowers) |
| lean-ux | [01-planning-process/lean-ux/SKILL.md](01-planning-process/lean-ux/SKILL.md) ← Usala para validar hipótesis de diseño, suposiciones de negocio y ciclos Lean U… |
| brand-guidelines | [01-planning-process/brand-guidelines/SKILL.md](01-planning-process/brand-guidelines/SKILL.md) ← Estandarización de tono de voz, pilares de mensaje y personalidad de marca |
| content-strategy | [01-planning-process/content-strategy/SKILL.md](01-planning-process/content-strategy/SKILL.md) ← Planificación estratégica de contenidos orientada a las etapas de embudo (TOFU/… |
| copywriting | [01-planning-process/copywriting/SKILL.md](01-planning-process/copywriting/SKILL.md) ← Redacción publicitaria persuasiva y de respuesta directa para convertir visitan… |
| humanizer | [01-planning-process/humanizer/SKILL.md](01-planning-process/humanizer/SKILL.md) ← Elimina clichés sintéticos y patrones robóticos de IA para recuperar un tono hu… |
| storybrand-messaging | [01-planning-process/storybrand-messaging/SKILL.md](01-planning-process/storybrand-messaging/SKILL.md) ← Estructuración de narrativa de producto y mensajería usando el marco StoryBrand… |
| content-studio | [01-planning-process/content-studio/SKILL.md](01-planning-process/content-studio/SKILL.md) ← Generación modular de piezas multicanal (artículos, hilos, notas) desde una ide… |
| app-flow-spec | [01-planning-process/app-flow-spec/SKILL.md](01-planning-process/app-flow-spec/SKILL.md) ← Generates the canonical APP_FLOW.md specification: route maps, role permissions… |

## 02-dev-roles

| Skill | Path |
|---|---|
| architecture-designer | [02-dev-roles/architecture-designer/SKILL.md](02-dev-roles/architecture-designer/SKILL.md) ← Generates the canonical TRD.md (Technical Requirements Document): module archit… |
| code-reviewer | [02-dev-roles/code-reviewer/SKILL.md](02-dev-roles/code-reviewer/SKILL.md) ← Conduct a rigorous, causal code review using the 4R Framework, Gentle-AI 4.3.1… |
| dod-checker | [02-dev-roles/dod-checker/SKILL.md](02-dev-roles/dod-checker/SKILL.md) ← Act as the strict Gatekeeper for the Definition of Done (DoD) |
| expert-debugger | [02-dev-roles/expert-debugger/SKILL.md](02-dev-roles/expert-debugger/SKILL.md) ← DEPRECATED. Use systematic-debugging instead. |
| security-audit | [02-dev-roles/security-audit/SKILL.md](02-dev-roles/security-audit/SKILL.md) ← Act as an Application Security (AppSec) Auditor executing OWASP 2026 Web/API/LL… |
| feature-implementer | [02-dev-roles/feature-implementer/SKILL.md](02-dev-roles/feature-implementer/SKILL.md) ← Implement production-ready features and domain logic following senior engineeri… |
| frontend-designer | [02-dev-roles/frontend-designer/SKILL.md](02-dev-roles/frontend-designer/SKILL.md) ← DEPRECATED. Use frontend-design instead. |
| frontend-design | [02-dev-roles/frontend-design/SKILL.md](02-dev-roles/frontend-design/SKILL.md) ← Anthropic methodology, anti-AI-slop, signature element |
| judgment-day | [02-dev-roles/judgment-day/SKILL.md](02-dev-roles/judgment-day/SKILL.md) ← parallel adversarial review (red + blue) |
| jd-judge-a | [02-dev-roles/jd-judge-a/SKILL.md](02-dev-roles/jd-judge-a/SKILL.md) ← blind Judge A (adversarial reviewer) |
| jd-judge-b | [02-dev-roles/jd-judge-b/SKILL.md](02-dev-roles/jd-judge-b/SKILL.md) ← blind Judge B (adversarial reviewer) |
| jd-fix-agent | [02-dev-roles/jd-fix-agent/SKILL.md](02-dev-roles/jd-fix-agent/SKILL.md) ← surgical fix agent for judgment-day |
| review-risk | [02-dev-roles/review-risk/SKILL.md](02-dev-roles/review-risk/SKILL.md) ← R1 security lens |
| review-readability | [02-dev-roles/review-readability/SKILL.md](02-dev-roles/review-readability/SKILL.md) ← R2 clarity lens |
| review-reliability | [02-dev-roles/review-reliability/SKILL.md](02-dev-roles/review-reliability/SKILL.md) ← R3 tests/contracts lens |
| review-resilience | [02-dev-roles/review-resilience/SKILL.md](02-dev-roles/review-resilience/SKILL.md) ← R4 ops/rollback lens |
| review-refuter | [02-dev-roles/review-refuter/SKILL.md](02-dev-roles/review-refuter/SKILL.md) ← refutes BLOCKER/CRITICAL findings |
| review-validator | [02-dev-roles/review-validator/SKILL.md](02-dev-roles/review-validator/SKILL.md) ← gate final: evidencia antes de "listo" |
| rdd-defect-workflow | [02-dev-roles/rdd-defect-workflow/SKILL.md](02-dev-roles/rdd-defect-workflow/SKILL.md) ← RDD: recibos, corrección acotada, gates de entrega y kill switch |
| decision-gate | [02-dev-roles/decision-gate/SKILL.md](02-dev-roles/decision-gate/SKILL.md) ← compress human's last-20% judgment to 3 min, traceable |
| github-pr | [02-dev-roles/github-pr/SKILL.md](02-dev-roles/github-pr/SKILL.md) ← conventional commits, structured PR descriptions |
| performance-refactor | [02-dev-roles/performance-refactor/SKILL.md](02-dev-roles/performance-refactor/SKILL.md) ← Refactor code to improve performance, readability, and scalability |
| qa-tester | [02-dev-roles/qa-tester/SKILL.md](02-dev-roles/qa-tester/SKILL.md) ← Generate comprehensive automated test suites with adversarial boundary, concurr… |
| technical-writer | [02-dev-roles/technical-writer/SKILL.md](02-dev-roles/technical-writer/SKILL.md) ← Generate comprehensive, accessible, and professional technical documentation |
| frontend-debugging-protocol | [02-dev-roles/frontend-debugging-protocol/SKILL.md](02-dev-roles/frontend-debugging-protocol/SKILL.md) ← `references/diagnostic-tree.md` |
| auth-flow-audit | [02-dev-roles/auth-flow-audit/SKILL.md](02-dev-roles/auth-flow-audit/SKILL.md) ← `references/audit-checklist.md`, `scripts/audit-auth.mjs` |
| micro-interactions | [02-dev-roles/micro-interactions/SKILL.md](02-dev-roles/micro-interactions/SKILL.md) ← hover, press, stagger, shimmer copy-paste catalog |
| hexagonal-architecture-layers-java | [02-dev-roles/hexagonal-architecture-layers-java/SKILL.md](02-dev-roles/hexagonal-architecture-layers-java/SKILL.md) ← domain/application/infrastructure layers, ports & adapters, Java |
| systematic-debugging | [02-dev-roles/systematic-debugging/SKILL.md](02-dev-roles/systematic-debugging/SKILL.md) ← 4-phase systematic debugging: root-cause tracing, isolation, fix verification (Superpowers) |
| verification-before-completion | [02-dev-roles/verification-before-completion/SKILL.md](02-dev-roles/verification-before-completion/SKILL.md) ← evidence before assertions, pre-commit/PR proof check (Superpowers) |
| archify | [02-dev-roles/archify/SKILL.md](02-dev-roles/archify/SKILL.md) ← Usala para crear diagramas Excalidraw, flujos y mapas de arquitectura visual té… |
| gentle-ai-review-4r | [02-dev-roles/gentle-ai-review-4r/SKILL.md](02-dev-roles/gentle-ai-review-4r/SKILL.md) ← 5 |
| live-cve-security-intel | [02-dev-roles/live-cve-security-intel/SKILL.md](02-dev-roles/live-cve-security-intel/SKILL.md) ← Use at the end of a project, before release, or during High-Risk (Item 2/5) rev… |

## 03-ai-ml

| Skill | Path |
|---|---|
| ai-orchestration | [03-ai-ml/ai-orchestration/SKILL.md](03-ai-ml/ai-orchestration/SKILL.md) ← Guidelines for managing multi-agent orchestrations |
| ai-scalability-mlops | [03-ai-ml/ai-scalability-mlops/SKILL.md](03-ai-ml/ai-scalability-mlops/SKILL.md) ← Guidelines for scaling applications and managing AI/ML operations |
| api-ai-billing | [03-ai-ml/api-ai-billing/SKILL.md](03-ai-ml/api-ai-billing/SKILL.md) ← Guidelines for managing AI API billing, FinOps token budgets, and usage quotas |
| llm-integration | [03-ai-ml/llm-integration/SKILL.md](03-ai-ml/llm-integration/SKILL.md) ← Guidelines for integrating LLMs into backend APIs |
| ai-sdk-5 | [03-ai-ml/ai-sdk-5/SKILL.md](03-ai-ml/ai-sdk-5/SKILL.md) ← Vercel AI SDK 5, useChat/UIMessage/streaming |
| prompt-engineering | [03-ai-ml/prompt-engineering/SKILL.md](03-ai-ml/prompt-engineering/SKILL.md) ← Standards and guidelines for Prompt Engineering |
| research-first | [03-ai-ml/research-first/SKILL.md](03-ai-ml/research-first/SKILL.md) ← ECC-inspired research-first development pattern |
| context-engineering | [03-ai-ml/context-engineering/SKILL.md](03-ai-ml/context-engineering/SKILL.md) ← Use when designing LLM context layouts, agent memory pipelines, multi-turn comp… |
| ai-safety-agent-guard | [03-ai-ml/ai-safety-agent-guard/SKILL.md](03-ai-ml/ai-safety-agent-guard/SKILL.md) ← Use when building LLM/agentic applications, MCP servers, tool-calling pipelines… |
| multimodal-ai-pipelines | [03-ai-ml/multimodal-ai-pipelines/SKILL.md](03-ai-ml/multimodal-ai-pipelines/SKILL.md) ← Use when building applications that process images, PDFs, screenshots, audio st… |
| rag-knowledge-systems | [03-ai-ml/rag-knowledge-systems/SKILL.md](03-ai-ml/rag-knowledge-systems/SKILL.md) ← Use when designing or optimizing RAG pipelines, document chunking, hybrid BM25… |

## 04-backend

| Skill | Path |
|---|---|
| docker | [04-backend/docker/SKILL.md](04-backend/docker/SKILL.md) ← Docker dev environment setup and production deployment via Railway/Render/VPS f… |
| error-handling | [04-backend/error-handling/SKILL.md](04-backend/error-handling/SKILL.md) ← Defines error handling patterns across the stack: Result types, Express error m… |
| mcp-integration | [04-backend/mcp-integration/SKILL.md](04-backend/mcp-integration/SKILL.md) ← Configures Model Context Protocol (MCP) servers for AI agents |
| api-design | [04-backend/api-design/SKILL.md](04-backend/api-design/SKILL.md) ← Defines REST API design conventions: URL structure, HTTP methods, status codes,… |
| expressjs | [04-backend/expressjs/SKILL.md](04-backend/expressjs/SKILL.md) ← Guidelines for Express.js API development |
| jwt-bcrypt | [04-backend/jwt-bcrypt/SKILL.md](04-backend/jwt-bcrypt/SKILL.md) ← Security standards for User Authentication and Authorization |
| microservices | [04-backend/microservices/SKILL.md](04-backend/microservices/SKILL.md) ← Guidelines for Microservices and Modular Monolith architectures |
| nodejs | [04-backend/nodejs/SKILL.md](04-backend/nodejs/SKILL.md) ← Guidelines for backend Node.js development |
| payments | [04-backend/payments/SKILL.md](04-backend/payments/SKILL.md) ← Universal payment processing architecture covering checkout sessions, payment i… |
| postgresql | [04-backend/postgresql/SKILL.md](04-backend/postgresql/SKILL.md) ← `references/schema-reference.md` |
| prisma-orm | [04-backend/prisma-orm/SKILL.md](04-backend/prisma-orm/SKILL.md) ← `references/schema-template.md` |
| socketio | [04-backend/socketio/SKILL.md](04-backend/socketio/SKILL.md) ← Real-time event communication with Socket.io (v4.7+) |
| rate-limiting-design | [04-backend/rate-limiting-design/SKILL.md](04-backend/rate-limiting-design/SKILL.md) ← `references/tier-table.md`, `scripts/check-limiters.mjs` |
| api-response-normalizer | [04-backend/api-response-normalizer/SKILL.md](04-backend/api-response-normalizer/SKILL.md) ← `references/envelope-convention.md`, `scripts/check-id-consistency.mjs` |
| prisma-frontend-types | [04-backend/prisma-frontend-types/SKILL.md](04-backend/prisma-frontend-types/SKILL.md) ← `references/type-mapping-rules.md`, `scripts/generate-frontend-types.mjs` |
| nodejs-module-loading | [04-backend/nodejs-module-loading/SKILL.md](04-backend/nodejs-module-loading/SKILL.md) ← `references/esm-evaluation-order.md`, `scripts/check-env-loading.mjs` |
| booking-scheduling-domain | [04-backend/booking-scheduling-domain/SKILL.md](04-backend/booking-scheduling-domain/SKILL.md) ← `references/slot-logic.md`, `references/conflict-resolution.md`, `references/no-show-protocol.md`, `scripts/check-booking-queries.mjs` |
| background-jobs-queues | [04-backend/background-jobs-queues/SKILL.md](04-backend/background-jobs-queues/SKILL.md) ← `references/job-catalog.md`, `references/bullmq-setup.md`, `scripts/check-jobs.mjs` |
| file-uploads-storage | [04-backend/file-uploads-storage/SKILL.md](04-backend/file-uploads-storage/SKILL.md) ← `references/upload-patterns.md`, `references/validation-rules.md`, `scripts/check-uploads.mjs` |
| notifications-multichannel | [04-backend/notifications-multichannel/SKILL.md](04-backend/notifications-multichannel/SKILL.md) ← `references/channel-priority.md`, `references/templates.md`, `scripts/check-notifications.mjs` |
| reports-exports | [04-backend/reports-exports/SKILL.md](04-backend/reports-exports/SKILL.md) ← `references/report-types.md`, `scripts/check-reports.mjs` |
| django-drf | [04-backend/django-drf/SKILL.md](04-backend/django-drf/SKILL.md) ← Django REST Framework: serializers, viewsets, permissions, JWT |
| java-21 | [04-backend/java-21/SKILL.md](04-backend/java-21/SKILL.md) ← records, sealed classes, pattern matching, virtual threads (Loom) |
| spring-boot-3 | [04-backend/spring-boot-3/SKILL.md](04-backend/spring-boot-3/SKILL.md) ← constructor injection, @ConfigurationProperties, @Transactional |
| modern-ts-backend | [04-backend/modern-ts-backend/SKILL.md](04-backend/modern-ts-backend/SKILL.md) ← Use when architecting greenfield TypeScript APIs, edge/serverless services, typ… |

## 05-frontend

| Skill | Path |
|---|---|
| electronjs | [05-frontend/electronjs/SKILL.md](05-frontend/electronjs/SKILL.md) ← DEPRECATED. Use electron instead. |
| electron | [05-frontend/electron/SKILL.md](05-frontend/electron/SKILL.md) ← security patterns: contextBridge, sandbox, IPC validation (gentleman-skills) |
| expo-production-auditor | [05-frontend/expo-production-auditor/SKILL.md](05-frontend/expo-production-auditor/SKILL.md) ← `references/troubleshooting.md` |
| maps-gps | [05-frontend/maps-gps/SKILL.md](05-frontend/maps-gps/SKILL.md) ← Implements real-time GPS telemetry streaming and interactive geospatial map vie… |
| nextjs | [05-frontend/nextjs/SKILL.md](05-frontend/nextjs/SKILL.md) ← DEPRECATED. Use nextjs-15 instead. |
| push-notifications | [05-frontend/push-notifications/SKILL.md](05-frontend/push-notifications/SKILL.md) ← Implementation of mobile push notifications across Expo, React Native, APNs, an… |
| pwa-capacitor | [05-frontend/pwa-capacitor/SKILL.md](05-frontend/pwa-capacitor/SKILL.md) ← Standards for Progressive Web Apps (PWA) and Ionic Capacitor hybrid mobile buil… |
| react-native | [05-frontend/react-native/SKILL.md](05-frontend/react-native/SKILL.md) ← Guidelines for cross-platform React Native development |
| react-vite | [05-frontend/react-vite/SKILL.md](05-frontend/react-vite/SKILL.md) ← Standards and guidelines for React and Vite SPA development |
| react-19 | [05-frontend/react-19/SKILL.md](05-frontend/react-19/SKILL.md) ← React 19 with React Compiler, no manual memoization |
| nextjs-15 | [05-frontend/nextjs-15/SKILL.md](05-frontend/nextjs-15/SKILL.md) ← Next.js 15 App Router, Server Actions |
| tailwindcss | [05-frontend/tailwindcss/SKILL.md](05-frontend/tailwindcss/SKILL.md) ← DEPRECATED. Use tailwind-4 instead. |
| tailwind-4 | [05-frontend/tailwind-4/SKILL.md](05-frontend/tailwind-4/SKILL.md) ← Tailwind 4, cn() utility, theme classes |
| zod-4 | [05-frontend/zod-4/SKILL.md](05-frontend/zod-4/SKILL.md) ← Zod 4 breaking changes from v3 |
| zustand-5 | [05-frontend/zustand-5/SKILL.md](05-frontend/zustand-5/SKILL.md) ← Zustand 5 with useShallow selectors |
| ai-ui-generation | [05-frontend/ai-ui-generation/SKILL.md](05-frontend/ai-ui-generation/SKILL.md) ← Google Stitch/v0/Lovable, anti-slop, prompt→deploy |
| angular-core | [05-frontend/angular-core/SKILL.md](05-frontend/angular-core/SKILL.md) ← signals, zoneless, inject(), no lifecycle hooks |
| angular-forms | [05-frontend/angular-forms/SKILL.md](05-frontend/angular-forms/SKILL.md) ← Signal Forms (v21) + Reactive Forms |
| angular-performance | [05-frontend/angular-performance/SKILL.md](05-frontend/angular-performance/SKILL.md) ← NgOptimizedImage, @defer, SSR |
| angular-architecture | [05-frontend/angular-architecture/SKILL.md](05-frontend/angular-architecture/SKILL.md) ← Scope Rule, file naming |
| state-management | [05-frontend/state-management/SKILL.md](05-frontend/state-management/SKILL.md) ← DEPRECATED. Use zustand-5 instead. |
| lazy-loading-patterns | [05-frontend/lazy-loading-patterns/SKILL.md](05-frontend/lazy-loading-patterns/SKILL.md) ← `references/lazy-patterns.md`, `scripts/check-module-level-loads.mjs` |
| forms-validation-react | [05-frontend/forms-validation-react/SKILL.md](05-frontend/forms-validation-react/SKILL.md) ← `references/rhf-zod-pattern.md`, `references/multi-step-forms.md`, `scripts/check-forms.mjs` |
| i18n-localization | [05-frontend/i18n-localization/SKILL.md](05-frontend/i18n-localization/SKILL.md) ← `references/setup-guide.md`, `scripts/check-hardcoded-strings.mjs` |
| offline-sync-mobile | [05-frontend/offline-sync-mobile/SKILL.md](05-frontend/offline-sync-mobile/SKILL.md) ← `references/sync-patterns.md`, `scripts/check-offline-sync.mjs` |
| deep-linking-mobile | [05-frontend/deep-linking-mobile/SKILL.md](05-frontend/deep-linking-mobile/SKILL.md) ← `references/setup-guide.md`, `scripts/check-deep-links.mjs` |
| design-system-tokens | [05-frontend/design-system-tokens/SKILL.md](05-frontend/design-system-tokens/SKILL.md) ← `references/token-taxonomy.md`, `references/color-scales.md`, `scripts/check-tokens.mjs` |
| visual-effects | [05-frontend/visual-effects/SKILL.md](05-frontend/visual-effects/SKILL.md) ← `references/glassmorphism.md`, `references/gradients-blends.md`, `scripts/check-effects.mjs` |
| motion-framer | [05-frontend/motion-framer/SKILL.md](05-frontend/motion-framer/SKILL.md) ← `references/spring-layout.md`, `references/animate-presence.md`, `scripts/check-motion.mjs` |
| scroll-animations | [05-frontend/scroll-animations/SKILL.md](05-frontend/scroll-animations/SKILL.md) ← `references/scroll-reveal.md`, `references/parallax.md`, `scripts/check-scroll.mjs` |
| page-transitions | [05-frontend/page-transitions/SKILL.md](05-frontend/page-transitions/SKILL.md) ← `references/web-transitions.md`, `scripts/check-transitions.mjs` |
| motion-gsap | [05-frontend/motion-gsap/SKILL.md](05-frontend/motion-gsap/SKILL.md) ← `references/timelines.md`, `references/svg-text.md`, `scripts/check-gsap.mjs` |
| lottie-animations | [05-frontend/lottie-animations/SKILL.md](05-frontend/lottie-animations/SKILL.md) ← `references/lottie-integration.md`, `scripts/check-lottie.mjs` |
| motion-accessibility | [05-frontend/motion-accessibility/SKILL.md](05-frontend/motion-accessibility/SKILL.md) ← `references/reduced-motion.md`, `references/performance.md`, `scripts/check-motion-a11y.mjs` |
| three-js-web | [05-frontend/three-js-web/SKILL.md](05-frontend/three-js-web/SKILL.md) ← `references/core-threejs.md`, `references/r3f-patterns.md`, `references/drei-helpers.md`, `references/performance-webgl.md`, `references/spline-no-code.md` |
| web-animation-sources | [05-frontend/web-animation-sources/SKILL.md](05-frontend/web-animation-sources/SKILL.md) ← `references/animation-sources.md` (10 referencias curadas por tópico) |
| vercel-react-best-practices | [05-frontend/vercel-react-best-practices/SKILL.md](05-frontend/vercel-react-best-practices/SKILL.md) ← Vercel Engineering: React & Next.js performance rules, server components, bundle optimization |
| vercel-composition-patterns | [05-frontend/vercel-composition-patterns/SKILL.md](05-frontend/vercel-composition-patterns/SKILL.md) ← scalable React composition, compound components, React 19 API |
| vercel-react-view-transitions | [05-frontend/vercel-react-view-transitions/SKILL.md](05-frontend/vercel-react-view-transitions/SKILL.md) ← native ViewTransition animations, shared elements, CSS pseudo-elements |
| web-design-guidelines | [05-frontend/web-design-guidelines/SKILL.md](05-frontend/web-design-guidelines/SKILL.md) ← review UI code for Web Interface Guidelines compliance, accessibility, UX audit |
| interface-design | [05-frontend/interface-design/SKILL.md](05-frontend/interface-design/SKILL.md) ← craft-first UI for dashboards, SaaS apps, admin panels, tokens (Linear/Stripe standard) |
| figma-implement | [05-frontend/figma-implement/SKILL.md](05-frontend/figma-implement/SKILL.md) ← plegado Capa 1: Figma → código 1:1 (canónico del grupo figma), design context + screenshots vía MCP |
| design-driven | [05-frontend/design-driven/SKILL.md](05-frontend/design-driven/SKILL.md) ← formal design pipeline (D1 brief → D6 design-review), decision gates, anti-slop |
| impeccable | [05-frontend/impeccable/SKILL.md](05-frontend/impeccable/SKILL.md) ← Comandos Bakaus, PRODUCT.md/DESIGN.md, references/commands.md |
| taste-skill | [05-frontend/taste-skill/SKILL.md](05-frontend/taste-skill/SKILL.md) ← Design Read, diales, 10 bans, references/full-guide.md |
| emil-kowalski | [05-frontend/emil-kowalski/SKILL.md](05-frontend/emil-kowalski/SKILL.md) ← Filosofía de Emil Kowalski (animations.dev): física de resortes, gestos interru… |
| refactoring-ui | [05-frontend/refactoring-ui/SKILL.md](05-frontend/refactoring-ui/SKILL.md) ← Metodología Wathan & Schoger armonizada con tokens OKLCH: validación de jerarqu… |
| ui-ux-pro-max | [05-frontend/ui-ux-pro-max/SKILL.md](05-frontend/ui-ux-pro-max/SKILL.md) ← Base de 50+ estilos UI, 160+ paletas y reglas por industria (SaaS, Fintech, E-c… |
| onboarding-cro | [05-frontend/onboarding-cro/SKILL.md](05-frontend/onboarding-cro/SKILL.md) ← Diseño y optimización de flujos de onboarding para reducir Time-to-Value (TTV)… |
| page-cro | [05-frontend/page-cro/SKILL.md](05-frontend/page-cro/SKILL.md) ← Optimización de conversión para landing pages, precios y páginas de producto se… |
| popup-cro | [05-frontend/popup-cro/SKILL.md](05-frontend/popup-cro/SKILL.md) ← Diseño de popups, modales de exit-intent y banners de alta conversión sin degra… |
| signup-flow-cro | [05-frontend/signup-flow-cro/SKILL.md](05-frontend/signup-flow-cro/SKILL.md) ← Reducción de fricción y optimización de conversión en formularios y flujos de r… |
| frontend-slides-deck | [05-frontend/frontend-slides-deck/SKILL.md](05-frontend/frontend-slides-deck/SKILL.md) ← Use when creating zero-dependency interactive HTML slide presentations, convert… |
| hallmark-design-study | [05-frontend/hallmark-design-study/SKILL.md](05-frontend/hallmark-design-study/SKILL.md) ← Use when extracting structural and visual DNA from reference URLs or screenshot… |
| scroll-world-storytelling | [05-frontend/scroll-world-storytelling/SKILL.md](05-frontend/scroll-world-storytelling/SKILL.md) ← Use when building immersive scroll-driven landing pages, product showcases, 3D/… |

## 06-code-quality

| Skill | Path |
|---|---|
| branch-pr | [06-code-quality/branch-pr/SKILL.md](06-code-quality/branch-pr/SKILL.md) ← creación de pull requests con validación issue-first |
| chained-pr | [06-code-quality/chained-pr/SKILL.md](06-code-quality/chained-pr/SKILL.md) ← división de PRs grandes (>400 líneas) en slices apilados para revisión |
| comment-writer | [06-code-quality/comment-writer/SKILL.md](06-code-quality/comment-writer/SKILL.md) ← redacción colaborativa y directa en comentarios de PRs y code reviews |
| issue-creation | [06-code-quality/issue-creation/SKILL.md](06-code-quality/issue-creation/SKILL.md) ← creación y triage estructurado de issues en GitHub con evidencia técnica |
| systemic-issue-triage | [06-code-quality/systemic-issue-triage/SKILL.md](06-code-quality/systemic-issue-triage/SKILL.md) ← triage masivo de reportes de bugs, issues y backlog |
| work-unit-commits | [06-code-quality/work-unit-commits/SKILL.md](06-code-quality/work-unit-commits/SKILL.md) ← commits atómicos estructurados por unidad de trabajo revisable |
| pnpm-workspaces | [06-code-quality/pnpm-workspaces/SKILL.md](06-code-quality/pnpm-workspaces/SKILL.md) ← Configures pnpm as the package manager and workspace orchestrator for monorepo… |
| turborepo | [06-code-quality/turborepo/SKILL.md](06-code-quality/turborepo/SKILL.md) ← Configures Turborepo for build caching and parallel execution in pnpm monorepos |
| biome | [06-code-quality/biome/SKILL.md](06-code-quality/biome/SKILL.md) ← Configures Biome as a unified linter and formatter replacing ESLint + Prettier |
| changesets | [06-code-quality/changesets/SKILL.md](06-code-quality/changesets/SKILL.md) ← Configures Changesets for versioning and changelog management in pnpm monorepos |
| changelog-generator | [06-code-quality/changelog-generator/SKILL.md](06-code-quality/changelog-generator/SKILL.md) ← automatic user-facing changelogs & release notes from git commits |
| env-management | [06-code-quality/env-management/SKILL.md](06-code-quality/env-management/SKILL.md) ← Manages environment variables across development, staging, and production envir… |
| solid-clean-code | [06-code-quality/solid-clean-code/SKILL.md](06-code-quality/solid-clean-code/SKILL.md) ← Software engineering quality and architectural proportionality — SOLID, DRY, KI… |
| typescript | [06-code-quality/typescript/SKILL.md](06-code-quality/typescript/SKILL.md) ← Guidelines for strict TypeScript development — precise type safety, unknown nar… |
| dependency-guardian | [06-code-quality/dependency-guardian/SKILL.md](06-code-quality/dependency-guardian/SKILL.md) ← Garantiza el uso de versiones estables, seguras y actualizadas de todas las dep… |
| build-config-validator | [06-code-quality/build-config-validator/SKILL.md](06-code-quality/build-config-validator/SKILL.md) ← `scripts/validate-build-config.mjs` |
| elixir-antipatterns | [06-code-quality/elixir-antipatterns/SKILL.md](06-code-quality/elixir-antipatterns/SKILL.md) ← Agent misuse, nested case, bare spawn, GenServer bottleneck |
| supply-chain-runtime-security | [06-code-quality/supply-chain-runtime-security/SKILL.md](06-code-quality/supply-chain-runtime-security/SKILL.md) ← Use when hardening Node/TypeScript dependency trees, auditing third-party MCP s… |

## 07-testing

| Skill | Path |
|---|---|
| go-testing | [07-testing/go-testing/SKILL.md](07-testing/go-testing/SKILL.md) ← patrones de prueba para Go: unit tests, cobertura, Bubbletea teatest y golden files |
| testing-patterns | [07-testing/testing-patterns/SKILL.md](07-testing/testing-patterns/SKILL.md) ← Unit, integration, and E2E testing patterns for fullstack apps — fast determini… |
| playwright | [07-testing/playwright/SKILL.md](07-testing/playwright/SKILL.md) ← E2E, MCP-first exploration, Page Object Model |
| pytest | [07-testing/pytest/SKILL.md](07-testing/pytest/SKILL.md) ← fixtures, mocking, parametrize, markers, async, conftest |
| agentic-evals-edd | [07-testing/agentic-evals-edd/SKILL.md](07-testing/agentic-evals-edd/SKILL.md) ← Use when testing AI agents, LLM prompts, RAG pipelines, or skill routers with d… |

## 08-devops

| Skill | Path |
|---|---|
| ci-cd | [08-devops/ci-cd/SKILL.md](08-devops/ci-cd/SKILL.md) ← CI/CD pipeline configuration for modern workspaces and monorepos |
| kill-switches | [08-devops/kill-switches/SKILL.md](08-devops/kill-switches/SKILL.md) ← Implements emergency stop mechanisms for AI agent processes: heartbeat dead-man… |
| monitoring | [08-devops/monitoring/SKILL.md](08-devops/monitoring/SKILL.md) ← Logging, healthchecks, and observability telemetry standards for backend servic… |
| observability | [08-devops/observability/SKILL.md](08-devops/observability/SKILL.md) ← Configures observability stack: OpenTelemetry traces, Prometheus metrics, struc… |
| store-deployment-eas | [08-devops/store-deployment-eas/SKILL.md](08-devops/store-deployment-eas/SKILL.md) ← `references/eas-setup.md`, `scripts/check-eas-config.mjs` |
| cloudflare-edge | [08-devops/cloudflare-edge/SKILL.md](08-devops/cloudflare-edge/SKILL.md) ← Usala para configurar el patrón Cloudflare delante con proxy, WAF, Turnstile, e… |

## 09-media-graphics

| Skill | Path |
|---|---|
| nano-banana | [09-media-graphics/nano-banana/SKILL.md](09-media-graphics/nano-banana/SKILL.md) ← canónico del grupo banana-image-gen: generación/edición de imágenes con Nano Banana (Gemini CLI nanobanana) |
| banana-claude | [09-media-graphics/banana-claude/SKILL.md](09-media-graphics/banana-claude/SKILL.md) ← Creative Director: prompt engineering, modos de dominio y control de aspecto para imágenes profesionales |

## 11-mcp-hybrid

| Skill | Path |
|---|---|
| gentle-ai-bench | [11-mcp-hybrid/gentle-ai-bench/SKILL.md](11-mcp-hybrid/gentle-ai-bench/SKILL.md) ← benchmarking y evaluación de agentes mediante corpus de journeys |
| component-scrapper-mcp | [11-mcp-hybrid/component-scrapper-mcp/SKILL.md](11-mcp-hybrid/component-scrapper-mcp/SKILL.md) ← scrapea componentes de sitios en vivo vía MCP y los reutiliza como código project-ready |
| oklch-theme-injector | [11-mcp-hybrid/oklch-theme-injector/SKILL.md](11-mcp-hybrid/oklch-theme-injector/SKILL.md) ← temas de color perceptivo OKLCH/OKHSL sobre la taxonomía de tokens HSL |
| motion-video-pipeline | [11-mcp-hybrid/motion-video-pipeline/SKILL.md](11-mcp-hybrid/motion-video-pipeline/SKILL.md) ← pipeline motion-to-video: render de frames y ensamblaje con timing determinístico |
| ux-auditor-agent | [11-mcp-hybrid/ux-auditor-agent/SKILL.md](11-mcp-hybrid/ux-auditor-agent/SKILL.md) ← auditoría UX/usabilidad/accesibilidad con hallazgos priorizados y evidencia |
| asset-generator-mcp | [11-mcp-hybrid/asset-generator-mcp/SKILL.md](11-mcp-hybrid/asset-generator-mcp/SKILL.md) ← assets de imagen (iconos, logos, ilustraciones) vía generación MCP con brief de estilo |
| figma-mcp | [11-mcp-hybrid/figma-mcp/SKILL.md](11-mcp-hybrid/figma-mcp/SKILL.md) ← inspección de archivos Figma (design context, metadata, tokens, screenshots) vía servidor MCP |
| open-design | [11-mcp-hybrid/open-design/SKILL.md](11-mcp-hybrid/open-design/SKILL.md) ← OpenDesign por MCP (mcp__open-design__*), CLI od de respaldo |
| openseo | [11-mcp-hybrid/openseo/SKILL.md](11-mcp-hybrid/openseo/SKILL.md) ← Usala para auditar SEO técnico, schemas JSON-LD y visibilidad en motores de IA… |

## professional-planner

| Skill | Path |
|---|---|
| professional-planner | [professional-planner/SKILL.md](professional-planner/SKILL.md) ← DEPRECATED |

## 🔗 Referencias

- Spec oficial: https://agentskills.io/specification
- Validador local: `node ./00-meta-skills/skill-validator/scripts/validate-skills.mjs`
- Instalador cross-tool: `node ./00-meta-skills/skill-sync/scripts/install-skills.mjs --target <path>`
- Shared scripts helper: `_shared/script-utils.mjs` (usado por los scripts `*.mjs` de las skills con `scripts/`)
- Auto-invoke: ver [AGENTS.md](AGENTS.md) sección 🤖 Auto-Invoke List

## 12-matt-pocock

| Skill | Path |
|---|---|
| ask-matt | [12-matt-pocock/ask-matt/SKILL.md](12-matt-pocock/ask-matt/SKILL.md) ← Ask which skill or flow fits your situation |
| code-review | [12-matt-pocock/code-review/SKILL.md](12-matt-pocock/code-review/SKILL.md) ← Two-axis Standards vs Spec review since a fixed git ref (Matt Pocock interactiv… |
| codebase-design | [12-matt-pocock/codebase-design/SKILL.md](12-matt-pocock/codebase-design/SKILL.md) ← Shared vocabulary for designing deep modules |
| diagnosing-bugs | [12-matt-pocock/diagnosing-bugs/SKILL.md](12-matt-pocock/diagnosing-bugs/SKILL.md) ← Diagnosis loop for hard bugs and performance regressions |
| domain-modeling | [12-matt-pocock/domain-modeling/SKILL.md](12-matt-pocock/domain-modeling/SKILL.md) ← Build and sharpen a project's domain model |
| grill-me | [12-matt-pocock/grill-me/SKILL.md](12-matt-pocock/grill-me/SKILL.md) ← Use when the user wants to sharpen a plan or design with relentless questioning |
| grill-with-docs | [12-matt-pocock/grill-with-docs/SKILL.md](12-matt-pocock/grill-with-docs/SKILL.md) ← A relentless interview to sharpen a plan or design, which also creates docs (AD… |
| grilling | [12-matt-pocock/grilling/SKILL.md](12-matt-pocock/grilling/SKILL.md) ← Grill the user relentlessly about a plan, decision, or idea |
| handoff | [12-matt-pocock/handoff/SKILL.md](12-matt-pocock/handoff/SKILL.md) ← Use when the session must be compacted into a handoff document for another agen… |
| implement | [12-matt-pocock/implement/SKILL.md](12-matt-pocock/implement/SKILL.md) ← Implement a piece of work based on a spec or set of tickets |
| improve-codebase-architecture | [12-matt-pocock/improve-codebase-architecture/SKILL.md](12-matt-pocock/improve-codebase-architecture/SKILL.md) ← Scan a codebase for deepening opportunities, present them as a visual HTML repo… |
| migrate-to-shoehorn | [12-matt-pocock/migrate-to-shoehorn/SKILL.md](12-matt-pocock/migrate-to-shoehorn/SKILL.md) ← Migrate test files from `as` type assertions to @total-typescript/shoehorn |
| prototype | [12-matt-pocock/prototype/SKILL.md](12-matt-pocock/prototype/SKILL.md) ← Build a throwaway prototype to answer a design question |
| research | [12-matt-pocock/research/SKILL.md](12-matt-pocock/research/SKILL.md) ← Delegates reading legwork and source investigation to a background agent (Matt… |
| resolving-merge-conflicts | [12-matt-pocock/resolving-merge-conflicts/SKILL.md](12-matt-pocock/resolving-merge-conflicts/SKILL.md) ← Use when you need to resolve an in-progress git merge/rebase conflict |
| scaffold-exercises | [12-matt-pocock/scaffold-exercises/SKILL.md](12-matt-pocock/scaffold-exercises/SKILL.md) ← Create exercise directory structures with sections, problems, solutions, and ex… |
| setup-pre-commit | [12-matt-pocock/setup-pre-commit/SKILL.md](12-matt-pocock/setup-pre-commit/SKILL.md) ← Set up Husky pre-commit hooks with lint-staged (Prettier), type checking, and t… |
| tdd | [12-matt-pocock/tdd/SKILL.md](12-matt-pocock/tdd/SKILL.md) ← Test-driven development red-green-refactor loop principles and seam definition… |
| teach | [12-matt-pocock/teach/SKILL.md](12-matt-pocock/teach/SKILL.md) ← Teach the user a new skill or concept, within this workspace |
| to-questionnaire | [12-matt-pocock/to-questionnaire/SKILL.md](12-matt-pocock/to-questionnaire/SKILL.md) ← Use when a decision can't be fully answered and must be turned into a questionn… |
| to-spec | [12-matt-pocock/to-spec/SKILL.md](12-matt-pocock/to-spec/SKILL.md) ← Use when the current conversation must be synthesized into a spec published to… |
| to-tickets | [12-matt-pocock/to-tickets/SKILL.md](12-matt-pocock/to-tickets/SKILL.md) ← Use when a plan, spec, or conversation must be broken into tracer-bullet ticket… |
| triage | [12-matt-pocock/triage/SKILL.md](12-matt-pocock/triage/SKILL.md) ← Move issues and external PRs through a state machine of triage roles, categoris… |
| wait-what | [12-matt-pocock/wait-what/SKILL.md](12-matt-pocock/wait-what/SKILL.md) ← Use when the last message did not land with the user and must be re-pitched |
| wayfinder | [12-matt-pocock/wayfinder/SKILL.md](12-matt-pocock/wayfinder/SKILL.md) ← Use when a large chunk of work (more than one agent session) must be planned as… |
| wizard | [12-matt-pocock/wizard/SKILL.md](12-matt-pocock/wizard/SKILL.md) ← Generate an interactive bash wizard that walks a human through steps only they… |
| writing-for-agents | [12-matt-pocock/writing-for-agents/SKILL.md](12-matt-pocock/writing-for-agents/SKILL.md) ← Writing documents for agents |
