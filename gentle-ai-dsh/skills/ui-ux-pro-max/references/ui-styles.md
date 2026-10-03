# Catálogo Extendido de Estilos UI (50+ Arquetipos)

Guía de referencia para selección y aplicación consistente de estilos visuales en interfaces digitales.

---

## 1. Minimalismo y Estructura Moderna

### 1.1 Bento Grid
- **Rasgos visuales**: Distribución asimétrica de tarjetas modulares rectangulares inspiradas en las cajas bento japonesas. Esquinas redondeadas (`rounded-2xl` o `rounded-3xl`), fondos sutiles, micro-interacciones individuales por celda y jerarquía de tamaños según la relevancia de la información.
- **Cuándo usar**: Landing pages de producto, páginas de características (features), dashboards ejecutivos y resúmenes de portafolio.
- **Cuándo NO usar**: Interfaces densas de entrada de datos masiva o tablas complejas de contabilidad.
- **Clases clave Tailwind**: `grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6 bg-slate-950 text-white rounded-3xl`.

### 1.2 Swiss Style / Estilo Tipográfico Internacional
- **Rasgos visuales**: Rigurosa retícula matemática, jerarquía tipográfica sin serifa audaz, alineación estricta a la izquierda, espacios negativos amplios y ausencia casi total de ornamentación.
- **Cuándo usar**: Publicaciones editoriales, sitios web corporativos de arquitectura, consultoría de alto nivel y marcas de diseño.
- **Cuándo NO usar**: Juegos, aplicaciones infantiles o software con carga lúdica.
- **Clases clave Tailwind**: `font-sans tracking-tight leading-none text-slate-900 border-t border-slate-900 pt-6`.

### 1.3 Flat Design 2.0 (Modern Semi-Flat)
- **Rasgos visuales**: Base plana enriquecida con sombras muy difusas y sutiles capas de elevación. Conserva la simplicidad cromática sin la bidimensionalidad rígida del Flat original.
- **Cuándo usar**: Aplicaciones de productividad general, paneles administrativos y software SaaS empresarial.
- **Cuándo NO usar**: Productos de entretenimiento inmersivo o marcas de lujo que requieran alta textura.

### 1.4 Minimalismo Monocromático
- **Rasgos visuales**: Paleta restringida a blanco, negro y una gama estricta de tonos de gris con un único acento funcional. Enfoque absoluto en la tipografía y el espacio en blanco.
- **Cuándo usar**: Herramientas para desarrolladores (developer tools), plataformas de lectura y aplicaciones de notas.

---

## 2. Profundidad, Luz y Materialidad

### 2.1 Glassmorphism Refinado
- **Rasgos visuales**: Superficies translúcidas con desenfoque de fondo (`backdrop-blur-md`), bordes finos con degradado semitransparente (`border border-white/20`) y sombras suaves.
- **Cuándo usar**: Paneles modales flotantes, encabezados sticky de navegación y tarjetas de superposición sobre fondos ricos o dinámicos.
- **Cuándo NO usar**: Fondos planos monótonos o interfaces que requieran cumplimiento de contraste accesible AAA sin control del fondo.
- **Clases clave Tailwind**: `bg-white/10 dark:bg-slate-900/40 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl`.

### 2.2 Modern Skeuomorphism / Skeuomorfismo Táctil
- **Rasgos visuales**: Iluminación interior discreta (`inset shadow`), biseles sutiles y texturas táctiles refinadas que simulan dispositivos analógicos de alta gama (estilo sintetizadores Teenage Engineering o audio premium).
- **Cuándo usar**: Aplicaciones de audio/música, controles deslizantes de hardware, controles de precisión y paneles de edición creativa.
- **Cuándo NO usar**: Tablas analíticas densas o flujos masivos de onboarding.

### 2.3 Neumorfismo Suave (Soft UI Controlado)
- **Rasgos visuales**: Relieves basados en doble sombra (luz superior izquierda suave y sombra inferior derecha suave sobre fondo de tono idéntico).
- **Cuándo usar**: Botones de interruptores (toggles), tarjetas interactivas de domótica y paneles de estado no críticos.
- **Cuándo NO usar**: Textos informativos principales o elementos donde el contraste WCAG AA deba ser evidente.

