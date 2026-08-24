# Verification Report: slice-2

**Change**: slice-2 — Media wave (3D + curaduría) y evolución del harness (E1–E5)
**Mode**: Standard (sin STRICT TDD declarado; runners: validador `--strict`, router-replay, arneses temp dir de journal e installer)
**Base verificada**: `main @ 152c042`, working tree limpio, 5 PRs mergeados
**Fecha**: 2026-08-24

## Veredicto

**PASS WITH WARNINGS** — 0 CRITICAL · 4 WARNING · 1 SUGGESTION. Todas las tareas 6.1–6.6 ejecutadas con evidencia real de runtime sobre main; ninguna tarea queda sin check.

## Completeness

| Task | Alcance | Status |
|---|---|---|
| 6.1 Router smoke + corpus + anti-falso-primario | overlap-matrix, router-replay-corpus | ✅ (con WARNING W1) |
| 6.2 Replay determinista ×2 offline | router-replay-corpus | ✅ |
| 6.3 Journal: recuperación de escritura interrumpida | apply-progress-journal | ✅ |
| 6.4 Installer: dry-run/uninstall/rollback | installer-lifecycle | ✅ (con WARNING W2) |
| 6.5 Model-routing: schema, camino negativo, degradación | model-routing, model-routing-hooks | ✅ |
| 6.6 Global: V exit 0, cobertura 11 specs, 7 success criteria | proposal | ✅ (con WARNING W1/W3/W4) |

## Evidence

| # | Comando | Exit | Resultado clave |
|---|---|---|---|
| E1 | `node 00-meta-skills/skill-validator/scripts/validate-skills.mjs --strict` | 0 | «151 pass · 0 with issues», 0 errors/warnings/info (strict mode) |
| E2 | `node …/skill-router.mjs --query <q> --json` ×8 queries | 0 | «3d scene»→three-js-web c:1; «three.js scene setup»→three-js-web c:1; «webgl»→three-js-web; «build a webgl hero with react-three-fiber and drei»→three-js-web c:1; anti-falso-primario: «css 3d transform card flip effect»→visual-effects c:1, «add entrance animation to hero section»→micro-interactions (web-animation-sources secondary[0]); curaduría: «find hover effects inspiration and references»→web-animation-sources c:1, «animate.css library examples»→web-animation-sources c:1 |
| E3 | `node …/router-replay.mjs` ×2 → archivos temporales comparados por SHA256 | 0 / 0 | HASH1=HASH2=`D6DBA329DFC62A0F9D0776F5348434F0D4039C047EC5730BAB74EDDC213F085A`; `{total:13, exactMatches:13, accuracy:1, discrepancies:[], malformedLines:[], offline:true}`; consistencia triple `{groupsInMatrix:8, groupsCovered:8, fixturesMigrated:12}` |
| E4 | `node …/router-replay.mjs --corpus <temp>` (caso discrepancia + id duplicado + línea inválida) | 1 esperado | discrepancy `{id:"discrepancy-probe", line:1, expected:"WRONG-SKILL", got:"figma-implement"}`, accuracy 0; línea malformada reportada con nº de línea y razón (`invalid JSON`, `duplicate case id`) |
| E5 | Arnés journal temp dir (`--journal-dir`): record ×3 → cola truncada sin `\n` → status → re-record unidad interrumpida → verify | 0 | stderr «discarded unterminated tail (75 bytes); truncated to committed prefix»; unidades 1–3 preservadas `completed`, `lastSeq:3`; reintento legal aplicado; `verify {ok:true,lastSeq:4,units:4}` |
| E6 | Tamper detection: mutación de evento histórico (unitId línea 2) → `verify` y luego `record` | 4 / 4 | «hash chain broken at events.jsonl:3 — recorded history was mutated» (el rechazo aplica a TODA operación, no solo verify) |
| E7 | Idempotencia: re-record misma unidad en journal limpio | 0 | snapshot byte-idéntico (SHA256 igual antes/después), eventos 1→1 |
| E8 | Journal real del piloto: `verify --change slice-2` | 0 | `{ok:true, lastSeq:14, units:14}` |
| E9 | Installer temp dir: `--dry-run` (target vacío) → plantado ajeno `USER-NOTES.md` → install gen1 → edición de SKILL.md instalado → `--uninstall` | 0 / 0 / 0 | dry-run no mutante (0 ítems FS antes/después) con plan create por archivo; manifest gen1 `{entries:207, tool:claude-code}`, ajeno NO propio (0 entries) y sobrevive; uninstall elimina 206 propios vigentes, retiene y LISTA el propio editado («retained (edited since install)») |
| E10 | Installer: install gen2 (207 entries, 1 overwritten con backup) → `--rollback` | 0 / 0 | «Rollback done: 1 restored, 206 removed, 0 retained»; el overwritten restaurado desde backup conserva la edición del usuario; manifest vuelve a vista generación 1; historial registra `[uninstall, rollback]`; ajeno sobrevive todo el ciclo |
| E11 | Uninstall sin manifest (target fresco con archivo preciado) | 1 esperado | «No manifest … Aborting without deleting anything»; archivo preciado intacto |
| E12 | Mini-validador JSON Schema (subset `$ref/$defs,type,const,required,additionalProperties,minLength`) en temp dir | 0 / 1 esperado | `profiles.example.json` → VALID exit 0; instancia corrupta (sin `version`, prop adicional `bogus`, alias vacío) → INVALID con errores precisos por keyword, exit 1 |
| E13 | Greps estáticos | — | `model-routing.md`: 0 coincidencias de comandos runtime (`.mjs\|node \|npm \|npx \|curl \|opencode …\|codex …`); tabla de degradación explícita (líneas 65–78); `harness-map.md`: «Política de review» (l.77) + «Punto de extensión AHE» (l.96) con 3 sidecars, 4 niveles, OPEN-1, doc-only; vocabulario causal presente en harness-map (4 líneas) y review-policy.md (14 líneas); GLM como target de skill-sync: 0 hits |

