---
name: odd-workflow
description: "Use when executing substantial features or multi-step development in harnesses without native gentle-ai. Governs Organic Driven Development (ODD): authorize, explore, clarify, track before first write in odd/tasks/<feature>.md, implement task-by-task with work-unit commits, and close with verified evidence. Do NOT use when gentle-ai is already active in the system prompt."
trigger: ["odd workflow", "organic driven development", "flujo odd", "implementar feature multi archivo", "iniciar feature", "trabajo sustancial", "odd task"]
license: MIT
allowed-tools: Read Write Bash(git:*,gh:*)
metadata:
  author: gentleman-programming
  version: "1.0.0"
---

# odd-workflow — Organic Driven Development (Fallback)

> **Precedencia de proceso**: Si el harness tiene Gentle-AI activo (`gentle-ai`), su bloque inyectado en el system prompt es la autoridad absoluta de proceso. Esta skill opera exclusivamente como **guía y fallback** en entornos donde Gentle-AI no está presente o en harnesses desnudos.

## Principio fundamental

En el ecosistema Gentle-AI 4.0.0, **ODD es el único flujo de desarrollo**. SDD (Spec-Driven Development) y OpenSpec fueron retirados. No generes artefactos `sdd/*` ni pipelines de fases previas.

## El Protocolo ODD (7 Pasos obligatorios)

1. **Autorizar**: Confirmar que el usuario pidió explícitamente mutar código. Auditorías, exploraciones y planes son solo lectura hasta autorización expresa.
2. **Explorar**: Leer el código existente proporcionalmente antes de diseñar o escribir nada.
3. **Resolver incertidumbre**: Formular como máximo UNA pregunta al usuario solo si hay una decisión de producto bloqueante; de lo contrario, decidir con base técnica.
4. **Clasificar**: El trabajo es *sustancial* si requiere 2 o más pasos significativos o progreso digno de recuperarse tras una interrupción. Si es pequeño y comprendido (1 archivo mecánico), se ejecuta directo sin artefactos durables.
5. **Trackear antes del primer write**: Para trabajo sustancial autorizado, crear obligatoriamente `odd/tasks/<feature-name>.md` y su espejo en Engram (topic `odd/<feature-name>/tasks`) ANTES de tocar el primer archivo fuente. Informar al usuario en una sola línea el archivo creado y la cantidad de tareas.
6. **Implementar tarea por tarea**:
   - Respetar el Evidence Budget de delegación.
   - Cada tarea se cierra con al menos un commit convencional (unidad de trabajo) en la rama de la feature.
   - Registrar la identidad del commit y la evidencia de tests en el feature doc.
7. **Cerrar**: Reportar el resultado verificado con comandos y resultados observados, checks fallidos o pendientes, y el próximo paso.

## Estructura obligatoria del Feature Doc (`odd/tasks/<feature>.md`)

Todo documento de feature debe incluir:
- `# <Título> — feature doc (ODD)`
- Metadatos: Estado, Fecha, Branch, Mirror Engram.
- `## Objetivo`: resultado concreto esperado.
- `## Problema / por qué`: contexto y justificación técnica.
- `## Alcance autorizado`: límites claros de lo que se toca y lo que no.
- `## Restricciones`: convenciones de arquitectura, package manager, linters.
- `## Tareas`: checklist con IDs estables (`- [ ] T1`, `- [ ] T2`, etc.).
- `## Configuración`: TDD mode (on/off), RDD mode (on/off), Delivery strategy.
- `## Progreso / evidencia`: comandos ejecutados, tests observados, commits y ruta aplicada (inline o delegada con justificación del trigger).
- `## Próximo paso`: siguiente acción concreta.

## Reglas de Delegación (Evidence Budget)

- **Direct inline**: Evidencia cabe en 1 batch paralelo (máximo 3 llamadas, ~10k tokens). Modificar 1 archivo mecánico ya comprendido sin decisiones pendientes.
- **Delegated direct**: Más de ~10k tokens de evidencia o ≥4 archivos a entender → delegar un explorer que devuelva un resumen acotado con referencias `path:line`. Modificación de 2+ archivos no triviales → delegar a un writer acotado.
- La heurística de ~400 líneas modificadas (adiciones + eliminaciones) por tarea es orientativa para planificar unidades pequeñas, nunca un tope rígido.

## Estrategia de Entrega y RDD

- **Entrega**: `ask-on-risk` (preguntar una vez la estrategia de cadena si supera ~400 líneas), `auto-chain`, `single-pr`, `exception-ok`. Cadena: `stacked-to-main` o `feature-branch-chain`.
- **RDD (Receipt-Driven Development)**: Viene `on` por defecto desde gentle-ai 4.0.0. No lo apagues ni lo enciendas por decisión propia: pertenece al usuario vía `gentle-ai review mode enable|disable`. Tras cada commit, evaluar con `gentle-ai review assess`.
- **TDD**: Se aplica test-first cuando existe un test ejecutable determinista y el entorno lo soporta; no inventar runners ni asumir TDD por la sola presencia de tests.
