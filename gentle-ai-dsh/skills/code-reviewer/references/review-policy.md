# Review Policy — disposición causal (reflejo SHOULD de harness-map)

> **Fuente única de verdad**: `00-meta-skills/harness-map.md`, sección «⚖️ Política de review». Este documento REFLEJA esa política para el uso concreto de esta skill durante una revisión; ante cualquier discrepancia, gana harness-map. Es consistente con la disposición causal del punto de extensión RDD (misma sección del mapa, punto «RDD»).

## Regla central: causalidad

Durante una revisión, clasifique cada hallazgo por su relación causal con el cambio bajo revisión:

| Clasificación | Criterio | Consecuencia |
|---|---|---|
| **Introducido** | El defecto no existía antes y entra con este diff | **Bloquea** la aprobación hasta su corrección |
| **Empeorado** | El defecto preexistía pero este diff lo agrava (más alcance, más severidad, nueva superficie) | **Bloquea** hasta revertir el empeoramiento o corregir |
| **Preexistente** | El defecto ya existía fuera del diff y el cambio no lo agrava | **No bloquea**: follow-up documentado aparte (issue o nota del cambio) |
| **Fuera de alcance** | Mejora válida pero sin relación causal con el cambio | No bloquea; se sugiere como follow-up |

Evidencia mínima para bloquear: el hallazgo debe poder señalarse en el diff (changed hunk), en un camino creado por el candidato, en un test diferencial, o en una comparación antes/después. Sin ese vínculo causal, el hallazgo se trata como preexistente o fuera de alcance.

## Perfiles de arquitectura opt-in

- Los perfiles de review (p. ej. conjuntos adicionales de lentes 4R) aplican SOLO cuando se declaran explícitamente en la configuración del cambio.
- **Sin declaración → política base única**: causalidad + reporte aparte de deuda preexistente.
- Un perfil declarado agrega reglas adicionales; NUNCA relaja la causalidad como criterio de bloqueo.

## Uso con los lentes de esta skill

Los lentes 4R (`references/4r-framework.md`) producen hallazgos; esta política decide cuáles bloquean:

1. Correr el lente correspondiente al riesgo dominante del diff.
2. Clasificar cada hallazgo con la tabla causal de arriba.
3. Bloquear solo introducido/empeorado con evidencia; registrar el resto como follow-up documentado en el resultado de la revisión.

## Relación con RDD y AHE

- El punto de extensión RDD (harness-map) declara dónde se insertaría una revisión acotada con recibo entre `sdd-verify` y `sdd-archive`; sigue SIN mecanismo ejecutable. Esta política es la disposición que ese gate futuro reutilizaría.
- El punto AHE (evaluación del harness) es independiente: activar uno no habilita al otro.
