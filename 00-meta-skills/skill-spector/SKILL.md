---
name: skill-spector
description: "Auditoría de seguridad y análisis estático para skills de agentes según Hermes #13 y NVIDIA SkillSpector. Úsala para detectar inyección de prompts, comandos peligrosos, tool poisoning MCP y fugas de datos. No usar para pentesting de red."
license: MIT
allowed-tools: Read Bash(node:*,python:*)
metadata:
  version: "2.0.0"
  trigger: ["skill spector", "nvidia skillspector", "auditoria de skills", "seguridad de skills", "hermes skill security", "deteccion de prompt injection", "escanear skill", "tool poisoning", "mcp security"]
  scope: [global, project]
---

# 🕵️ Skill Spector — Auditoría de Seguridad & Análisis Estático (`Hermes #13` + `NVIDIA SkillSpector v2.12`)

Protocolo unificado de análisis estático de seguridad para *Agent Skills* conforme a **Hermes #13** y las familias de detección de **`NVIDIA/SkillSpector`** (`TT1–6`, `SC1–10`, `LP1–4`, `TP1–4`, `RP1–3`, `AS1–3`, `RA1`, `AR1–3`, `EA1–5`, `DS1–4`, `PE1–5`). Evalúa instrucciones Markdown, `SKILL.md` frontmatter, manifiestos MCP y scripts ejecutables antes de instalar o promover skills.

---

## 📋 Cuándo Usar

- Al auditar skills de terceros o externas antes de incorporarlas al catálogo (junto con [`prompt-shield`](../../03-ai-ml/prompt-shield/SKILL.md)).
- Al revisar cambios en `SKILL.md`, servidores MCP o `scripts/` antes de un Pull Request.
- Para ejecutar compatibilidad multi-harness (`--harness-check`) y scoring Tier 1 (`--quality-score`) vía `validate-skills.mjs`.
- **No usar para**: pentesting de red (usar herramientas de infraestructura), auditoría de dependencias de una app (`live-cve-security-intel` / `security-audit`) o solo linting sintáctico (`skill-validator`).

---

## 🚦 Reglas Duras (Piso Innegociable)

1. **Mínimo Privilegio en Herramientas (`LP1–LP4`)**: Declarar solo las herramientas necesarias en `allowed-tools`; prohibido `Bash(*)` o wildcard abierto en skills analíticas.
2. **Cero Ejecución Remota Ciegamente (`SC1–SC10`)**: Prohibido `rm -rf`, `curl | bash`, redirecciones ocultas de registry/fuentes (`SC10`), deserialización insegura (`DS1–DS4`), escalamiento hacia sockets/Docker (`PE1–PE5`) y bytecode `.pyc`/`__pycache__` empaquetado sin fuente (`SC8`).
3. **Zero Secret Exfiltration & Taint Tracking (`TT1–TT6`)**: Rastrear flujo léxico e intra/inter-función desde fuentes sensibles (`.env`, SSH keys, credenciales, variables de entorno) hacia sinks salientes (HTTP/markdown image leaks/stdout).
4. **Barrera Anti-Override, Anti-Refusal y Auto-Modificación (`AR1–AR3`, `RA1`, `AS1–AS3`, `EA1–EA5`)**: Ninguna skill puede ordenar ignorar reglas del sistema, suprimir negativas de seguridad (`AR1–AR3`), leer directorios de otras skills sin permiso (`AS1–AS3`), auto-modificar sus reglas/hooks (`RA1`) o secuestrar la selección de proveedor/modelo (`EA1–EA5`).
5. **Integridad MCP (`TP1–TP4`, `RP1–RP3`)**: La descripción declarada de toda tool MCP debe coincidir con lo que ejecuta el script (*Tool Poisoning* `TP1–TP4`) sin mutaciones diferidas/condicionales (*Rug-Pull* `RP1–RP3`).

---

## 🛠️ Matriz de Threat Vectors (`Hermes #13` + `NVIDIA SkillSpector v2.12`)

| Vector | Cobertura Técnica (`Hermes #13` + `SkillSpector`) | Reglas Clave | Severidad Base |
|---|---|---|---|
| **V1 · Ejecución, Supply-Chain & Deserialización** | Comandos destructivos, pipes remotos sin hash, `.pyc` sin fuente, desvío de registry (`PyPI`/`pnpm`), `pickle`/`yaml.load` inseguro, socket de Docker (`1.3x` multiplicador en scripts ejecutables) | `SC1–SC10` (`SC8`, `SC10`), `DS1–DS4`, `PE1–PE5` | `CRITICAL` / `HIGH` |
| **V2 · Exfiltración & Taint Flow (`TT1–6`)** | Lectura de `.env`, `id_rsa`, cookies/tokens + transmisión por red, URL query strings o markdown `![leak](...)`; snooping de memoria/skills vecinas | `TT1–TT6`, `AS1–AS3` | `CRITICAL` |
| **V3 · Prompt Injection, Anti-Refusal & Hijack** | Comentarios ocultos, Unicode invisible/Tags, overrides políglotas, coerción anti-refusal, auto-edición de `AGENTS.md`/`SKILL.md` o desvío de endpoint LLM | `AR1–AR3`, `RA1`, `EA1–EA5`, `prompt-shield` | `CRITICAL` |
| **V4 · Permisos & Seguridad MCP** | `allowed-tools` irrestricto, mismatch entre doc y código MCP (Tool Poisoning) o cambio de comportamiento post-aprobación (Rug-Pull) | `LP1–LP4`, `TP1–TP4`, `RP1–RP3` | `HIGH` / `CRITICAL` |
| **V5 · Metadatos, Baseline & Harness Readiness** | Coincidencia `name`/carpeta, SemVer, cláusula de exclusión, baseline YAML con SHA-256 ligado a versión, y chequeos Tier 1 (`--harness-check` + `--quality-score >= 70`) | `harness-check`, `QualityScore >= 70`, `.skillspector-baseline.yaml` | `MEDIUM` / `HIGH` |

---

## 🔄 Flujo de Auditoría Determinista en `skillsGV`

1. **Cuarentena Previa**: Ante skills/repos externos, correr primero [`safe_read.py`](../../03-ai-ml/prompt-shield/scripts/safe_read.py) con diales `9/8/10` (`exit 3` aborta lectura normal y emite reporte tripartito no-echo).
2. **Validación + Harness + Tier-1 Quality Score**:
   ```bash
   node 00-meta-skills/skill-validator/scripts/validate-skills.mjs <ruta-skill> --strict --harness-check --quality-score
   ```
   *(Verifica compatibilidad en 7 harnesses: `claude-code`, `codex`, `copilot-cli`, `hermes`, `openclaw`, `opencode`, `antigravity`; score mínimo `>= 70/100` con fórmula `0.35*Correctness + 0.25*Discoverability + 0.25*Reliability + 0.15*Efficiency`.)*
3. **Supresión Segura (`.skillspector-baseline.yaml`)**: Cualquier falso positivo justificado (e.g. firmas defensivas dentro de un escáner) se documenta por hash SHA-256 + versión de regla, jamás silenciando reglas globales con comodines.

---

## 🧭 Floor, Not Ceiling (`[Beyond-Baseline]`)

Los 5 vectores anteriores definen el piso mínimo de seguridad estática. Cuando el riesgo del entorno lo amerite, los auditores pueden sumar análisis AST inter-procedural completo, sandboxing en contenedores efímeros sin red o verificación simbólica anotándolo con `[Beyond-Baseline: <razón de seguridad>]`.
