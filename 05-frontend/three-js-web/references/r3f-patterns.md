# Patrones react-three-fiber (R3F)

R3F es un renderer de React para three.js: la escena se describe con componentes y el loop se maneja solo. Requiere React 18+; los objetos three.js se crean vía JSX con la convención `lowerCase` (`<mesh>`, `<ambientLight>`).

## Anatomía mínima

```jsx
import { Canvas } from "@react-three/fiber";

<Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 2]}>
  <ambientLight intensity={0.5} />
  <directionalLight position={[2, 2, 4]} />
  <mesh rotation={[0.4, 0.2, 0]}>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="orange" />
  </mesh>
</Canvas>
```

- `<Canvas>` crea scene + camera + renderer y limpia recursos al desmontar.
- Los props de transform aceptan arrays (`position={[x, y, z]}`) o objetos.

## Hooks esenciales

| Hook | Uso | Regla |
|---|---|---|
| `useFrame((state, delta) => {})` | Mutaciones por frame (animar, seguir cursor) | Nada de creación de objetos dentro |
| `useThree()` | Acceso a `scene`, `camera`, `renderer`, `size`, `clock` | Leer, no mutar en render |
| `useLoader(GLTFLoader, url)` | Carga de assets (con `Suspense`) | Combinar con lazy boundaries |

## Patrones que funcionan

1. **Componente = pieza de escena**: encapsular mesh + material + lógica en un componente; componer dentro del `<Canvas>`.
2. **Animación declarativa por frame**: mutar refs (`meshRef.current.rotation.y += delta`) dentro de `useFrame`; evitar re-renders de React para animación continua.
3. **Estado UI ↔ escena**: props de React entran a la escena; datos de la escena salen via eventos (`onPointerOver`, `onClick` sobre meshes) — R3F raycastea automáticamente.
4. **Carga con Suspense**: envolver assets pesados en `<Suspense fallback={null}>` dentro del Canvas.
5. **Render bajo demanda**: `frameloop="demand"` + invalidación manual para dashboards/editoriales sin animación continua.

## Errores comunes

- Estado React re-renderizando 60 fps: la animación continua vive en `useFrame`/refs, no en `useState`.
- Colocar HTML dentro del Canvas: usar drei `<Html>` cuando corresponda.
- Olvidar key estable en listas de meshes dinámicas (recrea GPU resources).

## Recursos

- Documentación: https://docs.pmnd.rs/react-three-fiber
- Ejemplos: https://codesandbox.io/examples/package/@react-three/fiber
