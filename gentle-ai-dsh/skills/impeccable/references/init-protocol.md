# Protocolo Init y Documentación — Impeccable

Este protocolo define la secuencia de inicialización del contexto durable de diseño y la sincronización con el sistema de tokens.

## Flujo de Inicialización

```
[ INICIO DEL ENTORNO AGÉNTICO ]
               │
               ▼
   Comando: "/impeccable init"
               │
               ├─► Escanea base de código y tokens Tailwind/CSS existentes
               ├─► Valida vacíos en el contexto del producto
               └─► Genera archivo central PRODUCT.md (Contexto Durable)
               │
               ▼
   Comando: "/impeccable document"
               │
               └─► Infiere y exporta tokens visuales en DESIGN.md (Formato Google Stitch)
```

## Reglas Críticas de Inicialización

1. **Escanear antes de generar**: `/impeccable init` inspecciona `tailwind.config.*`, archivos CSS globales (`globals.css`, `index.css`) y componentes existentes para no reinventar tokens ya presentes.
2. **Contexto Durable (`PRODUCT.md`)**: Define quién es el usuario, el problema central y la voz de marca. Debe estar en la raíz o en el directorio de diseño del proyecto.
3. **Especificación Visual (`DESIGN.md`)**: Formato Google Stitch conciso con tokens de color (OKLCH), tipografía, espaciado, radios y diales de movimiento.
4. **Protección de Aprobación D3**: NUNCA sobrescribir un `DESIGN.md` que ya fue aprobado en la fase D3 de `design-driven` sin confirmación explícita del usuario.
5. **Huecos de Marca**: Si faltan tokens o decisiones de marca, no inventar valores por omisión; preguntar o derivar al cuestionario D1b de `design-driven`.

## Integración Opcional con MCP

Los siguientes servidores MCP potencian el flujo pero son estrictamente opcionales:

- **Figma MCP / Code Connect**: Inspección de nodos y tokens (`figma-implement` canónico para diseño a código).
- **21st.dev MCP**: Búsqueda e inserción de componentes Tailwind curados (`pnpm dlx @21st-dev/cli@latest init`).
- **Fal.ai MCP**: Generación de ilustraciones en tiempo real con FLUX Schnell.

Si ninguno está disponible, el flujo continúa localmente con tokens del proyecto y assets existentes.
