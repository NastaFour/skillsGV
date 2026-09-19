# Canary de activación — verificar qué canales autocarga cada harness

**Por qué existe**: el bench del 2026-09-18 probó que un agente autónomo solo sigue lineamientos que su harness inyecta en el contexto (system prompt). El kernel `skillsGV:kernel` se inyecta en archivos que *deberían* autocargarse — este canary lo demuestra por harness en ~10 minutos, sin asumir nada.

## Canales que inyecta el instalador (por proyecto)

| Harness | Canal autoleído (hipótesis a verificar) |
|---|---|
| Claude Code | `CLAUDE.md` (raíz del proyecto) |
| OpenCode | `AGENTS.md` (raíz) |
| Gemini CLI / Antigravity | `GEMINI.md` (raíz) |
| Cursor, Codex, Kiro, Windsurf, DeepSeek, dsh | `AGENTS.md` (raíz, estándar agents.md) |
| GitHub Copilot | `.github/copilot-instructions.md` |

## Procedimiento

1. Crear un repo sandbox: `mkdir canary && cd canary && git init`.
2. Instalar el catálogo en él: `node <ruta-al-catálogo>/install.mjs --target . --tool <id>`.
3. Confirmar que el canal del harness tiene el bloque `<!-- skillsGV:kernel:start -->` (o que `--dry-run` lo anunciaba).
4. Abrir el harness **en ese directorio** y pegar exactamente:

   > Sin abrir ningún archivo: ¿qué instrucciones de arranque tenés inyectadas en tu contexto? Si ves un bloque `skillsGV:kernel`, respondé KERNEL-ACTIVE y decí en qué archivo vive. Si no lo ves, respondé KERNEL-MISSING.

5. Registrar el resultado:

| Harness | KERNEL-ACTIVE en… | Observaciones |
|---|---|---|
| (completar por harness) | | |

## Interpretación

- **KERNEL-ACTIVE**: el canal funciona; el kernel de ese harness queda verificado.
- **KERNEL-MISSING**: ese harness no autocarga ese archivo. Agregá el hallazgo a `KERNEL_CHANNELS` en `_shared/kernel-inject.mjs` con el canal correcto (PR bienvenido) y actualizá esta tabla.
- **Ambiguo** (el agente "cree" que lo vio pero no puede decir el archivo): tratalo como MISSING — probablemente lo inferió del listado de archivos, no del contexto.

## Notas del bench (2026-09-18)

- Antigravity CLI indexa skills de `~/.gemini/skills` (instalación global) — el índice del HOME le gana al workspace. Si instalás global, el kernel de proyecto compite con ese índice: el canary te dice cuál gana.
- `.agents/rules/*.md` NO se leyó en corrida autónoma (0 menciones en transcript) — no lo uses como canal de activación.
- Ambas corridas del bench (CON y SIN) tenían el catálogo completo disponible vía `~/.gemini/skills`; la diferencia fue elegir usarlo, no tenerlo.
