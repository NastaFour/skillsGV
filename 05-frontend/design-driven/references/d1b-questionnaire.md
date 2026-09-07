# Cuestionario de Unicidad D1b (5 Bloques Obligatorios) — design-driven

> **Regla de oro**: Un bloque por turno. Mínimo 8 preguntas en total. Si el usuario responde "no sé / lo que quieras", proponer 2 opciones concretas y esperar elección. Nunca rellenar bloques vacíos con defaults ni asumir preferencias de marca.

---

## Bloque 1 · Las 3 P's (Persona, Dolor, Promesa)

1. **Persona**: ¿Quién es el usuario principal? (Edad, oficio, contexto de uso diario). ¿Cuáles son 3 adjetivos de la sensación que debe transmitir y cuál es su tono de voz?
2. **Dolor**: ¿Qué problema o frustración concreta paga por resolver esta interfaz?
3. **Promesa**: ¿Qué valor o certeza inmediata se lleva el usuario en los primeros 10 segundos de interacción?
*(Si responde "no sé": proponer 2 opciones contrastadas, ej. "Profesional clínico riguroso" vs "Plataforma accesible y pedagógica", y esperar).*

---

## Bloque 2 · Diales Triaxiales y Vibe Espacial

4. **Calibración de Diales (1-10)**:
   - `DESIGN_VARIANCE`: ¿Estructura simétrica (1-3), asimetría controlada con offset (4-7), o diseño editorial artístico (8-10)?
   - `MOTION_INTENSITY`: ¿Estático con hover sutil (1-3), transiciones fluidas CSS (4-7), o coreografía avanzada GSAP/Motion (8-10)?
   - `VISUAL_DENSITY`: ¿Espacio amplio tipo galería/lujo (1-3), app diaria estándar (4-7), o cockpit denso de datos con font-mono (8-10)?
   *(Si no elige: ofrecer 2 perfiles cerrados, ej. "Editorial 8/6/3" vs "SaaS Técnico 4/5/7", y esperar).*
5. **Anclaje de Scroll**: ¿La página debe tener cadencia narrativa con anclaje rítmico al descender o funcionar como una aplicación densa fija?

---

## Bloque 3 · Referencias Reales y Anti-Referencias

6. **Referencias Positivas**: Proporcionar 3-5 URLs reales (Godly, Awwwards, 21st.dev, Dribbble, Figma o producto vivo) indicando qué se toma exactamente de cada una (paleta, tipografía, retícula o micro-interacción). *Nunca aceptar "inspirado en Linear" sin URL o captura concreta*.
7. **Anti-Referencias**: Proporcionar 2-3 ejemplos de productos, sitios o patrones que NO gustan y por qué, para prohibirlos explícitamente.

---

## Bloque 4 · Firma (Signature) y Heartbeat

8. **Elemento de Firma**: ¿Cuál es el elemento icónico e inolvidable que el usuario recordará tras usar la aplicación una sola vez?
9. **Acento Cromático**: Definir 1 único color de acento primario OKLCH (saturación estricta < 80%).
10. **Par Tipográfico en Contraste**: Definir el emparejamiento tipográfico por contraste de ejes (Serif + Sans, Geometric + Humanist, o una familia explotada). *Inter queda prohibido como default perezoso*.
11. **Límites de Hero**: Techo tipográfico clamp a 6rem máximo y suelo de letter-spacing a `-0.04em`.
12. **Pantalla Corazón (Heartbeat)**: ¿Cuál es LA pantalla o dato crítico que no puede fallar bajo ninguna circunstancia?

---

## Bloque 5 · Anti-Slop Negativo y Restricciones Reales

13. **Lista de Prohibiciones (Bans)**: Confirmar la aplicación de los 10 Absolute Bans (cero em-dashes en UI, no gradientes violeta neón, no beige/brass cliché, no fake product divs, no scroll cues) más los odios estéticos específicos del usuario.
14. **Límites de Dependencias**: ¿Hasta dónde se puede implementar? (Solo CSS nativo vs librerías aprobadas como GSAP, Motion o componentes curados de 21st.dev).
15. **Restricciones de Entrega**: Nivel de accesibilidad requerido (WCAG AA), idioma/localización y fecha límite.
