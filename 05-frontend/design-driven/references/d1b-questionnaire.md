# Fase D1b — Entrevista de Unicidad, Chasis Arquetípicos y Protocolo "Think Outside the Box"

Este cuestionario operacionaliza la Fase D1b de `design-driven`. Su propósito es **erradicar el diseño genérico por omisión ("AI-slop")** combinando un piso sólido de ingeniería visual con un techo creativo abierto (**Floor, Not Ceiling**).

---

## ⚡ Modo 1: Síntesis One-Shot Ultra-Compacta (Ahorro Máximo de Tokens)

Cuando el usuario pida una ejecución directa/one-shot o el flujo corra en modo `auto`, **no abras rondas de preguntas que consuman turnos extra**. Sintetizá las 8 dimensiones nucleares + el protocolo **Think Outside the Box** en un único bloque compacto antes del `Design Read`:

```markdown
### 🧠 D1b One-Shot Creative Synthesis
1. **Esencia y Anti-Referencia**: [3 adjetivos] | Jamás parecerse a: [Cliché de la industria a evitar]
2. **Inversión Lateral (Think Outside the Box)**: [Cliché dominante del nicho] -> Invertido en: [Metáfora física/editorial única]
3. **Chasis y Diales**: [Arquetipo A-H] (`DESIGN_VARIANCE: X, MOTION_INTENSITY: Y, VISUAL_DENSITY: Z`)
4. **Arquitectura de Color (OKLCH/HSL)**: `--surface-0`, `--surface-1`, `--text-primary`, `--accent-primary`, `--border-subtle`
5. **Sistema Tipográfico**: `--font-display`, `--font-sans`, `--font-mono` (`tabular-nums` en métricas)
6. **Física Espacial (3 Reglas Mecánicas)**: [Regla 1: Grid/proporción] · [Regla 2: Bordes/superficie] · [Regla 3: Densidad/respiro]
7. **Coreografía de Movimiento**: [Curva spring/cubic-bezier + fallback `prefers-reduced-motion`]
8. **Firma de Oficio (`[Beyond-Baseline]`)**: [El detalle bespoke que hace inolvidable esta interfaz]
```

---

## 🗣️ Modo 2: Entrevista Interactiva en 5 Bloques (Proyectos Greenfield Colaborativos)

Si el usuario prefiere co-diseñar paso a paso, presentá estos 5 bloques conversacionales:

### Bloque 1: Personalidad, Anti-Referencias y "Think Outside the Box"
1. **Personalidad en 3 palabras**: Si tu producto fuera un objeto físico o espacio arquitectónico, ¿qué 3 adjetivos lo definirían? *(ej: "cronógrafo suizo, silencioso, táctil" o "revista impresa, cálida, radical")*.
2. **Anti-Referencias**: ¿Qué cliché visual de tu industria odiás o querés evitar a toda costa?
3. **Metáfora Fuera de la Caja**: ¿Te gustaría anclar la interfaz en un **Chasis Arquetípico clásico (A-G)** o explorar una **Inversión Lateral (H. Bespoke / Think Outside the Box)** inspirada en un objeto físico/editorial fuera del software tradicional?

### Bloque 2: Selección de Chasis y Densidad (A–H)
4. **Elección de Chasis**:
   - **A. `Technical Monograph`** (`[7, 2, 8]` — Editorial técnico, asimétrico 1:3, hairlines 1px, sin cards)
   - **B. `Industrial Spec-Sheet`** (`[3, 1, 9]` — Telemetría/finanzas, grilla 12-col hairline, `tabular-nums`)
   - **C. `The Gallery`** (`[9, 4, 2]` — Lujo/portafolio, `>= 45%` lienzo abierto, escala tipográfica extrema)
   - **D. `The Kinetic Utility`** (`[4, 8, 7]` — Herramienta espacial/3D/canvas, `100dvh`, HUDs flotantes)
   - **E. `The Precision Instrument`** (`[4, 5, 7]` — Productividad veloz estilo Linear/Raycast, `6-8px` radios)
   - **F. `The Humanist Companion`** (`[5, 4, 5]` — Consumo/salud/educación, superficies cálidas y orgánicas)
   - **G. `The System Native`** (`[3, 2, 7]` — SaaS enterprise multi-equipo sobre primitivas limpias)
   - **H. `Bespoke / Creative Exploration (Think Outside the Box)`** (Híbrido o metáfora lateral con 3 reglas generativas propias)

### Bloque 3: Luz, Color Semántico y Materialidad
5. **Polaridad y Atmósfera**: ¿Modo oscuro profundo (oled/carbon), claro papel/editorial (alabaster/warm stone), o adaptativo?
6. **Acento con Intención**: ¿Qué color guía la acción primaria (`--accent-primary`) y cómo evitamos el violeta/azul genérico de IA sin justificación de marca?

### Bloque 4: Voz Tipográfica y Ritmo
7. **Combinación Tipográfica**: ¿Sans geométrica de precisión + Monospace técnica, Serif editorial de alto contraste + Sans humanista, o Display expresiva para storytelling?

### Bloque 5: El Detalle Firma (Signature Craft)
8. **Momento Memorable**: ¿Cuál será el "detalle firma" en los primeros 5 segundos? *(ej. navegación tipo comando instantánea, transición scroll-scrubbed con `scroll-world-storytelling`, o fichas técnicas con micro-tipografía tabular impecable)*.

---

## 🧬 Las 3 Reglas Generativas Mecánicas por Chasis

Todo `DESIGN_SYSTEM.md` debe dejar asentadas las 3 leyes mecánicas del chasis elegido (o las 3 leyes creadas en el modo **Think Outside the Box**):

| Chasis | Regla 1 (Layout / Grilla) | Regla 2 (Superficie / Bordes) | Regla 3 (Tipografía / Interacción) |
|---|---|---|---|
| **A. Monograph** | Grilla asimétrica 1:3 con índice sticky | Hairlines expuestas `1px solid var(--border-subtle)`, 0 cards | Contraste Serif/Sans + notas marginales |
| **B. Spec-Sheet** | Matriz densa de 12 columnas compactas | Cero `box-shadow`, radios `0px-2px`, celdas con borde compartido | `font-variant-numeric: tabular-nums` obligatorio |
| **C. Gallery** | Lienzo vacío `>= 45%` del viewport | Cero bordes divisores; separación pura por espacio negativo | Escala bipolar (`clamp(2.75rem, 6vw, 5.5rem)` vs `0.75rem`) |
| **D. Kinetic** | Viewport fijo `100dvh` con lienzo central | Paneles HUD flotantes (`backdrop-filter: blur(16px)`) | Transiciones físicas por resorte + atajos directos |
| **E. Precision** | Jerarquía de paneles colapsables y listas densas | Micro-radios `6px-8px`, bordes de luminancia sutil `1px` | Navegación `Cmd+K` y estados hover instantáneos (`<120ms`) |
| **F. Humanist** | Flujo de lectura centrado (`60-70ch`) y grillas amables | Superficies cálidas en capas suaves, radios `10px-16px` | Micro-copy empático y transiciones suaves |
| **G. System Native** | Layouts estándar de alta claridad y predecibilidad | Tokens semánticos puros sobre primitivas accesibles (Radix/Shadcn) | Foco en velocidad de tarea y consistencia |
| **H. Bespoke (Out of the Box)** | **Definida por inversión lateral del cliché** | **Definida por la materialidad de la metáfora elegida** | **Definida por la firma interactiva `[Beyond-Baseline]`** |
