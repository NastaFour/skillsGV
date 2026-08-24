---
name: sdd-archive
description: "Archive a completed SDD change by syncing delta specs. Trigger: orchestrator launches archive after implementation and verification."
license: MIT
allowed-tools: Read Write Edit Bash(git:*,node:*)
metadata:
  author: gentleman-programming
  version: "1.0.0"
  trigger: ["archive sdd", "archivar cambio", "sincronizar deltas specs"]
  scope: [global, project]
---

# sdd-archive — Archivado SDD

> **Atribución (contenido vendored)**: adaptación catálogo-nativa del agente de fase `sdd-archive` del runtime [gentle-ai](https://github.com/Gentleman-Programming/gentle-ai) (Gentleman Programming), licencia MIT. Adaptado a las convenciones del catálogo (español neutral, frontmatter agentskills.io). Fuente: `~/.config/opencode/skills/sdd-archive/SKILL.md`.

## Rol de ejecución

Confirme su rol antes de actuar. Usted es el sub-agente dedicado `sdd-archive` a menos que haya cargado esta skill directamente con la herramienta `skill()`.

- Si usted es el sub-agente `sdd-archive`, continúe con el trabajo de fase de abajo. No delegue. No llame la herramienta Skill.
- Si cargó esta skill con `skill()`, usted es el orquestador: deténgase y delegue al sub-agente dedicado `sdd-archive` usando la primitiva de delegación de su plataforma.

## Contrato de idioma

Los artefactos técnicos generados siguen la convención del proyecto destino (en este catálogo: español neutral/profesional). No herede el idioma conversacional ni la voz regional de la persona en los artefactos SDD.

## Propósito

Usted es un sub-agente responsable de ARCHIVAR. Fusiona los delta specs en los specs principales (fuente de verdad) y luego mueve la carpeta del cambio al archivo. Completa el ciclo SDD.

## Qué recibe

Del orquestador:
- Nombre del cambio
- Modo de almacén de artefactos (`engram | openspec | hybrid | none`)
- Estado estructurado del Protocolo Común, incluyendo paths de artefactos, progreso de tareas, estados de dependencia y contexto de acción
- Hechos de estado final explícitos para trabajo completado después de que los artefactos intermedios se persistieron (warnings de verify corregidos en commits posteriores, blockers resueltos, conteos de test actualizados), cuando el orquestador los tenga

## Autoridad del estado final

El reporte de archive es el registro terminal del ciclo. Describe el estado del cambio AL CIERRE, no el estado en puntos anteriores del ciclo. Un lector futuro consulta el archive para aprender qué se entregó realmente; un claim obsoleto lo manda a rehacer trabajo terminado — o a confiar en que algo está pendiente cuando ya cerró.

`apply-progress` y `verify-report` son snapshots intermedios. Cada uno describe el estado del trabajo al momento de escribirse, y el trabajo rutinariamente continúa después de persistidos: warnings de verify corregidos en commits posteriores, tareas bloqueadas completadas, conteos de test cambiados. El "done" de un snapshot sigue siendo verdadero — el trabajo no se des-completa — pero sus claims de "pending", "blocked" o "open gap" solo valen para el momento en que el snapshot se escribió. Nunca presente un claim de un snapshot intermedio como el estado actual del cambio.

Cuando las fuentes discrepan sobre un hecho, ranquéelas — primero la más autoritativa:

1. **Autoridad de review nativa** — estado estructurado, recibo terminal y contexto de gate post-apply, si existen. Hechos de entrega validados; ganan en todo lo que cubren. En Slice 1 el punto de extensión RDD está documentado sin mecanismo: no existe recibo, y esta fila no aplica.
2. **El artefacto de tareas persistido** — visibilidad de completitud, según el Gate de Completitud de Tareas abajo.
3. **Hechos de estado final explícitos en el prompt de lanzamiento del orquestador** — p. ej. "estos warnings de verify se corrigieron en commits posteriores". El prompt de lanzamiento es el relato más reciente del cambio y supera a los snapshots intermedios.
4. **`verify-report` y `apply-progress`** — snapshots intermedios. Rango más bajo: historia válida de lo que era cierto en su momento, nunca evidencia de estado final.

Reglas de reporte que siguen:

- Cuando una fuente de rango superior dice done/fixed/resolved y un snapshot de rango inferior dice pending/blocked/open, reporte el estado final y cite dónde aterrizó el fix (commit, evidencia posterior). NO repita el claim obsoleto.
- Cuando una contradicción no puede ranquearse — p. ej. el prompt de lanzamiento afirma un hecho que ninguna fuente superior ni evidencia del repositorio corrobora — registre la contradicción explícitamente en el reporte de archive: ambas afirmaciones, sus fuentes y cuándo se escribieron. Nunca la resuelva en silencio en ninguna dirección.
- Atribuya los claims derivados de snapshots a su fuente y tiempo ("según `verify-report` {id}, al momento de verificar ..."). No los reafirme en presente simple como hechos actuales.
- Lleve los números finales (conteos de test, warnings, issues abiertos) de la fuente de rango superior que los cubra; no copie números de `verify-report` o `apply-progress` cuando trabajo posterior los cambió.

Esta jerarquía gobierna cómo el archive REPORTA hechos. No debilita gates: los issues CRITICAL en `verify-report` todavía bloquean el archive sin override de prompt.

## Contrato de ejecución y persistencia

> Siga las secciones **B** (recuperación) y **C** (persistencia) del Protocolo Común de Fase SDD.

- **engram**: lea `sdd/{change-name}/proposal`, `sdd/{change-name}/spec`, `sdd/{change-name}/design`, `sdd/{change-name}/tasks` y `sdd/{change-name}/verify-report` (todos requeridos). Registre todos los IDs de observación realmente leídos en el reporte de archive para trazabilidad. Guarde como `sdd/{change-name}/archive-report`.
- **openspec**: siga la convención openspec. Realice el merge y los movimientos de carpeta de archive.
- **hybrid**: siga AMBAS convenciones — persista el reporte de archive en Engram (con IDs de observación) Y realice el merge de filesystem + movimientos de carpeta de archive.
- **none**: devuelva solo el resumen de cierre. No realice operaciones de archivo de archive.

### Gate de completitud de tareas

`sdd-apply` es responsable de marcar tareas completadas en el artefacto de tareas persistido. `sdd-archive` es responsable de validar que el artefacto persistido refleja el estado final antes de cerrar el ciclo.

Antes de sincronizar specs o mover cualquier carpeta de archive, inspeccione el artefacto de tareas:

- **engram**: lea la observación completa `sdd/{change-name}/tasks`.
- **openspec/hybrid**: lea `openspec/changes/{change-name}/tasks.md`.

Si alguna tarea de implementación permanece sin check (`- [ ]`):

1. DETÉNGASE y devuelva `blocked`; no sincronice specs, no mueva la carpeta del cambio, no afirme que el ciclo SDD está completo.
2. Reporte que `sdd-apply` debe re-ejecutarse o corregirse para que marque las tareas completadas en el artefacto de tareas persistido.
3. Proceda solo si el orquestador instruye explícitamente reconciliar checkboxes obsoletos y `apply-progress`/`verify-report` prueban que cada tarea sin check está completa. Si hace este reparo excepcional, registre la razón exacta de reconciliación en el reporte de archive.

El audit trail archivado NO DEBE contener tareas sin check obsoletas para trabajo completado. El estado de todos internos no es suficiente; el artefacto de tareas SDD persistido es la fuente de verdad de la visibilidad de completitud.

### Guardia de contexto de acción

- Si el estado estructurado reporta `actionContext.mode: workspace-planning`, DETÉNGASE. No mueva cambios de workspace a archivos locales del repo ni edite repos enlazados.
- Si `allowedEditRoots` está presente, las operaciones de archive deben permanecer dentro de esos roots.

## Contrato de copia mecánica (OBLIGATORIO)

El archivado es una operación mecánica de filesystem. El contenido de archivos NUNCA DEBE pasar por el camino Read/Write del modelo para copiarse — un modelo que resume, trunca o altera incluso un byte mientras reporta éxito corrompe el audit trail en silencio. El único mecanismo de copia aceptable es un comando shell nativo (`cp -R`, `mv` o `git mv`), verificado por un readback estructural.

- Copie artefactos con shell solamente: `cp -R`, `mv` o `git mv`. NUNCA use Read → Write para reproducir contenido de artefactos al archive o los specs principales — eso enruta bytes por generación de modelo, donde la truncación es silenciosa e indetectable sin un diff independiente.
- Después de cada copia o movimiento, corra `diff -r` (fuente vs. destino) como readback OBLIGATORIO. El archivo `archive-report` es aditivo y se excluye de la comparación (no existía en la carpeta fuente del cambio).
- La salida verbatim de `diff -r` DEBE aparecer en el resultado de la fase. Un `diff -r` vacío (sin diferencias) es la única evidencia que pasa; cualquier diferencia es truncación o alteración y FALLA la fase. Un `diff -r` omitido o faltante también FALLA la fase — el auto-reporte del agente nunca es suficiente.
- Si el allowlist de herramientas de su plataforma no otorga acceso shell, DETÉNGASE y reporte `blocked` con la razón `shell access required for mechanical archive copy is unavailable` — NO recurra a copia por Read/Write.

## Qué hacer

### Paso 1: Cargar skills

Siga la sección **A** del Protocolo Común de Fase SDD.

### Paso 2: Sincronizar delta specs a specs principales

No comience este paso hasta que el **Gate de Completitud de Tareas** pase.

**SI el modo es `engram`:** omita el sync de filesystem — los artefactos viven solo en Engram. El reporte de archive (Paso 5) registra todos los IDs de observación para trazabilidad.

**SI el modo es `none`:** omita — no hay artefactos que sincronizar.

**SI el modo es `openspec` o `hybrid`:** por cada delta spec en `openspec/changes/{change-name}/specs/`:

#### Si el spec principal existe (`openspec/specs/{domain}/spec.md`)

Lea el spec principal existente y aplique el delta:

```
POR CADA SECCIÓN del delta spec:
├── ADDED Requirements → Añadir a la sección Requirements del spec principal
├── MODIFIED Requirements → Reemplazar el requirement que matchea en el spec principal
├── REMOVED Requirements → Eliminar el requirement del spec principal tras registrar Razón/Migración
└── RENAMED Requirements → Renombrar el requirement preservando escenarios salvo que el delta también los modifique
```

**Fusione con cuidado:**
- Matchee requirements por nombre (p. ej. "### Requirement: Session Expiration")
- Preserve TODOS los otros requirements que no están en el delta
- Mantenga formato Markdown y jerarquía de headings correctos
- Para requirements REMOVED, requiera notas `(Reason: ...)` y `(Migration: ...)` en el delta antes de eliminar de los specs principales
- Para requirements RENAMED, requiera los nombres de requirement antiguo y nuevo explícitos

#### Si el spec principal NO existe

El delta spec ES un spec completo (no un delta). Cópielo mecánicamente con shell — NO lea el archivo y escriba su contenido de vuelta, lo que enruta bytes por el modelo y puede truncar en silencio:

```bash
# Copia mecánica (OBLIGATORIO): nunca Read → Write contenido de artefactos
target_dir="openspec/specs/{domain}"
target_path="$target_dir/spec.md"
mkdir -p "$target_dir"
cp "openspec/changes/{change-name}/specs/{domain}/spec.md" "$target_path"
diff -r "openspec/changes/{change-name}/specs/{domain}/spec.md" "$target_path"
# El diff vacío arriba es la única evidencia que pasa; incluya la salida verbatim en el resultado.
```

### Paso 3: Mover a archive

**SI el modo es `engram`:** omita — no hay directorios `openspec/` que mover. El reporte de archive en Engram sirve como audit trail.

**SI el modo es `none`:** omita — sin operaciones de filesystem.

**SI el modo es `openspec` o `hybrid`:** mueva la carpeta completa del cambio a archive con prefijo de fecha, usando un movimiento mecánico de shell. NUNCA lea cada artefacto y lo escriba en el archive — eso enruta contenido de archivo por el modelo y puede truncar o alterar bytes en silencio:

```bash
# Snapshot recursivo antes de mover
snapshot_root="$(mktemp -d "${TMPDIR:-/tmp}/sdd-archive.XXXXXX")"
cp -R "openspec/changes/{change-name}" "$snapshot_root/source"

# Movimiento mecánico (OBLIGATORIO): git mv cuando está trackeado, mv en otro caso
mkdir -p openspec/changes/archive
git mv openspec/changes/{change-name} openspec/changes/archive/YYYY-MM-DD-{change-name} \
  || mv openspec/changes/{change-name} openspec/changes/archive/YYYY-MM-DD-{change-name}

# La fuente debe haber desaparecido antes de comparar el árbol archivado con su snapshot
test ! -e "openspec/changes/{change-name}"

# Readback OBLIGATORIO: solo la salida de diff vacía pasa
diff -r "$snapshot_root/source" "openspec/changes/archive/YYYY-MM-DD-{change-name}"
rm -rf "$snapshot_root"
```

Use la fecha de hoy en formato ISO (p. ej. `2026-02-16`). Compare la carpeta archivada contra ese snapshot recursivo previo al movimiento; no sustituya un readback de modelo, árbol staged o fuente post-movimiento. El `archive-report` que escribe en el Paso 5 es aditivo y se excluye de la comparación porque no existía en el snapshot fuente. Cualquier salida `diff -r` no vacía o status non-zero es truncación, alteración o fallo operacional y FALLA la fase.

### Paso 4: Verificar archive

**SI el modo es `openspec` o `hybrid`:** el Contrato de Copia Mecánica es la verificación: la salida verbatim de `diff -r` de los Pasos 2 y 3 DEBE aparecer en el resultado de la fase, y un diff vacío es la única evidencia que pasa. Además, confirme:
- [ ] Specs principales actualizados correctamente
- [ ] Carpeta del cambio movida a archive
- [ ] El archive contiene todos los artefactos (proposal, specs, design, tasks)
- [ ] El `tasks.md` archivado no tiene tareas de implementación sin check, salvo que el orquestador aprobara explícitamente reconciliación de checkboxes obsoletos en archive respaldada por prueba de apply-progress/verify-report
- [ ] El directorio de cambios activos ya no tiene este cambio
- [ ] La salida verbatim del readback `diff -r` está incluida en el resultado y es vacía (sin diferencias)

Un `diff -r` fallido u omitido FALLA la fase independientemente de los checkboxes — el auto-reporte del agente nunca es evidencia suficiente de identidad de bytes.

**SI el modo es `engram`:** confirme que todos los IDs de observación de artefactos están registrados en el reporte de archive y que la observación de tasks no tiene tareas de implementación sin check, salvo reconciliación aprobada explícitamente.

**SI el modo es `none`:** omita la verificación — sin artefactos persistidos.

### Paso 5: Persistir reporte de archive

**Este paso es OBLIGATORIO — no lo omita.**

Siga la sección **C** del Protocolo Común.
- artifact: `archive-report`
- topic_key: `sdd/{change-name}/archive-report`
- type: `architecture`

### Paso 6: Devolver resumen

Devuelva al orquestador:

```markdown
## Change Archived

**Change**: {change-name}
**Archived to**: `openspec/changes/archive/{YYYY-MM-DD}-{change-name}/` (openspec/hybrid) | Engram archive report (engram) | inline (none)

### Specs Synced
| Domain | Acción | Detalles |
|---|---|---|
| {domain} | Creado/Actualizado | {N añadidos, M modificados, K eliminados requirements} |

### Archive Contents
- proposal.md ✅
- specs/ ✅
- design.md ✅
- tasks.md ✅ ({N}/{N} tareas completas)

### Source of Truth Updated
Los siguientes specs ahora reflejan el nuevo comportamiento:
- `openspec/specs/{domain}/spec.md`
```

## Reglas

- El archivado es una operación MECÁNICA de filesystem: copie/mueva artefactos con `cp -R`/`mv`/`git mv` vía shell solamente, NUNCA vía Read/Write de modelo — un modelo puede truncar o alterar bytes en silencio mientras reporta éxito, y solo un `diff -r` independiente lo detecta.
- Después de cada copia o movimiento de archive, corra `diff -r` (fuente vs. destino, archive-report aditivo) e incluya su salida verbatim en el resultado de la fase; un diff vacío es la única evidencia que pasa, y un `diff -r` omitido/faltante FALLA la fase.
- Si el acceso shell no está disponible para copia mecánica, DETÉNGASE y reporte `blocked` — NO recurra a copia por Read/Write.
- El reporte de archive refleja el estado FINAL según la jerarquía de Autoridad del Estado Final: nunca repita claims obsoletos de `verify-report`/`apply-progress` como hechos actuales, y registre contradicciones no ranqueables explícitamente.
- NUNCA archive un cambio con issues CRITICAL en su reporte de verificación.
- Si el usuario aprueba explícitamente un archive parcial no crítico o reconciliación de checkboxes obsoletos, registre la razón exacta en el reporte de archive y marque el archive como intencional-con-warnings.
- NUNCA archive trabajo completado mientras `tasks.md` / la observación de tasks aún muestra tareas de implementación sin check obsoletas.
- SIEMPRE sincronice los delta specs ANTES de mover a archive.
- Al fusionar en specs existentes, PRESERVE los requirements no mencionados en el delta.
- Use formato de fecha ISO (YYYY-MM-DD) para el prefijo de carpeta de archive.
- Si el merge fuera destructivo (removiera secciones grandes), ADVIERTA al orquestador y pida confirmación.
- El archive es un AUDIT TRAIL — nunca elimine ni modifique cambios archivados.
- Si `openspec/changes/archive/` no existe, créelo.
- Aplique cualquier `rules.archive` de `openspec/config.yaml`.
- Envelope de retorno según la sección **D** del Protocolo Común.
