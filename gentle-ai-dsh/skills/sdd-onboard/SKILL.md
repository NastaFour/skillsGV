---
name: sdd-onboard
description: "Walk users through the SDD workflow on the real codebase. Trigger: orchestrator launches onboarding for the full SDD cycle."
license: MIT
allowed-tools: Read Write Edit Bash(node:*)
metadata:
  author: gentleman-programming
  version: "1.0.0"
  trigger: ["onboard sdd", "onboarding sdd", "walkthrough sdd"]
  scope: [global, project]
---

# sdd-onboard — Onboarding SDD

> **Atribución (contenido vendored)**: adaptación catálogo-nativa del agente de fase `sdd-onboard` del runtime [gentle-ai](https://github.com/Gentleman-Programming/gentle-ai) (Gentleman Programming), licencia MIT. Adaptado a las convenciones del catálogo (español neutral, frontmatter agentskills.io). Fuente: `~/.config/opencode/skills/sdd-onboard/SKILL.md`.

## Rol de ejecución

> **NOTA DEL ORQUESTADOR**: esta skill está diseñada para ejecutarse INLINE por el orquestador. Es un walkthrough interactivo — no se necesita delegación a sub-agentes.

## Override de ejecutor

Si usted ES el sub-agente `sdd-onboard` (NO el orquestador), el gate de arriba NO aplica para usted. Continúe con el trabajo de fase de abajo. No delegue. No llame la herramienta Skill. Usted es el ejecutor — ejecute.

## Contrato de idioma

Los artefactos técnicos generados siguen la convención del proyecto destino (en este catálogo: español neutral/profesional). No herede el idioma conversacional ni la voz regional de la persona en los artefactos SDD.

## Propósito

Usted es un sub-agente responsable del ONBOARDING. Guía al usuario a través de un ciclo SDD completo — de exploración a archive — usando su codebase real. Esto es un cambio real con artefactos reales, no un ejemplo de juguete. El objetivo es enseñar haciendo.

## Qué recibe

Del orquestador:
- Modo de almacén de artefactos (`engram | openspec | hybrid | none`)
- Opcional: una mejora o área sugerida en la que enfocarse

## Qué hacer

### Fase 1: Bienvenida y análisis del codebase

Salude al usuario y explique lo que va a pasar:

```
"¡Bienvenido a SDD! Te guiaré por un ciclo completo usando tu codebase real.
Encontraremos algo pequeño para mejorar, construiremos todos los artefactos,
lo implementaremos y lo archivaremos. En cada paso explicaré qué estamos
haciendo y por qué.

Déjame escanear tu codebase en busca de oportunidades..."
```

Luego escanee el codebase en busca de una oportunidad real de mejora pequeña:

```
Criterios para un buen cambio de onboarding:
├── Alcance pequeño — completable en una sesión (30-60 min)
├── Riesgo bajo — sin breaking changes, sin migraciones de datos
├── Valor real — algo genuinamente útil, no un juguete
├── Spec-worthy — al menos 1 requirement claro y 2 escenarios
└── Ejemplos:
    ├── Validación de input faltante en un formulario o endpoint API
    ├── Mensajes de error inconsistentes en un flujo de auth
    ├── Una función utilitaria que podría extraerse y reutilizarse
    ├── Estado de loading/error faltante en un componente asíncrono
    └── Un TODO o FIXME en el código con intención clara
```

Presente 2-3 opciones al usuario. Déjelo elegir o sugerir la suya.

### Fase 2: Explorar (narrado)

Narre mientras explora:

```
"Paso 1: Explorar — Antes de comprometernos con cualquier cambio, investigamos.
 Déjame mirar el código relevante..."
```

Ejecute el comportamiento de `sdd-explore` inline — investigue el área elegida, entienda el estado actual, identifique qué necesita cambiar. Explique sus hallazgos al usuario en lenguaje llano.

Concluya con:

```
"Bien — entiendo con qué estamos trabajando. Ahora empecemos un cambio real."
```

### Fase 3: Proponer (narrado)

```
"Paso 2: Proponer — Escribimos QUÉ vamos a construir y POR QUÉ.
 Esto se convierte en el contrato para todo lo que sigue."
```

Cree la carpeta del cambio y escriba `proposal.md` siguiendo el formato de `sdd-propose`. Después de crearlo:

```
"Acá está la propuesta que escribí. Fijate en la sección Capabilities —
 esto le dice al siguiente paso exactamente qué archivos de spec crear."
```

Muestre la propuesta al usuario y déjelo revisarla. Pregunte si quiere ajustar algo antes de continuar.

### Fase 4: Specs (narrado)

```
"Paso 3: Specs — Definimos QUÉ debe hacer el sistema, en términos testeables.
 Sin detalles de implementación — solo comportamiento observable."
```

Escriba los delta specs siguiendo el formato de `sdd-spec`. Después de crearlos:

```
"¿Ves el formato Given/When/Then? Cada escenario es un caso de test potencial.
 Estos escenarios guiarán la fase de verify más adelante."
```

### Fase 5: Diseño (narrado)

```
"Paso 4: Diseño — Decidimos CÓMO construirlo. Decisiones de arquitectura, cambios de archivos, justificación."
```

Escriba `design.md` siguiendo el formato de `sdd-design`. Resalte las decisiones clave:

```
"Fijate en la sección Decisions — documentamos POR QUÉ elegimos este enfoque
 sobre las alternativas. Tu yo futuro (y tus colegas) te lo van a agradecer."
```

### Fase 6: Tareas (narrado)

```
"Paso 5: Tareas — Dividimos el trabajo en pasos concretos y verificables."
```

Escriba `tasks.md` siguiendo el formato de `sdd-tasks`. Explique la estructura:

```
"Cada tarea es lo suficientemente específica como para saber cuándo terminó.
 'Implementar feature' no es una tarea. 'Crear src/utils/validate.ts con validateEmail()' sí."
```

### Fase 7: Aplicar (narrado)

```
"Paso 6: Aplicar — Ahora escribimos código real. Las tareas nos guían, los specs nos dicen qué significa 'hecho'."
```

Implemente las tareas siguiendo el comportamiento de `sdd-apply`. Narre cada tarea a medida que la completa:

```
"Implementando la tarea 1.1: [descripción]
 ✓ Hecho — [nota breve sobre qué se creó/cambió]"
```

Si el modo Strict TDD está activo, aplique el ciclo TDD y explíquelo:

```
"Fijate: RED → GREEN → TRIANGULATE → REFACTOR.
 Escribimos el test que falla PRIMERO, y luego el código mínimo para pasarlo."
```

### Fase 8: Verificar (narrado)

```
"Paso 7: Verificar — Comprobamos que lo que construimos coincide con lo que especificamos."
```

Ejecute el comportamiento de `sdd-verify`. Explique la matriz de cumplimiento:

```
"Cada escenario de spec recibe un veredicto: COMPLIANT, FAILING o UNTESTED.
 Este es el momento en que los specs rinden — nos dicen exactamente qué revisar."
```

### Fase 9: Archivar (narrado)

```
"Paso 8: Archivar — Fusionamos nuestros delta specs en los specs principales y cerramos el cambio.
 Los specs ahora describen el nuevo comportamiento. El cambio se convierte en el audit trail."
```

Ejecute el comportamiento de `sdd-archive`. Muestre el resultado:

```
"¡Hecho! El cambio está archivado en openspec/changes/archive/YYYY-MM-DD-{nombre}/
 Y openspec/specs/ ahora refleja el nuevo comportamiento."
```

### Fase 10: Resumen

Cierre la sesión con un recuento:

```markdown
## Onboarding Complete! 🎉

Esto es lo que construimos juntos:

**Change**: {change-name}
**Artefactos creados**:
- proposal.md — el POR QUÉ
- specs/{capability}/spec.md — el QUÉ
- design.md — el CÓMO
- tasks.md — los PASOS

**Código cambiado**:
- {lista de archivos}

**El ciclo SDD en una línea**:
explore → propose → spec → design → tasks → apply → verify → archive

**Cuándo usar SDD**: cualquier cambio donde quieras acordar el QUÉ antes de escribir código.
Tweaks pequeños? Solo código. Features, APIs, decisiones de arquitectura? SDD primero.

**Próximos pasos**:
- Probá /sdd-new para tu próxima feature real
- Revisá openspec/specs/ — es tu fuente de verdad creciente
- ¿Preguntas? El orquestador siempre está disponible
```

## Reglas

- Este es un cambio REAL — no una demo. Los artefactos y el código deben ser de calidad de producción.
- Mantenga la narración de cada fase CORTA — 1-3 oraciones. Enseñe, no dicte una clase.
- Siempre pregunte antes de continuar más allá de la Fase 3 (propuesta) — deje que el usuario revise y ajuste.
- Si el usuario elige su propia mejora, valide que encaje con los criterios "pequeño y seguro" antes de proceder.
- Si algo bloquea el ciclo (tests fallan, diseño poco claro, codebase demasiado complejo), DETÉNGASE y explique — no fuerce el avance.
- Adapte el tono al usuario — si es experimentado, omita lo básico; si es nuevo, explique más.
- Siga todas las reglas de formato de las skills individuales (sdd-propose, sdd-spec, sdd-design, sdd-tasks, sdd-apply, sdd-verify, sdd-archive).
- Envelope de retorno según la sección **D** del Protocolo Común.
