# Vocabulario de Comandos — Impeccable (Paul Bakaus)

Impeccable estructura la interacción de diseño agéntico a través de 23 comandos especializados clasificados por su tipo de acción: Create, Evaluate y Refine.

## Comandos de Creación (Create)

| Comando | Qué hace (1 línea) | Cuándo NO usarlo |
|---|---|---|
| `/impeccable shape` | Planifica la experiencia de usuario y el árbol de componentes en frío antes de codificar. | No usar para codificar componentes directos (usar `craft`). |
| `/impeccable craft` | Ejecuta el ciclo completo: planificar, iterar sobre visuales y programar en código real. | No usar si no existen `PRODUCT.md` y `DESIGN.md` (usar `init` primero). |

## Comandos de Evaluación (Evaluate)

| Comando | Qué hace (1 línea) | Cuándo NO usarlo |
|---|---|---|
| `/impeccable critique` | Análisis heurístico y semántico de jerarquía visual y carga cognitiva del layout. | No usar para verificar suites de test o compilación de código. |
| `/impeccable audit` | Evaluación automatizada de rendimiento, accesibilidad (WCAG AA 4.5:1) y responsividad. | No usar para rediseñar la estética visual (usar `polish` o `layout`). |

## Comandos de Refinamiento (Refine)

| Comando | Qué hace (1 línea) | Cuándo NO usarlo |
|---|---|---|
| `/impeccable polish` | Corrección iterativa alineada a tokens de `DESIGN.md` para erradicar AI tells y slop. | No usar en prototipado temprano sin tokens ni paleta aprobada. |
| `/impeccable typeset` | Ajuste fino de emparejamiento tipográfico, tracking (`-0.04em` floor) y leading. | No usar si se requiere alterar la paleta cromática (usar `colorize`). |
| `/impeccable colorize` | Inyección dirigida de paleta de acento con 1 único acento OKLCH saturación <80%. | No usar para reestructurar la cuadrícula o espaciado (usar `layout`). |
| `/impeccable layout` | Reparación de jerarquías espaciales, paddings erráticos y alineación grid/flex. | No usar para añadir transiciones o micro-interacciones (usar `animate`). |
| `/impeccable bolder` | Incrementa expresividad y contraste visual en interfaces tímidas o excesivamente neutras. | No usar si la pantalla ya está visualmente saturada (usar `quieter`). |
| `/impeccable quieter` | Atenúa ruido visual y reduce ornamentos innecesarios en interfaces recargadas. | No usar si la interfaz es plana y carece de jerarquía clara (usar `bolder`). |
| `/impeccable distill` | Simplifica el código estructural eliminando divs anidados y clases CSS redundantes. | No usar antes de estabilizar la lógica de negocio del componente. |
| `/impeccable harden` | Robustece la interfaz ante text-overflow, i18n, estados de carga y fallos de red. | No usar durante fases de bocetado o exploración creativa inicial. |
| `/impeccable onboard` | Diseña flujos de bienvenida, empty states informativos y disparadores de activación. | No usar para pantallas internas densas de usuarios recurrentes. |
| `/impeccable animate` | Incorpora micro-interacciones con curvas físicas aceleradas por GPU y propósito semántico. | No usar para efectos cinematográficos de scroll pesado (usar `motion-gsap`). |
| `/impeccable delight` | Inserta detalles de interacción sutiles y momentos memorables alineados a la marca. | No usar en paneles cockpit o dashboards analíticos de alta densidad. |
| `/impeccable overdrive` | Habilita capacidades gráficas avanzadas como shaders WebGL y físicas 2D en DOM. | No usar cuando el presupuesto de rendimiento exija dial MOTION_INTENSITY <= 3. |
| `/impeccable clarify` | Pule los textos de interfaz (UX copy), eliminando jerga, meta-frases y ambigüedad. | No usar para cambiar contratos de API o esquemas de datos del backend. |
| `/impeccable adapt` | Reorganiza el layout para factores de forma diversos usando Container Queries. | No usar si la versión de escritorio base aún no está resuelta. |
| `/impeccable optimize` | Diagnostica y corrige ineficiencias de renderizado en cliente y re-renders innecesarios. | No usar como sustituto de una arquitectura de estado bien planteada. |
| `/impeccable live` | Modo interactivo local en vivo con HMR para ajustes en caliente (Beta opcional). | No usar en CI/CD headless ni en entornos sin soporte de navegador local. |
