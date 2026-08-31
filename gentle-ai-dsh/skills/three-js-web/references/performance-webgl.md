# Performance WebGL — presupuesto de GPU y memoria

Una escena 3D corre a 60 fps o se siente rota. Presupuesto orientativo: **< 1-2 ms CPU + < 8 ms GPU por frame** en desktop; mobile es 3-5× más restrictivo. Medir SIEMPRE antes de optimizar (Chrome DevTools → Performance, `Stats` de drei).

## Draw calls: el enemigo #1

- Cada mesh/material único ≈ un draw call; el presupuesto práctico es ~100-500 por escena (menos en mobile).
- **Instancing**: `InstancedMesh` / drei `<Instances>` para repetir el mismo geometry+material (partículas, bosques, multitudes) — miles de objetos en 1 draw call.
- **Merge estático**: unir geometrías que no se mueven independientemente (`BufferGeometryUtils.mergeGeometries`).
- Reducir visibilidad con `<Detailed />` (LOD) o frustum culling (three.js lo hace solo si los bounds son correctos).

## Texturas y geometría

| Palanca | Impacto | Práctica |
|---|---|---|
| Resolución de texturas | Memoria GPU + fill rate | Máx 2048px salvo caso justificado; comprimir (KTX2/basis) |
| Polígonos | Vertex processing | Draco/Meshopt en GLTF; decimar assets pesados |
| `dpr` del canvas | Fill rate exponencial | `dpr={[1, 2]}` nunca `window.devicePixelRatio` crudo |
| Post-procesamiento | Full-screen passes | Limitar passes; `Bloom` selectivo > global |

## Ciclo de vida (fugas de memoria)

- Al remover meshes: `dispose()` de geometría, material y texturas (R3F lo hace al desmontar componentes, pero no para recursos creados fuera de JSX).
- Cachear modelos/texturas compartidos (`useGLTF` ya cachea); clonar cuando se necesita variación.
- Vigilar la pestaña Memory / `renderer.info.memory`: geometrías y texturas deben volver a cero tras navegar.

## Render loop

- Escenas sin animación continua: `frameloop="demand"` (renderiza solo al cambiar).
- Pausar cuando la pestaña/canvas no es visible (`document.visibilityState`, IntersectionObserver).
- `useFrame` limpio: sin allocations (`new Vector3()` por frame genera GC churn; reusar vectores módulo-nivel).

## Mobile / low-end

- Testear en dispositivo real desde el primer día.
- Reducir resolución de sombras o desactivarlas (`shadows={false}`).
- Considerar versión simplificada de la escena bajo `navigator.hardwareConcurrency`/user agent como heurística (no como contrato).

## Checklist pre-ship

- [ ] `renderer.info.render.calls` < presupuesto en la peor vista
- [ ] Sin crecimiento de memoria tras navegación repetida
- [ ] `dpr` acotado y probado en retina
- [ ] Animaciones pausadas off-screen
- [ ] 60 fps en el dispositivo móvil objetivo (o degradación aceptada)
