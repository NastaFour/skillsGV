# Guía Exhaustiva de Registro y Referencia de UI Moderna

### Arquitectura de Diseño Agéntico, Gobernanza Estética y Prevención de AI Slop

**Rol**: Arquitecto de Software y Diseñador de Sistemas de Diseño Senior  
**Fecha de Publicación**: Septiembre de 2026  
**Adaptación**: Ecosistema skillsGV (MIT)

---

## 1. PRINCIPIOS FUNDAMENTALES DE DISEÑO UI/UX MODERNO

### 1.1 Filosofía del Diseño Moderno: La Lucha contra el "AI Slop"
El fenómeno del **"AI Slop"** en interfaces generadas por agentes se define como la convergencia estética genérica producto de la inercia probabilística de los modelos de lenguaje: uso indiscriminado de la tipografía *Inter*, degradados continuos de púrpura a azul ("AI-purple"), sombreados difusos exagerados, bordes decorativos superfluos y tarjetas anidadas dentro de tarjetas sin justificación funcional.

Para erradicar esta inercia, la disciplina moderna exige **Gobernanza Estética**. El diseño no se confía al azar; se modela mediante restricciones deterministas y sistemas de reglas de ingeniería frontend que fuerzan al modelo a romper sesgos y operar con criterio arquitectónico.

---

### 1.2 Inferencia de Brief y el "Design Read" (Sección 0)
Antes de escribir código o estilos, el agente ejecuta una rutina de análisis semántico y espacial del proyecto evaluando seis señales:
1. **Página Core (Page Kind)**: Clasificación funcional (landing, portafolio, SaaS denso, editorial, institucional).
2. **Palabras de Vibe (Vibe Words)**: Adjetivos específicos del diseño ("minimalista", "brutalista suizo", "lujo silencioso", "calidez artesanal").
3. **Referencias Estéticas (References)**: Sitios web o marcas ancla reales (Linear, Apple, Stripe, Godly).
4. **Público Objetivo (Audience)**: Perfil demográfico y ergonómico del usuario final.
5. **Activos de Marca Preexistentes (Brand Assets)**: Paletas existentes, logotipos y tokens vigentes.
6. **Restricciones Silenciosas (Quiet Constraints)**: Requisitos de accesibilidad extrema o rendimiento.

#### Requerimiento Obligatorio: "Design Read"
El agente debe declarar en el chat una línea estructurada antes de generar cualquier componente:
> **"Reading this as: [Público Objetivo] for [Producto/Propósito], with a [Estilo Estético/Vibe] language, leaning toward [Herramientas/Stack Técnico]."**

*Ejemplo*:
> *"Reading this as: B2B SaaS landing for technical buyers, with a Linear-style minimalist language, leaning toward Tailwind utilities + Geist + restrained motion."*

---

### 1.3 Parametrización Triaxial: El Sistema de Diales
La visualización se calibra mediante un vector numérico de diales del **1 al 10**:

$$\vec{T} = \begin{bmatrix} \text{DESIGN\_VARIANCE} \\ \text{MOTION\_INTENSITY} \\ \text{VISUAL\_DENSITY} \end{bmatrix}$$

#### 1. DESIGN_VARIANCE (1-10) — Desviación de Simetría
- **1-3 (Predictivo / Simétrico)**: Estructuras puramente simétricas, grid clásico de 12 columnas con fracciones idénticas.
- **4-7 (Offset / Asimétrico Moderado)**: Desplazamientos espaciales controlados (`margin-top: -2rem`), aspect ratios combinados (4:3 con 16:9), encabezados a la izquierda con datos centrados.
- **8-10 (Asimetría Radical / Editorial)**: Retículas masonry, proporciones `2fr 1fr 1fr`, espacio negativo intencional (`padding-left: 20vw`).
- **Mobile Override**: Si `DESIGN_VARIANCE` es 4-10, en pantallas <768px debe colapsar obligatoriamente a una sola columna (`w-full`, `px-4`, `py-8`).

