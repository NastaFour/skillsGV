# Harness de evals por skill

Evals declarativas por skill con el esquema Anthropic (`evals.json`), ejecutadas
con `node:test`. El gate es 100% offline: jamás red ni modelo.

## Esquema (`<skill>/evals.json`)

```json
{
  "evals": [
    {
      "id": "identificador-unico",
      "prompt": "pedido real que dispara la skill",
      "files": [],
      "expected_output": "respuesta gold que un agente correcto produciría",
      "expectations": ["routes-to:<skill>", "contains:<texto>", "not-contains:<texto>", "regex:<patrón>"]
    }
  ]
}
```

- Mínimo **2 evals** por skill; `id` único dentro del suite.
- Expectativas (`<kind>:<valor>`):
  - `contains:` / `not-contains:` — subcadena en `expected_output` (offline) o en
    el stdout del agente (live).
  - `regex:` — `new RegExp(valor, "i")` contra el mismo texto.
  - `routes-to:<skill>` — invoca el **skill-router real**
    (`--query <prompt> --json`) y exige que elija `<skill>` como `primary`.
    Es un invariante local determinista: se evalúa igual offline y live.

## Gate offline (`pnpm test`)

`test/evals.test.mjs` descubre cada `evals.json` del catálogo, valida el esquema
(errores señalando eval y campo) y corre todas las expectativas — esquema
inválido o expectativa incumplida ponen la suite en rojo. El motor compartido es
`_shared/eval-harness.mjs`.

## Loop de optimización (opt-in, no bloquea el gate)

```powershell
# Las expectativas se evalúan contra el agente configurado (prompt como último argumento):
$env:EVAL_AGENT_CMD = "opencode run"
node scripts/run-evals.mjs --live [--skill <name>] [--agent-cmd "<cmd>"] [--timeout <ms>]

# Comparar las dos corridas más recientes (regresiones/fixes/altas/bajas):
node scripts/run-evals.mjs --compare [--skill <name>]
```

Cada corrida `--live` queda en `evals/results/<timestamp>.json` (historial local,
no commiteado). Ni `pnpm test` ni CI ejecutan `run-evals.mjs`; su exit code
refleja el resultado live solo para scripting local.
