---
name: content-studio
description: "Generación modular de piezas multicanal (artículos, hilos, notas) desde una idea central. Úsala para multiplicar contenidos de marca. No usar para pipelines de renderizado de video 3D."
license: MIT
allowed-tools: Read Bash(node:*)
metadata:
  version: "1.0.0"
  trigger: ["content studio", "estudio de contenido", "reutilizacion de contenido", "newsletter copy", "hilo de twitter", "anuncio de producto"]
  scope: [global, project]
---

# 🎙️ Content Studio — Multiplicación y Adaptación Multicanal

Motor de producción y reciclaje de contenido modular. Permite tomar un activo nuclear de alta profundidad (documento de lanzamiento, post técnico, investigación o cambio arquitectónico) y transformarlo quirúrgicamente en múltiples piezas optimizadas para diferentes canales, maximizando el alcance sin diluir el rigor técnico ni la voz de marca.

---

## 📋 Cuándo Usar

- Al lanzar una nueva versión de producto o funcionalidad relevante y necesitar cobertura coordinada.
- Al transformar un artículo largo o documento de arquitectura en publicaciones para redes sociales y correo.
- Al redactar notas de versión (*release notes*) y changelogs orientados tanto a usuarios finales como a ingenieros.
- Al crear hilos educativos para X/Twitter o reflexiones técnicas de negocio para LinkedIn.

**No usar para**:
- Pipelines de renderizado o edición de video 3D/animaciones (usar `11-mcp-hybrid/motion-video-pipeline`).
- Planificación estratégica a largo plazo de pilares temáticos o embudos (usar `01-planning-process/content-strategy`).
- Creación de código para generadores de sitios estáticos (usar `02-dev-roles/feature-implementer`).

---

## 🚦 Reglas Duras

1. **Un solo origen de verdad**: Toda derivación multicanal debe sustentarse en hechos comprobados y verificados en el documento fuente principal.
2. **Cero copypaste intercanal**: Cada plataforma tiene su propio lenguaje nativo y dinámicas de consumo. No publiques el mismo párrafo en LinkedIn que en un changelog.
3. **Cero clickbait deshonesto**: Los ganchos deben generar curiosidad legítima basada en el valor real del contenido, jamás en exageraciones vacías.
4. **Respeto a la densidad informativa**: Si un hilo de X no puede explicar el matiz completo, debe enlazar a la fuente original en lugar de simplificar hasta la falsedad.
5. **Alineación con las guías de marca**: La modulación del formato jamás justifica perder los pilares de tono definidos en la identidad de marca.

---

## 🛠️ Metodología Paso a Paso (Motor 1 a 5)

A partir de 1 documento fuente (ej. un nuevo release o migración técnica), extrae y construye 5 artefactos específicos:

### 1. Hilo de Twitter/X (Desglose Dinámico)
- **Tweet 1 (Gancho)**: Problema no resuelto o lección contraintuitiva + qué se logró.
- **Tweets 2 a 4 (El Núcleo)**: Explicación de los 3 aprendizajes o decisiones de diseño con capturas o snippets.
- **Tweet 5 (Conclusión)**: Resultado medible alcanzado.
- **Tweet 6 (Llamado a la acción)**: Enlace a la documentación profunda o repositorio.

### 2. Publicación de LinkedIn (Perspectiva Profesional / Post-Mortem)
- **Líneas 1-2 (Gancho de scroll)**: Dilema de ingeniería o de negocio que generó el cambio.
- **Cuerpo (El Proceso)**: El conflicto ("Intentamos X, pero falló en producción debido a Y").
- **El Hallazgo**: La solución arquitectónica y el principio rector.
- **Impacto**: Métricas reales (tiempo ahorrado, costes reducidos, estabilidad).
- **Pregunta de cierre**: Invitación honesta al debate entre profesionales.

### 3. Resumen de Newsletter (Tono Cercano y Curaduría)
- **Asunto claro**: Promesa de valor sin mayúsculas exageradas.
- **Apertura personal**: Breve contexto de por qué este cambio importa para la comunidad.
- **Resumen ejecutivo**: 3 puntos clave con explicaciones concisas.
- **Enlace directo de lectura profunda**: Acceso al recurso completo.

### 4. Release Notes para Usuarios (Orientado a Beneficios)
- **Qué cambió**: Descripción simple en lenguaje no técnico.
- **Por qué te beneficia**: Cómo mejora el flujo de trabajo diario del usuario.
- **Cómo empezar a usarlo**: Pasos de activación inmediata.

### 5. Changelog Técnico (Registro Estructurado)
- Formato estructurado tipo *Keep a Changelog* (Added, Changed, Deprecated, Removed, Fixed, Security).
- Referencias exactas a versiones, commits o PRs.

---

## 💡 Ejemplos de Implementación

### Caso: "Migración de Base de Datos Monolítica a Réplicas de Lectura"

#### Fragmento del Hilo de X/Twitter
```markdown
1/5 Migrar una base de datos con 50M de registros sin downtime parece imposible hasta que separas las lecturas pesadas.

Aquí está el resumen técnico de cómo pasamos de 98% de uso de CPU a menos de 20% sin gastar más en hardware: 👇
```

#### Fragmento de Post de LinkedIn
```markdown
Escalar bases de datos no siempre requiere máquinas más grandes. A menudo requiere repensar los patrones de acceso.

El mes pasado, nuestras consultas de reportes comenzaron a ahogar las escrituras críticas de producción. La tentación habitual era duplicar el tamaño de la instancia en la nube. En su lugar, implementamos réplicas de solo lectura y enrutamiento inteligente de conexiones a nivel de aplicación.

El resultado:
- Reducción del 75% en latencia de consultas pesadas.
- Costo de infraestructura idéntico al mes anterior.
- Cero segundos de interrupción para los usuarios.

¿Qué criterio usan en sus equipos para decidir entre escalar verticalmente o separar lecturas y escrituras?
```

#### Fragmento de Changelog Técnico
```markdown
### Changed
- Conexiones de solo lectura redirigidas automáticamente a réplicas geográficas secundarias para endpoints `/reports` y `/analytics`.
- Latencia p95 de transacciones de escritura reducida a 14ms (antes 85ms).
```

---

## 🚫 Anti-Patrones

- **Tratar a todas las redes como canales de broadcast unidireccional**: Publicar enlaces huérfanos sin aportar valor autónomo en el propio post.
- **Deformar la verdad técnica para ganar viralidad**: Inventar afirmaciones absolutistas como "Esta tecnología está muerta" para forzar engagement.
- **Descuidar a los usuarios en las release notes**: Explicar los cambios en jerga interna que solo los desarrolladores del equipo entienden.
- **Inconsistencia de tiempos verbales**: Mezclar pasado y presente de forma desordenada en notas de versión.
