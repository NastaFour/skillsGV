# Gobernanza Estética: Invariantes y Heurísticas contra Clichés de IA — taste-skill

Esta guía establece el **Piso de Calidad con Techo Abierto (Floor, Not Ceiling)**: previene el "slop" genérico de IA y los errores graves de UX, mientras autoriza la audacia estética y la libertad creativa cuando el contexto lo amerita.

---

## 🛡️ Nivel 1 — Invariantes de Calidad (Hard Anti-Slop / Innegociables)

Estas reglas protegen la integridad técnica, accesibilidad y honestidad del producto. No admiten excepciones:

1. **Cero Datos Falsos o Cosplay Decorativo (Tufte Anti-Slop)**:
   - Prohibido `Lorem ipsum`, métricas fabricadas sin significado real (ej. gráficas inventadas de subida constante) y simulación de consolas o telemetría falsa (`SYS_STATUS: 0x4F`) cuando el producto no posee datos reales.
   - *Solución*: Usar copy con significado contextual real, métricas reales o capturas del producto en funcionamiento.

2. **Cero Estados Interactivos Faltantes**:
   - Todo elemento accionable (botones, links, inputs, cards cliqueables) debe implementar explícitamente todos sus estados: `hover`, `focus-visible` (con ring de contraste alto), `active`, `disabled`, `loading` y `error`.

3. **Cumplimiento de Accesibilidad y Contraste WCAG 2.2**:
   - Contraste mínimo de 4.5:1 para texto normal y 3:1 para texto grande/componentes interactivos.
   - Suelo tipográfico mínimo de 12px (`0.75rem` / `clamp(0.75rem, ...)`), con peso $\ge 500$ en metadatos y etiquetas.

4. **Respeto Obligatorio a `prefers-reduced-motion`**:
   - Toda animación o transición superior a un fundido inmediato debe desactivarse o simplificarse cuando el usuario tenga activa la preferencia de reducción de movimiento.

5. **Prohibición de Scroll-Hijacking síncrono en JS**:
   - Prohibido bloquear o alterar el scroll nativo mediante escuchas síncronas `window.addEventListener('scroll')`. Usar CSS scroll-driven animations, `IntersectionObserver` o GSAP ScrollTrigger con limpieza adecuada (`kill()`).

---

## 🎨 Nivel 2 — Heurísticas contra Clichés de IA (Context-Aware & Overrideable)

Estas heurísticas señalan patrones que los modelos de lenguaje suelen abusar sin pensar. Son **puntos de partida y advertencias de oficio**, NO prohibiciones absolutas. Si el dominio del producto (e-commerce de autor, editorial, lujo, artesanía, consumo) o una propuesta creativa fundamentada del modelo lo requiere, **pueden usarse libremente** justificando brevemente el beneficio (`[Beyond-Baseline: <razón técnica/creativa>]`).

1. **AI-Purple & Gradientes Genéricos**:
   - *Por qué suele ser cliché*: Los gradientes violeta/azul saturados con glow neón sobre fondos oscuros se han convertido en el cliché visual del "SaaS genérico de IA".
   - *Libertad contextual*: Prefiere paletas con identidad contextual y un acento cromático justificado. Si el producto es Web3, gaming, sintetizadores o diseño retro-futurista donde estos gradientes son idóneos, su uso está autorizado.

2. **Paletas Cálidas (Crema, Terracota, Latón, Espresso)**:
   - *Por qué suele ser cliché*: El uso indiscriminado de fondos marfil con acento terracota en sitios que no lo requieren.
   - *Libertad contextual*: En e-commerce de moda, diseño interior, productos artesanales, gastronomía, editoriales o marcas de lujo, las paletas cálidas son ricas, humanas y 100% permitidas.

3. **Numeración Editorial y Eyebrows (01 / 02 / 03)**:
   - *Por qué suele ser cliché*: Prefijar secciones arbitrarias con números genera falsa jerarquía sin valor de lectura.
   - *Libertad contextual*: En guías paso a paso, flujos de onboarding, tutoriales, cronologías históricas o publicaciones editoriales, es bienvenido y aporta orden.

4. **Radios de Borde Generosos (`rounded-2xl`, `rounded-3xl`, `rounded-full`)**:
   - *Por qué suele ser cliché*: Sobre-redondear tarjetas densas de telemetría o dashboards compactos reduce el área útil.
   - *Libertad contextual*: En productos de consumo masivo, apps infantiles, interfaces móviles o diseño lúdico y cercano, los radios suaves (16px a 24px) o pastillas completas son altamente efectivos.

5. **Guiones Tipográficos (— / –)**:
   - *Por qué suele ser cliché*: La IA abusa de los em-dashes como muletilla para pausas artificiales en microcopy publicitario.
   - *Libertad contextual*: En textos editoriales, literatura o artículos donde las convenciones ortográficas lo demanden, se pueden emplear con total naturalidad.

6. **Tipografía Predeterminada (Inter como piloto automático)**:
   - *Por qué suele ser cliché*: Usar Inter por pereza sin considerar la personalidad del producto.
   - *Libertad contextual*: Inter es excelente para dashboards operacionales si se elige con deliberación; combinar Serif + Sans o Sans geométrica + Mono aporta diferenciación.

7. **Zonificación de Monospace**:
   - *Por qué suele ser cliché*: Usar monospace para párrafos enteros degrada la velocidad de lectura un 25-30%.
   - *Libertad contextual*: Reserva fuentes monoespaciadas para telemetría, código, identificadores y números tabulares (`tabular-nums`).

---

## 🔒 Reglas de Consistencia (Locks de Diseño)

- **Acentos**: Mantener control sobre la saturación para no fatigar la vista (1 acento dominante por pantalla, saturación $<80\%$ en áreas extensas).
- **Techo Tipográfico Hero**: `clamp(2.5rem, 5vw + 1rem, 6rem)` para evitar tamaños monstruosos que desborden la ventana.
- **Tracking Floor**: Mínimo `-0.04em` en encabezados grandes para evitar colisión de glifos.
- **Estabilidad de Viewport**: Usar `min-h-[100dvh]` en lugar de `h-screen` para soportar barras móviles dinámicas.
- **Física de Movimiento Explícita**: Evitar `all 0.3s ease`; animar propiedades aceleradas por GPU (`transform`, `opacity`) con física acorde al chasis.
