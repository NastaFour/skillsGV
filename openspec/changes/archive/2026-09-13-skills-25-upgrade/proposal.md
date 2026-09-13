# Proposal: skills-25-upgrade

## Intent
Cerrar la brecha 2.5→2.7 del catálogo (209 skills reales) y adoptar 9 mejoras cortas del diagnóstico de 32: conteos de fuente única, gates mecanizados, RDD/TDD ejecutables, provider custom. Evita el re-trabajo por drift de índices y copias divergentes. Usuarios: mantenedor, runtime dsh/OpenCode, agentes SDD.

## Scope
### In Scope
- WU0: commit-per-WU del WIP (27 archivos) tras gates; install-state (~200+/runtime).
- WU1: verdad documental: counts 209, NL>slash, guard 400/800, JD, codegraph, failover.
- WU2: RDD activo.
- WU3: TDD meta-scripts + eval harness.
- WU4: provider custom (`--save-provider`, opencode/dsh).
- WU5: addon de fuente única (mirror por script).
- Gates nuevos: catalog.json, 500/~2K, `--check-deps`, auditoría de scripts, requires-mcp, doctor.
- Deltas: rename contra binario, NL, guard, jueces fuera de SDD, economía de modelos.

### Out of Scope
Renames masivos (gerundio), versionado/CHANGELOG por skill, OTel, compaction/retry/sandboxing de runtime, playground, context_cost, medio/largo del 32 (incl. bench E3).

## Capabilities
### New
- `catalog-manifest`: manifiesto único genera índices y valida conteos.
- `skill-quality-gates`: descripción con exclusión; presupuestos 500/~2K (a ratificar); `--check-deps`; auditoría de scripts.
- `skill-eval-harness`: evals Anthropic + runner node:test.
- `mcp-requirements`: requires-mcp, mcp-manifest, fallbacks (11-mcp-hybrid).
- `catalog-doctor`: doctor unificado (validate/dry-run/loader/env).

### Modified
- `harness-orchestration`: corte al segundo fallo; superficie NL-primero.
- `rdd-extension-point`: activación (review global; recibo en gates).
- `model-routing`: tiers; provider custom; `sync --profile/--profile-phase` (design).
- `review-policy`: JD solo código post-apply/pre-PR; guard 400/800.
- `installer-lifecycle`: gate install-state; addon de fuente única.

## Approach
- WU0: higiene + install-state → gates PASS; conteos/runtime.
- WU1: docs + reglas → validator 0/0/0.
- WU2: RDD → delta spec; gate opt-in.
- WU3: suites + evals → `pnpm test` verde.
- WU4: provider → suites; inyección probada.
- WU5: addon → paridad; installer test.
Cada WU autónoma (inicio/fin/rollback); commit tras gates.

## Impact
193→209 skills reales; `pnpm test` 15/15; WIP de 27 archivos absorbido en WU0; claims stale corregidos desde el manifest.

## Constraints
pnpm-only estricto; review 400 default/800 preflight con ask-on-risk; hybrid.

## Risks
Drift de conteos (alta) → manifest + check; divergencia addon (media) → fuente única; RDD over-promise (media) → opt-in sin enforcement; cuota 402 (media) → failover documentado.

## Rollback
Revert por WU; índices y mirror regenerables; sin migraciones.

## Open Questions
- Bug tool-prefix engram y `managed-assets.json`: ASSUMPTION-TO-RATIFY (sin canal upstream).
- Atribución 2.6 vs 2.7: ASSUMPTION-TO-RATIFY (sin CHANGELOG).

## Success Criteria
- [ ] Validator 0/0/0 + router-replay verdes.
- [ ] `pnpm test`, suites nuevas y evals PASS.
- [ ] Recibo RDD por WU aplicado.
- [ ] Install-state consistente por runtime.
- [ ] Índices desde manifest.
