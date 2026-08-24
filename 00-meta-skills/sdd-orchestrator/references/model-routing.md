# Model Routing — protocolo declarativo por catálogo del runtime (E1)

> **Estado**: ACTIVO desde Slice 2 (delta `model-routing-hooks`). Documentación únicamente: el routing lo resuelve el agente LLM leyendo el catálogo que su runtime expone. No hay script, ejecutable, TUI ni comandos de runtime en este contrato. Fuente única de verdad de la capability `model-routing`; los perfiles se declaran según `_shared/model-routing/profiles.schema.json`.

## Propósito

Asignar un modelo distinto a cada fase del pipeline SDD (propose, spec, design, tasks, apply, verify) sin acoplarse a un proveedor ni a un runtime concreto. Cada runtime expone un **catálogo de modelos** distinto; el routing se define contra la **interfaz de ese catálogo**, nunca contra comandos o APIs específicas. Precedente: artifact-store-abstraction (D6 de Slice 1) — abstracción como protocolo documentado consumido por agentes LLM.

## Contrato de interfaz de catálogo

El routing asume únicamente dos operaciones abstractas sobre el catálogo que el runtime expone al agente en su sesión:

| Operación | Firma conceptual | Semántica |
|---|---|---|
| `list()` | `→ Model[]` | Modelos visibles al runtime en la sesión actual (nombres/aliases con que el agente puede referirlos). |
| `resolve(phase)` | `phase → Model` | Dado el perfil declarado de una fase, matchea su `alias` contra `list()`. El matcheo lo realiza el agente LLM comparando el alias con los nombres visibles; si hay exacto, se usa ese modelo. |

Reglas del contrato:

- **Provider-agnostic**: la definición del routing no menciona comandos, flags ni APIs de ningún runtime. Los nombres de runtime aparecen solo como ejemplos informativos de forma de catálogo.
- **Sin TUI obligatoria**: la selección y el estado viven en configuración/estado persistido del runtime. Una TUI puede agregarse después sin romper este contrato.
- **Persistencia heredada**: el perfil elegido se declara en la configuración persistida del runtime (mecanismo propio de cada uno); al retomar sesión, el perfil sigue vigente sin re-selección manual.

## Forma del catálogo por runtime (ejemplos informativos)

Cada runtime expone su catálogo de manera distinta; el agente lo lee tal como se le presenta y aplica el mismo protocolo:

| Runtime | Forma típica del catálogo |
|---|---|
| OpenCode | modelos configurados para la sesión (multi-mode); el agente ve qué modelos tiene asignados/disponibles |
| Antigravity | modelos incluidos en el plan activo, expuestos por el entorno del agente |
| Codex | presets de esfuerzo de razonamiento (effort) seleccionables por sesión |

La lista anterior es ilustrativa, no normativa: cualquier runtime con catálogo observable sigue este protocolo sin cambios en la definición del routing.

## Formato declarativo de perfiles

Los perfiles por fase se declaran como configuración (no código), validados contra `_shared/model-routing/profiles.schema.json` (ejemplo funcional en `_shared/model-routing/profiles.example.json`):

```json
{
  "version": 1,
  "defaultAlias": "<alias-base-del-runtime>",
  "phases": {
    "propose": { "alias": "<alias>" },
    "spec":    { "alias": "<alias>" },
    "design":  { "alias": "<alias>" },
    "tasks":   { "alias": "<alias>" },
    "apply":   { "alias": "<alias>" },
    "verify":  { "alias": "<alias>" }
  }
}
```

- Cada fase admite `{}` (sin perfil propio → usa `defaultAlias`) o un objeto con `alias` obligatorio y `provider`/`notes` opcionales.
- Los `alias` son cadenas lógicas: cobran significado solo al resolverse contra `list()` del runtime actual.

## Algoritmo de resolución (ejecutado por el agente, no por código)

1. Leer el perfil declarado para la fase actual (configuración persistida del cambio/runtime).
2. Obtener `list()` — el catálogo visible del runtime.
3. `resolve(phase)`: si el `alias` del perfil coincide con un modelo visible, usarlo para la fase. Si el perfil de la fase está vacío, usar `defaultAlias`.
4. Si el alias no existe en el catálogo: reportarlo en el resultado de la fase (campo `risks` del contrato de resultado) y continuar con el modelo más próximo disponible o el default — el pipeline no se interrumpe por routing.

## Degradación sin catálogo (documentada)

Si el runtime **no expone catálogo de modelos**, el sistema degrada de forma definida y el pipeline MUST NOT fallar:

| Situación | Comportamiento |
|---|---|
| Runtime con catálogo expuesto | Cada fase resuelve su modelo vía perfil + interfaz de catálogo. |
| Runtime sin catálogo expuesto | Todas las fases usan el modelo por defecto del runtime (comportamiento previo a E1); la limitación queda registrada aquí y puede anotarse en el resultado de la fase. |
| Alias del perfil ausente en el catálogo | Fallback al modelo más próximo disponible o al default; se reporta en `risks`; el pipeline continúa. |

## Límites y reglas duras

- MUST resolver el routing por interfaz de catálogo; MUST NOT acoplarse a un runtime ni depender de comandos hardcodeados.
- MUST operar sin TUI dedicada; MUST degradar sin fallar el pipeline cuando no hay catálogo.
- **GLM sigue sin ser target de skill-sync**: GLM es un modelo, no un harness con directorio de configuración propio. La portabilidad se logra por routing de modelos (esta capability), no añadiendo targets al instalador.
- Ninguna parte de este documento es ejecutable: activar el routing es declarar perfiles y que el agente aplique el algoritmo anterior.

## Relación con el resto del harness

- Delta `model-routing-hooks`: el requisito «Perfiles por fase diferidos» pasa de DIFERIDO a ACTIVADO por esta capability (ver `openspec/specs/model-routing-hooks/spec.md` tras el merge del cambio).
- Fila «Model Routing» en la tabla de harnesses extendidos de `harness-map.md`.
- La política de review causal está en `harness-map.md` («Política de review») — independiente de qué modelo ejecute cada fase.
