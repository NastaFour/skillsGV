---
name: decision-gate
description: Decision-support system that compresses the human's last-20% judgment from 30 min to 3 min. Presents trade-offs as an ordered matrix, surfaces conflicts with prior decisions (via Engram), offers safe defaults to override, and records the decision + reasoning in Engram. Use when judgment-day or a PRD leaves a decision the human must make and you want it fast, well-informed, and traceable.
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex, DeepSeek. Requires Engram binary for conflict surfacing + memory (graceful fallback to markdown log)."
allowed-tools: Bash(node:*) Read
metadata:
  trigger: ["decision gate", "decisión final", "final decision", "human decision", "trade-off matrix", "go no go", "approve", "judgment", "stakeholder", "override default"]
  scope: [global, project]
  version: "1.0.1"
  time_budget_sec: 180
---

# Decision Gate — Compress the Human's Last 20%

Comprime el juicio humano de negocio (trade-offs de prioridades, riesgo o presupuesto) de 30 min a 3 min sin decidir en nombre del usuario y dejando rastro en memoria para no re-litigar en sesiones futuras.

> Posicionamiento: [`judgment-day`](../../02-dev-roles/judgment-day/SKILL.md) produce el diagnóstico adversarial; [`idea-to-prd-express`](../../01-planning-process/idea-to-prd-express/SKILL.md) produce el PRD; `decision-gate` cierra decisiones subjetivas abiertas.

## When to Use

- ✅ `judgment-day` devolvió `SPLIT`, `idea-to-prd-express` dejó open questions, o un ADR ([`tech-escalation-adr`](../../01-planning-process/tech-escalation-adr/SKILL.md)) compite entre 2–3 opciones.
- ✅ Llamadas de negocio pre-merge (launch vs polish, scope cut, integración externa sí/no).
- ❌ **Do NOT use** para respuestas técnicas objetivas (esas corresponden a `code-reviewer` o `judgment-day`).

## The 3-Minute Decision Protocol

`metadata.time_budget_sec: 180` es declarativo: el orchestrator externo (`odd-workflow` o host) debe surfacear el budget y decidir si aceptar default silencioso o escalar si expira.

1. **Step 1 — Decision Matrix (`2–3` opciones máximo)**: Muestra Cost, Risk, Reversibilidad, Stakeholder impact, una única opción marcada `✅ default seguro` y el **Eje de incertidumbre** explícito (`>3` opciones = parálisis; `<2` = diktat).
2. **Step 2 — Conflict Surfacing determinista**: Ejecuta [`scripts/resolve-default.mjs`](scripts/resolve-default.mjs) (`--topic` + `--options`). El script nunca deja que la IA invente defaults; aplica `engram-prev` > `lower-risk` > `domain-rule` > `null`. Si hay conflicto con Engram previo, exige override explícito.
3. **Step 3 — Default-Override asimétrico**:
   - `"A"` → acepta default seguro (1 palabra).
   - `"override: B porque <razón>"` → elige no-default con justificación obligatoria.
   - `"need: <info>"` → difiere decisión e invoca `research-first`.
4. **Step 4 — Record automático**: Guarda decisión, reasoning, conflicto e incertidumbre en Engram (`engram save ... --type decision`) o, si Engram no está disponible, en `DECISIONS.md`.

## Guards & Anti-Patterns

- Nunca decidas por el humano ni inventes opciones o defaults neutros (cuando `default != null`, preséntalo como recomendación).
- Si no hay respuesta tras el turno, el flujo no bloquea solo cuando el host autoriza `"default-accepted-silently"` registrado en Engram.
- No reabras decisiones cerradas salvo override explícito ni omitas el `reasoning` al guardar.

## Integration & References

| Necesidad / Referencia | Destino |
|---|---|
| Diagnóstico adversarial antes de decisión | [`judgment-day`](../../02-dev-roles/judgment-day/SKILL.md) |
| PRD con open questions | [`idea-to-prd-express`](../../01-planning-process/idea-to-prd-express/SKILL.md) |
| ADR arquitectónico | [`tech-escalation-adr`](../../01-planning-process/tech-escalation-adr/SKILL.md) |
| Memoria previa / conflict surfacing | [`engram-integration`](../../01-planning-process/engram-integration/SKILL.md) |
| Research si `"need: <info>"` | [`research-first`](../../03-ai-ml/research-first/SKILL.md) |
| Plantillas CLI, conflictos y ejemplo SSR/CSR | [`references/decision-examples.md`](references/decision-examples.md) |
| Especificación humana del algoritmo | [`references/default-resolution.md`](references/default-resolution.md) |

## Keywords

decision gate, human decision, trade-off matrix, go no go, approve, override default, judgment, decisión final, conflict surfacing
