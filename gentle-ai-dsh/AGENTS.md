# Gentle-AI en DeepSeek Harness

Estás corriendo con el ecosistema **Gentle-AI** instalado sobre DeepSeek Harness.
Este archivo es tu arranque: léelo entero antes de trabajar.

## 0 · Bootstrap (leer PRIMERO)

Dependés de 3 servidores MCP y de 1 modelo "flash". Verificá que estén antes de
empezar trabajo real:

| Necesidad | Variable de entorno | Cómo obtenerla |
|---|---|---|
| Engram (memoria) | ENGRAM_MCP_COMMAND, ENGRAM_MCP_ARGS | binario local `engram` o `pnpm dlx ...` |
| Context7 (docs) | (sin key — endpoint público) | https://mcp.context7.com/mcp |
| OpenDesign (diseño) | (ya cableado en el preset) | herramientas mcp__open-design__* |
| Modelo flash | DSH_FLASH_MODEL | default `deepseek-v4-flash` (servido por `opencode-go`) |

Si falta alguna: **avisá** al usuario cuál falta y dale el comando exacto, y seguí
trabajando sin memoria/docs hasta que la setee (el modo es disabled-safe, no te
detengas):

    $env:ENGRAM_MCP_COMMAND = 'engram'
    $env:DSH_FLASH_MODEL = 'deepseek-v4-flash'

Después, reiniciar el Host de dsh. Mientras tanto las herramientas MCP
(mcp__engram__*, mcp__context7__*, mcp__open-design__*) simplemente no existen —
seguís trabajando, solo sin memoria/docs/diseño. Nunca inventes una API key ni
una URL.

## 0.5 · Tier 0 — disciplina base siempre activa

Hay 14 skills "tier 0" siempre-activas, definidas en
**skill-loader/tier0-context.json** (skill-router, skill-loader, skill-creator,
skill-validator, skill-sync, professional-planner, sdd-orchestrator, ...).

Regla dura: **antes de cada turno que pueda cargar otra skill, corré
skill-router** para bajar 206 → 3-5 candidatas. No leas el cuerpo de una skill
fuera de la selección del router sin re-routear antes.

## 1 · Cómo trabajar (el pipeline)

Seguí Spec-Driven Development. Arrancá con "/sdd new" o "SDD change". Cargá la
skill **sdd-orchestrator** y DELEGÁ las fases (nunca las ejecutes inline):

1. sdd-init → sdd-explore → sdd-propose  (delegá con **subagent** / flash)
2. sdd-spec / sdd-design                  (**subagent** / flash)
3. sdd-tasks (flash) → sdd-apply (**subagent_strong** / pro) → sdd-verify (flash)
4. **judgment-day** (revisión dual adversarial, **subagent_strong** / pro — solo los 2 jueces)
5. **code-reviewer** / **verification-before-completion** antes de dar por terminado

Herramientas de delegación: **subagent** y **subagent_fork** corren en el modelo
flash; **subagent_strong** conserva el modelo fuerte. Vos planificás y sintetizás
en el modelo fuerte. Nunca avances una fase sin su dependencia satisfecha.

**Delegación (regla dura)**: fix pequeño y mecánico (1 archivo) → inline; todo lo
demás → delegar. Cargá **gentle-orchestrator** para el protocolo completo + el
roster de 20 agentes. **Si un subagente falla o devuelve vacío → RE-LANZALO una
vez + investigá el porqué** (leé el error, no asumas).

## 2 · De dónde salen las skills

El catálogo (206 skills de skillsGV) vive en **~/.agents/skills**. Cargá una por
nombre con la herramienta **skill**. Antes de cualquier turno que pueda cargar
otra skill, usá **skill-router** para reducir 206 → 3-5 candidatas. El catálogo
es la fuente de verdad; no lo edites desde la sesión salvo que te lo pidan.

## 3 · Memoria y documentación

Protocolo de memoria compacto (Engram, mcp__engram__*):

- Guardá decisiones, bugs y descubrimientos PROACTIVAMENTE con **mem_save**
  (topic keys: dsh/…, design/<proyecto>, <proyecto>/…). No esperes al cierre.
- Al cerrar una sesión de trabajo: **mem_session_summary**.
- Ante conflictos o duplicados en memoria: **mem_judge**.
- "Guardado en memoria" NO es "respondido al usuario": siempre confirmá en el chat.

Consultá Context7 (mcp__context7__*) antes de escribir contra librerías que no
conocés.

## 4 · Diseño (OpenDesign)

Para prototipos, landings, dashboards, slides, imágenes o video: usá la skill
**open-design**. OpenDesign está cableado como MCP en este preset: usá las
herramientas **mcp__open-design__*** primero; si no existen (host sin reiniciar
o server no arrancado), caé al CLI **od** (`pnpm add -g open-design` si tampoco
está) y avisá al usuario.

## 5 · Reglas

- Artefactos técnicos SDD en inglés (registro neutro/profesional), salvo pedido explícito.
- Nunca afirmes "listo" sin evidencia de verificación (verification-before-completion).
- RDD (receipt-driven) es opt-in; si está habilitado, seguí rdd-defect-workflow.
- **Traductor visual**: si el usuario manda capturas/imágenes y vos no podés ver
  imágenes, no improvises — redirigí a Antigravity (o **od**) y exigí una spec
  textual antes de continuar.
- **Harvest**: al cierre de CADA proyecto (después de todos los fixes), corré el
  protocolo **skill-harvest** (Parte C del README): buscá en Engram lo aprendido,
  identificá 1-3 patrones repetibles y escribí un TXT en la carpeta _inbox
  (env SKILLS_INBOX). Nunca crees la skill automáticamente — recomendala.
- **Doctor al arranque**: al iniciar sesión corré **pnpm dlx gentle-ai-dsh doctor**; si
  algo falta, avisá con el comando exacto (no trabajes a ciegas con MCP caídos).
- **Package manager: pnpm only — `npm`/`npx` rechazados.** Usá `pnpm` para
  instalar y correr scripts, y `pnpm dlx` en lugar de `npx`.
