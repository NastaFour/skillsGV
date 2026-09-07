# Matriz de Prohibiciones Absolutas y Reglas de Bloqueo — taste-skill

Cualquier violación a estos 10 "Absolute Bans" constituye un fallo automático de producción (no una advertencia).

---

## 🚫 Los 10 Absolute Bans de la Gobernanza Estética

1. **Em-Dashes (—) y En-Dashes (–) en Copy Visible**:
   - Completamente prohibido el uso de guiones largos (—) o medios (–) en textos visibles para el usuario final (títulos, subtítulos, párrafos, botones, badges).
   - *Solución*: Usar un guión simple (-) o reescribir la frase para prescindir de la pausa artificial de IA.
   - *Nota*: Esta regla aplica al copy visible de la UI, no a la documentación técnica interna.

2. **The Lila Rule / AI-Purple Ban**:
   - Prohibida la inserción sistemática de gradientes violeta-púrpura neón con efectos de brillo en botones, bordes o fondos de tarjetas.
   - *Solución*: Paletas neutras sobrias (Zinc, Slate, Stone, Neutral) combinadas con un único acento cromático justificado.

3. **Premium-Consumer Beige/Brass Palette Ban**:
   - Prohibido el uso cliché de fondos marfil/crema (`#f5f1ea`, `#f7f5f1`, `#efeae0`, `#ece6db`) combinados con acentos latón/óxido (`#b08947`, `#b6553a`, `#9a2436`) y textos espresso (`#1a1714`).
   - *Solución*: Rotar obligatoriamente a direcciones modernas como *Cold Luxury* (plata + cromo + gris frío), *Forest* (verde profundo + ámbar), o *Cobalt + Cream*.

4. **Banned Section-Numbering Eyebrows (01 / 02 / 03)**:
   - Prohibido prefijar secciones con números secuenciales (`01 / ABOUT`, `02 / FEATURES`, `03 / PRICING`) salvo que la interfaz describa un flujo ordenado interactivo real o una cronología temporal genuina.

5. **Side-Stripe Card Accent Borders**:
   - Prohibido colocar bordes laterales coloreados con grosor mayor a 1px como elementos ornamentales de acento en tarjetas o banners informativos.

6. **Gradient Text Overload**:
   - Prohibido aplicar degradados en texto mediante `background-clip: text` y colores transparentes en párrafos o textos largos.
   - *Tolerancia máxima*: Exclusivamente en títulos Hero principales y con un límite de **máximo 3 palabras**.

7. **SaaS Cliché: Hero-Metric Template**:
   - Prohibido el patrón sistemático de mostrar una fila horizontal de 3 métricas numéricas gigantescas con subtítulos enanos sobre una caja con gradiente sutil bajo el Hero.

8. **Scroll-Hijack mediante `window.addEventListener('scroll')`**:
   - Ban absoluto de escuchas de scroll síncronas en JavaScript para animaciones en cliente.
   - *Solución*: Usar CSS Scroll-Driven Animations nativas, `IntersectionObserver` o GSAP ScrollTrigger con `ScrollTrigger.kill()` explícito al desmontar.

9. **Div-Based Fake Product UI**:
   - Prohibido construir representaciones falsas de terminales, paneles de chat, dashboards o bloques de código mediante divs y CSS decorativo en el Hero.
   - *Solución*: Utilizar capturas de pantalla de la aplicación real o gráficos vectoriales abstractos limpios.

10. **Banned Scroll Cues**:
    - Prohibidas las etiquetas flotantes como *"Scroll to explore"*, *"↓ scroll"* o animaciones en bucle de ratones de ordenador al pie del Hero.

---

## 🔒 Reglas de Consistencia (Locks de Diseño)

Estas directrices no son opcionales; son restricciones de ingeniería frontend:

- **Un solo acento OKLCH**: Máximo 1 color de acento principal por viewport, con saturación estricta `< 80%`. Replicar idéntico en focus rings, badges y llamadas activas.
- **Techo Tipográfico Hero**: `clamp(2.5rem, 5vw + 1rem, 6rem)` (techo absoluto de 6rem / ~96px). Todo tamaño superior se clasifica como grito visual.
- **Suelo de Letter-Spacing (Tracking Floor)**: Para títulos grandes en negrita, el suelo mínimo es `-0.04em`. Prohibido bajar a `-0.05em` o `-0.08em` (provoca colisión de glifos).
- **Italic Descender Clearance**: Al usar palabras en cursiva (*italic*) dentro de títulos, aplicar `leading-[1.15]` mínimo y `pb-1` para evitar el corte físico de descendentes (y, g, j, p, q) en WebKit/Blink.
- **Radios de Borde Controlados**:
  - Tarjetas y contenedores: máximo **`12px` o `16px`** (`rounded-xl`). Prohibido sobre-redondear con radios de 32px o 40px en rectángulos grandes.
  - Botones e inputs: `6px - 8px` o pastilla perfecta `9999px` cuando el brief lo exija.
- **Espacio de Navegación**: Barra de navegación con altura máxima de **`80px`** en una sola línea horizontal. Sin badges flotantes falsos ("Available for work").
- **Disciplina del Hero Section**:
  - Máximo 4 elementos de texto en jerarquía: eyebrow, titular (max 2 líneas), subtexto (max 20 palabras, max 4 líneas) y CTA.
  - Padding superior desktop limitado a `pt-24` máximo.
  - Todo el bloque visible en viewport inmediato (*above-the-fold*).
- **Ancho de Prosa**: Párrafos y bloques de lectura restringidos a **`65ch - 75ch`**.
- **Prohibición de Inter como Default**: Prohibido usar la fuente *Inter* como predeterminado perezoso sin justificación de brief. Explorar tipografías con contraste de ejes (Serif+Sans, Geometric+Humanist).
- **Accesibilidad de Movimiento**: `prefers-reduced-motion` obligatorio siempre que el dial `MOTION_INTENSITY > 3`.
- **Estabilidad de Viewport**: Usar siempre `min-h-[100dvh]` en lugar de `h-screen` para evitar saltos por barras retráctiles de navegador móvil.
- **Bento Grids**: Al menos el 30% de las celdas deben contener variación de textura (foto real, patrón abstracto o color sólido contrastante), y tener exactamente $N$ celdas funcionales para $N$ elementos (sin relleno vacío).
