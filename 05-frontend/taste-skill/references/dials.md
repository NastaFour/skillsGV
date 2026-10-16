# Calibración Triaxial de Diales y Chasis Arquetípicos — taste-skill

El comportamiento y estructura espacial de la interfaz se calibran matemáticamente mediante un vector triaxial de diales numéricos del **1 al 10**:

$$\vec{T} = \begin{bmatrix} \text{DESIGN\_VARIANCE} \\ \text{MOTION\_INTENSITY} \\ \text{VISUAL\_DENSITY} \end{bmatrix}$$

---

## 🏛️ Matriz de Presets por Chasis Arquetípico

En lugar de calibrar diales en el vacío, el vector $\vec{T}$ se pre-calibra automáticamente según el **Chasis Arquetípico** seleccionado en D1b:

| Chasis Arquetípico | Vector $\vec{T}$ [DV, MI, VD] | Perfil de Retícula y Espacio | Física de Movimiento Cuantitativa | Fallback CSS Nativo |
|---|---|---|---|---|
| **Technical Monograph** | $[7, 2, 8]^T$ | Retícula asimétrica 1:3 (`main` + aside). Hairlines 1D (`border-b`). | Sobre-amortiguado: `stiffness: 300, damping: 45, mass: 1.0` (80-140ms sin rebote). | `cubic-bezier(0.25, 1, 0.5, 1)` 120ms |
| **Industrial Spec-Sheet** | $[3, 1, 9]^T$ | Matriz 12/16 columnas. Tabular nums. Monospace zonificado. | Instantáneo/Linear: `step-end` o linear 60ms. Retículo crosshair en hover. | `linear` 60ms o `step-end` |
| **The Gallery / Space Tension** | $[9, 4, 2]^T$ | Vacío activo $\ge 45\%$. Escala bipolar con escalón de anclaje. | Alta inercia: `stiffness: 110, damping: 22, mass: 1.6` (500-800ms, stagger 60ms). | `cubic-bezier(0.16, 1, 0.3, 1)` 600ms |
| **The Kinetic Utility** | $[4, 8, 7]^T$ | Viewport fijo `100dvh` (`overflow-hidden`). HUDs flotantes $\le 24\text{px}$. | Resorte crítico veloz: `stiffness: 480, damping: 38, mass: 0.6` (seguimiento 1:1). | `cubic-bezier(0.34, 1.56, 0.64, 1)` 180ms |
| **The Precision Instrument** | $[4, 5, 7]^T$ | Densidad calibrada (`p-2.5` a `p-4`), micro-radios 6-8px, atajos `Cmd+K`. | Hardware acelerado: `cubic-bezier(0.16, 1, 0.3, 1)` (150-200ms en transform/opacity). | `cubic-bezier(0.16, 1, 0.3, 1)` 180ms |
| **The Humanist Companion** | $[5, 4, 5]^T$ | Warm consumer/editorial/health/education. Ritmo orgánico, aire generoso y tipografía conversacional. | Resorte orgánico: `stiffness: 220, damping: 24, mass: 1.0` (250-350ms suave). | `cubic-bezier(0.22, 1, 0.36, 1)` 280ms |
| **The System Native (Enterprise)** | $[3, 2, 7]^T$ | Hereda tokens y retícula del sistema existente (Shadcn, MUI, Tailwind). | Estándar operativo comercial, sobrio y predecible. | `cubic-bezier(0.2, 0, 0, 1)` 150ms |
| **Bespoke / Creative Exploration** | Variable $[\text{DV}, \text{MI}, \text{VD}]^T$ | Híbrido justificado o arquitectura espacial a medida del dominio. | Resortes o curvas calibradas para la experiencia específica. | Declarado en `DESIGN_SYSTEM.md` |

---

## 1. DESIGN_VARIANCE (1-10) — Desviación de Simetría Estándar

Controla la tensión espacial, balance de rejilla y alineación estructural:

- **1-3 (Predictivo / Simétrico)**:
  - Estructuras puramente simétricas, rejilla tradicional de 12 columnas con fracciones idénticas.
  - Alineación central absoluta o regular.
  - Recomendado para portales corporativos conservadores, B2B enterprise y paneles administrativos (System Native).
