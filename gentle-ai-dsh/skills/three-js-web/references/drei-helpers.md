# Helpers drei (@react-three/drei)

drei es la caja de herramientas estándar de R3F: componentes listos para producción que resuelven los casos repetitivos (controles, entornos, carga de modelos, texto, UI en escena). Instalar junto a `three` y `@react-three/fiber`.

## Controles y cámara

- `<OrbitControls />` — rotar/zoom/pan con inercia; acotar con `minPolarAngle`, `maxPolarAngle`, `enablePan={false}`.
- `<PerspectiveCamera makeDefault />` / `<OrthographicCamera makeDefault />` — declarar la cámara activa desde JSX.
- `<CameraControls />` — control tipo editor cuando OrbitControls queda corto.

## Entorno y luces

- `<Environment preset="city" />` — HDRI de entorno para reflejos/iluminación PBR realistas sin configurar luces a mano.
- `<ContactShadows />` / `<AccumulativeShadows />` — sombras de contacto baratas y de calidad.
- `<Lightformer />` — superficies emisivas dentro de `Environment` para iluminación de estudio.

## Carga de assets

- `useGLTF(url)` — wrapper de `useLoader` con caché; usar `useGLTF.preload(url)`.
- `useTexture(urls)` — texturas con Suspense; `useTexture.preload()`.
- `<Center />`, `<Bounds />` / `<Resize />` — normalizar tamaño/posición de modelos externos.

## Texto y UI en escena

- `<Text>` (troika) — texto 3D nítido con fuentes SDF.
- `<Html>` — DOM real anclado a un punto 3D (tooltips, formularios accesibles).
- `<Billboard />` — sprite que siempre mira a cámara.

## Utilidades frecuentes

| Helper | Propósito |
|---|---|
| `<Float />` | Flotación sutil (hover de hero sections) |
| `<Sparkles />` | Partículas decorativas baratas |
| `<MeshReflectorMaterial />` | Suelos/paredes reflectantes |
| `<Detailed />` | LOD por distancia |
| `<Stats />` | Overlay de FPS para debugging |

## Errores comunes

- Importar todo drei "por si acaso": usa tree-shaking igualmente, pero revisar bundle con import específico (`import { OrbitControls } from "@react-three/drei"`).
- `Environment` + sombras costosas en mobile: medir antes de prometer 60 fps.
- Mutar props internos de helpers en cada frame en lugar de usar sus APIs.

## Recursos

- Documentación y stories: https://docs.pmnd.rs/drei
