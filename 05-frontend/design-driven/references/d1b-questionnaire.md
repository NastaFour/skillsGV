# Fase D1b — Entrevista de Unicidad, Chasis Arquetípicos y Protocolo "Think Outside the Box"

Este cuestionario operacionaliza la Fase 1 (D1b) de `design-driven`. Su propósito es **erradicar el diseño genérico por omisión ("AI-slop")** — tanto las cards redondeadas genéricas con gradiente violeta como el extremo opuesto (muros de cajitas `0–2px` con borde `1px`, códigos monospace decorativos y etiquetas `"A / B"`).

---

## 🗣️ Modo Predeterminado (Greenfield Interactivo): Entrevista Concisa en 1 Mensaje

Para todo proyecto UI greenfield iniciado en conversación interactiva — **incluso si el usuario ya nombró un tema o material** ("papel", "dashboard", "tienda") —, enviá **un solo mensaje conciso** con estas 5 decisiones abiertas y **frená hasta recibir respuesta** (cumpliendo la regla ODD de 1 turno de pregunta):

1. **Personalidad y Anti-Referencia**: En 2–3 palabras, ¿qué sensación querés transmitir y qué cliché visual querés evitar a toda costa?
2. **Geometría y Superficies**: ¿Preferís **esquinas suaves/orgánicas y elevación sutil** donde mande el espacio en blanco, o **arquitectura rectilínea** con líneas divisorias mínimas? *(Nunca cajas con borde `1px` alrededor de cada elemento).*
3. **Luz y Acento**: ¿Modo claro, oscuro o dual con transición, y qué color de acento guía la acción principal?
4. **Voz Tipográfica**: ¿Display expresiva + Sans limpia, Serif editorial + Sans humanista, o Sans geométrica de precisión? *(Monospace solo en código o métricas numéricas reales).*
5. **Detalle Firma (`[Beyond-Baseline]`)**: ¿Qué interacción o detalle visual querés que se recuerde en los primeros 5 segundos?

*(Si el usuario quiere explorar más a fondo, desglosá por bloques; si ya respondió todas estas dimensiones en su prompt inicial, confirmá el `Design Read` y avanzá).*

---

## ⚡ Modo One-Shot Compacto (Solo si el usuario lo pide o en Swarms Autónomos)

Usá este modo **únicamente** cuando el usuario escriba explícitamente *"one-shot"*, *"sin preguntas"*, *"sorprendeme"* o cuando corras como subagente/swarm autónomo sin interacción directa:

```markdown
### 🧠 D1b One-Shot Creative Synthesis
1. **Esencia y Anti-Referencia**: [3 adjetivos] | Jamás parecerse a: [Cliché de la industria a evitar]
2. **Inversión Lateral (Think Outside the Box)**: [Cliché dominante] -> Invertido en: [Metáfora única]
3. **Chasis y Diales**: [Arquetipo A-H] (`DESIGN_VARIANCE: X, MOTION_INTENSITY: Y, VISUAL_DENSITY: Z`)
4. **Arquitectura de Color (OKLCH/HSL)**: `--surface-0`, `--surface-1`, `--text-primary`, `--accent-primary`, `--border-subtle`
5. **Sistema Tipográfico**: `--font-display`, `--font-sans`, `--font-mono` (`tabular-nums` solo en métricas/código)
6. **Física Espacial (3 Reglas Mecánicas)**: [Regla 1: Grid/proporción] · [Regla 2: Superficie/radios/elevación] · [Regla 3: Respiro/espacio negativo]
7. **Coreografía de Movimiento**: [Curva spring/cubic-bezier + fallback `prefers-reduced-motion`]
8. **Firma de Oficio (`[Beyond-Baseline]`)**: [El detalle bespoke que hace inolvidable esta interfaz]
```

---

## 🧬 Las 3 Reglas Generativas Mecánicas por Chasis

Todo `DESIGN_SYSTEM.md` debe dejar asentadas las 3 leyes mecánicas del chasis elegido. **Regla transversal**: *"cero cards genéricas"* significa usar **espacio negativo, escala tipográfica y contraste de fondo**, jamás reemplazar tarjetas por cientos de cajitas `0–2px` con borde `1px`.

| Chasis | Regla 1 (Layout / Grilla) | Regla 2 (Superficie / Radios / Bordes) | Regla 3 (Tipografía / Interacción) |
|---|---|---|---|
| **A. Monograph** | Grilla asimétrica 1:3 con índice sticky | Divisores estructurales `1px` solo entre secciones; cero cajitas alrededor de badges/links | Contraste Serif/Sans + notas marginales limpias |
| **B. Spec-Sheet** | Matriz densa de 12 columnas compactas | Celdas con borde compartido (`0–4px`), sin sombras pesadas | `font-variant-numeric: tabular-nums` obligatorio |
| **C. Gallery** | Lienzo vacío `>= 45%` del viewport | Cero bordes divisores innecesarios; separación por espacio negativo | Escala bipolar (`clamp(2.75rem, 6vw, 5.5rem)` vs `0.75rem`) |
| **D. Kinetic** | Viewport fijo `100dvh` con lienzo central | Paneles HUD flotantes (`backdrop-filter` con `@supports` fallback) | Transiciones físicas por resorte + atajos directos |
| **E. Precision** | Jerarquía de paneles colapsables y listas densas | Micro-radios `6px-8px`, bordes de luminancia sutil `1px` | Navegación `Cmd+K` y estados hover instantáneos (`<120ms`) |
| **F. Humanist** | Flujo de lectura centrado (`60-70ch`) y grillas amables | Superficies cálidas en capas suaves, radios `10px-16px`, elevación sutil | Micro-copy empático y transiciones suaves |
| **G. System Native** | Layouts estándar de alta claridad y predecibilidad | Tokens semánticos puros sobre primitivas accesibles (Radix/Shadcn) | Foco en velocidad de tarea y consistencia |
| **H. Bespoke (Out of the Box)** | **Definida por inversión lateral del cliché** | **Radios, elevación y materialidad acordes a la metáfora (nunca 0–2px por reflejo)** | **Definida por la firma interactiva `[Beyond-Baseline]`** |