- **4-7 (Offset / Asimétrico Moderado)**:
  - Desplazamientos espaciales controlados (`margin-top: -2rem` para traslapes elegantes).
  - Relaciones de aspecto combinadas (4:3 junto a 16:9).
  - Encabezados alineados a la izquierda conviviendo con métricas centradas.
  - Típico de B2B moderno y SaaS de producto técnico (Precision Instrument).
- **8-10 (Asimetría Radical / Editorial)**:
  - Composiciones de revista de arte o diseño editorial de vanguardia (The Gallery, Monograph).
  - Retículas masonry, columnas con proporciones asimétricas deliberadas (`2fr 1fr 1fr` o `3fr 1fr`).
  - Zonas amplias de espacio negativo intencional (`padding-left: 20vw` o márgenes desalineados).
- **Mobile Override (<768px)**:
  - Si `DESIGN_VARIANCE >= 4` **O** `VISUAL_DENSITY >= 8` (incluyendo Industrial Spec-Sheet y Technical Monograph), el layout en pantallas móviles (<768px) DEBE colapsar obligatoriamente a una columna limpia (`w-full`, `px-4`, `py-8`) o tarjetas apiladas con scroll horizontal aislado por tabla para evitar desbordes y roturas de viewport.

---

## 2. MOTION_INTENSITY (1-10) — Nivel de Animación

Regula la presencia física de movimiento y transiciones:

- **1-3 (Estático / Mecánico)**:
  - Sin animaciones de entrada automáticas ni desplazamientos complejos en cliente.
  - Interacciones restringidas a estados `:hover` y `:active` instantáneos o sobre-amortiguados.
  - Modo `prefers-reduced-motion` activo por defecto.
- **4-7 (Fluido CSS / Aceleración GPU)**:
  - Transiciones suaves con curvas de aceleración física (`transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease`).
  - Entradas en cascada (`animation-delay`) controladas.
  - Animaciones limitadas estrictamente a propiedades aceleradas por GPU (`transform`, `opacity`).
- **8-10 (Coreografía Avanzada / Kinetic)**:
  - Efectos cinematográficos, manipulación directa de canvas, resortes físicos interactivos (Motion v11 / GSAP).
  - Preservación de velocidad gestual e interrupción inmediata al interactuar.
- **Hard Ban de Scroll**:
  - Prohibido de forma absoluta el uso de `window.addEventListener('scroll')` en JavaScript.
  - Utilizar en su lugar CSS Scroll-Driven Animations, `useScroll` de Motion, `IntersectionObserver` o GSAP ScrollTrigger con `ScrollTrigger.kill()` explícito en el desmontaje.
- **Prohibición de Transiciones Genéricas**:
  - Prohibido el uso indiscriminado de `transition: all 0.3s ease`. Toda transición debe usar propiedades explícitas y la física de resortes o el Fallback CSS Nativo del arquetipo.

---

## 3. VISUAL_DENSITY (1-10) — Información por Viewport

Define la compresión de información y relación de aire por pantalla:

- **1-3 (Galería / Lujo)**:
  - Enfoque en el espacio negativo y aire estético (The Gallery).
  - Separaciones generosas de sección (`py-32` a `py-48`).
  - Escala tipográfica amplia con poco texto por viewport.
  - Marcas de lujo, manifiestos de diseño y portafolios de autor.
- **4-7 (App Diaria / SaaS / Humanist / System Native)**:
  - Espaciado estándar comercial (`py-16` a `py-24`).
  - Equilibrio óptimo entre densidad de controles y legibilidad ergonómica.
- **8-10 (Cockpit / Dashboard Analítico / Spec-Sheet)**:
  - Máxima concentración de datos por píxel (finanzas, trading, monitoreo, telemetría).
  - Paddings mínimos, eliminación total de tarjetas decorativas en favor de líneas separadoras sutiles de 1px.
  - **Requisito Obligatorio**: uso estricto de tipografía monoespaciada (`font-mono`) y `tabular-nums` para cualquier valor numérico para garantizar el alineamiento tabular. Monospace prohibido para bloques de lectura narrativa.