- Build/type-check: N/A — el catálogo no tiene step de compilación (sin package.json ni node_modules); la verificación de sintaxis es efectiva vía ejecución real de los scripts.
- `test_output_hash`: replay ×2 SHA256 `D6DBA329…085A` (idéntico entre corridas y coincidente con el registrado en apply-progress WU2).

## Spec Compliance Matrix

Total real contado de los specs recuperados: **11 capabilities · 38 requirements · 50 escenarios**. Veredicto por escenario: COMPLIANT salvo los señalados.

### three-js-web (4 reqs · 6 escenarios) — COMPLIANT
- Skill única stack 3D web: Cobertura como unidad COMPLIANT (E2: corpus resuelve three-js-web, grupo único en matriz) · Ubicación de categoría COMPLIANT (`05-frontend/three-js-web/`).
- Material por faceta: Facetas enlazadas COMPLIANT (E1 sin enlaces huérfanos; 5 archivos presentes en `references/`).
- Spline sección no-code: COMPLIANT (sección interna l.42; 0 carpetas spline separadas).
- Cumplimiento + registro mismo PR: Registro completo COMPLIANT (E1) · PR sin registro COMPLIANT (comportamiento negativo garantizado por validador --strict; verificado en RED de WU1).

### web-animation-sources (4 reqs · 5 escenarios) — COMPLIANT
- Descubrimiento por router: COMPLIANT (E2 curaduría 2/2 primario; anti-falso-primario implementación OK).
- Referencias agrupadas por tópico: Contenido curado COMPLIANT (10 entradas exactas en 9 grupos tópicos, cada una con título/autor-fuente/URL/propósito).
- Lista curada sin instrucciones: Formato de entrada COMPLIANT (tablas de atribución; sin código ni procedimientos embebidos).
- Registro mismo PR: Validación estricta COMPLIANT (E1) · Contador desactualizado COMPLIANT (negativo cubierto por --strict).

### model-routing (4 reqs · 5 escenarios) — COMPLIANT
- Routing por interfaz de catálogo: Resolución por fase COMPLIANT (protocolo activo, consumido por agente contra catálogo del runtime; esta sesión OpenCode opera bajo asignaciones por fase) · Runtime alternativo COMPLIANT (definición sin acople: E13 cero comandos hardcodeados).
- Perfiles por fase declarados: Selección persistida COMPLIANT (configuración declarativa versionada en `_shared/model-routing/` según schema v1).
- Sin TUI obligatoria: Operación sin TUI COMPLIANT (documento declara operación por configuración/catálogo; grep confirma ausencia de TUI requerida).
- Degradación sin catálogo: Runtime sin catálogo expuesto COMPLIANT (tabla documentada: default del runtime, MUST NOT fallar; fallback de alias reporta en `risks` y continúa).

### model-routing-hooks delta (1 req · 3 escenarios) — COMPLIANT
- Activación en Slice 2 COMPLIANT (E13: «activo desde Slice 2» en harness-map + protocolo) · Runtime sin catálogo COMPLIANT (degradación documentada) · Distinción modelo vs. harness COMPLIANT (GLM: 0 hits como target de skill-sync).

### rdd-extension-point delta (2 reqs · 2 escenarios) — COMPLIANT
- Extensión documental con diseño AHE: COMPLIANT (sección AHE junto al punto RDD; nota explícita de independencia).
- Sin mecanismo ejecutable: COMPLIANT (doc-only verificado; ninguna fase intercepta el pipeline; este verify no ejecutó mecanismo RDD/AHE alguno).

