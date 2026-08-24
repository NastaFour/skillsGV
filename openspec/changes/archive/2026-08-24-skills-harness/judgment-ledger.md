# Judgment Day — Ledger (skills-harness)

- **Target**: main @ `d1194918b99ff9a957f20a6026cee698e3cb75fe` (base `c62bcac`)
- **Ronda**: 1 (dos jueces ciegos en paralelo, read-only)
- **Contradicción resuelta con evidencia**: fixture `figma-inspect-only` ejecutado en vivo → `primary: figma-mcp, confidence: 1` (L1 es latente, no reproduce hoy en NTFS).

## Hallazgos confirmados (ambos jueces)

| ID | Severidad | Ubicación | Claim | Disposición |
|---|---|---|---|---|
| L1 | WARNING (latente) | `00-meta-skills/skill-router/scripts/skill-router.mjs:153-173` | Hook D4 promueve el canonical sin exigir trigger propio; si el canonical entra al top-4 por keywords sin trigger, la promoción fuerza confidence ≤0.5 y `primary=null`. Depende del orden de walk del filesystem. | introduced |
| L2 | WARNING | `00-meta-skills/sdd-init/SKILL.md:65-68` | Contrato de salida lista 5 campos; omite `skill_resolution` (spec exige 6, sección D del protocolo común). | introduced |
| L3 | WARNING | `AGENTS.md` (Tier 0) vs `00-meta-skills/skill-loader/scripts/skills-loader.mjs:115-128` y `tier0-context.json` | El Tier 0 documentado (con engram-integration y kill-switches) no coincide con el set aplicado por el loader (skill-loader y decision-gate, sin los dos anteriores). | unknown |
| L4 | WARNING | `allowed-tools: Read` en sdd-apply/sdd-verify/sdd-archive/sdd-onboard y fases de planificación | Las fases escriben código/artefactos o requieren shell (cp/mv/git mv/diff); el frontmatter subdeclara la superficie de herramientas. | introduced |

## Sospechosos (un solo juez)

| ID | Juez | Ubicación | Claim |
|---|---|---|---|
| S1 | B | `AGENTS.md:30,62,96,176` | Regla de arranque nueva enruta 2+ archivos a `sdd-orchestrator`; regla global y fila auto-invoke enrutan lo mismo a `professional-planner` (contradicción). |
| S2 | B | `00-meta-skills/sdd-verify/SKILL.md:77-79` | Contrato de salida es solo `## Verification Report`; no exige el envelope de 6 campos. |
| S3 | A | `00-meta-skills/skill-loader/scripts/skills-loader.mjs:466-467` | `--emit-registry` hardcodea `scope: project`; nunca lee `metadata.scope` del frontmatter. |

## INFO (suggestions, no bloqueantes)

- `openspec/config.yaml` dice «catálogo de 129 skills» (hoy 149).
- `00-meta-skills/skill-router/SKILL.md` y `tier0-context.json` dicen «109 skills».
- `00-meta-skills/harness-map.md` filas 1/6/7/8/9 apuntan a `professional-planner` en vez del harness nuevo.
- `09-media-graphics/nano-banana/SKILL.md:75` cross-ref confusa («is this skill» → debería decir nano-banana).

## Decisión

Usuario: **CORREGIR TODO** (L1-L4 + S1-S3 + INFO razonable) con actor acotado, luego re-juicio de ambos jueces sobre ledger + delta.

## Veredicto terminal (ronda final)

