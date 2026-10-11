---
name: design-driven
description: "Trigger: design driven, DDD, pipeline de diseno, design-driven development, disenar pantalla, rediseno, design system, brief de diseno, prototipo formal, entrevista de diseno, design DNA. Formal design pipeline (D1 brief → D1b uniqueness questionnaire → D2 explore → D3 design-system → D4 prototype → D5 handoff → D6 design-review) — a unique design is INTERVIEWED, not drawn. Decision gates + Design DNA artifact + anti-AI-slop rule."
license: MIT
allowed-tools: Read Task Bash(git:*,gh:*,od:*)
metadata:
  author: gentleman-programming
  version: "2.1.0"
  delegate_only: true
  trigger: ["design driven", "pipeline de diseno", "design-driven development", "disenar pantalla", "rediseno", "design system", "brief de diseno", "prototipo formal", "entrevista de diseno", "design dna"]
---

# design-driven — Pipeline de Diseño formal (DDD)

> Principio rector: **un diseño único no se dibuja — se entrevista.** Cada respuesta del
> usuario alimenta un artefacto "Design DNA" que hace trazable la unicidad. Nunca
> inventes preferencias de marca; ante "no sé", proponé 2 opciones concretas y esperá elección.
> Desacoplá siempre el **Chasis Composicional** (retícula y matemáticas) del **Livery** (marca y colores).

## Rol de ejecución

- Si sos el sub-agente **design-driven**: coordiná D1-D6 y delegá el trabajo de fase. No lo ejecutes inline.
- Si cargaste esta skill con **skill()**: sos el orquestador. Seguí este contrato y HACÉ las preguntas de F1/F2 vos mismo (no las delegues).

## Pipeline y fases

Orden estricto: D1 → **D1b** → D2 → D3 → D4 → D5 → D6.