### ahe-extension-point (4 reqs · 5 escenarios) — COMPLIANT
- Sidecars descritos COMPLIANT (evaluator/debugger/evolver con responsabilidad e inserción post-verify propuesta; sin implementación).
- Niveles enumerados COMPLIANT (`static_contract`/`transcript_replay`/`live_smoke`/`manual_oracle` con criterio y acumulatividad).
- Entregable doc-only COMPLIANT · Detección de scope creep COMPLIANT (restricción explícita en documento y spec).
- Relación documentada COMPLIANT (RDD y AHE puntos distintos; ninguno habilita al otro).

### review-policy (3 reqs · 5 escenarios) — COMPLIANT
- Disposición causal: Deuda preexistente no bloquea COMPLIANT (follow-up aparte documentado; ver caso W4 residual config.yaml tratado así) · Hallazgo introducido bloquea COMPLIANT.
- Perfiles opt-in: Sin perfil declarado COMPLIANT · Perfil declarado COMPLIANT (opt-in nunca relaja causalidad).
- Documentación en harness-map: Fuente única de verdad COMPLIANT (cross-check textual E13; consistencia con disposición causal RDD).

### overlap-matrix delta (2 reqs · 2 escenarios) — COMPLIANT
- Grupo unitario three-js-web: Query 3D resuelve primario correcto COMPLIANT (E2/E3: matriz↔fixture↔corpus consistentes 8/8·12/12; ningún motion/visual-effects falso primario por "3D").
- Fixture del grupo: Smoke test del grupo COMPLIANT (fixture migrado verbatim al corpus, verificado por replay).

### router-replay-corpus (4 reqs · 5 escenarios) — COMPLIANT
- Corpus JSONL: Caso bien formado COMPLIANT (metadatos mínimos; malformada reportada con nº de línea — E4: `invalid JSON`, `duplicate case id`, razones precisas).
- Replay determinista: Ejecución offline COMPLIANT (`offline:true`, spawnSync determinista sin modelos) · Determinismo COMPLIANT (×2 SHA256 idéntico E3).
- Métricas agregadas: Reporte de discrepancias COMPLIANT (E4: discrepancia listada con consulta/esperado/got y accuracy refleja el fallo).
- Integración con verificación: Grupo nuevo cubierto COMPLIANT (caso three-js-web resuelve en corpus; consistencia mecanizada fallaría si un grupo nuevo quedara sin caso).

### apply-progress-journal (5 reqs · 6 escenarios) — COMPLIANT
- Snapshot versionado e historial append-only: Registro de avance COMPLIANT (E5/E8) · Mutación prohibida COMPLIANT (E6: rechazo exit 4 en verify Y record).
- Lock exclusivo: Escritor concurrente COMPLIANT (evidencia GREEN WU3-T3 en journal/snapshot: escritor concurrente exit 3 controlado, huérfano >stale-timeout recuperado; no re-ejecutado en esta sesión, evidencia previa registrada como unidad completada 3.2).
- IDs idempotentes: Re-aplicación de una WU COMPLIANT (E7: snapshot byte-idéntico, sin evento duplicado).
- Recuperación de escritura interrumpida: Recuperación tras abort COMPLIANT (E5: prefijo confirmado truncado, unidades conservadas, unidad interrumpida reintentable legalmente).
- Node sin Bash: Ejecución nativa Windows COMPLIANT (todo el arnés corrió en PowerShell+Node nativo, sin Bash).

### installer-lifecycle (5 reqs · 6 escenarios) — COMPLIANT (con WARNING W2 en SHOULD de listado)
- Manifest ownership: Instalación registrada COMPLIANT (E9: destino/origen/hash por entry; ajenos fuera del manifest).
- Dry-run: Simulación sin efectos COMPLIANT (E9: plan completo, FS intacto).
- Uninstall solo propios: Desinstalación segura COMPLIANT con matiz (MUST íntegro: ajenos/editados NO eliminados; SHOULD de listar: solo lista propios-editados — ver W2) · Uninstall sin manifest COMPLIANT (E11: abort exit 1 sin borrar nada).
- Rollback de una generación: Reversión puntual COMPLIANT (E10: restaura desde backup o elimina si era new; registrado en historial; simétrico frente a ediciones del usuario).
- Node con invariantes: Ejecución nativa Windows COMPLIANT (ciclo completo sin Bash).

## Correctness

La implementación coincide con design/tasks/apply-progress en comportamiento observable. Los caminos negativos diseñados como gates (tamper, sin manifest, corpus malformado/discrepante, schema corrupto) rechazan con exit codes diferenciados y mensajes accionables. La seguridad del usuario se sostiene en los tres frentes probados: el ajeno jamás entra al manifest ni se borra; el propio editado se retiene; el rollback respeta la intención del usuario (restaura su versión editada desde backup).