#### 2. MOTION_INTENSITY (1-10) — Nivel de Animación
- **1-3 (Estático)**: Sin animaciones de entrada automáticas, solo `:hover` y `:active` instantáneos, `prefers-reduced-motion` por defecto.
- **4-7 (Fluido CSS)**: Transiciones con aceleración física (`cubic-bezier(0.16, 1, 0.3, 1)`), cascada con `animation-delay`, propiedades aceleradas por GPU (`transform`, `opacity`).
- **8-10 (Coreografía Avanzada)**: GSAP ScrollTrigger, animaciones nativas conducidas por scroll, resortes con Motion v11.
- **Hard Ban**: Prohibido `window.addEventListener('scroll')` en JavaScript. Usar `useScroll` de Motion, `IntersectionObserver` o GSAP ScrollTrigger con `kill()` al desmontar.

#### 3. VISUAL_DENSITY (1-10) — Información por Viewport
- **1-3 (Galería / Lujo)**: Mucho espacio en blanco, separaciones `py-32` a `py-48`, escala tipográfica generosa.
- **4-7 (App Diaria / SaaS)**: Espaciado comercial estándar (`py-16` a `py-24`), equilibrio entre densidad y legibilidad.
- **8-10 (Cockpit / Dashboard)**: Máxima concentración de datos, paddings mínimos, sin tarjetas decorativas, separadores sutiles de 1px. **Requisito obligatorio**: uso estricto de `font-mono` para valores numéricos.

---

## 2. SISTEMA DE TOKENS Y ESTILOS

### 2.1 Color y Teoría de OKLCH
El sistema adopta la especificación **OKLCH** (Luminancia, Croma, Matiz) para garantizar percepción uniforme de luminosidad y contraste:

```css
:root {
  --color-bg-base: oklch(0.98 0.005 240);
  --color-text-ink: oklch(0.12 0.010 240);
  --color-accent-primary: oklch(0.55 0.220 142); /* Emerald de alto contraste */
}
```

#### Color Consistency Lock
1. Se permite únicamente **un solo color de acento principal** con saturación estricta `< 80%` por viewport.
2. Declarado el acento, se replica idéntico en elementos interactivos, focus rings y badges, prohibiendo alternar a tonos no mapeados.

---

### 2.2 Tipografía y Ritmo Visual

#### Font Pairing en Contraste
Evitar fuentes de la misma categoría geométrica (ej. no mezclar Inter con Geist). Seguir la regla de contraste de ejes:
- *Serif* (títulos) + *Sans-serif* (cuerpo).
- *Geometric Sans* (títulos) + *Humanist Sans* (cuerpo).
- Familia única (*Single-Family*) explotada en pesos y anchos.

#### El Techo del Heading Hero
```css
h1.hero-display {
  font-size: clamp(2.5rem, 5vw + 1rem, 6rem); /* Techo estricto de 6rem (~96px) */
}
```

#### Suelo del Letter-Spacing
Para titulares en negrita con alto peso visual, el suelo rígido es **`-0.04em`**. Valores inferiores como `-0.05em` o `-0.08em` hacen colisionar caracteres.

#### Italic Descender Clearance
Al usar variantes en cursiva dentro de títulos, aplicar `leading-[1.15]` y `pb-1` para evitar recorte de descendentes tipográficos (y, g, j, p, q) en WebKit y Blink.

---

### 2.3 Espaciado y Layout
- **Ritmo de Espaciado**: Variar rellenos entre secciones (`pt-32 pb-16` seguido de `pt-12 pb-32`) evitando el repetitivo `py-20` en todo el documento.
- **Ancho de Prosa**: Párrafos y cuerpos de texto limitados a **`65ch - 75ch`**.

---

### 2.4 Elevación, Sombras y Radios de Borde
- **Tarjetas y Contenedores**: Radio máximo de **`12px` o `16px`** (`rounded-xl` en Tailwind v4). Prohibidos radios desmedidos de 32px o 40px en rectángulos grandes.
- **Botones e Inputs**: Entre `6px` y `8px`, o pastilla de `9999px` cuando el brief lo justifique.

---

## 3. REGISTRO DE COMPONENTES Y PATRONES

### 3.1 Disciplina del Hero Section
- **Límite de Texto**: Máximo 4 elementos jerárquicos: (1) Eyebrow, (2) Headline (max 2 líneas), (3) Subtexto (max 20 palabras, max 4 líneas), (4) CTA principal.
- **Padding Superior**: Altura de padding superior desktop limitada a **`pt-24`** máximo.
- **Above-the-fold**: Todo el Hero debe ser visible inmediatamente sin scroll.

### 3.2 Navbars
- Altura máxima de **`80px`** en desktop, distribuida en una sola línea horizontal.
- Prohibidos indicadores decorativos flotantes de estado no conectados a APIs reales.

