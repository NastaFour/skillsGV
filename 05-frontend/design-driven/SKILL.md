---
name: design-driven
description: "Trigger: design driven, DDD, pipeline de diseno, design-driven development, disenar pantalla, rediseno, design system, brief de diseno, prototipo formal, entrevista de diseno, design DNA. Formal design pipeline (D1 brief → D1b uniqueness questionnaire → D2 explore → D3 design-system → D4 prototype → D5 handoff → D6 design-review) — a unique design is INTERVIEWED, not drawn. Decision gates + Design DNA artifact + anti-AI-slop rule."
license: MIT
allowed-tools: Read Task Bash(git:*,gh:*,od:*)
metadata:
  author: gentleman-programming
  version: "2.0.0"
  delegate_only: true
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
| **D1b** | **Cuestionario de Unicidad** | Design DNA (personalidad, referencias, firma, corazón, anti-slop) | strong | — (ver F1) |
| D2 | design-explore | Auditoría visual de la UI actual + inventario de componentes + problemas | strong | interface-design, web-design-guidelines |
| D3 | design-system | Tokens (HSL/OKLCH + dark, tipografía, 8pt, elevación, motion) + primitivas | strong | design-system-tokens, oklch-theme-injector, tailwind-4 |
| D4 | design-prototype | Prototipo de 1-3 pantallas clave (HTML/React o **od**) | flash + od | open-design, interface-design, micro-interactions |
| D5 | design-handoff | Spec visual TEXTUAL + assets exportados | strong | micro-interactions, motion-accessibility, technical-writer |
| D6 | design-review | Judgment Day visual: 2 jueces ciegos contra el Design DNA | 2× strong | judgment-day, ux-auditor-agent |

## F1 · Cuestionario de Unicidad (D1b — la fase MÁS importante, sin atajos)

Tras D1, SIEMPRE preguntar por bloques. Adaptá la cantidad a la amplitud del proyecto;
**mínimo 8 preguntas**. Nunca saltes un bloque sin respuesta.

**1 · Personalidad de marca**
- 3 adjetivos de la sensación (clínico-serio, cálido-cercano, tech-premium, artesanal…).
- Si la marca fuera una persona: edad, cómo viste, cómo habla.
- Qué TONO debe respirar (profesional / editorial / minimalista / lúdico / confianza médica).

**2 · Referencias positivas (combustible de la unicidad)**
- 3-5 referencias visuales que encantan + QUÉ exactamente de cada una (color, layout, tipografía, detalle).
- 2-3 anti-referencias: qué NO gusta y por qué (para prohibirlas explícitamente).
- Qué app/producto de uso diario le parece hermoso.

**3 · Elementos de firma (signature)**
- QUÉ un elemento debe ser icónico e inconfundible (color de acento, tipografía, forma, micro-interacción).
- Qué debería recordar el usuario tras usarla UNA vez.
- Contexto local/cultural a sentir (es-VE, formato de fechas, moneda, iconografía local).

**4 · El corazón del producto**
- Cuál es LA pantalla/dato que no puede fallar (el diseño se centra ahí).
- Cómo se usa en la vida real (turnos nocturnos → dark default; una mano; alta repetición → densidad alta).

**5 · Anti-slop negativo**
- Qué diseños parecen "genéricos de IA" a evitar (gradientes morados, tarjetas con sombra exagerada, todo redondeado…).
- Colores/fuentes/layouts que ODIÁ.

**6 · Restricciones reales**
- Hasta dónde se puede implementar (solo CSS/tokens vs nuevas deps aprobadas).
- Accesibilidad, idioma, formato de entrega, deadline.

**Regla dura:** si responde "lo que quieras / no sé" en un bloque, REFORMULÁ con 2 opciones
concretas de ejemplo. El "no sé" no autoriza a inventar; autoriza a proponer para que elija.
Nunca rellenes bloques vacíos con defaults.

## F2 · Confirmaciones intermedias (mínimo, sin abrumar)

- **Tras D3 tokens**: 1 pregunta — paleta base (clara/oscura/mixta + default), par tipográfico, densidad. Mostrá 2 variantes mínimas si hay duda.
- **Tras D4 prototype**: 1 crítica guiada — "¿qué 3 cosas cambiarías del prototipo?" (reacciona, no diseña).
- **Tras D5 handoff**: aprobación explícita antes de implementar.

## F3 · El artefacto Design DNA

- Cada respuesta se consolida en **design-artifacts/<project>/design-dna.md**: personalidad, referencias con qué se tomó de cada una, elemento de firma, anti-slop prohibidos, corazón del producto.
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
