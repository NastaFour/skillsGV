---
name: refactoring-ui
description: "Metodología Wathan & Schoger armonizada con tokens OKLCH: validación de jerarquía en escala de grises, contraste por peso/luminosidad y elevación multicapa. Úsala al pulir interfaces visuales. No usar para branding o logos."
license: MIT
metadata:
  version: "1.1.0"
  trigger: ["refactoring ui", "jerarquia visual", "escala de grises", "sombras multicapa", "espaciado fijo", "contraste sutil"]
  scope: [global, project]
allowed-tools: Read Bash(node:*)
---

# 📐 refactoring-ui — Metodología de Diseño Táctico y Jerarquía Visual

Conjunto de principios tácticos basados en *Refactoring UI* (Adam Wathan & Steve Schoger), integrados con el flujo de tokens semánticos OKLCH de `design-driven` (`DESIGN_SYSTEM.md`). Permite transformar interfaces rígidas o saturadas en experiencias visuales jerarquizadas, legibles y coherentes mediante decisiones sistemáticas de contraste, espaciado y elevación.

---

## 📋 Cuándo Usar

- Al diseñar o refactorizar pantallas frontend (formularios, tarjetas, tablas, páginas de ajustes, dashboards).
- Al notar que una interfaz se siente sobrecargada, desalineada o sin jerarquía clara entre datos primarios y metadatos.
- Para validar mediante la prueba de luminosidad/escala de grises que la jerarquía visual funciona sin depender exclusivamente del matiz (hue).
- Para calibrar elevaciones con sombras multicapa o bordes semánticos sutiles (`border-border-subtle`).
- Para estandarizar escalas modulares de espaciado (`4, 8, 12, 16, 24, 32, 48, 64px`) y tipografía.
- **NO usar** para diseño de logotipos, identidad corporativa desde cero o ilustraciones vectoriales complejas.
- **NO usar** para física de animaciones o gestos táctiles (usar `emil-kowalski`).

---

## 🚦 Reglas e Heurísticas de Jerarquía (Alineadas con `design-driven` D3)

1. **Prueba de Jerarquía Acromática Compatible con Tokens OKLCH**: En lugar de bloquear la definición de la paleta semántica de `DESIGN_SYSTEM.md` (Fase D3), utiliza la "escala de grises" como **heurística de validación óptica**: la jerarquía entre superficies (`--surface-primary`, `--surface-elevated`) y textos (`--text-primary`, `--text-secondary`, `--text-muted`) debe sostenerse por su canal de luminosidad (`L` en OKLCH) y peso tipográfico incluso si se desatura la pantalla al 0%.
2. **Jerarquía por Peso y Luminosidad, No por Ruido Cromático**: Para diferenciar niveles de información (título vs descripción vs fecha), variar el peso tipográfico (`font-semibold` frente a `font-normal`) y el token semántico de texto (`text-text-primary`, `text-text-secondary`, `text-text-muted`). Nunca asignar un color saturado distinto a cada línea de texto.
3. **Delimitación de Contenedores según el Arquetipo**:
   - En arquetipos *Atmospheric Minimalist*, *Humanist* o *Precision Dark UI*, evitar bordes pesados de alto contraste; preferir sombras multicapa suaves (`shadow-sm`, `shadow-md`), diferencias de luminosidad entre superficies (`bg-surface-elevated`) o bordes sutiles (`border-border-subtle`).
   - En arquetipos *Technical Monograph* o *Neo-Brutalist Swiss Grids*, las líneas divisorias expuestas de `1px solid` (`border-border-subtle` / `border-border-strong`) son estructurales e intencionales.
4. **Escala de Espaciado Modular (Rejilla de 4px / 8px)**: Los márgenes, paddings y gaps deben pertenecer a la escala modular (`4, 8, 12, 16, 24, 32, 48, 64px`). Evitar medidas mágicas arbitrarias que rompan el ritmo vertical.
5. **Presupuesto de Color Focal**: El 85–90% de la superficie debe apoyarse en tokens neutros o atmosféricos (`--surface-*`, `--text-*`). Reserva `--accent-primary` para acciones principales (CTA) y estados activos, y tokens semánticos (`--status-success`, `--status-warning`, `--status-danger`) para feedback puntual.
6. **Respiración Espacial y Ley de Proximidad**: Agrupa elementos relacionados con gaps estrechos (`gap-1.5` a `gap-3`) y separa secciones independientes con espacio generoso (`gap-6` a `gap-12`) antes de añadir líneas divisorias innecesarias.

---

## 💡 Principios Tácticos Fundamentales

### 1. Descomponer la Jerarquía en Tres Niveles Semánticos
En cualquier tarjeta, fila o panel, clasifica los textos en tres niveles:
- **Nivel Primario (El dato crucial)**: `text-text-primary font-semibold text-base` (ej. nombre de entidad, importe total).
- **Nivel Secundario (Contexto indispensable)**: `text-text-secondary font-normal text-sm` (ej. rol, descripción breve, identificador).
- **Nivel Terciario (Metadato auxiliar)**: `text-text-muted font-normal text-xs` (ej. marca temporal, estado de sincronización).

