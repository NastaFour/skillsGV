---
name: refactoring-ui
description: "Metodología Wathan & Schoger: diseñar primero en escala de grises, jerarquía por peso/tono y sombras multicapa. Úsala al pulir interfaces visuales. No usar para branding o logos."
license: MIT
metadata:
  version: "1.0.0"
  trigger: ["refactoring ui", "jerarquia visual", "escala de grises", "sombras multicapa", "espaciado fijo", "contraste sutil"]
  scope: [global, project]
allowed-tools: Read Bash(node:*)
---

# 📐 refactoring-ui — Metodología de Diseño para Desarrolladores

Conjunto de principios tácticos basados en el framework de Adam Wathan y Steve Schoger (*Refactoring UI*). Permite transformar interfaces rígidas o toscas en experiencias visuales jerarquizadas, elegantes y legibles mediante decisiones sistemáticas de diseño.

---

## 📋 Cuándo Usar

- Al diseñar o refactorizar pantallas frontend (formularios, tarjetas, tablas, páginas de ajustes, dashboards).
- Al notar que una interfaz se siente sobrecargada, desalineada o con falta de jerarquía clara.
- Para eliminar bordes negros pesados y sustituirlos por sombras suaves multicapa y elevaciones naturales.
- Para estandarizar escalas fijas de espaciado (4/8/12/16/24/32/48/64) y tipografía sin inventar números mágicos.
- Para reducir el ruido visual eliminando colores innecesarios que compiten entre sí.
- **NO usar** para diseño de logotipos, branding de marca o ilustraciones complejas.
- **NO usar** para animaciones táctiles complejas (usar `emil-kowalski` o `motion-framer`).

---

## 🚦 Reglas Duras

1. **Escala de Grises Primero (Grayscale First)**: Prohibido introducir color hasta que la pantalla completa sea plenamente comprensible, legible y equilibrada en blanco, negro y escala de grises. El color es un acento y refuerzo semántico, no la estructura.
2. **Jerarquía por Peso y Tono, No por Color**: Para diferenciar niveles de información (título vs descripción vs fecha), variar el peso tipográfico (`font-semibold` frente a `font-normal`) y el tono del gris (`text-slate-900`, `text-slate-600`, `text-slate-400`). Nunca asignar un color saturado diferente a cada línea de texto.
3. **Prohibición de Bordes Negros Duros**: No utilizar bordes gruesos de alto contraste (`border-gray-400` o `border-black`) para delimitar contenedores. Emplear sombras multicapa suaves (`shadow-sm`, `shadow-md`) o bordes muy sutiles (`border-slate-200/60` sobre blanco, o `border-white/10` en modo oscuro).
4. **Escala de Espaciado Estricta (Rejilla de 4px / 8px)**: Todos los márgenes, paddings y distancias deben pertenecer a la escala estricta: `4, 8, 12, 16, 24, 32, 48, 64px` (Tailwind `p-1`, `p-2`, `p-3`, `p-4`, `p-6`, `p-8`, `p-12`, `p-16`). Prohibido usar medidas arbitrarias no modulares.
5. **No Saturar con Color (Un Solo Acento Primario)**: El 90% de la interfaz debe ser territorio de neutros y grises. Reserva un único color de acento primario para las acciones principales (CTA). Los colores semánticos (verde, rojo, ámbar) solo se aplican para comunicar estados puntuales.
6. **Empezar con Demasiado Espacio en Blanco**: Diseñar primero con espaciados amplios y generosos. Es notablemente más sencillo ajustar y compactar una vista que descomprimir una interfaz congestionada.

---

## 💡 Principios Tácticos Fundamentales

### 1. Descomponer la Jerarquía en Tres Niveles
En cualquier tarjeta o bloque de información, clasifica los textos en:
- **Nivel Primario (El dato crucial)**: `text-slate-900 font-semibold text-base` (ej. nombre de usuario, importe total).
- **Nivel Secundario (Contexto indispensable)**: `text-slate-600 font-normal text-sm` (ej. descripción, correo electrónico).
- **Nivel Terciario (Metadato auxiliar)**: `text-slate-400 font-normal text-xs` (ej. fecha, estado de sincronización).