- **Target**: main @ `7402f19cd5a2c9d2c9347f58c8810af97a8ac190` (post-correcciones)
- **Rondas**: juicio 1 → corrección 1 (L1-L4, S1-S3, I1-I4) → re-juicio 1 (residuales R1-R6) → corrección 2 (R1-R6) → re-juicio 2 final.
- **Resultado re-juicio final**: ambos jueces `findings: []`; R1-R6 verificados en HEAD; sin defectos causados por correcciones.
- **Verificación final independiente**: `validate-skills.mjs --strict` exit 0 (149/149); smoke fixtures 11/11; query vivo `primary: figma-mcp, confidence: 1`; `git status` limpio.
- **Conteos**: confirmados 4 (ronda 1) + sospechosos 3 + INFO 4; correcciones: 12 WUs (ronda 1) + 6 WUs (ronda 2); residuales 0; contradicciones 1 (resuelta con evidencia en vivo).
- **JUDGMENT: APPROVED ✅** — 2026-08-24. Emitido por el orquestador tras el protocolo Judgment Day (skill `02-dev-roles/judgment-day`).

---

# Ronda de corrección 1

Actor acotado (bounded fix, sin review ni nuevo juicio) — autorizado por el usuario para corregir TODOS los IDs, incluidos sospechosos e INFO. Cada corrección es una unidad de trabajo atómica (conventional commits, sin atribución IA).

| ID | Fix (commit SHA) | Evidencia |
|---|---|---|
| L1 | `04e28b3` | Hook D4 solo promueve el canónico si `triggerScore >= 1`; si no, se mantiene el líder actual. Fixture nueva `figma-canonical-keyword-only` (canónico entra al top-4 solo por keywords; primary = figma-mcp, conf 1). Smoke: 11/11 fixtures verdes (10 existentes + 1 nueva). `--query "get the figma design context and tokens for this node"` → primary=figma-mcp, conf 1. |
| L2 | `d10f6a1` | Contrato de salida de sdd-init ahora exige el envelope de exactamente seis campos (status, executive_summary, artifacts, next_recommended, risks, skill_resolution) según sección D del protocolo común. |
| L3 | `a6e2fae` | Tier 0 reconciliado a UN set de 14 skills (unión): AGENTS.md (texto Tier 0), loader `TIER0_SKILLS` (+engram-integration, +kill-switches; comentario 12→14) y `tier0-context.json` regenerado (skillCount=14). Descripción de skill-loader actualizada a «14 always-on skills». |
| L4 | `2d6624b` | `allowed-tools` por fase alineado al trabajo real: apply `Read Write Edit Bash(node:*)`, verify `Read Bash(node:*)`, archive `Read Write Edit Bash(git:*,node:*)`, onboard `Read Write Edit Bash(node:*)`, propose/spec/design/tasks `Read Write Edit`, orchestrator `Read Task` (delegación), init `Read Write Edit` (escribe artefactos/registro). explore mantiene `Read` (no escribe). `validate-skills --strict` exit 0. |
| S1 | `ede69e0` | AGENTS.md:62/96/176 enrutan SDD a `sdd-orchestrator`; `professional-planner` queda como metodología de referencia. Coherente con la regla de arranque. |
| S2 | `067efea` | Contrato de salida de sdd-verify exige además el envelope de seis campos (sección D), junto al `## Verification Report`. |
| S3 | `7269df4` | `--emit-registry` lee `metadata.scope` del frontmatter (default `project`), con migración de cache. `.atl/skill-registry.md` regenerado: skill-creator y skill-loader → `root-only`; resto según su scope declarado. Emisión byte-idempotente (SHA256 igual en 2 corridas). |
| I1 | `e587b04` | `openspec/config.yaml`: «catálogo de 129 skills» → «149 skills» (conteo real verificado: 149 SKILL.md). |
| I2 | `0ae2485` | `skill-router/SKILL.md`: «109 skills» → «149» (descripción frontmatter + cuerpo ×2). `tier0-context.json` regenerado con la descripción embebida actualizada. |
| I3 | `5bbefb1` | `harness-map.md` filas 1/6/7/8/9 apuntan a `sdd-orchestrator` / fases `sdd-*` / `_shared/sdd-phase-common.md`; filas de cobertura actualizadas (professional-planner = metodología de referencia). |
| I4 | `7d540dc` | `nano-banana/SKILL.md:75`: «is this skill» → «is `nano-banana`» (espeja la redacción de banana-claude). |

## Verificación global post-corrección (exit codes y evidencia en vivo)

