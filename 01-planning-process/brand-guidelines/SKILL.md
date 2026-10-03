---
name: brand-guidelines
description: "Estandarización de tono de voz, pilares de mensaje y personalidad de marca. Úsala para definir la identidad verbal de un producto. No usar para hojas de estilo CSS ni tokens de diseño."
license: MIT
allowed-tools: Read Bash(node:*)
metadata:
  version: "1.0.0"
  trigger: ["brand guidelines", "guias de marca", "tono de voz", "personalidad de marca", "pilares de mensaje", "guia de estilo editorial"]
  scope: [global, project]
---

# 🛡️ Brand Guidelines — Tono de Voz y Pilares de Marca

Guía operativa para construir, documentar y estandarizar la identidad verbal, los pilares de mensajería y el tono de voz de un producto digital. Asegura que todos los puntos de contacto (producto, marketing, soporte, documentación) transmitan una personalidad coherente, reconocible y alineada a los valores de la empresa.

---

## 📋 Cuándo Usar

- Al fundar un nuevo producto y requerir una personalidad editorial consistente.
- Al alinear a equipos multidisciplinarios (diseño, ingeniería, soporte, marketing) bajo un mismo estándar de comunicación.
- Al redactar guías de estilo para redactores, desarrolladores o creadores de contenido externos.
- Al revisar mensajes de error en interfaz, correos transaccionales o respuestas de soporte para verificar coherencia de tono.

**No usar para**:
- Hojas de estilo CSS, variables de Tailwind o tokens de diseño visual (usar `05-frontend/design-system-tokens` o `05-frontend/tailwindcss`).
- Generación de paletas cromáticas o logotipos vectoriales (usar herramientas de diseño gráfico).
- Redacción de micro-copy publicitario de conversión táctica (usar `01-planning-process/copywriting`).

---

## 🚦 Reglas Duras

1. **La voz no cambia; el tono se modula según el contexto**: La voz es la personalidad inmutable de la marca (ej. directa, experta, cercana). El tono se adapta al momento del usuario (empático en un error 500, celebratorio al completar un hito, sobrio en una factura).
2. **La matriz 'Qué somos vs Qué NO somos' debe ser accionable**: Evita obviedades. Cada par debe delimitar una frontera clara de comportamiento editorial.
3. **Glosario canónico obligatorio**: Define términos oficiales de producto que jamás deben sustituirse por sinónimos coloquiales para no confundir al usuario.
4. **Pilares de mensajería jerarquizados**: Limita a un máximo de 3 o 4 pilares centrales. Más de cuatro diluye el posicionamiento y confunde a los redactores.
5. **Cero tecnicismos innecesarios en la comunicación general**: Usa el nivel de precisión técnica que requiera la audiencia, pero sin arrogancia ni hermetismo.

---

## 🛠️ Metodología Paso a Paso

### 1. Calibración del Espectro de Voz (Voice Dimensions)
Evalúa y posiciona la marca en 4 ejes clave (escala 1 a 5):
- **Formal vs. Coloquial**: ¿Trato de "usted" solemne o tuteo cercano y profesional?
- **Audaz vs. Prudente**: ¿Posturas firmes y desafiantes o neutralidad diplomática?
- **Técnico vs. Accesible**: ¿Vocabulario para arquitectos de software o explicaciones comprensibles para todo usuario de negocio?
- **Serio vs. Humorístico**: ¿Enfoque 100% utilitario o toques de ingenio sutil donde no estorbe?

### 2. Construcción de la Matriz de Identidad
Define contrastes nítidos que guíen las decisiones diarias de redacción:
| Qué somos | Qué NO somos | Razón operativa |
|---|---|---|
| **Directos y concisos** | Bruscos o desinteresados | Respetamos el tiempo del usuario sin perder la amabilidad. |
| **Expertos y rigurosos** | Pedantes o condescendientes | Compartimos conocimiento con claridad, sin mirar al usuario por encima del hombro. |
| **Innovadores y audaces** | Temerarios o exagerados | Avanzamos con fundamentos técnicos, sin vender promesas irreales. |
| **Empáticos y serviciales** | Sumisos o excesivamente disculpatorios | Asumimos responsabilidad en los errores y ofrecemos soluciones inmediatas. |

### 3. Establecimiento de los Pilares de Valor Innegociables
Establece los 3 pilares que sostienen cada mensaje:
1. **Rendimiento implacable**: Hacemos que cada interacción sea rápida y eficiente.
2. **Privacidad y soberanía de datos**: La seguridad de nuestros clientes está antes que cualquier métrica de crecimiento.
3. **Simplicidad radical**: Eliminamos la complejidad innecesaria para que el usuario logre su meta sin tropiezos.

### 4. Glosario Canónico: Palabras Preferidas vs. Prohibidas
Crea la tabla de coherencia terminológica:
| Usar siempre | Evitar a toda costa | Contexto / Explicación |
|---|---|---|
| *Espacio de trabajo* | *Organización / Tenant* | Término accesible para usuarios finales dentro de la interfaz. |
| *Conectar / Vincular* | *Enganchar / Integrar (en UI)* | Más directo y amigable para usuarios no técnicos. |
| *Comenzar prueba* | *Regístrese ahora* | Enfocado en el beneficio inmediato en lugar de la tarea burocrática. |
| *Incidencia resuelta* | *Problema arreglado* | Mantiene el rigor profesional sin sonar informal. |

---

## 💡 Ejemplos de Implementación

### Modulación de Tono por Canal

#### Mensaje de Error (Canal: UI de Producto)
- ❌ **Incorrecto (Frío o robótico)**: *"Error 500: Fallo de ejecución en el servidor interno."*
- ❌ **Incorrecto (Demasiado bromista)**: *"¡Ups! Nuestros monos programadores derramaron café sobre el servidor."*
- ✅ **Alineado a guías de marca**: *"No pudimos guardar los cambios. Tu información no se ha perdido. Reintenta en unos segundos o contacta a soporte si persiste."*

#### Email de Onboarding (Canal: Email Marketing)
- ✅ **Alineado a guías de marca**: *"Bienvenido. Tu espacio de trabajo está listo. Sigue estos 3 pasos para conectar tu primer servicio y comenzar a recibir métricas en tiempo real."*

---

## 🚫 Anti-Patrones

- **Esquizofrenia de marca**: Sonar juvenil y desenfadado en redes sociales, pero arcaico y distante en el producto.
- **Pautas abstractas sin ejemplos**: Declarar "nuestra marca es inspiradora y humana" sin mostrar ejemplos concretos de qué escribir y qué evitar.
- **Ignorar el glosario**: Permitir que cada desarrollador o redactor invente nombres distintos para las mismas funciones en la aplicación.
- **Humor en situaciones de estrés**: Usar chistes o animaciones graciosas cuando una transacción falla o un usuario pierde acceso a su cuenta.
