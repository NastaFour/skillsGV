---
name: ui-ux-pro-max
description: "Base de 50+ estilos UI, 160+ paletas y reglas por industria (SaaS, Fintech, E-commerce). Úsala antes de codificar interfaces web y móviles. No usar para APIs o backend."
license: MIT
metadata:
  version: "1.0.0"
  trigger: ["ui ux pro max", "estilos ui", "paleta de colores", "bento grid", "glassmorphism", "brutalismo", "reglas de diseño"]
  scope: [global, project]
allowed-tools: Read Bash(node:*)
---

# 💎 ui-ux-pro-max — Motor de Estilos UI, Paletas y Reglas de Diseño

Motor de razonamiento visual y base de conocimiento de diseño frontend. Proporciona más de 50 estilos visuales documentados, más de 160 combinaciones cromáticas accesibles y directivas estrictas de interfaz según la industria del producto (SaaS, Fintech, E-commerce).

---

## 📋 Cuándo Usar

- Al concebir, estructurar o rediseñar pantallas antes de escribir código HTML/CSS/Tailwind.
- Para seleccionar el estilo visual idóneo (Bento Grid, Glassmorphism, Neobrutalismo, Minimalismo Suizo, Aurora UI) según el arquetipo de producto.
- Para definir una paleta cromática completa con proporciones armónicas (60-30-10) y ratios de contraste WCAG AA/AAA.
- Para aplicar directivas específicas de industria (densidad en SaaS, tipografía tabular en Fintech, fricción mínima en E-commerce).
- **NO usar** para lógica de backend, consultas de base de datos o desarrollo de APIs.
- **NO usar** para la entrevista de unicidad de marca de producto (usar `design-driven` para el ciclo D1-D6).

---

## 🚦 Reglas Duras

1. **Preflight Obligatorio antes del Código**: Antes de emitir cualquier componente o vista, declarar explícitamente en el chat:
   - **Arquetipo de Estilo**: (ej. *Bento Grid Minimalista*).
   - **Industria y Contexto**: (ej. *SaaS B2B Analítico*).
   - **Trío Cromático (60-30-10)**: Base neutra (60%), Estructura (30%), Acento interactivo (10%).
   - **Garantía de Contraste**: Confirmar ratio WCAG AA (mínimo 4.5:1 para texto regular, 3.0:1 para texto grande).
2. **Coherencia de Estilo Único**: Prohibido mezclar estilos visuales dispares en la misma vista (ej. no combinar bordes neobrutalistas gruesos con tarjetas translúcidas de glassmorphism).
3. **Regla del Acento Único**: Un solo color primario interactivo para llamadas a la acción (CTA). No competir con múltiples colores saturados en botones secundarios.
4. **Doble Codificación de Estado**: Ningún estado crítico (éxito, error, advertencia) puede depender únicamente del color; acompañar con icono, glifo direccional o texto explicativo.
5. **Cifras Tabulares en Datos Cuantitativos**: En métricas, tablas y balances, es obligatorio usar `tabular-nums` o fuentes monoespaciadas para evitar desalineación visual durante actualizaciones.

---

## 🏛️ Motor de Selección de Estilos UI

Selecciona el arquetipo visual según la naturaleza y el público objetivo del producto:

| Estilo Visual | Industria Óptima | Elementos Clave | Cuándo Evitar |
|---|---|---|---|
| **Bento Grid** | SaaS, Portafolios, Tech | Rejilla asimétrica modular, `rounded-2xl`, fondos tenues, micro-interacciones | Entrada masiva de datos en formularios |
| **Glassmorphism** | Dashboards Dark, Web3 | `backdrop-blur-md`, bordes `border-white/10`, tarjetas translúcidas | Fondos planos claros o alto requisito AAA |
| **Neobrutalismo** | Creator tools, B2C juvenil | Bordes negros de 2-3px, sombras duras sin blur, colores vivos | Banca tradicional o software médico |
| **Minimalismo Suizo** | Enterprise B2B, Legal | Retícula matemática, tipografía sans limpia, alto contraste, cero adorno | Juegos, entretenimiento infantil |
| **Aurora UI** | AI tools, Landing pages | Gradientes difuminados mesh, fondos atmosféricos, glow suave | Pantallas de configuración densas |
| **Dark Futurism** | DevTools, Cripto, Consolas | Fondos `#09090b`, acentos cian/lima neón, fuentes monospace | E-commerce de moda clásica |

