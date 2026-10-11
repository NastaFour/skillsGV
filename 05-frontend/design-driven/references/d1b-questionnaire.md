# Cuestionario de Unicidad D1b (5 Bloques Obligatorios) — design-driven

> **Regla de oro**: Un bloque por turno para diseño formal de pantallas completas o greenfield (mínimo 8 preguntas en total). Desacoplar siempre el **Chasis Composicional** (retícula, relaciones de escala y física) del **Livery** (fuentes, colores y logotipo corporativos del cliente).
> 
> **Fast-Path (Mantenimiento Incremental)**: En tareas de mantenimiento o ajustes menores (diff < 50 líneas, bugfix o agregado de un botón/control a pantalla existente), NO ejecutar los 5 bloques. El agente ejecuta el **Fast-Path**: hereda el chasis y tokens existentes emitiendo un único `Design Read` de 1 línea.
> 
> **Autorización de Auto-Inferencia**: En modo `auto` o cuando el usuario solicita explícitamente delegar la decisión («hacé lo que quieras / decidí vos / auto»), el orquestador **queda explícitamente autorizado** a inferir el Chasis Arquetípico más adecuado según la entropía de datos del producto, emitir el `Design Read` formal y avanzar sin bloquear el flujo interactivo.

---

## Bloque 1 · Las 3 P's (Persona, Dolor, Promesa)

1. **Persona**: ¿Quién es el usuario principal? (Edad, oficio, contexto de uso diario). ¿Cuáles son 3 adjetivos de la sensación que debe transmitir y cuál es su tono de voz?
2. **Dolor**: ¿Qué problema o frustración concreta paga por resolver esta interfaz?
3. **Promesa**: ¿Qué valor o certeza inmediata se lleva el usuario en los primeros 10 segundos de interacción?
*(Si responde "no sé": en modo interactivo proponer 2 opciones contrastadas y esperar; en modo auto, inferir según el dominio del producto).*

---

## Bloque 2 · ADN Arquetípico, Diales y Gramática Generativa (Fusión de Chasis)

4. **Selección de Chasis Arquetípico** (Elegir 1 de los 7 o definir Custom):
   - **A · Technical Monograph** (Reporte académico / Bell Labs 1974): Retícula asimétrica 1:3 (`main` + marginalia en `<aside>`), hairlines 1D continuos (`border-b`), cero tarjetas contenedoras en caja. *Preset: `DV: 7, MI: 2, VD: 8` | Física sobre-amortiguada.*
   - **B · Industrial Spec-Sheet** (Telemetría analítica / Manual NASA): Matriz de 12/16 columnas con hairlines de 1px, `tabular-nums lining-nums`, monospace estrictamente zonificado a métricas y tablas (prohibido en prosa). *Preset: `DV: 3, MI: 1, VD: 9` | Física mecánica instantánea (colapso a lista en móvil).*
   - **C · The Gallery / Space Tension** (Catálogo de arte / Prada): Vacío activo masivo (≥45% viewport), escala tipográfica bipolar (Display ≥3:1 vs micro) con escalón intermedio obligatorio (eyebrow de 18-24px). *Preset: `DV: 9, MI: 4, VD: 2` | Alta inercia con stagger.*
   - **D · The Kinetic Utility** (Mesa de trabajo / Figma Canvas): Viewport fijo `100dvh` (`overflow-hidden`), herramienta/canvas protagonista inmediato desde el frame 0, HUDs contextuales flotantes a ≤24px. *Preset: `DV: 4, MI: 8, VD: 7` | Resorte veloz crítico.*
   - **E · The Precision Instrument** (Estudio de ingeniería moderno / Linear, Raycast, Stripe): Foco en teclado prioritario (`Cmd+K`), densidad equilibrada (`p-2.5` a `p-4`), micro-radios controlados (6-8px), superficies táctiles sobrias. *Preset: `DV: 4, MI: 5, VD: 7` | Suave acelerado por hardware.*
   - **F · The Humanist Companion** (Producto empático y cálido / Notion, Airbnb): Ritmo suave, contención orgánica, generoso aire visual sin frialdad, tipografía conversacional humanista. *Preset: `DV: 5, MI: 4, VD: 5` | Resorte natural relajado.*
   - **G · The System Native (Enterprise Workhorse)**: Aplicaciones corporativas y dashboards B2B que integran librerías preexistentes (Shadcn UI, Radix, Tailwind estándar, Material UI). Hereda tokens y convenciones del proyecto sin imponer estética de autor. *Preset: `DV: 3, MI: 2, VD: 7` | Timing operativo limpio.*
   *(Si el usuario no elige: en interactivo proponer 2 perfiles adaptados al producto; en auto, inferir según datos).*