### 2. Separar Mediante Superficies y Proximidad
En lugar de trazar bordes pesados entre cada fila o bloque:
- Alterna tokens de superficie (`bg-surface-primary` frente a `bg-surface-elevated`).
- Deja que el espacio en blanco (`gap-6`) marque la separación natural entre grupos no relacionados.

### 3. Sombras Multicapa (Luz Directa + Luz Ambiental)
Cuando el arquetipo utilice elevación física:
- Combina una sombra ambiental corta que perfile el contorno inferior con una sombra direccional suave y difusa que simule luz cenital (`shadow-sm` / `shadow-md` en modo claro; iluminación de borde superior `inset 0 1px 0 oklch(1 0 0 / 0.06)` en modo oscuro).

### 4. Alineación Óptica en Tablas y Cifras
- Textos informativos: alineados a la izquierda (`text-left`).
- Cantidades, fechas, porcentajes e importes: alineados a la derecha (`text-right`) con cifras tabulares (`tabular-nums font-mono`).
- Cabeceras de tabla: discretas y estructuradas (`text-xs font-semibold uppercase tracking-wider text-text-secondary`).

---

## 🛠️ Flujo de Pulido Visual Armonizado con `DESIGN_SYSTEM.md`

1. **Anclaje de Tokens (`design-driven` D3)**: Define o verifica la escala OKLCH (`--surface-*`, `--text-*`, `--accent-*`, `--border-*`) asegurando saltos claros de luminosidad (`L`).
2. **Prueba de Contraste Acromático**: Verifica que al inspeccionar la vista sin saturación, las acciones primarias, títulos y contenedores sigan siendo inequívocos.
3. **Corrección de Proximidad y Espaciado**: Ajusta paddings y márgenes a la escala de 4/8px.
4. **Calibración de Bordes y Elevación**: Sustituye recuadros toscos por `bg-surface-elevated border border-border-subtle shadow-sm rounded-xl` (o hairlines limpias de `1px` si el arquetipo es *Monograph* / *Swiss Grid*).
5. **Aplicación Selectiva del Acento**: Reserva `bg-accent-primary` para el CTA principal de la vista.

---

## 💻 Ejemplos Prácticos de Refactorización

### Antes: Tarjeta sobrecargada con estilos arbitrarios y sin jerarquía
```html
<!-- Bordes duros arbitrarios, colores literales que compiten y ausencia de escala tipográfica -->
<div style="border: 2px solid #666; padding: 15px; margin: 10px; border-radius: 4px;">
  <h3 style="color: blue; font-size: 16px;">Elena Rostova</h3>
  <p style="color: black; font-size: 14px;">Arquitecta de Sistemas Principales</p>
  <span style="color: green; font-size: 14px;">Sincronizado hace 5 min</span>
  <button style="background: red; color: white; border: none; padding: 10px;">Revocar acceso</button>
</div>
```

### Después: Refactorizada con Jerarquía Wathan & Schoger + Tokens Semánticos
```html
<article class="flex items-center justify-between rounded-xl border border-border-subtle bg-surface-primary p-5 shadow-sm transition-shadow hover:shadow-md">
  <div class="flex items-center gap-4">
    <!-- Avatar sobre superficie elevada -->
    <div class="flex h-11 w-11 items-center justify-center rounded-full bg-surface-elevated font-semibold text-text-primary border border-border-subtle">
      ER
    </div>
    <div>
      <!-- Jerarquía primaria por peso y luminosidad -->
      <h3 class="text-sm font-semibold text-text-primary">
        Elena Rostova
      </h3>
      <!-- Nivel secundario atenuado -->
      <p class="text-xs text-text-secondary">
        Arquitecta de Sistemas Principales
      </p>
      <!-- Metadato terciario con indicador semántico puntual -->
      <p class="mt-1 flex items-center gap-1.5 text-xs text-text-secondary">
        <span class="h-1.5 w-1.5 rounded-full bg-accent-primary"></span>
        Sincronizado hace 5 min
      </p>
    </div>
  </div>
  <!-- Acción destructiva secundaria discreta hasta recibir foco/hover -->
  <button
    type="button"
    class="rounded-lg border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-medium text-text-primary hover:border-accent-primary transition-colors"
  >
    Revocar acceso
  </button>
</article>
```

---

## 🚀 Floor, Not Ceiling (`[Beyond-Baseline]`)

La jerarquía en tres niveles, la escala modular de 4/8px y la restricción de color focal constituyen el piso táctico para evitar interfaces caóticas. Cuando el arquetipo seleccionado en `DESIGN_SYSTEM.md` requiera decisiones expresivas deliberadas —como cuadrículas brutales con líneas expuestas de alto contraste (*Neo-Brutalist Swiss Grids*), tipografía hero de escala extrema (*Kinetic Typography*) o composiciones cromáticas inmersivas (*Bespoke / Creative Exploration*)—, estas prevalecen sobre las heurísticas conservadoras siempre que mantengan legibilidad WCAG y se documenten con `[Beyond-Baseline: <razón técnica/creativa>]`.

---

## 📚 Referencias

- [Flujo de Trabajo en Escala de Grises](references/grayscale-workflow.md)
- [Guía de Elevación y Sombras Multicapa](references/elevation-shadows.md)
- [Escala de Espaciado y Jerarquía Tipográfica](references/spacing-hierarchy.md)