| Fase | Nombre | Produce | Modelo | Apoyo |
|---|---|---|---|---|
| D1 | design-brief | Objetivo, audiencia, moodboard de referencias visuales (imágenes vía Antigravity/od), restricciones (tokens, stack, a11y) | strong | frontend-design, brainstorming |
| **D1b** | **Cuestionario de Unicidad** | Design DNA (3 P's, chasis arquetípico, diales pre-calibrados, 3 reglas generativas mecánicas, referencias, firma, anti-slop) | strong | taste-skill, impeccable (ver F1) |
| D2 | design-explore | Auditoría visual de la UI actual + inventario de componentes + problemas | strong | interface-design, web-design-guidelines |
| D3 | design-system | Tokens (HSL/OKLCH + dark, tipografía, 8pt, elevación, motion) + primitivas | strong | design-system-tokens, oklch-theme-injector, tailwind-4 |
| D4 | design-prototype | Prototipo de 1-3 pantallas clave (HTML/React o **od**) | flash + od | open-design, interface-design, micro-interactions |
| D5 | design-handoff | Spec visual TEXTUAL + assets exportados | strong | micro-interactions, motion-accessibility, technical-writer |
| D6 | design-review | Judgment Day visual: 2 jueces ciegos contra el Design DNA | 2× strong | judgment-day, ux-auditor-agent |

## F1 · Cuestionario de Unicidad (D1b — Greenfield vs Fast-Path)

> **Auto-Trigger & Scoping**:
> 1. **Greenfield / Nuevas Pantallas**: El brief D1 + el cuestionario D1b los ejecuta el ORQUESTADOR con el usuario en **5 bloques secuenciales (un bloque por turno)** ANTES de generar código UI. Si el usuario no conoce el pipeline o pide "hacé lo que quieras / auto", el orquestador infiere el arquetipo según la entropía de datos, emite el `Design Read` formal y construye sobre el chasis sin improvisar en el vacío.
> 2. **Fast-Path (Mantenimiento Incremental)**: Para ajustes menores (diff < 50 líneas, bugfix, o agregar un botón/input a una pantalla existente), **no se corren los 5 bloques**. El orquestador emite un `Design Read` de 1 línea heredando el chasis/tokens del proyecto y procede directamente.

Tras D1, para pantallas nuevas el ORQUESTADOR ejecuta D1b en **5 bloques obligatorios y secuenciales** (un bloque por turno, mínimo 8 preguntas). **Leer [references/d1b-questionnaire.md](references/d1b-questionnaire.md) ANTES de preguntar**.

1. **Las 3 P's**: Persona (quién es, 3 adjetivos, tono), Dolor (problema que paga por resolver), Promesa (qué se lleva en 10s).
2. **ADN Arquetípico y Diales (Chasis)**: Selección de 1 de los 7 Chasis Arquetípicos (*Technical Monograph, Industrial Spec-Sheet, The Gallery, The Kinetic Utility, The Precision Instrument, The Humanist Companion, The System Native*) que pre-calibra automáticamente los diales triaxiales (`DESIGN_VARIANCE`, `MOTION_INTENSITY`, `VISUAL_DENSITY`), retícula y física de resortes (con fallback CSS nativo), más la definición de las **3 Reglas Generativas Mecánicas**.
3. **Referencias Reales**: 3-5 URLs reales o productos ancla con qué se toma de cada uno + 2-3 anti-referencias.
4. **Firma, Heartbeat y Suelo A11y**: Elemento inolvidable, 1 acento OKLCH (<80% sat), tipografía por contraste (Inter permitido si es corporativo preexistente), hero clamp 6rem, suelo WCAG 2.2 a11y min 12px, pantalla corazón crítica.
5. **Anti-slop, Anti-Faux-Density y Restricciones**: 10 Absolute Bans de `taste-skill` + prohibición de falsa telemetría decorativa + límites de dependencias + física de resortes cuantitativa o fallback cubic-bezier.

## F2 · Confirmaciones intermedias (mínimo, sin abrumar)

- **Tras D3 tokens**: 1 pregunta — paleta base (clara/oscura/mixta + default), par tipográfico, densidad. Mostrá 2 variantes mínimas si hay duda.
- **Tras D4 prototype**: 1 crítica guiada — "¿qué 3 cosas cambiarías del prototipo?" (reacciona, no diseña).
- **Tras D5 handoff**: aprobación explícita antes de implementar.

## F3 · El artefacto Design DNA

- Cada respuesta se consolida en **design-artifacts/<project>/design-dna.md** con los campos:
  - `persona` / `dolor` / `promesa`
  - `archetype`: `{name, preset, physics_spring, css_fallback}`
  - `generative_rules`: `[rule1_layout, rule2_surface, rule3_type_scale]`
  - `dials`: `{variance, motion, density}`
  - `references`: `[{url, takeaway}]`
  - `anti_references`
  - `signature`
  - `accent_oklch`
  - `type_pairing`
  - `bans[]`
  - `heartbeat_screen`
- Se persiste en Engram con topic key **design/<project>/dna**.
- **D6 evalúa contra el DNA**: ¿tiene la firma elegida? ¿cumple las 3 reglas generativas? ¿evita faux-density y TODOS los anti-slop? ¿parece un dashboard genérico? — respuesta textual con evidencia. Si falla → vuelve a D3/D4 (máx 2 rondas).

## F4 · Modos y reglas transversales

- Cachear **interactive|auto** por sesión. En auto, mantener SIEMPRE D1b (cuestionario o inferencia) y D5 (aprobación); omitir solo las confirmaciones intermedias si el usuario lo pide.
- Si el usuario manda referencias como imágenes y el modelo no ve → Antigravity/od traduce a spec textual.
- Preferencias de marca NUNCA se inventan en vacío; en ausencia de respuesta, se infieren según el dominio del producto o se proponen opciones.

## Gates

- **decision-gate** al final de D1, D3 y D5 (el humano aprueba el rumbo).
- D6: máximo 2 rondas de fix.
- **D6 technical gate (opcional)**: corré **scripts/token-audit.mjs --srcDir <proyecto>** para cazar hex hardcodeados, literales **bg-white**/text-black y paletas no semánticas antes de aprobar.

## Regla anti-slop & Anti-Attention-Decay

1. Nunca entregues una pantalla sin pasar por D3 (tokens) y sin Design DNA. El diseño no se improvisa en el apply.
2. **Inyección en cabecera multi-formato**: Todo archivo frontend nuevo generado debe incluir en su primera línea de comentario las directivas del arquetipo y sus 3 reglas generativas usando la sintaxis nativa del archivo (`/* @design-archetype: ... */` en JS/TS/CSS/Dart, `<!-- @design-archetype: ... -->` en HTML/Vue templates, `# @design-archetype: ...` en Python/YAML, y omitir en `.json` estricto) para evitar que el LLM decaiga en su centroide estadístico durante sesiones largas.

## Persistencia

D1-D6 guardan decisiones en Engram con topic design/<proyecto>. D4 guarda prototipos en design-artifacts/<fecha>-<fase>/ del proyecto (historial visual).
