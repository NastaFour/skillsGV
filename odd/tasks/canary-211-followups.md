# Canary de activación + follow-ups CHANGELOG 2.1.1 — feature doc (ODD)

- **Estado**: en curso (branch por crear `feat/followups-211` desde `main@6edd3cc`)
- **Fecha**: 2026-09-21
- **Mirror Engram**: `odd/canary-211-followups/tasks` (proyecto `skillsgv`, sesión `skillsGV-2026-09-21-canary-followups`)

## Objetivo

Cerrar el ciclo post-2.1.1: registrar los resultados del canary de activación, ejecutar los follow-ups listados en el CHANGELOG 2.1.1 y dejar diseñado el bench final (skills vs sin skills) que el usuario pidió.

## Problema / por qué

- El canary (`references/canary-activation.md`) existía como procedimiento pero sin resultados registrados.
- El CHANGELOG 2.1.1 deja 5 follow-ups explícitos fuera del release.
- El usuario pidió, al final de todo, un test comparativo skills vs sin skills con `agy` (Gemini flash, effort high) y análisis de session logs para evaluar adherencia a lineamientos en profundidad.

## Hallazgo central del canary (2026-09-21)

**Antigravity CLI (`agy -p`) = KERNEL-MISSING por ambas vías**: no autocarga `GEMINI.md` ni `AGENTS.md` del workspace (probados ambos, sandbox `canary-activacion`, install 2.1.1 desde `main@6edd3cc`, 512 archivos, kernel minimal inyectado). Su capa always-on proviene solo del HOME: `~/.gemini/GEMINI.md` (bloques gentle-ai) + índice de `~/.gemini/skills`. Consecuencia: para `agy`, el único canal de activación verificado es el GLOBAL → el follow-up "kernel en installs globales" es la única vía real de activación para ese harness.

Gemini CLI puro (`gemini -p`): PENDING — sin auth en el entorno (GEMINI_API_KEY/OAuth ausentes).

Dato adicional: uninstall con código 2.1.1 sobre un manifest pre-merge limpió perfecto (19 archivos, kernel, gitignore, `.skills-install/`) — simetría verificada en entorno real, no solo en suite.

## Tareas

