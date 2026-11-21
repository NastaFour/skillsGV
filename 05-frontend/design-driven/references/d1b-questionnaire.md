# Fase D1b v4 — Creative Pitch en 1 Mensaje, Matriz de Dominio y Chasis Arquetípicos

Este protocolo reemplaza la entrevista abierta genérica por una **propuesta proactiva en 1 solo mensaje** (cumpliendo la regla ODD de 1 turno de pregunta) para erradicar tanto el *AI-slop* plano/genérico ("simplecito") como la sobrecarga de circos 3D donde destruyen la usabilidad.

---

## 🧭 Matriz de Elegibilidad por Dominio (Domain Guardrails)

Antes de redactar las 3 opciones del **Creative Pitch**, clasificá el producto en esta matriz:

| Dominio / Superficie | Opción 1 (Editorial) | Opción 2 (Cinética / Interactiva) | Opción 3 (Propuesta Audaz — Elegibilidad) |
|---|---|---|---|
| **Brand, Estudio, Portfolio, Producto Launch, Arte/Media, Academia/Evento** | Crisp Editorial (`Gallery` / `Monograph`) | Interactive Kinetic (`motion-gsap` + selector/ruleta/agenda viva o micro-interacción firma) | **Immersive 2D/3D/Shader** (`scroll-world-storytelling`, `three-js-web`, `shader-dev`, Astro `client:visible`, `Rule of One` + `reduced-motion`) |
| **SaaS Dashboard, Admin/CRUD, Docs Técnicas, Formularios/Checkout, Lead-Gen Local** | Crisp Editorial (`Precision` / `System Native`) | Functional Micro-Kinetic (`emil-kowalski` + `micro-interactions` + vista interactiva útil) | **Data-Dense Precision o Storytelling SVG Editorial** (`refactoring-ui` / `frontend-slides-deck` diagramas SVG — **PROHIBIDO 3D/Shaders decorativos por defecto**) |

---

## 🗣️ Modo Predeterminado (Greenfield Interactivo): Creative Pitch en 1 Mensaje

Enviá **1 único mensaje conciso** con **3 conceptos concretos diseñados para ESE negocio** (máximo `3` líneas por opción: Dirección/Chasis + Paleta/Tipografía + Pieza Firma + Skills Phase 2 auto-vinculadas) y **frená hasta recibir respuesta**:

```markdown
Para que esta interfaz salga única y con impacto real (sin plantillas genéricas), armé 3 direcciones concretas:

1. **Crisp Editorial ([Chasis])** — [Paleta luz/acento + par tipográfico]. *Pieza firma*: [detalle tipográfico/espacial sin JS pesado]. *(Skills: `tailwind-4`, `refactoring-ui`, `micro-interactions`)*
2. **Interactive Kinetic ([Chasis])** — [Paleta luz/acento + ritmo]. *Pieza firma*: [elemento interactivo útil pensada para el usuario — ej. ruleta de estilos, comparador vivo o timeline scrubbed]. *(Skills: `emil-kowalski`, `motion-gsap`, `micro-interactions`)*
3. **[Immersive Stage / Editorial SVG según Dominio] ([Chasis H])** — [Inversión lateral de cliché]. *Pieza firma `[Beyond-Baseline]`*: [escena 3D/shader acotada en zona focal o diagrama SVG arquitectónico]. *(Skills: [`scroll-world-storytelling` / `three-js-web` / `shader-dev` | `frontend-slides-deck`])*

Elegí `1`, `2` o `3` (podés ajustar modo claro/oscuro, color o pedir "desde cero"), y si querés usar un modelo específico de tu API key para construir el frontend indicalo acá `[opcional · default: actual]`.
```

- **Fallback "desde cero"**: solo si el usuario pide responder las 5 dimensiones manuales (Personalidad/Anti-Referencia, Geometría, Luz/Acento, Tipografía, Detalle Firma), desplegá las 5 preguntas en un solo bloque.
- **One-Shot (`"one-shot"` / `"sin preguntas"` / `"sorprendeme"` / Swarms)**: elegí automáticamente la Opción 2 o 3 habilitada por la Matriz de Dominio, registrá el `Design Read` y escribí `DESIGN_SYSTEM.md` completo antes de codificar.

