---
name: humanizer
description: "Elimina clichés sintéticos y patrones robóticos de IA para recuperar un tono humano natural. Úsala para desintoxicar textos. No usar para formateo de código fuente o JSON."
license: MIT
allowed-tools: Read Bash(node:*)
metadata:
  version: "1.0.0"
  trigger: ["humanizer", "humanise text", "humanizar texto", "anti slop de texto", "quitar tono ia", "voz humana natural"]
  scope: [global, project]
---

# ✍️ Humanizer — Depuración Anti-Slop y Voz Natural

Herramienta y guía estilística para desintoxicar textos de las firmas sintéticas típicas de los modelos de lenguaje (LLMs). Restaura la cadencia, especificidad y contundencia de una voz humana experta, erradicando muletillas predecibles, estructuras simétricas forzadas y retórica inflada.

---

## 📋 Cuándo Usar

- Al revisar borradores generados por asistentes de IA para documentación, artículos o comunicados.
- Al redactar páginas de producto, newsletters o manuales que suenen genéricos o desapasionados.
- Al auditar textos técnicos para eliminar relleno verbal y tecnicismos burocráticos.
- Para inyectar personalidad, ritmo y franqueza en contenidos corporativos rígidos.

**No usar para**:
- Formateo de código fuente, linters o esquemas JSON/YAML (usar `06-code-quality/biome` o `06-code-quality/typescript`).
- Redacción publicitaria de respuesta directa pura (usar `01-planning-process/copywriting`).
- Corrección de bugs o depuración lógica de software (usar `02-dev-roles/expert-debugger`).

---

## 🚦 Reglas Duras

1. **Cero tolerancia a frases de relleno de IA**: Frases como "en el vertiginoso mundo actual", "sumergirse en" o "un tapiz de posibilidades" deben eliminarse sin piedad.
2. **Prohibido el resumen redundante**: Elimina conclusiones mecánicas que comiencen con "En conclusión", "En resumen" o "En última instancia". Si el texto hizo su trabajo, el lector ya lo entendió.
3. **Variabilidad métrica obligatoria**: Alterna oraciones de 4 palabras con oraciones de 20 palabras. Los LLMs producen oraciones de longitud casi idéntica; los humanos crean música al escribir.
4. **Voz activa por defecto**: Sustituye construcciones pasivas ("la función es ejecutada por el sistema") por acción directa ("el sistema ejecuta la función").
5. **Especificidad sobre abstracción**: Cambia adjetivos vacíos ("una solución increíblemente potente") por hechos comprobables ("procesa 10,000 eventos por segundo con latencia inferior a 5ms").

---

## 🛠️ Metodología Paso a Paso

### 1. Barrido de Clichés Sintéticos (Lexical Purge)
Detecta y extirpa la lista negra de tics algorítmicos:
- ❌ *"En el vertiginoso mundo actual / In today's fast-paced world"* ➔ **Acción directa**.
- ❌ *"Sumergirse en / Delve into / Dive deep into"* ➔ **Explorar, examinar, analizar**.
- ❌ *"Es un testimonio de / It is a testament to"* ➔ **Demuestra, evidencia, prueba**.
- ❌ *"Un tapiz de posibilidades / A rich tapestry"* ➔ **Múltiples opciones, variedad real**.
- ❌ *"Aprovechar al máximo / Leverage the power of"* ➔ **Usar, aplicar, exprimir**.
- ❌ *"Es crucial recordar / It is vital to note"* ➔ **Declara el hecho directamente**.
- ❌ *"Cambiador de juego / Game changer / Revolucionario"* ➔ **Nombra la mejora concreta**.

### 2. Romper la Cadencia Monótona (Sentence Rhythm)
Aplica la regla de Gary Provost sobre la música del lenguaje:
- Escribe una frase corta.
- Luego agrega otra de longitud media que explique el contexto con soltura.
- De vez en cuando, cuando el argumento lo requiera, encadena una oración más larga y articulada que desarrolle la idea completa, guiando la mente del lector hasta un punto de descanso natural.
- Y remata. Con fuerza.

### 3. Poda de Perífrasis y Voz Pasiva
- Reemplaza "procede a llevar a cabo la inicialización" por "inicializa".
- Reemplaza "sirve para proporcionar la capacidad de" por "permite".
- Reemplaza "tiene un impacto negativo en" por "empeora" o "ralentiza".

### 4. Prueba de Lectura en Voz Alta
Lee el texto como si estuvieras frente a un colega en un café:
- Si te quedas sin aire, la frase es artificialmente enrevesada.
- Si suena a folleto corporativo de 2005, elimina los adjetivos ceremoniales.
- Si no dirías esa palabra en una conversación real, no la escribas.

---

## 💡 Ejemplos de Implementación

### Ejemplo 1: Introducción a Documentación Técnica
- **Versión IA (Slop)**:
  > "En el vertiginoso mundo digital de hoy en día, sumergirse en la optimización de bases de datos es un testimonio de la dedicación de un equipo. Es crucial recordar que aprovechar al máximo las consultas es vital para desbloquear todo el potencial de la aplicación. En última instancia, esto conducirá a un rendimiento estelar."
- **Versión Humanizada**:
  > "Las bases de datos lentas arruinan la experiencia del usuario. Optimizar consultas no requiere magia: basta con indexar los campos correctos y eliminar lecturas innecesarias. Esta guía muestra cómo reducir el tiempo de respuesta a la mitad sin cambiar de hardware."

### Ejemplo 2: Anuncio de Lanzamiento de Feature
- **Versión IA (Slop)**:
  > "Nos complace anunciar una experiencia revolucionaria que redefine el tapiz de la gestión de tareas, aprovechando herramientas innovadoras para un flujo de trabajo sin fisuras."
- **Versión Humanizada**:
  > "Agregamos filtros guardados y atajos de teclado. Ahora puedes revisar tus tareas pendientes en la mitad del tiempo."

---

## 🚫 Anti-Patrones

- **Adjetivitis aguda**: Apilar calificativos ("innovador, disruptivo, holístico, transformador") para compensar la falta de sustancia.
- **Transiciones mecánicas de manual**: Forzar conectores en cada párrafo ("Por consiguiente", "No obstante lo anterior", "Dicho esto").
- **Tono neutro despersonalizado**: Escribir como si nadie tuviera una opinión o una postura clara sobre el tema.
- **Simetría forzada en viñetas**: Hacer que todas las viñetas tengan exactamente la misma longitud y comiencen con el mismo tiempo verbal de forma artificial.
