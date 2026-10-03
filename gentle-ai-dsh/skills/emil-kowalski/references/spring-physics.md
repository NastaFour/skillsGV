# Física de Resortes y Parámetros Naturales (Spring Physics)

Guía de cálculo y selección de resortes inspirada en Emil Kowalski (*animations.dev*).

---

## 1. Por qué las Duraciones Fijas Son una Falacia

En el diseño de interfaces tradicional se asignan duraciones mágicas arbitrarias:
- `transition: transform 300ms ease-in-out`
- `animate(x, 100, { duration: 0.4 })`

### La Contradicción Física
Si un elemento se desplaza 10 píxeles tarda 300ms (velocidad imperceptible y lenta). Si ese mismo elemento se desplaza 500 píxeles en 300ms, viaja a una velocidad extrema.
En el mundo físico, los objetos no tienen un cronómetro de 300ms; responden a una fuerza elástica y una amortiguación.

---

## 2. Los Tres Parámetros del Resorte

Un resorte en Motion / Framer Motion o CSS springs se gobierna por tres constantes físicas:

1. **Stiffness ($k$) - Rigidez**:
   - Representa la tensión o fuerza restauradora del resorte.
   - A mayor *stiffness*, más rápido reacciona el componente y mayor aceleración inicial posee.
2. **Damping ($c$) - Amortiguamiento**:
   - Representa la fricción o resistencia al movimiento.
   - Evita que el objeto oscile eternamente.
   - Si el damping es muy bajo, rebota excesivamente (*underdamped*).
   - Si el damping es muy alto, el objeto se siente lento y viscoso (*overdamped*).
   - El objetivo ideal en UI es un amortiguamiento casi crítico (*critically damped* o con oscilación sutil imperceptible).
3. **Mass ($m$) - Masa**:
   - Representa el peso o inercia del objeto animado.
   - Mayor masa significa mayor resistencia a cambiar de velocidad (acelera más despacio y frena más despacio).
   - Para interfaces web rápidas, el valor habitual es `mass: 1` o `mass: 0.8`.

---

## 3. Presets Canónicos de Emil Kowalski

Valores calibrados para su uso directo en bibliotecas como Framer Motion o Motion:

### Microinteracciones Rápidas (Toggles, Botones, Pestañas)
```javascript
export const springSnappy = {
  type: "spring",
  stiffness: 450,
  damping: 35,
  mass: 0.8,
};
```
- Respuesta casi instantánea al clic o tap, sin rebote molesto.

### Superficies Medianas (Modales, Popovers, Menús Desplegables)
```javascript
export const springSmooth = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 1.0,
};
```
- Sensación de cuerpo físico natural al abrir o cerrar contenedores superpuestos.

### Paneles Grandes y Gestuales (Drawers, Bottom Sheets)
```javascript
export const springSheet = {
  type: "spring",
  stiffness: 220,
  damping: 28,
  mass: 1.0,
};
```
- Absorbe la inercia del arrastre táctil con fluidez elegante.

---

## 4. Comparativa de Parámetros

| Componente UI | Stiffness | Damping | Mass | Sensación |
|---|---|---|---|---|
| Toggle switch | 500 | 35 | 0.8 | Táctil e instantáneo |
| Tab slider (layoutId) | 400 | 32 | 0.9 | Fluido, magnético |
| Modal dialog | 320 | 30 | 1.0 | Estable, profesional |
| Bottom Sheet / Drawer | 220 | 28 | 1.0 | Elástico, orgánico |
| Tarjeta arrastrable | 260 | 25 | 1.0 | Retorno amortiguado |
