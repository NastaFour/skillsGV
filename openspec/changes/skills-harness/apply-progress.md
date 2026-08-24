# Apply Progress: skills-harness (Slice 1)

**Change**: skills-harness
**Modo**: Standard (strict TDD desactivado — catálogo de contenido, sin test runner)
**Batch**: PR-1 / WU1 (Fundación)
**Rama**: `slice/pr1-wu1-foundation` (base `c62bcac`, stacked-to-main)

## Tareas completadas en este batch

- [x] 1.1 `opencode.json`: reemplazar `api_key` de Context7 por `${CONTEXT7_API_KEY}`; verificar que el secreto no queda en texto plano (harness-bootstrap: Sin secreto en el repositorio)
- [x] 1.2 Crear `references/git-recovery-runbook.md` con los pasos ejecutados (backup → `git init` → commit `c62bcac`) para regeneración futura

## Archivos cambiados

| Archivo | Acción | Detalle |
|---|---|---|
| `opencode.json` | Modificado | `api_key` de Context7: texto plano → `${CONTEXT7_API_KEY}` (gitignoreado, no entra al commit) |
| `references/git-recovery-runbook.md` | Creado | Runbook del procedimiento de recuperación git ejecutado el 2026-08-24 (backup `.git.corrupt-20260824` → `git init` → commit raíz `c62bcac`, 388 archivos) |
| `openspec/changes/skills-harness/tasks.md` | Modificado | Tareas 1.1 y 1.2 marcadas `[x]` |
| `openspec/changes/skills-harness/apply-progress.md` | Creado | Este artefacto |

## Evidencia de unidad de trabajo (Work Unit Evidence)

| Evidencia | Valor requerido | Resultado |
|---|---|---|
| Comando de test enfocado y resultado exacto | Grep de la key real (`ctx7sk-48b8cd24-c4c5-4786-87be-56f23d52b726`) sobre el repo: 0 resultados; `opencode.json` contiene solo `${CONTEXT7_API_KEY}` | PASS — 0 coincidencias; referencia de entorno única |
| Comando/scenario de harness runtime | N/A — cambio de configuración verificable por inspección; sin frontera de runtime ejecutable (el catálogo no tiene test runner; `validate-skills.mjs` no aplica porque no se tocó ningún SKILL.md) | N/A con razón |
| Límite de rollback | Restaurar `opencode.json` desde el respaldo del valor previo (la key en texto plano) y revertir el commit del runbook (`git revert 5fda9b2`) | Sin afectar trabajo no relacionado |

## Desviaciones del diseño

Ninguna — la implementación coincide con design.md (D-Migration: runbook + migración de key; `opencode.json` permanece gitignoreado).

## Problemas encontrados

1. **Sin remoto git configurado**: `git remote -v` vacío. PR-1 no puede abrirse; la rama `slice/pr1-wu1-foundation` queda lista (commit `5fda9b2`) para push cuando exista remoto.
2. **Key expuesta previamente**: la key de Context7 estuvo en texto plano en el árbol de trabajo; se recomienda rotarla (design.md, Open Questions — confirmación con el usuario pendiente).

## Tareas restantes

- [ ] 2.1 a 2.4 (WU2 → PR-2): `_shared/sdd-phase-common.md`, orquestador, fases init→design, harness-map
- [ ] 3.1 a 3.3 (WU3 → PR-3): fases tasks→archive, model routing, brechas #16 y #4
- [ ] 4.1 a 4.5 (WU4 → PR-4): `--emit-registry`, consistencia, AGENTS.md, SKILLS.md, config.yaml
- [ ] 5.1 a 5.5 (WU5 → PR-5): lote piloto, matriz de solapamiento, hook del router, smoke tests
- [ ] 6.1 a 6.4 (Verificación)

## Frontera de workload / PR

- **Modo**: PR encadenado (chained PR slice, stacked-to-main)
- **Unidad actual**: WU1 — migración de API key + runbook git
- **Frontera**: PR-1 comienza en `c62bcac` (commit raíz) y termina en `5fda9b2`; no incluye nada de WU2-WU5
- **Impacto en presupuesto de revisión**: ~82 líneas añadidas (solo runbook; `opencode.json` gitignoreado), muy por debajo del guard de 400

## Estado

2/2 tareas del batch completadas (1.1, 1.2). Listo para el siguiente batch (WU2 → PR-2).