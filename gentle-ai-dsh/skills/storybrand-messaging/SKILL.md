---
name: storybrand-messaging
description: "Estructuración de narrativa de producto y mensajería usando el marco StoryBrand 7-part (SB7) de Donald Miller. Úsala para posicionar al cliente como el héroe. No usar para diseño visual o código UI."
license: MIT
allowed-tools: Read Bash(node:*)
metadata:
  version: "1.0.0"
  trigger: ["storybrand messaging", "storybrand", "sb7 framework", "narrativa de producto", "el cliente como heroe", "mensaje de marca"]
  scope: [global, project]
---

# 📖 StoryBrand Messaging — Marco SB7 de Donald Miller

Metodología de posicionamiento y narrativa comercial basada en el marco de 7 partes (StoryBrand SB7). El principio nuclear es contraintuitivo pero irrompible: **el cliente es el héroe de la historia; tu empresa o producto es únicamente el guía**. Cuando las marcas intentan ser el héroe, pierden la atención de sus prospectos.

---

## 📋 Cuándo Usar

- Al redactar la propuesta de valor, estructura o narrativa de una landing page o sitio web.
- Al diseñar campañas de email marketing (nurture sequence, lanzamientos, onboarding).
- Al definir el "One-Liner" de producto para decks de inversión, ventas o comunicación externa.
- Cuando la comunicación actual sea confusa, hable demasiado sobre la empresa o liste funciones técnicas sin conectar con los dolores del usuario.

**No usar para**:
- Diseño visual, maquetación CSS o selección de paletas de color (usar `05-frontend/frontend-design` o `05-frontend/ui-ux-pro-max`).
- Implementación de código de interfaz de usuario (usar `02-dev-roles/feature-implementer`).
- Redacción técnica pura de especificaciones OpenAPI o APIs (usar `02-dev-roles/technical-writer`).

---

## 🚦 Reglas Duras

1. **El cliente es el héroe, jamás el producto**: Tu marca encarna el arquetipo del Guía (como Yoda o Gandalf). Si tu mensaje dice "Somos los líderes en X", estás fallando la regla cardinal.
2. **Claridad sobre ingenio**: Si confundes, pierdes (*if you confuse, you lose*). Evita metáforas abstractas o eslóganes poéticos que obliguen al cerebro del lector a gastar calorías descifrando qué vendes.
3. **El problema opera en tres niveles**: Todo problema externo debe conectarse a una frustración interna y a una injusticia filosófica.
4. **Plan limitado a 3 o 4 pasos**: Si tu proceso tiene más de 4 pasos, el prospecto percibe alta fricción cognitiva y se paraliza.
5. **Doble llamada a la acción**: Toda página debe incluir un CTA Directo evidente (transaccional) y un CTA Transicional (para quien aún no está listo para comprar).

---

## 🛠️ Metodología Paso a Paso (SB7 Frame-by-Frame)

### 1. El Personaje (The Hero)
- Identifica al cliente ideal y define **un único deseo principal** relacionado con tu solución.
- ¿Qué quiere el cliente? Ej.: "Automatizar sus despliegues sin lidiar con infraestructura compleja".

### 2. El Problema (The Problem)
Desglosa el obstáculo en tres capas causadas por un **Villano** identificable:
- **Villano**: La causa raíz personificada (ej. la deuda técnica oculta, los silos de comunicación).
- **Problema Externo**: La barrera física o técnica (ej. "Los despliegues manuales tardan 4 horas").
- **Problema Interno**: La emoción o frustración que genera (ej. "Miedo constante a romper producción y perder fines de semana").
- **Problema Filosófico**: Por qué está mal a nivel ético/universal (ej. "Los ingenieros deberían crear producto, no ser esclavos de scripts frágiles").

### 3. Conoce al Guía (Meets a Guide)
El guía se gana la confianza del héroe combinando dos virtudes indispensables:
- **Empatía**: "Sabemos lo estresante que es recibir una alerta a las 3 a.m.".
- **Autoridad**: Demostrada con métricas, testimonios breves o certificaciones ("Más de 10,000 deploys exitosos y 99.99% de uptime").

### 4. Quién le da un Plan (Gives Them a Plan)
Reduce el riesgo percibido mediante un camino transparente:
- **Plan de Proceso (3 pasos)**:
  1. Conecta tu repositorio en 30 segundos.
  2. Configura tus reglas de validación automática.
  3. Despliega con confianza en cada commit.
- **Plan de Acuerdo**: Mitigación de riesgos (ej. garantía de satisfacción, migración sin downtime, cancelación en 1 clic).

### 5. Llamado a la Acción (Calls Them to Action)
- **CTA Directo**: Botón primario de alto contraste y verbo de acción inequívoco: "Comenzar Prueba Gratis", "Agendar Demo", "Crear Cuenta".
- **CTA Transicional**: Recurso de bajo compromiso para capturar prospectos indecisos: "Descargar Guía de Mejores Prácticas", "Ver Demo Interactiva de 2 Minutos".

### 6. Evitar el Fracaso (Helps Avoid Failure)
Comunica qué está en juego si el héroe no actúa (*the stakes*):
- Pérdida de dinero por incidentes no detectados.
- Desgaste del equipo de desarrollo.
- Retrasos que permiten a los competidores ganar mercado.

### 7. Culminar en el Éxito (Ends in Success & Identity Transformation)
Pinta un cuadro vívido del estado deseado y la transformación de identidad:
- **De (Antes)**: Ingeniero sobrecargado, ansioso en cada release.
- **A (Después)**: Líder técnico seguro, con pipelines predecibles y entregas continuas.

---

## 💡 Ejemplos de Implementación

### Estructura de Hero Section (Landing Page)
```markdown
# [Titular]: Despliegues continuos sin el estrés de romper producción.
# [Subtítulo]: Plataforma de CI/CD inteligente que valida, construye y publica tus servicios en minutos para que tu equipo entregue valor sin fricción.
# [CTA Directo]: Probar Gratis por 14 Días
# [CTA Transicional]: Ver Video de 90 Segundos
```

### El One-Liner StoryBrand (Fórmula de 3 Partes)
- **El Dolor**: "La mayoría de los equipos de ingeniería pierden hasta 15 horas semanales manteniendo pipelines rotos."
- **La Solución**: "Nuestra plataforma automatiza la validación y el release de extremo a extremo."
- **El Resultado**: "Permitiéndote lanzar nuevas funcionalidades a diario con tranquilidad absoluta."

---

## 🚫 Anti-Patrones

- **Hacerse el héroe**: Llenar la página principal con la historia de la fundación de la empresa en vez de los problemas del cliente.
- **Sobrecarga de opciones**: Ofrecer 5 llamadas a la acción distintas en el header que compiten entre sí.
- **Ignorar el problema interno**: Vender solo prestaciones técnicas sin apelar a cómo se siente el usuario al sufrir el problema.
- **Falta de riesgos explícitos**: No mostrar las consecuencias de la inacción por temor a sonar negativo; sin riesgo no hay historia ni urgencia.
