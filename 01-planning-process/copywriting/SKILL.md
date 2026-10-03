---
name: copywriting
description: "Redacción publicitaria persuasiva y de respuesta directa para convertir visitantes en clientes. Úsala para landing pages, anuncios y llamados a la acción. No usar para manuales técnicos o APIs."
license: MIT
allowed-tools: Read Bash(node:*)
metadata:
  version: "1.0.0"
  trigger: ["copywriting", "copy persuasivo", "conversion copy", "pas framework", "aida copywriting", "propuesta de valor"]
  scope: [global, project]
---

# 🎯 Copywriting — Redacción Persuasiva y Conversión Directa

Metodología de redacción publicitaria orientada a la respuesta directa y la conversión medible. Transforma propuestas técnicas en argumentos irresistibles mediante psicología de decisión, marcos de persuasión probados y eliminación quirúrgica de objeciones.

---

## 📋 Cuándo Usar

- Al redactar titulares, subtítulos y llamadas a la acción en landing pages y sitios web.
- Al escribir anuncios publicitarios (Google Ads, LinkedIn, Meta, newsletters patrocinadas).
- Al optimizar la tasa de conversión (CRO) en flujos de checkout, registro o actualización de planes.
- Al redactar secuencias de correos comerciales fríos o de reactivación de clientes inactivos.

**No usar para**:
- Manuales técnicos de referencia, endpoints OpenAPI o documentación de código (usar `02-dev-roles/technical-writer`).
- Estructuración de narrativa global de marca o mitología de producto (usar `01-planning-process/storybrand-messaging`).
- Definición de estilos CSS, layouts o tipografías (usar `05-frontend/tailwindcss` o `05-frontend/frontend-design`).

---

## 🚦 Reglas Duras

1. **Beneficios sobre características**: Cada característica técnica (*feature*) debe traducirse a un beneficio tangible y a un resultado final para el usuario.
2. **Promesa específica y creíble**: Los titulares deben incluir números, plazos o evidencias concretas. Las afirmaciones vagas como "mejora tus resultados" matan la conversión.
3. **Un solo objetivo por pieza de copy**: Toda página o anuncio debe perseguir una única acción deseada (un solo CTA principal). Las opciones secundarias distraen y reducen clics.
4. **Matar las objeciones antes del botón**: El micro-copy alrededor de los botones de acción debe desactivar miedos inmediatos (costo, permanencia, tiempo de instalación).
5. **Cero humo**: Jamás prometas resultados que el producto no pueda cumplir. La persuasión sostenible se basa en la verdad amplificada con claridad, no en el engaño.

---

## 🛠️ Metodología Paso a Paso

### 1. Selección del Marco de Conversión
Elige la estructura psicológica adecuada según el nivel de conciencia del lector:

#### A. PAS (Problem — Agitate — Solve)
Ideal para prospectos que son conscientes de su dolor pero no conocen la solución.
- **Problem**: Enuncia el dolor exacto del lector con empatía cruda.
- **Agitate**: Muestra el costo financiero, emocional u operativo de postergar la solución.
- **Solve**: Presenta tu producto como el alivio lógico, inmediato y definitivo.

#### B. AIDA (Attention — Interest — Desire — Action)
Estructura clásica para páginas completas y correos de venta.
- **Attention**: Titular disruptivo con gancho inesperado.
- **Interest**: Estadísticas relevantes, historias breves o casos de uso demostrables.
- **Desire**: Beneficios directos, testimonios y demostración del estado transformado.
- **Action**: Llamado a la acción claro, urgente y sin fricción.

#### C. BAB (Before — After — Bridge)
Fórmula de contraste rápido para anuncios y correos directos.
- **Before**: Tu situación actual llena de fricción y cuellos de botella.
- **After**: Cómo se siente el éxito cuando el trabajo fluye sin esfuerzo.
- **Bridge**: Tu producto como el puente directo entre ambos mundos.

### 2. Cadena Feature ➔ Benefit ➔ Outcome (FBO)
Aplica la prueba del *"¿Y qué?"*:
- **Feature (Qué es)**: *"Copias de seguridad automáticas cada 15 minutos en múltiples regiones geográficas."*
- **Benefit (Qué hace por mí)**: *"Tus datos nunca se pierden, incluso ante una caída total del proveedor de nube."*
- **Outcome (Qué significa para mi vida)**: *"Evita perder días de trabajo y la confianza de tus clientes ante cualquier incidente inesperado."*

### 3. Redacción de Titulares de Alto Impacto
Aplica fórmulas comprobadas de titulares:
- **La fórmula del resultado sin dolor**: `[Resultado deseado]` sin `[Mayor objeción o molestia habitual]`.
  - *Ejemplo: "Monitorea tus microservicios sin saturar a tu equipo con alertas falsas."*
- **La fórmula del cómo lograrlo**: `Cómo [Lograr meta codiciada] en [Plazo realista]`.
  - *Ejemplo: "Cómo reducir tu factura en la nube un 35% en los primeros 30 días."*

### 4. Optimización de Micro-Copy y Click Triggers
Transforma los puntos de contacto de alta fricción:
- **Texto del botón**: Enfocado en el valor recibido, no en la tarea a realizar.
  - ❌ *"Enviar formulario"* / *"Registrarse"*
  - ✅ *"Empezar gratis en 60 segundos"* / *"Ver mi informe personalizado"*
- **Click Triggers (junto al botón)**:
  - *"Sin tarjeta de crédito requerida."*
  - *"Cancela en 1 clic cuando quieras."*
  - *"Cumple con GDPR y SOC-2 Tipo II."*

---

## 💡 Ejemplos de Implementación

### Estructura de Landing Page B2B (Framework PAS)
```markdown
## [Problem]
Pierdes 8 horas a la semana conciliando facturas a mano en hojas de cálculo.

## [Agitate]
Un solo error de tipeo en un número de cuenta puede costarte miles de dólares en auditorías, retrasar pagos a proveedores y dejarte hasta la medianoche cuadrando números mientras tu competencia automatiza y escala.

## [Solve]
Nuestra plataforma sincroniza tus bancos, concilia transacciones en tiempo real con 99.8% de precisión y genera reportes listos para auditoría con un solo clic.

[Botón CTA]: Automatizar mis Conciliaciones Gratis
*Configuración en 3 minutos. Sin llamadas de ventas forzadas.*
```

---

## 🚫 Anti-Patrones

- **Copy centrado en el ego**: Llenar párrafos con "Somos la plataforma más galardonada" en vez de hablar de los problemas del usuario.
- **Titulares clickbait sin entrega de valor**: Prometer cielo y tierra para generar clics que rebotan en 3 segundos al notar el engaño.
- **Voz pasiva y verbos débiles**: Usar "Puedes tener la posibilidad de intentar..." en lugar de "Crea", "Acelera", "Controla".
- **Botones con texto transaccional frío**: Usar "Submit" o "Siguiente" perdiendo la última oportunidad de recordar el beneficio.
