# Flujo de Trabajo en Escala de Grises (Grayscale First)

Metodología táctica de diseño inspirada en *Refactoring UI* (Adam Wathan & Steve Schoger).

---

## 1. Por qué los Desarrolladores Fracasan al Empezar con Color

Cuando comienzas a maquetar una interfaz eligiendo colores desde el primer minuto, te enfrentas a demasiadas variables simultáneas:
- Tono, saturación y luminosidad.
- Contraste de texto.
- Espaciado, distribución y densidad.
- Jerarquía de la información.

Al forzar el uso de colores en etapas tempranas, es común compensar una mala jerarquía tipográfica o un espaciado deficiente añadiendo más colores (ej. un título azul, una etiqueta verde y una fecha naranja). El resultado es una interfaz ruidosa y desorganizada.

---

## 2. El Protocolo en 4 Fases

### Fase 1: Estructura Monocromática Pura
- Construye la pantalla utilizando únicamente:
  - Blanco puro (`#ffffff`) o fondo base neutral.
  - Fondos de contenedor en grises muy suaves (`slate-50`, `slate-100`).
  - Líneas divisorias apenas perceptibles (`border-slate-200/60`).
  - Textos en tres niveles de gris:
    - **Primario**: `slate-900` para títulos y datos principales.
    - **Secundario**: `slate-600` para descripciones y etiquetas secundarias.
    - **Terciario**: `slate-400` para metadatos, timestamps y texto de apoyo.

### Fase 2: Resolver Jerarquía por Peso y Tono
- Antes de pensar en color, pregúntate: *¿Puede un usuario distinguir qué elemento es más importante en menos de un segundo?*
- Si dos textos compiten:
  - Aumenta el peso del texto principal (`font-semibold` o `font-bold`).
  - Reduce el tono del texto complementario (`text-slate-500`).
  - Nunca agrandes el tamaño tipográfico de forma desmedida si puedes resolver la jerarquía mediante el contraste de peso y luminosidad.

### Fase 3: Evaluación de Densidad y Espaciado
- Evalúa el balance espacial en blanco y negro:
  - ¿Hay suficiente espacio en blanco entre bloques desconectados?
  - ¿Están los elementos relacionados visiblemente agrupados por proximidad?

### Fase 4: Reintroducción Estratégica del Color
Una vez que la interfaz funciona de forma impecable en blanco y negro:
1. **Asignar el color primario de marca únicamente a las llamadas a la acción principales (CTA)**: botón de guardar, enlace de acción principal o interruptor activo.
2. **Asignar colores semánticos con moderación**:
   - Rojo/Rose únicamente para estados de error o destrucción.
   - Verde/Emerald únicamente para confirmación o balance positivo.
   - Ámbar/Yellow únicamente para advertencias pendientes.
3. Si un elemento no requiere acción inmediata del usuario, **déjalo en escala de grises**.
