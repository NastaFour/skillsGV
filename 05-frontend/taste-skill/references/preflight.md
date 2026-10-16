# Matriz de Verificación Mecánica "Pre-Flight Check" — taste-skill

Antes de entregar cualquier pantalla o componente a producción, verificar cada punto de esta lista. Cualquier fallo puntual bloquea el paso al estado de producción.

## Checklist Mecánico Obligatorio

- [ ] **Design Read Declarado**: ¿Se declaró en el chat el "Design Read" unificado de 3 líneas (o Fast-Path de 1 línea para diffs <50 líneas) antes de emitir código?
  > ```
  > 1. Direction / Chassis: [Archetype] — [Why it fits the domain]
  > 2. Hierarchy & Tokens:  [Hero element, --surface-*, --accent-* from DESIGN_SYSTEM.md]
  > 3. Craft Signature:     [Fine detail, micro-interaction, or [Beyond-Baseline: <reason>]]
  > ```
  > *(Fast-Path para diffs <50 líneas: `Reading this as: [Audience/Product], [Vibe/Tokens], [Stack/Signature]`)*
- [ ] **Diales Calibrados**: ¿Los tres diales numéricos `DESIGN_VARIANCE`, `MOTION_INTENSITY` y `VISUAL_DENSITY` (1-10) fueron fijados explícitamente y justificados por el brief?
- [ ] **Mobile Variance Override**: Si `DESIGN_VARIANCE >= 4`, ¿el layout colapsa a una sola columna limpia (`w-full`, `px-4`, `py-8`) en pantallas menores a 768px?
- [ ] **No-Inter Default**: ¿Se ha evitado el uso del tipo de letra *Inter* como predeterminado perezoso sin justificación, usando emparejamiento con contraste de ejes?
- [ ] **Contraste Lumínico AA (4.5:1)**: ¿Todos los textos, botones e inputs superan la barrera WCAG AA de contraste de luminosidad mínima de `4.5:1` frente a su fondo (`3:1` en texto display grande)?
- [ ] **CTA en Una Sola Línea**: ¿Se ha asegurado que ningún texto de botón de llamada a la acción (CTA) se corte o divida en 2 o más líneas en pantallas de escritorio?
- [ ] **Bento Grid con Textura**: ¿El Bento Grid cuenta con al menos 30% de celdas con variación visual (fotografía real, patrón abstracto o fondo contrastante) y exactamente $N$ celdas para $N$ elementos?
- [ ] **Anclaje de Scroll**: ¿La propiedad de anclaje de desplazamiento `overflow-anchor: none` está definida explícitamente en elementos dinámicos o animados?
- [ ] **Scroll-Snapping Nativo**: ¿La implementación de Scroll Snapping utiliza exclusivamente CSS nativo `scroll-snap-type: y mandatory` sin escuchas JS pesadas?
- [ ] **Heurística de Guiones Tipográficos (Nivel 2)**: ¿Se evitaron guiones largos (—) y medios (–) como muletilla de copy en la interfaz (permitidos en prosa editorial o si el contexto literario lo justifica con `[Beyond-Baseline]`)?
- [ ] **Heurística de Radios de Borde (Nivel 2)**: ¿Los radios de tarjetas están calibrados entre 12px y 16px (`rounded-xl`), usando radios >16px o pastillas solo cuando el dominio lúdico/infantil o consumo masivo lo justifique con `[Beyond-Baseline]`?
- [ ] **Cero Gradientes Lila / Cliché Beige**: ¿La paleta está libre de gradientes violeta neón y libre del cliché beige/latón de IA?
- [ ] **Viewport Estable**: ¿La altura del viewport principal utiliza `min-h-[100dvh]` y nunca `h-screen`?
- [ ] **Accesibilidad de Movimiento**: ¿Si `MOTION_INTENSITY > 3`, se incluye soporte obligatorio de `@media (prefers-reduced-motion: reduce)`?
- [ ] **Límites de Hero**: ¿El Hero Section tiene máximo 4 elementos de texto, padding superior `<= pt-24`, y es visible completo above-the-fold?
- [ ] **Prosa Ergonómica**: ¿Los bloques de texto de lectura están restringidos a `65ch - 75ch` de ancho?