- [x] T0 Verificación de estado post-merge: `pnpm test` 111/111 PASS, `pnpm validate:strict` 210/0/0. Repo sano en `main@6edd3cc`.
- [x] T0b Reinstall del sandbox con la versión nueva (uninstall de install pre-merge + install fresco 2.1.1 completo).
- [x] T0c Canary `agy` vía `GEMINI.md` → KERNEL-MISSING; vía `AGENTS.md` → KERNEL-MISSING.
- [ ] T0d Registrar resultados del canary en `references/canary-activation.md` (tabla del paso 5).
- [x] T1 Follow-up #1 (slice mínimo aprobado): **DONE 2026-09-21** — commits `8285a57` (re-vendor contrato review 3.4.0 byte-exacto, hash `EB8AFE47…` verificado idéntico a la fuente + refs de mecánica en 8 archivos), `1b8795f` (chassis §B/§C/§D), `67a5040` (truth-up 5 puntos + RTK sweep limpio). Autorado +303/−183 (486). Verificación: `pnpm test` 111/111, `validate:strict` 210/0/0, `sync-addon --check` PASS, spot-check del orquestador (hash + diff §G). Writer: subagente `general` (glm-5.3 full) — deliberado, ver justificación en historia de sesión.
- [x] **REVIEW CONGELADA**: **RESUELTA / ABANDONADA** — Transacción huérfana `review-5048b2d75805b5d9` fue descartada limpiamente mediante `gentle-ai review abandon`. Store de reviews en estado limpio.
- [x] **GITIGNORE PROTEGIDO**: `.skills-install/`, `.skills-installed/`, `.agents/`, `.gemini/`, `.claude/`, `.cursor/`, `.vscode/` agregados a `.gitignore` raíz para evitar pusheos involuntarios de skills instaladas.
- [x] **FASE 1 (Frontend Design Skills)**: 3 nuevas skills creadas y validadas: `05-frontend/ui-ux-pro-max`, `05-frontend/refactoring-ui`, `05-frontend/emil-kowalski`.
- [x] **FASE 2 (Arch, Lean-UX, Cloudflare, OpenSEO & MCP)**: 4 nuevas skills creadas: `02-dev-roles/archify`, `01-planning-process/lean-ux`, `08-devops/cloudflare-edge`, `11-mcp-hybrid/openseo`. Actualizado `mcp-manifest.json` (openseo, playwright) y fallback bidireccional.
- [x] **FASE 3 (CRO Suite & Copywriting / StoryBrand / Security)**: 11 nuevas skills creadas y validadas:
  - CRO Suite (Corey Haines): `05-frontend/page-cro`, `05-frontend/signup-flow-cro`, `05-frontend/onboarding-cro`, `05-frontend/popup-cro`.
  - Copywriting / Brand (Donald Miller / Wondelai): `01-planning-process/storybrand-messaging`, `01-planning-process/humanizer`, `01-planning-process/copywriting`, `01-planning-process/brand-guidelines`, `01-planning-process/content-strategy`, `01-planning-process/content-studio`.
  - Security (Hermes #13): `00-meta-skills/skill-spector`.
- [x] **FASE 4 (Alineación Gentle-AI 4.0.0 & Evidence Budget)**:
  - `00-meta-skills/gentle-orchestrator/SKILL.md` actualizado con el Evidence Budget de 4.0.0 (~10k tokens / máx. 3 llamadas inline; mappers y writers delegados).
  - `00-meta-skills/harness-map.md` actualizado con nota de evolución ODD de 4.0.0.
  - `_shared/bootstrap-kernel-minimal.md` actualizado con ODD exclusivo y Evidence Budget.
- [x] **FASE 5 (Solución Kernel & Rutas Antigravity `agy`)**:
  - `00-meta-skills/skill-sync/scripts/install-skills.mjs` corregido para instalar en `.agents/skills` (la ruta real donde Antigravity CLI descubre skills en Windows/Home) y detectar `.gemini/antigravity-cli`, `antigravity`, `agy`.
- [x] **FASE 6 (Sincronización DSH & Verificación Total)**:
  - Catálogo principal actualizado a **228 skills**.
  - `node scripts/sync-addon.mjs --write` ejecutado con éxito: 228 skills en paridad exacta con `gentle-ai-dsh/skills/`.
  - `pnpm validate:strict`: **228 pass · 0 errors · 0 warnings**.
  - `pnpm test`: **111 pass · 0 fail**.
  - `pnpm test:addon`: **3 pass · 0 fail**.

## Alcance autorizado

Repo `C:\Users\j1347\Desktop\skills` (origin `github.com/NastaFour/skillsGV`), branch feature + PR. Sandbox `C:\Users\j1347\Desktop\canary-activacion` (desechable, ya modificado para el canary). No tocar `gentle-ai-dsh/AGENTS.md` (preset del addon) fuera de lo que el sync-addon regenere.

## Verificación (evidencia)

- `pnpm test` (111 tests, incluye kernel-inject + paridad espejo dsh) tras cada tarea de código.
- `pnpm validate:strict` tras tocar SKILL.md.
- Canales verificados con el prompt exacto del runbook (transcript en los outputs de las corridas `agy -p`).

## Estado de sesión (parada 2026-09-21, "Parar acá")

Sesión interrumpida por decisión del usuario durante el defect handoff del review nativo. Próxima sesión — orden sugerido:

1. Resolver la transacción congelada (ver REVIEW CONGELADA arriba).
2. Preguntar chain vs `size:exception` y abrir el PR de `feat/followups-211` (sin push aún).
3. T2+T4 Rama B: instalación global `~/.gemini` completa (210 skills + tier0 + kernel minimal en `~/.gemini/GEMINI.md`) — aprobada por usuario, pendiente de ejecución.
4. Confirmar con el usuario las rutas exactas de los proyectos viejos del bench CON/SIN skills para borrarlos (búsqueda `bench|zona|sonido|con-skills|sin-skills` en Desktop/home: sin resultados).
5. T7 Bench final: skills vs sin skills con `agy` (Gemini flash, `--effort high`), n por definir, análisis de session logs para adherencia a lineamientos.

Notas técnicas para reanudar: el STATUS del binding es el comando exacto con `--lineage=review-5048b2d75805b5d9 --repository-context=rctx2_5da5af79bd9254c60fef109ad137522c2ee2a3711f37ce60105e6f4043aae69b --base-ref=3ba49342583d17cc03e2a5b93ec328e715c12b60 --committed-only=true`. El preflight selectorless (sin binding) responde normal — el timeout es específico del binding con rctx2. Engram: proyecto `skillsgv` registrado vía session_start pero los writes (`mem_save`) fallan `ambiguous_project` en el MCP (disponibles: gentle-ai, mattpocock-skills) — mirror Engram PENDING, este archivo es la fuente de recuperación.


## Decisiones

1. No modificar `KERNEL_CHANNELS` en `kernel-inject.mjs` todavía: el hallazgo de agy es "no hay canal de workspace", no "el canal correcto es X" — la vía global es la decisión T2+T4.
2. `AGENTS.md` de prueba queda en el sandbox (desechable); no forma parte del manifest del instalador.
3. Bench final se diseña al final (después de follow-ups) — el usuario definió modelo/agente (agy, flash, high) pero no n ni aislamiento; se propone diseño antes de ejecutar.
4. **Usuario (2026-09-21)**: slice mínimo para el follow-up #1 (WU1+WU2, ~450-600 líneas, 2 PRs si hace falta); absorción completa del change SDD queda diferida.
5. **Usuario (2026-09-21)**: instalación global completa con kernel (sí) — catálogo 210 + tier0 + kernel minimal en `~/.gemini/GEMINI.md`.
6. **Usuario (2026-09-21)**: target de alineación = gentle-ai 3.4.0 (no 3.1.0); adaptar novedades 3.2.1→3.4.0 al harness de skills.
7. Contrato review: re-vendor byte-exacto EN (práctica existente del catálogo); docs de catálogo en ES.
