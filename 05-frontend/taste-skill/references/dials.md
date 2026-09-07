# Calibración Triaxial de Diales — taste-skill

El comportamiento y estructura espacial de la interfaz se calibran matemáticamente mediante un vector triaxial de diales numéricos del **1 al 10**:

$$\vec{T} = \begin{bmatrix} \text{DESIGN\_VARIANCE} \\ \text{MOTION\_INTENSITY} \\ \text{VISUAL\_DENSITY} \end{bmatrix}$$

Cada dial modula decisiones concretas de CSS, layout y librerías de animación:

---

## 1. DESIGN_VARIANCE (1-10) — Desviación de Simetría Estándar

Controla la tensión espacial, balance de rejilla y alineación estructural:

- **1-3 (Predictivo / Simétrico)**:
  - Estructuras puramente simétricas, rejilla tradicional de 12 columnas con fracciones idénticas.
  - Alineación central absoluta o regular.
  - Recomendado para portales gubernamentales, entidades bancarias y aplicaciones corporativas conservadoras.
- **4-7 (Offset / Asimétrico Moderado)**:
  - Desplazamientos espaciales controlados (`margin-top: -2rem` para traslapes elegantes).
  - Relaciones de aspecto combinadas (4:3 junto a 16:9).
  - Encabezados alineados a la izquierda conviviendo con métricas centradas.
  - Típico de B2B moderno y SaaS de producto técnico.
- **8-10 (Asimetría Radical / Editorial)**:
  - Composiciones de revista de arte o diseño editorial de vanguardia.
  - Retículas masonry, columnas con proporciones asimétricas deliberadas (`2fr 1fr 1fr`).
  - Zonas amplias de espacio negativo intencional (`padding-left: 20vw` o márgenes desalineados).
- **Mobile Override (<768px)**:
  - Si `DESIGN_VARIANCE` está entre **4 y 10**, el layout en pantallas móviles (<768px) DEBE colapsar obligatoriamente a una columna limpia (`w-full`, `px-4`, `py-8`) para evitar roturas y scroll horizontal accidental.

---

## 2. MOTION_INTENSITY (1-10) — Nivel de Animación

Regula la presencia física de movimiento y transiciones:

- **1-3 (Estático)**:
  - Sin animaciones de entrada automáticas ni desplazamientos complejos en cliente.
  - Interacciones restringidas a estados `:hover` y `:active` instantáneos.
  - Modo `prefers-reduced-motion` activo por defecto.
- **4-7 (Fluido CSS / Aceleración GPU)**:
  - Transiciones suaves con curvas de aceleración física (`transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1)`).
  - Entradas en cascada (`animation-delay`) controladas.
  - Animaciones limitadas estrictamente a propiedades aceleradas por GPU (`transform`, `opacity`).
- **8-10 (Coreografía Avanzada)**:
  - Efectos cinematográficos y animaciones dirigidas por scroll.
  - Uso de GSAP con ScrollTrigger, paralelaje dinámico o resortes físicos con Motion v11 / Framer Motion.
- **Hard Ban de Scroll**:
  - Prohibido de forma absoluta el uso de `window.addEventListener('scroll')` en JavaScript.
  - Utilizar en su lugar CSS Scroll-Driven Animations, `useScroll` de Motion, `IntersectionObserver` o GSAP ScrollTrigger con `ScrollTrigger.kill()` explícito en el desmontaje.

---

## 3. VISUAL_DENSITY (1-10) — Información por Viewport

Define la compresión de información y relación de aire por pantalla:

- **1-3 (Galería / Lujo)**:
  - Enfoque en el espacio negativo y aire estético.
  - Separaciones generosas de sección (`py-32` a `py-48`).
  - Escala tipográfica amplia con poco texto por viewport.
  - Marcas de lujo, manifiestos de diseño y portafolios de autor.
- **4-7 (App Diaria / SaaS)**:
  - Espaciado estándar comercial (`py-16` a `py-24`).
  - Equilibrio óptimo entre densidad de controles y legibilidad ergonómica.
- **8-10 (Cockpit / Dashboard Analítico)**:
  - Máxima concentración de datos por píxel (finanzas, trading, monitoreo).
  - Paddings mínimos, eliminación total de tarjetas decorativas en favor de líneas separadoras sutiles de 1px.
  - **Requisito Obligatorio**: uso estricto de tipografía monoespaciada (`font-mono`) para cualquier valor numérico para garantizar el alineamiento tabular.