Para consultar los más de 50 arquetipos detallados con rasgos y contraindicaciones, ver [Catálogo de Estilos UI](references/ui-styles.md).

---

## 🎨 Sistema de Paletas Cromáticas

Estructura tu paleta respetando la regla 60-30-10:
- **60% Base**: Fondo general y superficies principales (blanco puro, slate tenue o dark zinc).
- **30% Estructura**: Tipografías secundarias, bordes sutiles, divisiones y fondos de tarjetas.
- **10% Acento**: Reservado para botones principales de acción (CTA), estados activos y elementos focales.

### Presets Destacados por Dominio
- **SaaS Blue Steel**: Fondo `#f8fafc`, Superficie `#ffffff`, Texto `#0f172a`, Acento `#2563eb` (Blue 600).
- **Fintech Emerald Reserve**: Fondo `#090d0b`, Superficie `#111815`, Borde `#1c2b23`, Acento `#10b981` (Emerald 500).
- **E-commerce Warm Terracotta**: Fondo `#fafaf9`, Superficie `#ffffff`, Texto `#1c1917`, Acento `#ea580c` (Orange 600).
- **DevTools Cyber Lime**: Fondo `#09090b`, Superficie `#18181b`, Borde `#27272a`, Acento `#a3e635` (Lime 400).

Para el catálogo completo con más de 160 variaciones y tablas de contraste, ver [Catálogo de Paletas de Colores](references/color-palettes.md).

---

## 🏭 Directivas de Diseño por Industria

### SaaS B2B y Dashboards
- Cabeceras de tabla fijas con tipografía `text-xs uppercase tracking-wider text-slate-500 font-semibold`.
- Acciones destructivas aisladas y protegidas mediante diálogo modal de confirmación explícita.
- Paginación y filtros reflejados en la URL para reproducibilidad del estado.

### Fintech y Banca
- Cifras financieras formateadas con `tabular-nums` y dos decimales consistentes.
- Estados de variación de saldo con icono (`↑` verde / `↓` rojo) para accesibilidad de usuarios con daltonismo.
- Soporte para modo de privacidad que difumine balances con un clic.

### E-commerce y Retail
- Tarjetas de catálogo con aspecto de imagen uniforme (1:1 o 4:5).
- Precio actual prominente y precio original atenuado con tachado.
- Botón de compra de al menos 44x44px táctil y fijado en móvil como barra inferior sticky.

Para las reglas completas de arquitectura de interfaz por industria, ver [Reglas de Diseño por Industria](references/industry-rules.md).

---

## 💻 Ejemplos de Implementación

### Ejemplo 1: Tarjeta Bento Grid en Tailwind CSS
```html
<article class="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-shadow dark:border-slate-800 dark:bg-slate-900">
  <div class="flex items-center justify-between">
    <span class="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
      <span class="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
      Rendimiento Activo
    </span>
    <span class="text-xs text-slate-400">Últimos 30 días</span>
  </div>
  <div class="mt-4">
    <h3 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
      99.98%
    </h3>
    <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
      Disponibilidad global de infraestructura de procesamiento.
    </p>
  </div>
</article>
```

### Ejemplo 2: Indicador Fintech con Doble Codificación
```html
<div class="flex items-center gap-2">
  <span class="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400" aria-label="Incremento del 12.4%">
    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
    <span class="tabular-nums">+12.4%</span>
  </span>
  <span class="text-xs text-slate-500">vs mes anterior</span>
</div>
```

---

## 📚 Referencias

- [Catálogo Extendido de Estilos UI](references/ui-styles.md)
- [Catálogo de 160+ Paletas de Colores](references/color-palettes.md)
- [Reglas Específicas por Industria (SaaS, Fintech, E-commerce)](references/industry-rules.md)
