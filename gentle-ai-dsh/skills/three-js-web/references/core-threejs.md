# Core three.js — escena, cámara, renderer y loop

Fundamento del stack: three.js abstrae WebGL en objetos de escena. R3F (ver [r3f-patterns.md](r3f-patterns.md)) envuelve estos mismos conceptos en React; entenderlos a nivel three.js evita errores difíciles de diagnosticar.

## Triada obligatoria

| Concepto | Rol | Notas |
|---|---|---|
| `Scene` | Grafo de objetos a renderizar | Contiene meshes, luces, grupos |
| `Camera` | Punto de vista | `PerspectiveCamera(fov, aspect, near, far)` cubre el 90% de los casos |
| `Renderer` | Dibuja la escena en un `<canvas>` | `WebGLRenderer`; setear `setPixelRatio` y `setSize` |

## Render loop

```js
function animate() {
  requestAnimationFrame(animate);
  mesh.rotation.y += 0.01; // mutar estado por frame
  renderer.render(scene, camera);
}
animate();
```

- El loop corre ~60×/segundo: nada pesado dentro (crear objetos, allocaciones).
- Alternativa bajo demanda: renderizar solo cuando cambia algo (`renderer.render` explícito), clave en apps no-juego.

## Piezas frecuentes

- **Geometrías**: `BoxGeometry`, `SphereGeometry`, `TorusGeometry`, `BufferGeometry` para datos custom.
- **Materiales**: `MeshStandardMaterial` (PBR, uso general), `MeshBasicMaterial` (sin luz), `MeshPhysicalMaterial` (transparencia/refracción, más caro).
- **Luces**: `AmbientLight` (base) + `DirectionalLight`/`PointLight` (dirección/sombra). Sin luces, materiales estándar se ven negros.
- **Transformaciones**: cada `Object3D` tiene `position`, `rotation`, `scale`; agrupar con `Group`.

## Modelos externos

- Formato preferido: GLTF/GLB (compacto, soporta PBR y animaciones).
- Carga asíncrona con `GLTFLoader`; comprimir con Draco/Meshopt.
- Los modelos traen su propia jerarquía: recorrerla antes de animar (`object.traverse`).

## Errores comunes

- Olvidar agregar el objeto a la escena (`scene.add(mesh)`) o la luz necesaria.
- No ajustar `camera.aspect` al redimensionar (deformación).
- Fugas de memoria: llamar `geometry.dispose()` / `material.dispose()` / `texture.dispose()` al remover objetos.

## Referencias oficiales

- Documentación: https://threejs.org/docs/
- Ejemplos: https://threejs.org/examples/