### 3.3 Bento Grids
- **Variación de Fondo**: Al menos el **30% de las celdas** debe contener variación de textura (foto real, patrón abstracto o color sólido contrastante).
- **Conteo Exacto**: Para $N$ elementos de datos, exactamente $N$ celdas funcionales, sin cajas vacías de relleno.

### 3.4 Micro-interacciones y Animación
- **Skeletal Loaders**: Prohibidos spinners circulares genéricos; usar esqueletos estructurales que reproduzcan la geometría final.
- **Tactile Feedback**: Hover con micro-elevación y active con micro-compresión (`scale-[0.98]`).
- **GSAP Sticky-Stack Pattern**: Para secuencias con `MOTION_INTENSITY > 7`, apilar tarjetas fijando el contenedor y matando triggers al desmontar (`ScrollTrigger.getAll().forEach(t => t.kill())`).

---

## 4. ACCESIBILIDAD Y RESPONSIVIDAD (A11Y)

- **Contraste Lumínico**: Mínimo **`4.5:1`** bajo WCAG AA para textos normales, inputs y botones (`3:1` para display grande).
- **Container Queries**: Usar `@container (min-width: ...)` y unidades dinámicas (`cqi`, `cqw`) en lugar de depender únicamente de media queries globales.
- **Reduced Motion**: Si `MOTION_INTENSITY > 3`, incluir `@media (prefers-reduced-motion: reduce)` con animaciones desactivadas y transiciones de opacidad sutiles.
- **Estabilidad de Viewport**: Utilizar `min-h-[100dvh]` y evitar `h-screen` que genera saltos de layout en móviles.

---

## 5. ANTI-PATRONES VISUALES: LOS 10 ABSOLUTE BANS

1. **Em-dash (—) y en-dash (–)** en copy visible de UI (usar guión simple o reescribir).
2. **The Lila Rule**: Prohibidos gradientes violeta neón en botones y tarjetas.
3. **Beige/Brass Cliché**: Prohibida la paleta marfil/latón de IA. Rotar a Cold Luxury, Forest o Cobalt+Cream.
4. **Eyebrows numerados (01/02/03)** sin justificación cronológica real.
5. **Side-stripe >1px** decorativo en tarjetas.
6. **Gradient text overload**: degradados en texto limitados a máximo 3 palabras en titular hero.
7. **SaaS cliché de 3 métricas gigantes** bajo el hero.
8. **Scroll listener JS**: prohibido `window.addEventListener('scroll')`.
9. **Div-based fake product UI**: no falsear terminales o chats con divs; usar screenshots reales o vectores limpios.
10. **Scroll cues ban**: prohibido *"Scroll to explore"* o ratones animados.

---

## 6. LAS 6 CLAVES DE FABLE 5.1

1. **Brand Guide ANTES de codear**: No generar estilos sin antes declarar la identidad y el Design Read.
2. **Las 3 P's**: Definir siempre **Persona** (quién es y cómo habla), **Dolor** (qué problema resuelve) y **Promesa** (qué se lleva en 10 segundos).
3. **Anclaje de Scroll**: Diseñar páginas con cadencia y ritmo al descender, no pantallas estáticas aisladas.
4. **URL de Referencia Real**: Basarse en productos vivos o referencias de primer nivel para capturar la esencia, jamás para clonar ciegamente.
5. **Componentes Curados (21st.dev)**: Aprovechar bloques estructurales avanzados y de alta artesanía cuando aporten profundidad.
6. **Verificar Móvil Primero**: El mayor tráfico ocurre en viewport estrecho; verificar siempre que la asimetría colapse limpiamente a 1 columna.

---

## 7. FLUJO DE INSPIRACIÓN Y PROMPTING DE ALTA FIDELIDAD

- **Flujo de Trabajo**: Referencias en Dribbble, Pinterest o Figma → Regulación mediante skills `impeccable` y `taste-skill` → Prompt preciso (estética declarada + intención + par tipográfico + paleta OKLCH + restricciones + motion) → Construcción de una librería propia de estructuras y patrones, no de meras capturas.
- **Fuentes de Inspiración Recomendadas**: Godly.design, Awwwards, 21st.dev.
- **Generación de Imágenes**: Inferencia vía Fal.ai (FLUX Schnell) si el MCP está disponible; de lo contrario, emplear activos del proyecto. Nunca fotos de stock genéricas de IA.

