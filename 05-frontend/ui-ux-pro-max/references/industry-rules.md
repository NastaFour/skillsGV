# Reglas de Diseño por Industria (SaaS, Fintech, E-commerce)

Directivas estrictas para diseño de interfaces según la industria del producto digital.

---

## 1. SaaS y Herramientas B2B

### 1.1 Objetivos Clave
- Velocidad de ejecución para usuarios recurrentes (atajos, ergonomía visual).
- Alta densidad de datos sin saturación cognitiva.
- Reducción del error humano en acciones destructivas.

### 1.2 Reglas Duras
1. **Manejo de Tablas y Datos**:
   - Cabeceras de tabla fijas (`sticky top-0`) con tipografía sutil en mayúsculas (`text-xs uppercase tracking-wider text-slate-500 font-semibold`).
   - Celdas numéricas alineadas a la derecha con fuentes que soporten cifras tabulares (`font-mono tabular-nums`).
   - Textos largos con truncamiento automático (`truncate max-w-[200px]`) y tooltip visible al interactuar.
2. **Acciones Destructivas**:
   - Todo botón destructivo (eliminar equipo, purgar base de datos) requiere modal de confirmación con paso explícito (escribir el nombre del recurso) y color rojo reservado (`bg-rose-600 hover:bg-rose-700`).
3. **Persistencia de Filtros y Vistas**:
   - Los filtros aplicados en listas deben reflejarse en la URL como query params para permitir compartir y recargar el estado.

---

## 2. Fintech, Banca e Inversiones

### 2.1 Objetivos Clave
- Generar máxima confianza y sensación de seguridad institucional.
- Legibilidad instantánea de balances, comisiones y movimientos de dinero.
- Cero ambigüedad en los estados de transacción.

### 2.2 Reglas Duras
1. **Tipografía Numérica de Precisión**:
   - Todo número financiero debe usar `font-mono` o activar `font-variant-numeric: tabular-nums` para evitar que los caracteres numéricos salten de anchura al cambiar.
   - Los decimales pueden usar una jerarquía visual ligeramente atenuada (`text-2xl font-bold $1,420.<span class="text-slate-400 text-lg">50</span>`).
2. **Doble Codificación de Estado (Accesibilidad Daltonismo)**:
   - Nunca usar únicamente color verde o rojo para indicar variaciones de saldo o transacciones.
   - Obligatorio acompañar el color con un glifo o icono direccional (flecha hacia arriba `↑` para ingreso o positivo, flecha hacia abajo `↓` para débito o pérdida) y texto de estado accesible (`sr-only`).
3. **Privacidad y Modo Discreto**:
   - Las pantallas con balances principales deben incorporar un interruptor de "ocultar saldos" (`blur-sm` o reemplazo por asteriscos `••••••`).

---

## 3. E-commerce y Retail Digital

### 3.1 Objetivos Clave
- Foco ininterrumpido en el producto visual.
- Reducción máxima de la fricción en el embudo de conversión (checkout).
- Señales claras de disponibilidad, precio, variantes y plazos de entrega.

### 3.2 Reglas Duras
1. **Fotografía y Ratios**:
   - Las tarjetas de producto deben utilizar ratios de aspecto consistentes (1:1 o 4:5 vertical).
   - Fondos de imagen neutros y uniformes en listados de catálogo.
2. **Jerarquía de Precios y Descuentos**:
   - El precio final actual debe ser el elemento más prominente de la tarjeta (`text-lg font-bold text-slate-900`).
   - El precio anterior tachado debe atenuarse (`text-sm line-through text-slate-400`).
   - El porcentaje de descuento debe situarse como un badge contrastado y compacto (`bg-rose-100 text-rose-700 text-xs font-semibold px-2 py-0.5 rounded-full`).
3. **Acciones de Compra Táctiles**:
   - Tamaño de botón de compra mínimo de 44x44px para ergonomía táctil en dispositivos móviles.
   - En pantallas móviles de producto, el botón de "Añadir a la cesta" debe anclarse como barra fija inferior (`sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4`).
