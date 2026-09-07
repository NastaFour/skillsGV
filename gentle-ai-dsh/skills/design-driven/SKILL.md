---
name: design-driven
description: "Trigger: design driven, DDD, pipeline de diseno, design-driven development, disenar pantalla, rediseno, design system, brief de diseno, prototipo formal, entrevista de diseno, design DNA. Formal design pipeline (D1 brief → D1b uniqueness questionnaire → D2 explore → D3 design-system → D4 prototype → D5 handoff → D6 design-review) — a unique design is INTERVIEWED, not drawn. Decision gates + Design DNA artifact + anti-AI-slop rule."
license: MIT
allowed-tools: Read Task Bash(git:*,gh:*,od:*)
metadata:
  author: gentleman-programming
  version: "2.0.0"
  delegate_only: true
  trigger: ["design driven", "pipeline de diseno", "design-driven development", "disenar pantalla", "rediseno", "design system", "brief de diseno", "prototipo formal", "entrevista de diseno", "design dna"]
---

# design-driven — Pipeline de Diseño formal (DDD)

> Principio rector: **un diseño único no se dibuja — se entrevista.** Cada respuesta del
> usuario alimenta un artefacto "Design DNA" que hace trazable la unicidad. Nunca
> inventes preferencias de marca; ante "no sé", proponé 2 opciones concretas y esperá elección.

## Rol de ejecución

- Si sos el sub-agente **design-driven**: coordiná D1-D6 y delegá el trabajo de fase. No lo ejecutes inline.
- Si cargaste esta skill con **skill()**: sos el orquestador. Seguí este contrato y HACÉ las preguntas de F1/F2 vos mismo (no las delegues).

## Pipeline y fases

Orden estricto: D1 → **D1b** → D2 → D3 → D4 → D5 → D6.

| Fase | Nombre | Produce | Modelo | Apoyo |
|---|---|---|---|---|
| D1 | design-brief | Objetivo, audiencia, moodboard de referencias visuales (imágenes vía Antigravity/od), restricciones (tokens, stack, a11y) | strong | frontend-design, brainstorming |
| **D1b** | **Cuestionario de Unicidad** | Design DNA (3 P's, diales, referencias, firma, anti-slop) | strong | taste-skill, impeccable (ver F1) |
| D2 | design-explore | Auditoría visual de la UI actual + inventario de componentes + problemas | strong | interface-design, web-design-guidelines |
| D3 | design-system | Tokens (HSL/OKLCH + dark, tipografía, 8pt, elevación, motion) + primitivas | strong | design-system-tokens, oklch-theme-injector, tailwind-4 |
| D4 | design-prototype | Prototipo de 1-3 pantallas clave (HTML/React o **od**) | flash + od | open-design, interface-design, micro-interactions |
| D5 | design-handoff | Spec visual TEXTUAL + assets exportados | strong | micro-interactions, motion-accessibility, technical-writer |
| D6 | design-review | Judgment Day visual: 2 jueces ciegos contra el Design DNA | 2× strong | judgment-day, ux-auditor-agent |

## F1 · Cuestionario de Unicidad (D1b — 5 bloques obligatorios secuenciales, sin atajos)

> **Vía SDD**: si este pipeline corre por delegación SDD, el brief D1 + el cuestionario D1b los ejecuta el ORQUESTADOR con el usuario en **5 bloques secuenciales (un bloque por turno)** ANTES de lanzar `sdd-design`. El delegado recibe el Design DNA consolidado en su prompt y nunca lo inventa ni vuelve a entrevistar.

Tras D1, el ORQUESTADOR ejecuta D1b en **5 bloques obligatorios y secuenciales** (un bloque por turno, mínimo 8 preguntas). **Leer [references/d1b-questionnaire.md](references/d1b-questionnaire.md) ANTES de preguntar**.

1. **Las 3 P's**: Persona (quién es, 3 adjetivos, tono), Dolor (problema que paga por resolver), Promesa (qué se lleva en 10s).
2. **Diales y Vibe**: `DESIGN_VARIANCE`, `MOTION_INTENSITY`, `VISUAL_DENSITY` (1-10, vía `taste-skill`) + anclaje de scroll.
3. **Referencias Reales**: 3-5 URLs reales con qué se toma de cada una + 2-3 anti-referencias. Nunca «inspirado en Linear» sin URL.
4. **Firma y Heartbeat**: Elemento inolvidable, 1 acento OKLCH (<80% sat), tipografía por contraste (no Inter default), hero clamp 6rem, pantalla corazón crítica.
5. **Anti-slop y Restricciones**: 10 Absolute Bans de `taste-skill` + límites de dependencias (solo CSS vs aprobadas), a11y (WCAG AA), deadline.

**Regla dura:** Si responde «lo que quieras / no sé», proponer 2 opciones de ejemplo y esperar. Prohibido asumir o rellenar con defaults.

## F2 · Confirmaciones intermedias (mínimo, sin abrumar)

- **Tras D3 tokens**: 1 pregunta — paleta base (clara/oscura/mixta + default), par tipográfico, densidad. Mostrá 2 variantes mínimas si hay duda.
- **Tras D4 prototype**: 1 crítica guiada — "¿qué 3 cosas cambiarías del prototipo?" (reacciona, no diseña).
- **Tras D5 handoff**: aprobación explícita antes de implementar.

## F3 · El artefacto Design DNA

- Cada respuesta se consolida en **design-artifacts/<project>/design-dna.md** con los campos:
  - `persona` / `dolor` / `promesa`
  - `dials`: `{variance, motion, density}`
  - `references`: `[{url, takeaway}]`
  - `anti_references`
  - `signature`
  - `accent_oklch`
  - `type_pairing`
  - `bans[]`
  - `heartbeat_screen`
- Se persiste en Engram con topic key **design/<project>/dna**.
- **D6 evalúa contra el DNA**: ¿tiene la firma elegida? ¿evita TODOS los anti-slop? ¿parece un dashboard genérico? — respuesta textual con evidencia. Si falla → vuelve a D3/D4 (máx 2 rondas).

## F4 · Modos y reglas transversales

- Cachear **interactive|auto** por sesión. En auto, mantener SIEMPRE D1b (cuestionario) y D5 (aprobación); omitir solo las confirmaciones intermedias si el usuario lo pide.
- Si el usuario manda referencias como imágenes y el modelo no ve → Antigravity/od traduce a spec textual.
- Preferencias de marca NUNCA se inventan; en ausencia de respuesta, se proponen opciones y se espera elección.

## Gates

- **decision-gate** al final de D1, D3 y D5 (el humano aprueba el rumbo).
- D6: máximo 2 rondas de fix.
- **D6 technical gate (opcional)**: corré **scripts/token-audit.mjs --srcDir <proyecto>** para cazar hex hardcodeados, literales **bg-white**/text-black y paletas no semánticas antes de aprobar.

## Regla anti-slop

Nunca entregues una pantalla sin pasar por D3 (tokens) y sin Design DNA. El diseño no se improvisa en el apply.

## Persistencia

D1-D6 guardan decisiones en Engram con topic design/<proyecto>. D4 guarda prototipos en design-artifacts/<fecha>-<fase>/ del proyecto (historial visual).