5. **Calibración Triaxial Derivada & Anclaje de Scroll**:
   - Confirmar si se adoptan los diales del preset elegido (`DESIGN_VARIANCE`, `MOTION_INTENSITY`, `VISUAL_DENSITY`) o si se fuerza un valor puntual.
   - ¿La página tiene cadencia narrativa con scroll fluido o funciona como una aplicación densa fija / viewport lock (`100dvh`)?

6. **Las 3 Reglas Generativas Mecánicas**:
   - El agente DEBE derivar del arquetipo exactamente **3 directivas técnicas de CSS/Layout inmutables** (1 de retícula/layout, 1 de división/superficie, 1 de escala tipográfica) para registrarlas en `design-dna.md` y en el header del archivo visual antes de codificar.

---

## Bloque 3 · Referencias Reales y Anti-Referencias

7. **Referencias Positivas**: Proporcionar 3-5 URLs reales (Godly, Awwwards, 21st.dev, Dribbble, Figma o producto vivo) indicando qué se toma exactamente de cada una (paleta, tipografía, retícula o micro-interacción). *En modo terminal o backend sin URLs, indicar nombres de productos referentes concretos*.
8. **Anti-Referencias**: Proporcionar 2-3 ejemplos de productos, sitios o patrones que NO gustan y por qué, para prohibirlos explícitamente.

---

## Bloque 4 · Firma (Signature), Heartbeat y Salvaguardas A11y

9. **Elemento de Firma**: ¿Cuál es el elemento icónico e inolvidable que el usuario recordará tras usar la aplicación una sola vez?
10. **Acento Cromático**: Definir 1 único color de acento primario OKLCH o Hex corporativo (saturación estricta < 80%).
11. **Par Tipográfico en Contraste (Livery)**: Definir el emparejamiento tipográfico por contraste de ejes (Serif + Sans, Geometric + Humanist, o una familia explotada). *Inter queda prohibido como default reflexivo cuando no hay sistema previo; se permite si es la tipografía establecida del proyecto o requerimiento corporativo*.
12. **Límites de Hero y Suelo A11y**: Techo tipográfico clamp a 6rem máximo, tracking floor a `-0.04em`, y suelo mínimo de legibilidad WCAG 2.2 a `clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)` (mínimo 12px con peso ≥ 500 para metadatos, con excepción de etiquetas microscópicas en ejes de gráficos y `<kbd>`).
13. **Pantalla Corazón (Heartbeat)**: ¿Cuál es LA pantalla o dato crítico que no puede fallar bajo ninguna circunstancia?

---

## Bloque 5 · Anti-Slop Negativo, Anti-Faux-Density y Restricciones Reales

14. **Lista de Prohibiciones (Bans)**: Confirmar la aplicación de los 10 Absolute Bans (cero em-dashes en UI, no gradientes violeta neón, no beige/brass cliché, no fake product divs, no scroll cues) más los odios estéticos específicos del usuario.
15. **Anti-Faux-Density (Tufte)**: Si el proyecto carece de entropía real de datos, prohibir la simulación artificial de números de serie, métricas falsas (`SYS_STATUS: 0x4F`) o falsos LEDs decorativos (cosplay de telemetría). *(Mocks funcionales de prototipado en Fase D4 están permitidos si representan datos reales futuros).*
16. **Límites de Dependencias y Física**: ¿Hasta dónde se puede implementar? (Solo CSS nativo con curvas cúbicas vs librerías aprobadas como GSAP, Motion o componentes curados de 21st.dev). Prohibido `transition: all 0.3s ease` genérico; usar la física de resortes o el fallback CSS nativo del arquetipo.
17. **Restricciones de Entrega**: Nivel de accesibilidad requerido (WCAG AA), idioma/localización y fecha límite.
