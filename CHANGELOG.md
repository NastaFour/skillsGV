# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/); versionado [SemVer](https://semver.org/lang/es/).

## [2.1.0] — 2026-09-19

Alineación con **gentle-ai 3.1.0** y capa de activación always-on, motivada por el bench Zona del Sonido del 2026-09-18 (CON vs SIN skills): el agente CON solo siguió lineamientos que vivían en su system prompt inyectado y nunca leyó los archivos de reglas del workspace — ver `odd/tasks/activation-kernel-v2.md` para la evidencia completa.

### Added

- **Kernel de activación always-on** (`_shared/bootstrap-kernel-full.md` / `-minimal.md` + `_shared/kernel-inject.mjs`): en installs por proyecto, el instalador inyecta un bloque `skillsGV:kernel` idempotente (marcadores) en los archivos que cada harness autocarga (`AGENTS.md` / `GEMINI.md` / `CLAUDE.md` / `.github/copilot-instructions.md`). Variante `full` para harnesses desnudos (piso de proceso: ≤5 skills por turno, commits por unidad, verificación con evidencia, memoria si hay Engram, mini-reporte de cierre); variante `minimal` cuando gentle-ai está activo (el catálogo se declara capa de conocimiento y defiere el proceso al harness).
- **Blindaje de `.gitignore`** en installs por proyecto: bloque guardado con las rutas de skills instaladas + `.skills-install/` — nunca más un commit de 540 archivos con el catálogo adentro.
- **Detección de variante** (`detectVariant`): binario `gentle-ai` en PATH o `~/.gemini/GEMINI.md` con marcadores gentle → kernel minimal.
- **Simetría de ciclo de vida**: `--uninstall` extrae los bloques del kernel y el bloque del `.gitignore` (retiene los que el usuario editó dentro de los marcadores); `--rollback` restaura los archivos de canal desde backups.
- **Evidencia de activación**: el instalador reporta canal, estado y rutas al inyectar.
- **Suite de tests de inyección** (`test/kernel-inject.test.mjs`): idempotencia, reemplazo de bloque viejo, preservación de contenido ajeno, retención de bloques editados, guard/unguard de `.gitignore`, round-trip uninstall.
- **Vendorización de `_shared/skill-resolver.md`** (protocolo universal de resolución de skills para delegadores — existía solo en el espejo dsh; el catálogo lo referenciaba colgante).
- **Procedimiento canary** (`references/canary-activation.md`) para verificar en 10 minutos qué canales autocarga cada harness.

### Changed

- **ODD-first (gentle-ai 3.x)**: anuladas las reglas "SDD si 2+ archivos / 2+ dominios" en `AGENTS.md`, `sdd-orchestrator` y `gentle-orchestrator`. SDD solo a pedido explícito; con binario `gentle-ai` disponible, el dispatcher nativo (`sdd-status` / `sdd-continue`) es la autoridad de ruteo. Razón: dos jefes de proceso no coexisten — el system prompt del harness siempre le gana a los archivos del disco (evidencia en el bench).
- **Contrato de salida del kernel** con las 10 reglas action-first adaptadas de [i-have-adhd](https://github.com/ayghri/i-have-adhd) (MIT): acción primero, pasos numerados, un próximo paso, listas ≤5, errores matter-of-fact.
- README: one-liner de instalación para agentes, flags nuevos, corrección de deriva ("sí hay `package.json`").

### Follow-ups (fuera de este release)

- Absorber el openspec `skills-29-upgrade` (re-vendor del contrato review/RDD) actualizando su target de 2.9.1 → 3.1.0.
- Refresh de `tier0-context.json` en installs globales (el de `~/.gemini` está stale 2026-09-08).
- Bump del resto de menciones "2.7.0 verificado" (37 en el repo) con reverificación caso por caso.
- Kernel en installs globales (canal por harness global) — requiere decisión de canales (`~/.claude/CLAUDE.md`, `~/.gemini/GEMINI.md` gestionado por gentle).
- Bench v2 con n=3 y home aislado para medir el efecto del kernel.