- `node 00-meta-skills/skill-validator/scripts/validate-skills.mjs --strict` → exit 0 (149/149 pass, 0 errores, 0 warnings).
- Smoke fixtures del router (runner propio sobre `overlap-smoke-tests.json`) → 11/11 green.
- `node 00-meta-skills/skill-router/scripts/skill-router.mjs --query "get the figma design context and tokens for this node" --json` → `primary: figma-mcp`, `confidence: 1`.
- `node 00-meta-skills/skill-loader/scripts/skills-loader.mjs --emit-registry` → exit 0, 138 skills indexadas, byte-idempotente.
- `git status` limpio al cierre.

---

# Ronda de corrección 2

Re-juicio acotado (ambos jueces) sobre el ledger + delta de la ronda 1: 6 defectos residuales causados/relacionados con la corrección. El usuario autorizó corregir todo. Actor acotado final (bounded fix round 2, sin review ni nuevo juicio). Cada corrección es una unidad de trabajo atómica (conventional commits, sin atribución IA).

| ID | Fix (commit SHA) | Evidencia |
|---|---|---|
| R1 | `4e4fd25` | Header de `skills-loader.mjs` actualizado a «14 always-on skills» (coherente con el comentario inline «The 14 Tier 0» y `TIER0_SKILLS` de 14). Test: `--status` → exit 0, «Tier 0 set: 14 skills»; 0 referencias «12 always-on» en el header; `tier0-context.json` skillCount=14. |
| R2 | `62c98fa` | Tabla Tier System de `skill-loader/SKILL.md` ahora lista 14 entradas: +`engram-integration`, +`kill-switches` (mismo orden que `TIER0_SKILLS`). Test: comparación programática fila SKILL.md vs `TIER0_SKILLS` vs nombres de `tier0-context.json` → 14/14/14 con igualdad exacta de arreglos, exit 0. |
| R3 | `12a1771` | `sdd-verify/SKILL.md` `allowed-tools: Read Bash(node:*)` → `Read Write Bash(node:*)` (la fase debe persistir el verify-report en modos openspec/hybrid; consistente con sdd-apply/sdd-archive). Test: `validate-skills --strict` → exit 0, 149/149, 0 errores, 0 warnings. |
| R4 | `c40eed1` | `sdd-orchestrator/SKILL.md` `allowed-tools: Read Task` → `Read Task Bash(git:*,gh:*)` (el cuerpo manda bash inline para estado git/gh; sintaxis de prefijo consistente con `Bash(git:*,node:*)` de sdd-archive). Test: `validate-skills --strict` → exit 0, 149/149, 0 errores, 0 warnings. |
| R5 | `04a0b8a` | `skill-router/SKILL.md` líneas 22/41/93: `needsSDD` rutea a `sdd-orchestrator`; `professional-planner` queda como metodología de referencia (coherente con AGENTS.md y la regla de arranque). Test: 3 spots verificados por aserción de texto, 0 referencias «invoke professional-planner» residuales; `validate-skills --strict` → exit 0. |
| R6 | `36fc805` | Bullet D4 de «When to Use» (`skill-router/SKILL.md:24`) ya no describe promoción incondicional: `primary = canonical` solo cuando el grupo lidera Y el canónico tiene trigger propio (`triggerScore >= 1`); un canónico solo-keyword nunca desplaza al líder. Test: aserción de consistencia bullet vs paso 7 del algoritmo (ambos con `triggerScore >= 1`); fixture `figma-canonical-keyword-only` sigue esperando primary=figma-mcp. |

## Verificación global post-corrección (exit codes y evidencia en vivo)

- `node 00-meta-skills/skill-validator/scripts/validate-skills.mjs --strict` → exit 0 (149/149 pass, 0 errores, 0 warnings).
- Smoke fixtures del router (runner propio sobre `overlap-smoke-tests.json`) → 11/11 green (incluye `figma-canonical-keyword-only`: primary=figma-mcp).
- `git status` limpio al cierre.