---

## 8. SINCRONIZACIÓN DE CONTEXTO MEDIANTE MCP (OPCIONAL)

1. **Figma MCP / Code Connect**: Sincronización bidireccional entre canvas y repositorio (`figma-implement` canónico para generación de código).
2. **21st.dev MCP**: Búsqueda semántica e inserción de componentes curados de Tailwind y Motion:
   ```bash
   pnpm dlx @21st-dev/cli@latest init --client [cursor|claude|vscode|windsurf]
   ```
3. **Fal.ai MCP**: Inferencia de imágenes de alta fidelidad optimizadas en formato WebP con FLUX Schnell (`https://mcp.fal.ai/mcp`).

---

## 9. ÍNDICE DE FUENTES Y REFERENCIAS TÉCNICAS

1. 133 UI Component Libraries for React & Tailwind - 21st.dev
2. 21st MCP — UI Components for AI Coding Agents - 21st.dev
3. 21st.dev
4. 24 Graphic Design Websites Every Marketer Should Know in 2026 - Magier
5. AGENTS.md - pbakaus/impeccable - GitHub
6. Antigravity IDE
7. Arquitectura de Desarrollo Agéntico: Metodologías de Control Estético contra la Convergencia de Interfaces Genéricas
8. Best Image Generation API for Developers in 2026 | Wireflow Blog
9. Build with Google Antigravity, our new agentic development platform
10. CLAUDE.md - pbakaus/impeccable - GitHub
11. CSS container queries - MDN Web Docs
12. Changelog | Taste Skill
13. Claude Design from Anthropic Labs: How to Make It On-Brand With a brand-guidelines.md
14. Claude Fable - Anthropic
15. Connect your AI to 1,000+ models with the fal MCP Server
16. Documentation | Taste Skill
17. Every claude vibecoded app looks the same! What are your best tips to avoid that generic Claude look? - Reddit
18. Fal AI Development Services | Image Generation & AI Model API Integration
19. GLips/Figma-Context-MCP: MCP server to provide Figma layout information to AI coding agents - GitHub
20. GPT-6 Astra for Web Design: Can It Beat Claude Fable 5.1? | MindStudio
21. Getting Started with Google Antigravity - Codelabs
22. GitHub - pbakaus/impeccable: The design language that makes your AI harness better at design
23. Google Antigravity - Lexicon Branding
24. Google Antigravity A Complete Guide: Features, How It Works
25. Google transform Antigravity Upgrade from an AI powered IDE to A Software a Seamless Coding Environment
26. Guide to the Figma MCP server
27. Home | Google Antigravity Docs
28. IDE Extensions | Google Antigravity Docs
29. Impeccable — AI Design Skills for Cursor & Claude Code - Web Developer
30. Impeccable — Design Skill for Claude Code, Cursor, Codex | mdskills.ai
31. Introducing Claude Fable 5.1 and Claude Mythos 5.1 - Anthropic
32. Introducing Custom Agents | Google Antigravity Blog
33. Introducing IDE Extensions | Google Antigravity Blog
34. Introduction | Developer Docs
35. Kokonut Baffier — 54 React Components, Preview & Copy - 21st.dev
36. Layouts — 24 React Components, Preview & Copy - 21st.dev
37. Magic MCP → 21st MCP - GitHub
38. Mastering Impeccable: AI Skill Design for Frontend - Antonio Cárdenas
39. Not a designer: How do you make claude vibe code a web page without it turning into boring AI slop? - Reddit
40. Prompt Guide - Taste Skill
41. Set up the remote server (recommended) | Developer Docs
42. Taste Skill | The Anti-Slop Frontend Framework for AI Agents
43. Taste Skill: The Anti-Slop Frontend Framework That Makes AI Agents Design Like Pros
44. Taste-Skill - gives your AI good taste. stops the AI from generating boring, generic slop · GitHub
45. UX Design Agent Skill - Impeccable
46. Use 21st in Your Agent: One CLI, Every Editor, One Endpoint
47. What is the Figma MCP server?
48. What's new in Claude Fable 5.1
49. fal.ai vs WaveSpeedAI: An Honest Side-by-Side for 2026
50. overflow-anchor CSS property - MDN Web Docs
51. scroll-snap-type CSS property - MDN Web Docs
52. taste-skill/skills/taste-skill/SKILL.md at main · Leonxlnx/taste-skill - GitHub
