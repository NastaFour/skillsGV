# Spline — alternativa no-code para 3D web

Spline (https://spline.design) es un editor 3D visual en el navegador: se diseña la escena con interfaz gráfica y se publica embebida o exportada. Esta skill lo documenta como **sección de alternativa no-code**, no como stack de código.

## Cuándo elegirlo

- El equipo no tiene perfil técnico 3D y necesita una escena puntual (hero, ilustración interactiva).
- Prototipado rápido de dirección visual 3D antes de invertir en three.js/R3F.
- Landing pages donde la escena es contenido de diseño, no parte de la lógica de la app.

## Cuándo NO elegirlo

- Escenas acopladas a estado de la aplicación, datos dinámicos o lógica de negocio → R3F.
- Presupuesto de performance estricto: el runtime embebido pesa más que un bundle R3F afinado.
- Requisitos de accesibilidad/testing profundos sobre la escena.
- Necesidad de versionar la escena como código en el repo (Spline vive en su editor/cloud).

## Trade-offs resumidos

| Dimensión | Spline | three.js + R3F + drei |
|---|---|---|
| Curva de entrada | Baja (visual) | Alta (WebGL + React) |
| Control fino / lógica | Limitado | Total |
| Performance | Buena en casos simples | Optimizable a fondo |
| Integración con app React | Embed/iframe o runtime | Componentes nativos |
| Mantenimiento | Editor externo | Código en repo |

## Puntos de integración

- **Embed/iframe**: copiar el snippet de publicación; simple, menos control, carga diferida recomendada (`loading="lazy"`).
- **Runtime `@splinetool/react-spline`**: componente React que monta la escena; soporta eventos básicos declarados en el editor.
- Híbrido realista: Spline para el hero estático-interactivo + R3F cuando el producto exige lógica.

## Regla de decisión

Si la escena va a necesitar **una sola** de estas cosas — datos dinámicos, tests automatizados, performance afinada o versionado en git — empezar por [r3f-patterns.md](r3f-patterns.md) y usar Spline solo para explorar dirección de arte.