### 2.4 Claymorphism
- **Rasgos visuales**: Efecto de plastilina inflada 3D con esquinas redondeadas muy amplias, bordes interiores inflados y sombras difusas profundas.
- **Cuándo usar**: Interfaces educativas infantiles, aplicaciones de gamificación y fintech juvenil o Web3 amigable.
- **Cuándo NO usar**: Software médico, legal o bancario corporativo tradicional.

---

## 3. Expresionismo y Vanguardia

### 3.1 Neobrutalismo / Soft Brutalism
- **Rasgos visuales**: Bordes negros marcados (`border-2 border-black` o `border-3`), sombras duras sin desenfoque (`shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`), paleta de colores de alto contraste con tonos primarios saturados y esquinas ligeramente redondeadas o rectas.
- **Cuándo usar**: Comunidades de creadores, herramientas educativas interactivas, newsletters tech y productos B2C modernos.
- **Cuándo NO usar**: Interfaces bancarias conservadoras, plataformas de cumplimiento normativo o dashboards médicos.

### 3.2 Brutalismo Crudo (Web Brutalism)
- **Rasgos visuales**: HTML sin adornos estéticos tradicionales, enlaces en azul puro sin estilo adicional, tipografía monospace o Times New Roman forzada, fondos blancos puros y contraste crudo.
- **Cuándo usar**: Portafolios de arte contemporáneo, manifiestos técnicos y sitios de investigación independiente.

### 3.3 Cyberpunk / Dark Futurism
- **Rasgos visuales**: Fondos ultra oscuros (`#0a0a0f`), acentos de neón saturados (cian, magenta, verde lima), rejillas digitales tenues, esquinas achaflanadas y fuentes monoespaciadas.
- **Cuándo usar**: Plataformas de gaming, exchanges de criptomonedas, consolas de ciberseguridad y herramientas de monitoreo en tiempo real.
- **Cuándo NO usar**: Aplicaciones de contabilidad corporativa o plataformas de salud.

### 3.4 Retro Pop / 90s Web Revival
- **Rasgos visuales**: Elementos con colores vibrantes, tipografías display desenfadadas, iconos nostálgicos y patrones de puntos o rejillas de fondo.
- **Cuándo usar**: Campañas de marketing de temporada, productos de consumo orientados a la Generación Z.

---

## 4. Estilos Atmosféricos y Gradientes

### 4.1 Aurora UI / Mesh Gradients
- **Rasgos visuales**: Fondos con gradientes cromáticos difusos y fluidos en movimiento lento o estáticos, con alta dispersión gaussiana que evocan luces polares.
- **Cuándo usar**: Pantallas de bienvenida, landing pages de inteligencia artificial y portadas de producto prémium.
- **Clases clave Tailwind**: `bg-gradient-to-tr from-violet-600/30 via-indigo-500/20 to-teal-400/30 filter blur-3xl`.

### 4.2 Dark Mode OLED Luxe
- **Rasgos visuales**: Negro absoluto (`#000000`) de base, superficies intermedias en gris carbón muy profundo (`#121214`), bordes de 1px apenas visibles (`border-white/5`) y tipografía blanca pura de alto contraste.
- **Cuándo usar**: Aplicaciones multimedia, apps para pantallas OLED móviles y suites creativas nocturnas.

---

## Matriz Rápida de Selección de Estilo

| Objetivo del Producto | Estilo Primario Recomendado | Acento Recomendado |
|---|---|---|
| Dashboard B2B Analítico | Swiss Minimal / Bento Grid | Azul Cobalto / Slate |
| Fintech / Inversiones | Minimalismo Monocromático | Esmeralda Oscuro / Gris Plomo |
| Herramienta AI / Generativa | Aurora UI + Glassmorphism sutil | Violeta Neón / Ámbar |
| Herramienta para Creadores | Neobrutalismo suave | Amarillo Canario / Negro |
| E-commerce de Moda / Lujo | Monocromático Editorial | Acento Arena / Carbón |
| Consola de Infraestructura / DevTools | Dark Mode Minimalista + Monospace | Verde Lima / Cian |
