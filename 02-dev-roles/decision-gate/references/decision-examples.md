# Decision Gate — Examples, Templates & Resolver Contract

Detailed templates, Engram conflict examples, and CLI resolver states referenced by [`SKILL.md`](../SKILL.md).

## 1. Decision Matrix Template

```markdown
Decisión: <una frase>

| Opción | Cost | Risk | Reversibilidad | Stakeholder impact | Default? |
|---|---|---|---|---|---|
| A: <name> | ~8h | bajo | alta (rollback fácil) | solo dev team | ✅ default seguro |
| B: <name> | ~24h | medio | media (DB migration) | ops + soporte | |
| C: <name> | ~40h | alto | baja (rewrite) | clientes finales | |

Eje de incertidumbre: <¿qué es lo que NO sabemos y haría cambiar la decisión?>
```

## 2. Engram Conflict Surfacing

When [the default resolver script](../scripts/resolve-default.mjs) finds a prior decision contradicting the safe default:

```text
⚠️ Conflicto con decisión previa:
  [2025-11-04] "Adoptamos Zustand sobre Redux para state" (decision, project X)
  → La opción C "usar Redux" contradice este registro.
  → Override explícito requerido: responde "override: <razón>" o acepta A/B.
```

If Engram is unreachable, the script falls back to `lower-risk` or `domain-rule` (when options declare `risk` or applicable tags), or returns `default: null` with `default_source: "engram-unavailable"`.

## 3. Deterministic Default Resolver CLI

```bash
node ../scripts/resolve-default.mjs \
  --topic "<tópico de la decisión>" \
  --options '[{"name":"A","risk":"bajo","reversibilidad":"alta"},{"name":"B","risk":"medio"}]'
```

Output schema & `default_source` semantics:
- `"engram-prev"` — Engram had a prior decision naming one of the options.
- `"engram-conflict"` — Engram had a prior decision that matched no current option (`default: null`).
- `"engram-unavailable"` — Engram binary unreachable; no default biased by history.
- `"lower-risk"` — No Engram prior; picked the lowest-risk option.
- `"domain-rule"` — No Engram prior and no `risk` field; applied domain rule.
- `"none"` — No rule produced a default; the agent must never invent one.

Asymmetric human responses:
- `"A"` — accepts safe default option `A`, record and close.
- `"override: B porque <razón>"` — chooses non-default with explicit reasoning.
- `"need: <info>"` — defers decision and triggers targeted research first.

## 4. Recording Decision (Engram or `DECISIONS.md` Fallback)

```bash
engram save "<decisión: título corto>" \
  "Option <X> chosen. Reasoning: <razón o 'default accepted'>. Conflict: <sí/no + id previo>. Uncertainty axis: <eje>." \
  --type decision --project <nombre>
```

Markdown fallback (`DECISIONS.md`):

```markdown
## YYYY-MM-DD — <título>
- Option: <X>
- Reasoning: <razón>
- Conflict with prior: <sí/no + ref>
- Uncertainty axis: <eje>
```

## 5. Worked Example — Checkout SSR vs CSR

```text
Context: judgment-day devolvió SPLIT sobre si usar Server Components (Next 15) o CSR para /checkout.

Decisión: SSR vs CSR para la página de checkout

| Opción | Cost | Risk | Reversibilidad | Stakeholder impact | Default? |
|---|---|---|---|---|---|
| A: SSR (Server Components) | ~6h | bajo | alta (flip a "use client" en 1 línea) | solo dev | ✅ default seguro |
| B: CSR + SWR cache | ~4h | medio | media (re-arch data fetching) | dev + QA | |
| C: Hybrid (SSR shell + CSR islands) | ~16h | alto | baja (rewrite layout) | dev team amplio | |

Eje de incertidumbre: si el equipo acepta el overhead de hydration en mobile low-end (no lo sabemos sin medir).

🔍 Engram search "checkout SSR vs CSR":
   ⚠️ [2025-09-12] "Checkout CSR por latencia en mobile" (decision, proyecto Y)
   → La opción A contradice este registro. Override explícito requerido.

→ Respuesta humana esperada: "override: A porque el mobile low-end ya midió '24 y mejoró, aceptamos hydration overhead"

→ Registro Engram:
   engram save "decisión: checkout SSR" "Option A chosen overriding prior CSR-by-latency decision. Reasoning: mobile perf improved '24. Conflict: sí, #47 (2025-09-12)." --type decision --project X
```
