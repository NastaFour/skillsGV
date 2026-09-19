# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/); versionado [SemVer](https://semver.org/lang/es/).

## [2.1.1] — 2026-09-19

**Judgment Day ronda 1** (revisión adversarial dual ciega sobre PR #1; veredicto unánime FIX). Los hallazgos confirmados por overlap de ambos jueces se corrigieron; los de un solo juez se verificaron contra el código antes de actuar.

### Fixed

- **Simetría uninstall en el flujo de update** (blocker, ambos jueces): `summarizeKernel` ahora registra TODOS los canales (incluidos los "unchanged"), y `--uninstall` barre los records de kernel de TODAS las generaciones (unión cross-generación). Re-install → uninstall ya no deja bloques huérfanos en `AGENTS.md`/`GEMINI.md`/`CLAUDE.md` ni el guard del `.gitignore`.
- **Strip quirúrgico** (ambos jueces): la extracción del bloque ya no reescribe espacios del archivo completo (antes colapsaba `\n\n\n` globales y recortaba extremos). Solo se elimina el bloque y la línea separadora que el instalador agregó.
- **Rollback seguro** (Red + Blue): force-restore de archivo completo SOLO si es byte-idéntico a lo último escrito (`wroteSha256`); cualquier edición del usuario degrada a strip quirúrgico. Además el rollback **re-guarda** el `.gitignore` con las entradas de la generación restaurada (antes lo desguardaba y reabría el problema de los 540 archivos).
- **`--dry-run` ahora muestra la capa de activación** (Blue): el bloque de kernel+gitignore corre antes del early-return, con preview de canales y estados.
- **Unión del guard de `.gitignore`**: un re-install por subconjunto de herramientas (`--tool`) nunca desguarda directorios instalados por una generación anterior.
- **Aislamiento de fallos**: la fase de activación tiene try/catch por canal y global — un canal bloqueado (EPERM/EBUSY) ya no huérfana un install de miles de archivos sin manifiesto.
- **Rollback de generaciones kernel-only**: `cmdRollback` ya no hace early-return cuando `entries` está vacío pero existe kernel.
- **Seguridad de reemplazos**: inserciones vía function-replacement (sin expansión de patrones `$&`/`` $` `` desde plantillas); backups del kernel con etiqueta propia (`kernel-N-…`, sin colisión con el índice de entries); `hasBinary` ignora entradas vacías de PATH (falso "minimal" por exe en el cwd); `detectVariant` exige marcador `gentle-ai:` (no cualquier mención en prosa).

### Changed

- **Archivos UTF-16/BOM se saltean con warning** (canal y `.gitignore`) en lugar de destruirse; canales symlinked se saltean; comparación y escritura CRLF-aware (sin churn en archivos de Windows); marcadores del `.gitignore` en ASCII puro.
- Kernel full con línea para teammates (clone sin install local: ignorar o instalar).
- README: `dsh` en la lista de `--tool`, canal Copilot documentado, nota de que el manifiesto es local por máquina.

### Tests

- Suite 8 → **15** tests: regresiones F1-F4, strip quirúrgico con `\n\n\n` de usuario, round-trip CRLF exacto, force-rollback con edición de usuario, unión del gitignore, skip de encoding UTF-16 byte-idéntico, y **test de integración CLI** (install → re-install → uninstall vía `install-skills.mjs` real) que cubre el wiring que la suite anterior no ejecutaba.

### Judgment Day — Ronda 2 (re-juicio final del diff de fixes)

Los jueces ciegos volvieron a correr sobre el diff de la ronda 1 y **encontraron que parte de lo anunciado no estaba implementado** — el propio juicio atrapó la deriva:

- **`--rollback` re-guarda el `.gitignore`** (blocker, ambos jueces): la ronda 1 lo anunció en este CHANGELOG pero el código nunca lo hizo (el guard quedaba simplemente removido). Implementado + cubierto por el test CLI end-to-end.
- **El rollback de un re-install no-op conserva el kernel de la generación restaurada** (crítico, ambos): los canales "unchanged" que pertenecen a una generación previa ya no se stripean.
- **Ciclo de vida de archivos creados a través de re-installs**: la unión cross-generación preserva `createdFile` (uninstall borra el canal creado aunque la última generación lo registre "unchanged"); el `.gitignore` creado también se borra.
- **Marcadores legacy (2.1.0, em-dash)**: se reconocen y actualizan en guard/unguard (antes se duplicaba el bloque).
- **Off-by-marker en la región guardada**: la región cortaba antes del marcador de cierre y corrompía el `.gitignore` en updates (detectado por el test R2 de marcadores y por debug end-to-end).
- **UTF-16 sin BOM / cualquier NUL** detectado (antes solo BOM); **symlinks rotos** salteados con `lstat`; **CRLF sin líneas mixtas** (el tail del bloque usa el EOL del archivo).
- **`--uninstall --dry-run` y `--rollback --dry-run`** ahora previsualizan la capa de kernel; **`.skills-install/` se elimina al final del uninstall** (manifiesto + backups ya no quedan sin guardar).
- Tests 15 → **18**, incluido el test CLI con **rollback entre re-install y uninstall** (con dos tools) — la cobertura de wiring que faltaba.

### Judgment Day — Ronda 3 (juicio final sobre los fixes de ronda 2)

Segundo re-juicio ciego: **sin blockers nuevos**; 5 hallazgos confirmados corregidos con tests de regresión:

- **Keep del rollback endurecido por autoría**: un bloque heredado de la generación restaurada se conserva aunque el usuario haya editado el archivo FUERA de los marcadores (antes se stripeaba); si ninguna generación restaurada lo posee (rollback de primera generación), se extrae.
- **Bloques duplicados se consolidan**: archivos con dos bloques guardados (legacy em-dash + ASCII, la corrupción que dejaban versiones anteriores) se reparan a un único bloque con la unión de entradas de TODOS los bloques. Un marcador huérfano sin cierre marca el archivo como `skipped-corrupt-block` — guard y unguard no lo tocan (nunca más borrar reglas del usuario por un span falso).
- **`.gitignore` con symlink roto** se saltea con `lstat` (mismo patrón que los canales; antes `existsSync` lo dejaba pasar y escribía a través del link).
- **`.skills-install/` sobrevive si la limpieza del kernel retuvo/erroró entradas** (uninstall re-ejecutable tras resolverlas) en vez de destruir el manifiesto y dejar un callejón sin salida.
- **`createdFile` fiel**: un archivo pre-existente vacío ya no se registra como creado por el installer (su restauración en force escribe el contenido previo, no lo borra). `collectKernelOwned` se movió al módulo y tiene test unitario directo.

Tests 18 → **24**: escenarios CLI reestructurados (same-tool con keep-path real end-to-end; re-install con otro tool + uninstall sin rollback cubriendo la unión cross-generación y `giCreatedAny`), más los 5 unitarios de ronda 3. Protocolo judgment-day agotado (2 rondas de fix/re-juicio): la ronda 3 no abre una cuarta.

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