---

## ⚡ Modo One-Shot Compacto (`D1b Synthesis`)

```markdown
### 🧠 D1b One-Shot Creative Synthesis
1. **Esencia y Anti-Referencia**: [3 adjetivos] | Jamás parecerse a: [Cliché de la industria a evitar]
2. **Inversión Lateral (Think Outside the Box)**: [Cliché dominante] -> Invertido en: [Metáfora única]
3. **Chasis y Diales**: [Arquetipo A-H] (`DESIGN_VARIANCE: X, MOTION_INTENSITY: Y, VISUAL_DENSITY: Z`)
4. **Arquitectura de Color (OKLCH)**: `--surface-base`, `--surface-raised`, `--text-primary`, `--accent-primary`, `--border-subtle`
5. **Sistema Tipográfico**: `--font-display`, `--font-sans`, `--font-mono` (`tabular-nums` solo en métricas/código)
6. **Física Espacial (3 Reglas Mecánicas)**: [Grid/proporción] · [Superficie/radios/elevación] · [Respiro/espacio negativo]
7. **Coreografía & Rule of One**: [Curva/spring + zona focal única + 80% canvas calmo + `prefers-reduced-motion`]
8. **Firma de Oficio (`[Beyond-Baseline]`)**: [El detalle bespoke que define esta interfaz]
```

---

## 🧬 Las 3 Reglas Generativas Mecánicas por Chasis

Todo `DESIGN_SYSTEM.md` asienta las 3 leyes mecánicas del chasis elegido. **Regla transversal**: *"cero cards genéricas"* significa **espacio negativo, escala tipográfica y contraste tonal**, jamás reemplazar tarjetas por cientos de cajitas `0–2px` con borde `1px`.

| Chasis | Regla 1 (Layout / Grilla) | Regla 2 (Superficie / Radios / Bordes) | Regla 3 (Tipografía / Interacción) |
|---|---|---|---|
| **A. Monograph** | Grilla asimétrica 1:3 con índice sticky | Divisores estructurales `1px` solo entre secciones; cero cajitas alrededor de links | Contraste Serif/Sans + notas marginales limpias |
| **B. Spec-Sheet** | Matriz densa de 12 columnas compactas | Celdas con borde compartido (`0–4px`), sin sombras pesadas | `font-variant-numeric: tabular-nums` obligatorio |
| **C. Gallery** | Lienzo vacío `>= 45%` del viewport | Cero bordes divisores innecesarios; separación por espacio negativo | Escala bipolar (`clamp(2.75rem, 6vw, 5.5rem)` vs `0.75rem`) |
| **D. Kinetic** | Viewport fijo `100dvh` con lienzo central | Paneles HUD flotantes (`backdrop-filter` con `@supports` fallback) | Transiciones físicas por resorte + atajos directos |
| **E. Precision** | Jerarquía de paneles colapsables y listas densas | Micro-radios `6px-8px`, bordes de luminancia sutil `1px` | Navegación `Cmd+K` y estados hover instantáneos (`<120ms`) |
| **F. Humanist** | Flujo de lectura centrado (`60-70ch`) y grillas amables | Superficies cálidas en capas suaves, radios `10px-16px`, elevación sutil | Micro-copy empático y transiciones suaves |
| **G. System Native** | Layouts estándar de alta claridad y predecibilidad | Tokens semánticos puros sobre primitivas accesibles (Radix/Shadcn) | Foco en velocidad de tarea y consistencia |
| **H. Bespoke (Out of the Box)** | **Definida por inversión lateral del cliché** | **Radios, elevación y materialidad acordes a la metáfora (nunca 0–2px por reflejo)** | **Definida por la firma interactiva `[Beyond-Baseline]`** |
