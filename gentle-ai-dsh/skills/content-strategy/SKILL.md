---
name: content-strategy
description: "Planificación estratégica de contenidos orientada a las etapas de embudo (TOFU/MOFU/BOFU). Úsala para guiar el viaje del usuario. No usar para optimización técnica de servidores web."
license: MIT
allowed-tools: Read Bash(node:*)
metadata:
  version: "1.0.0"
  trigger: ["content strategy", "estrategia de contenido", "pilares de contenido", "embudo de contenidos", "tofu mofu bofu", "calendario de contenido"]
  scope: [global, project]
---

# 🗺️ Content Strategy — Estrategia de Contenidos y Embudo de Conversión

Marco estratégico para planificar, producir y distribuir activos de contenido alineados a las fases del viaje del usuario (*customer journey*). Conecta las necesidades informativas de prospectos y clientes con objetivos de negocio concretos mediante arquitectura de temas, modelos de atribución y distribución multicanal.

---

## 📋 Cuándo Usar

- Al planificar el calendario editorial de un blog técnico, canal de YouTube o newsletter.
- Al diseñar una estrategia de atracción de usuarios orgánicos y posicionamiento de autoridad.
- Al estructurar una arquitectura de contenidos en silos o clusters temáticos para SEO y valor del usuario.
- Al alinear la producción de piezas editoriales con objetivos de adquisición (leads), activación o retención.

**No usar para**:
- Optimización técnica de servidores web, proxies o cabeceras HTTP (usar `08-devops/cloudflare-edge`).
- Redacción táctica de micro-piezas individuales como tweets o posts (usar `01-planning-process/content-studio`).
- Creación de código para gestión de contenidos o CMS (usar `02-dev-roles/feature-implementer`).

---

## 🚦 Reglas Duras

1. **Cada pieza debe tener un objetivo de embudo asignado**: No produzcas contenido "porque sí". Todo artículo o guía debe pertenecer explícitamente a TOFU, MOFU o BOFU.
2. **Distribución proporcional a la creación**: Dedica al menos tanto tiempo a distribuir el contenido por canales propios y ganados como el que dedicas a redactarlo.
3. **Pillar & Cluster como estructura no negociable**: Ningún post satélite vive aislado; debe enlazar y nutrir una página pilar de referencia.
4. **Métricas de negocio sobre métricas vanidosas**: El valor del contenido se mide por retención, activación de cuentas y conversiones asistidas, no únicamente por impresiones superficiales.
5. **Calidad y profundidad sobre volumen masivo**: Una guía exhaustiva con datos originales supera a diez resúmenes superficiales reciclados.

---

## 🛠️ Metodología Paso a Paso

### 1. Mapeo del Embudo de Contenido (Full-Funnel Alignment)

#### A. TOFU (Top of Funnel) — Descubrimiento y Conciencia
- **Objetivo**: Atraer a personas que experimentan síntomas del problema pero aún no conocen soluciones formales.
- **Formato**: Artículos educativos generales, infografías, glosarios conceptuales, tendencias de la industria.
- **Tono**: Divulgativo, empático y libre de venta agresiva.

#### B. MOFU (Middle of Funnel) — Consideración y Educación Técnica
- **Objetivo**: Ayudar al usuario a evaluar diferentes enfoques y arquitecturas para resolver su dolor.
- **Formato**: Comparativas objetivas ("Enfoque A vs. Enfoque B"), guías paso a paso, calculadoras, plantillas de trabajo.
- **Tono**: Técnico, analítico y pragmático.

#### C. BOFU (Bottom of Funnel) — Decisión y Compra
- **Objetivo**: Demostrar por qué tu producto específico es la mejor elección para el caso de uso del prospecto.
- **Formato**: Casos de estudio con métricas reales, guías de migración desde herramientas rivales, desgloses de ROI, comparativas de producto.
- **Tono**: Resolutivo, respaldado por evidencia y enfocado en minimizar el riesgo de adopción.

### 2. Arquitectura de Contenidos: Modelo Pillar & Cluster
- **Página Pilar (Pillar Page)**: Un documento exhaustivo y exhaustivo sobre un tema macro (ej. *"Guía Definitiva de Arquitectura de Microservicios"*).
- **Contenidos Cluster (Satélites)**: Artículos específicos que profundizan en subtemas del pilar (ej. *"Patrón Saga en Node.js"*, *"Resiliencia con Circuit Breakers"*, *"Trazabilidad distribuida con OpenTelemetry"*).
- **Interlinking bidireccional**: Cada satélite enlaza al pilar central, y el pilar referencia a los satélites.

### 3. Matriz de Distribución por Canales
- **Canales Propios (Owned)**: Blog corporativo, newsletter semanal, documentación técnica, changelog.
- **Canales Compartidos (Shared)**: Comunidades en Reddit, foros de desarrolladores, GitHub Discussions, X/Twitter, LinkedIn.
- **Canales Ganados (Earned)**: Menciones orgánicas en podcasts, newsletters curadas por terceros y recomendaciones de la comunidad.

### 4. Cuadro de Mando y Métricas de Rendimiento
- **Atracción**: Visitantes únicos calificados, ranking en búsquedas orgánicas, porcentaje de clics (CTR).
- **Interés y Retención**: Tiempo de lectura promedio, profundidad de scroll (>75%), tasa de suscripción a newsletter.
- **Conversión de Negocio**: Registros de usuarios atribuibles, descargas de recursos clave, ingresos influenciados por contenido.

---

## 💡 Ejemplos de Implementación

### Plan de Cluster Temático: "Seguridad en CI/CD"
```markdown
# [Pillar Page]
- Título: "Guía Integral de Seguridad en Pipelines de Integración y Despliegue Continuo (2026)"
- Embudo: MOFU / BOFU
- Objetivo: Convertirse en la referencia de cabecera de la industria.

# [Clusters Satélites]
1. TOFU: "Los 5 errores más comunes al gestionar secretos en entornos de CI"
   - Canal: Publicación en blog + resumen en X/Twitter.
2. MOFU: "Análisis estático de código vs. Auditoría de dependencias: Cómo combinarlos"
   - Canal: Blog técnico + infografía explicativa en LinkedIn.
3. BOFU: "Cómo una fintech redujo a cero sus incidentes de supply chain con validación automatizada"
   - Canal: Caso de estudio con descarga en PDF + llamada a demo.
```

---

## 🚫 Anti-Patrones

- **Fábrica de humo sin estrategia**: Publicar 5 artículos por semana sin saber a qué público se dirigen ni qué acción se espera que tomen.
- **Ignorar el BOFU**: Centrarse exclusivamente en artículos introductorios virales sin crear contenido que ayude a cerrar ventas.
- **El cementerio de contenido**: Publicar un artículo excelente y jamás volver a compartirlo ni actualizarlo con nuevos datos.
- **Venta prematura en TOFU**: Tratar de forzar una llamada comercial en un artículo que solo pretendía responder una duda conceptual básica.
