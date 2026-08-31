---
name: sdd-init
description: "Trigger: sdd init, iniciar sdd, openspec init. Initialize SDD context, testing capabilities, registry, and persistence."
license: MIT
allowed-tools: Read Write Edit
metadata:
  author: gentleman-programming
  version: "1.0.0"
  trigger: ["sdd init", "iniciar sdd", "openspec init"]
  scope: [global, project]
---

# sdd-init — Inicialización del contexto SDD

> **Atribución (contenido vendored)**: adaptación catálogo-nativa del agente de fase `sdd-init` del runtime [gentle-ai](https://github.com/Gentleman-Programming/gentle-ai) (Gentleman Programming), licencia MIT. Adaptado a las convenciones del catálogo (español neutral, frontmatter agentskills.io). Fuente: `~/.config/opencode/skills/sdd-init/SKILL.md`.

## Rol de ejecución

Confirme su rol antes de actuar. Usted es el sub-agente dedicado `sdd-init` a menos que haya cargado esta skill directamente con la herramienta `skill()`.

- Si usted es el sub-agente `sdd-init`, continúe con el trabajo de fase de abajo. No delegue. No llame la herramienta Skill.
- Si cargó esta skill con `skill()`, usted es el orquestador: deténgase y delegue al sub-agente dedicado `sdd-init` usando la primitiva de delegación de su plataforma.

## Contrato de idioma

Los artefactos técnicos generados siguen la convención del proyecto destino (en este catálogo: español neutral/profesional). No herede el idioma conversacional ni la voz regional de la persona en los artefactos SDD.

## Contrato de activación

Ejecute esta fase cuando el orquestador/usuario pida inicializar SDD en un proyecto. Usted es el ejecutor de fase: haga el trabajo usted mismo, no delegue y no se comporte como orquestador.

## Reglas duras

- Detecte el stack real, convenciones, arquitectura, herramientas de testing y modo de persistencia; nunca adivine.
- En modo `engram`, no cree `openspec/`.
- En modo `openspec`, siga la convención openspec y escriba artefactos de archivo.
- En modo `hybrid`, escriba ambos: archivos openspec Y observaciones Engram.
- Persista siempre las capacidades de testing por separado como `sdd/{project}/testing-capabilities` o `openspec/config.yaml` `testing:`.
- Construya siempre `.atl/skill-registry.md`; guarde también `skill-registry` en Engram cuando esté disponible.
- Use `capture_prompt: false` para guardados SDD/config automatizados cuando la plataforma lo soporte; omítalo si el esquema no lo expone.
- Si `openspec/` ya existe, reporte qué existe y pregunte antes de actualizarlo.

## Puertas de decisión

| Entrada | Acción |
|---|---|
| `mode=engram` | Guardar contexto y capacidades solo en Engram. |
| `mode=openspec` | Crear/actualizar solo archivos bootstrap openspec. |
| `mode=hybrid` | Hacer ambas persistencia: Engram y openspec. |
| `mode=none` | Devolver solo el contexto detectado; sin artefactos SDD salvo el registro si se requiere. |
| Marcador/config strict TDD encontrado | Usar ese valor. |
| Sin marcador/config pero existe test runner | Default `strict_tdd: true`. |
| Sin test runner | `strict_tdd: false` y explicar indisponibilidad. |

## Pasos de ejecución

1. Inspeccione los archivos del proyecto (`package.json`, `go.mod`, `pyproject.toml`, CI, config de lint/test) y resuma stack/convenciones.
2. Detecte test runner, capas de testing, cobertura, linter, type checker y formateador.
3. Resuelva Strict TDD desde marcador del agente, `openspec/config.yaml`, fallback por runner detectado o fallback sin runner.
4. Inicialice la persistencia para el modo resuelto.
5. Construya `.atl/skill-registry.md` usando las reglas de escaneo del registro de skills.
6. Persista las capacidades de testing y el contexto del proyecto.
7. Devuelva el envelope de inicialización estructurado.

## Contrato de salida

Devuelva el envelope de resultado de exactamente seis campos — `status`, `executive_summary`, `artifacts`, `next_recommended`, `risks` y `skill_resolution` — según la sección **D** del Protocolo Común. Incluya proyecto, stack, modo de persistencia, estado de Strict TDD, tabla de capacidades de testing, IDs/paths de observaciones guardadas, path del registro y el siguiente paso `/sdd-explore` o `/sdd-new`.

## Dependencias y bloqueo

Esta fase no tiene dependencias de entrada obligatorias (es la raíz del pipeline). Si el modo requiere `openspec/config.yaml` y el archivo no es legible, devuelva `status: blocked` con el motivo y no avance.

## Referencias

- [Protocolo común de fase SDD](../../_shared/sdd-phase-common.md) — secciones A (carga de skills), B (recuperación), C (persistencia) y D (envelope).