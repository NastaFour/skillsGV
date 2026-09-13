# skill-quality-gates Specification

## Purpose

Gates mecanizados de calidad del catálogo: descripción con cláusula de exclusión, presupuestos de contexto ratificados, `--check-deps` y auditoría de scripts en el validador.

## Requirements

### Requirement: Descripción con cláusula de exclusión

La plantilla de `skill-creator` MUST incluir una cláusula de exclusión ("Do NOT use for…") en la descripción; el validador SHOULD emitir warning cuando falte.

#### Scenario: Warning por exclusión ausente

- GIVEN una skill cuya descripción no declara cuándo NO usarla
- WHEN corre el validador
- THEN emite warning de exclusión ausente
- AND no falla el gate por ese motivo

### Requirement: Presupuesto de 500 líneas por SKILL.md (estándar ratificado)

El cuerpo de cada `SKILL.md` MUST tener ≤ 500 líneas; el validador en `--strict` MUST fallar (error) al exceder. Estándar ratificado por este cambio (antes ASSUMPTION-TO-RATIFY en la propuesta).

#### Scenario: Exceso en strict

- GIVEN un `SKILL.md` con 501 líneas de cuerpo
- WHEN corre el validador `--strict`
- THEN falla con error de presupuesto de líneas

#### Scenario: Límite exacto

- GIVEN un `SKILL.md` con exactamente 500 líneas de cuerpo
- WHEN corre el validador `--strict`
- THEN pasa sin error de presupuesto

### Requirement: Presupuestos de tokens (estándares ratificados)

El contexto Tier 0 MUST presupuestarse en ≤ ~2K tokens, con exceso reportado como warning (nunca error); la guía de tamaño por `SKILL.md` MUST fijarse en ≤ 5K tokens, reportada como guidance/warning. Ambos umbrales quedan ratificados como estándares del catálogo (antes ASSUMPTION-TO-RATIFY en la propuesta).

#### Scenario: Tier 0 excedido

- GIVEN un Tier 0 que supera ~2K tokens estimados
- WHEN corre el validador
- THEN emite warning con el presupuesto excedido
- AND el exit se mantiene exitoso

#### Scenario: SKILL.md excedido

- GIVEN un `SKILL.md` que supera ~5K tokens estimados
- WHEN corre el validador
- THEN emite guidance/warning sin error bloqueante

### Requirement: Check de dependencias (`--check-deps`)

El validador MUST exponer `--check-deps`, que verifica las dependencias/entorno declaradas por skill (campo `compatibility`/metadata) y reporta las no satisfechas.

#### Scenario: Dependencia no satisfecha

- GIVEN una skill que declara una dependencia de entorno no disponible
- WHEN corre el validador con `--check-deps`
- THEN reporta skill, dependencia y causa

### Requirement: Auditoría de scripts

La validación MUST escanear `scripts/` además de los cuerpos `SKILL.md`, marcando como error `curl`, `eval`/`Function` y `child_process` sin justificación declarada.

#### Scenario: Script con eval

- GIVEN un script del catálogo que usa `eval`
- WHEN corre el validador
- THEN falla con error de auditoría de scripts

#### Scenario: Child process justificado

- GIVEN un script que usa `child_process` con justificación declarada en la skill
- WHEN corre el validador
- THEN no es error de auditoría