## Design Coherence

Sin desviaciones estructurales nuevas respecto a las documentadas en apply-progress. Las adiciones menores ya declaradas (subcomando `verify`, `--journal-dir`, evento `unit-interrupted`, `prevBackup`, ids duplicados detectados en replay) se observaron activas y benefit-compatible con los escenarios de spec. La degradación E1 es doc-by-design (protocolo consumido por agente), coherente con D4 y con el precedente artifact-store-abstraction.

## Issues

### CRITICAL
Ninguno.

### WARNING
- **W1 — Criterio de éxito #2 de proposal con lectura literal incumplida**: la query desnuda `3d` devuelve `primary:null, confidence:0`. Los escenarios de spec usan «consulta tipo "3d scene / three.js / WebGL"» y SÍ cumplen; la causa raíz es la restricción documentada `MIN_TRIGGER_LENGTH=4` (un trigger de 2 chars está prohibido por diseño A2). Clasificado WARNING porque ningún requirement de spec exige resolución de la query desnuda y las queries realistas resuelven correctamente. Acción sugerida: corregir la redacción del criterio en proposal («query tipo "3d scene/three.js/webgl"») o evaluar fallback por keywords para tokens <4.
- **W2 — Listado de archivos ajenos retenidos (SHOULD parcial)**: `--uninstall` retiene al archivo ajeno nunca-owneado (MUST cumplido, sobrevive) pero NO lo lista: el reporte «Retained foreign/user-edited files» recorre solo entries del manifest cuyo hash difiere. El help del script («foreign or user-edited files are retained and listed») y la evidencia de WU4 («sale listado como retenido») sobreprometen. Acción sugerida: o ajustar help/evidencia, o listar archivos no-manifest dentro de directorios owned durante uninstall.
- **W3 — Desviación conocida y esperada (curaduría)**: 6 de las 10 URLs de `animation-sources.md` son enlaces sustitutos canónicos del mismo tópico, marcados como «enlace sustituto» en el propio archivo. Pendiente confirmación del usuario. Los requisitos de spec (autor+propósito por entrada, lista curada) se cumplen; el WARNING es por la confirmación abierta.
- **W4 — Residual de contador fuera de alcance**: `openspec/config.yaml:27` sigue diciendo «catálogo de 149 skills». Ya anotado en apply-progress WU5 como follow-up (fix 87ecae9 limitó alcance a skill-router+tier0). No bloquea.

### SUGGESTION
- **S1 — Documentar el gotcha PS 5.1 UTF-16 en redirects**: `>` y `>>` de PowerShell 5.1 escriben UTF-16 LE y rompen archivos byte-sensibles (JSONL/corpus). Durante esta verificación reprodujo falsas «malformed lines» masivas hasta reescribir con UTF-8 sin BOM. Candidato a nota en harness-map o en la skill de testing.

## Success Criteria de proposal (uno por uno)

| # | Criterio | Veredicto | Evidencia |
|---|---|---|---|
| 1 | `validate-skills.mjs --strict` exit 0 | ✅ PASS | E1: exit 0, 151 pass, 0 issues |
| 2 | Router: query "3d" → three-js-web primario | ⚠️ PARCIAL (W1) | Queries compuestas ("3d scene", "3d scene three.js", webgl/R3F/drei) resuelven three-js-web c:1 en smoke y corpus; la query desnuda `3d` no resuelve por restricción MIN_TRIGGER_LENGTH documentada |
| 3 | Replay E2 sin llamadas a modelos + métricas | ✅ PASS | E3: `offline:true`, métricas completas, ×2 idéntico |
| 4 | Journal E3 recupera write interrumpido sin pérdida | ✅ PASS | E5/E6/E7/E8: tail descartado, unidades preservadas, retry legal, tamper rechazado, journal real ok lastSeq 14 |
| 5 | `--dry-run` y uninstall solo-propios verificados | ✅ PASS | E9/E10/E11: dry-run no mutante; ajeno retenido; rollback íntegro (listado SHOULD parcial → W2, no afecta el MUST) |
| 6 | E1 activa perfiles por fase vía catálogo en OpenCode sin comandos hardcodeados | ✅ PASS | Protocolo activo «desde Slice 2» (harness-map l.67/l.49), perfiles válidos vs schema, 0 comandos hardcodeados (E12/E13); activación por interfaz de catálogo mediada por agente, según diseño |
| 7 | harness-map documenta E5 y punto AHE (E6, doc-only) | ✅ PASS | Secciones «Política de review» (l.77) y «Punto de extensión AHE» (l.96) completas; cross-check con review-policy.md |

## Verdict

**PASS WITH WARNINGS**