### 2. Separar Mediante Fondos en Vez de Líneas Divisarias
En lugar de trazar una línea horizontal entre cada fila o sección:
- Alterna tonos tenues de fondo (`bg-slate-50` frente a `bg-white`).
- Deja que el espacio en blanco (`gap-6`) marque la separación natural entre grupos no relacionados (principio de proximidad).

### 3. Sombras Multicapa (Luz Directa + Luz Ambiental)
Una sombra realista combina:
- Una sombra ambiental pequeña y suave que delimita el borde inferior.
- Una sombra direccional más amplia y translúcida que simula la fuente de luz superior.
- En Tailwind CSS, las clases estándar `shadow-sm` y `shadow-md` implementan esta doble capa.

### 4. Alineación Correcta en Tablas y Cifras
- Textos informativos: siempre alineados a la izquierda (`text-left`).
- Números, fechas, porcentajes y monedas: siempre alineados a la derecha (`text-right`) y con cifras tabulares (`tabular-nums font-mono`).
- Cabeceras de tabla: atenuadas respecto a los datos (`text-xs font-semibold uppercase tracking-wider text-slate-500`).

---

## 🛠️ Flujo de Refactorización Paso a Paso

1. **Auditoría Monocromática**: Pasa toda la vista a escala de grises reemplazando fondos, textos y bordes de color por grises neutros (`slate` o `zinc`).
2. **Corrección de Espaciado**: Aplica la escala de 4/8/16/24/32px y verifica que los elementos dependientes estén más juntos que los bloques independientes.
3. **Reemplazo de Bordes**: Sustituye líneas negras por `bg-white shadow-sm border border-slate-200/60 rounded-xl`.
4. **Calibración de Tipografía**: Ajusta pesos (`font-semibold` / `font-normal`) y contrastes (`text-slate-900` / `text-slate-500`).
5. **Reintroducción del Color Focal**: Aplica el color de acento primario únicamente al botón de acción decisiva y a estados activos relevantes.

---

## 💻 Ejemplos Prácticos de Refactorización

### Antes: Tarjeta sobrecargada "hecha por programador"
```html
<!-- Código tosco con bordes duros, colores arbitrarios y falta de jerarquía -->
<div style="border: 2px solid #666; padding: 15px; margin: 10px; border-radius: 4px;">
  <h3 style="color: blue; font-size: 16px;">Juan Pérez</h3>
  <p style="color: black; font-size: 14px;">Administrador de Sistemas</p>
  <span style="color: green; font-size: 14px;">Activo hace 5 min</span>
  <button style="background: red; color: white; border: none; padding: 10px;">Suspender</button>
</div>
```

### Después: Refactorizada con la metodología Wathan & Schoger
```html
<article class="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
  <div class="flex items-center gap-4">
    <!-- Avatar con tono neutro y borde sutil -->
    <div class="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
      JP
    </div>
    <div>
      <!-- Jerarquía primaria por peso y tono -->
      <h3 class="text-sm font-semibold text-slate-900 dark:text-white">
        Juan Pérez
      </h3>
      <!-- Nivel secundario en gris atenuado -->
      <p class="text-xs text-slate-500 dark:text-slate-400">
        Administrador de Sistemas
      </p>
      <!-- Metadato terciario con indicador sutil -->
      <p class="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
        <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
        Activo hace 5 min
      </p>
    </div>
  </div>
  <!-- Acción secundaria discreta en gris en lugar de botón rojo invasivo -->
  <button type="button" class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
    Suspender
  </button>
</article>
```

---

## 📚 Referencias

- [Flujo de Trabajo en Escala de Grises](references/grayscale-workflow.md)
- [Guía de Elevación y Sombras Multicapa](references/elevation-shadows.md)
- [Escala de Espaciado y Jerarquía Tipográfica](references/spacing-hierarchy.md)
