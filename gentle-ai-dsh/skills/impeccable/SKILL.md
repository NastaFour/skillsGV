---
name: impeccable
description: "Trigger: impeccable, /impeccable, paul bakaus, PRODUCT.md, DESIGN.md, critique UI, polish anti-slop. Design governance using 23 specialized commands to shape, craft, critique, audit, and polish UI without slop. Use when governing design with commands."
license: MIT
compatibility: Requires Node 20+ and pnpm 9+. Works in any project with modern CSS or Tailwind.
metadata:
  author: gentleman-programming
  version: "1.0.0"
  trigger: ["impeccable", "/impeccable", "paul bakaus", "PRODUCT.md", "DESIGN.md", "critique UI", "polish anti-slop"]
  scope: [global, project]
allowed-tools: Read Write Edit Bash(git:*,pnpm:*)
---

# 🎨 impeccable — Gobernanza de Diseño por Comandos

Framework de control estético y gobernanza de interfaz basado en el vocabulario de 23 comandos especializados (adaptado de Paul Bakaus). Produce y mantiene `PRODUCT.md` (contexto durable) y `DESIGN.md` (tokens visuales formato Stitch).

## 📋 Cuándo Usar

- Usar para gobernar, auditar y pulir diseño con comandos deterministas (`init`, `shape`, `craft`, `critique`, `polish`).
- Usar para auditar componentes contra "AI tells" o inyectar calidad anti-slop.
- **NO usar** para la entrevista inicial de unicidad de diseño (usar `design-driven` D1/D1b).
- **NO usar** para crear tokens desde cero sin brief (usar `design-system-tokens`).

## 🚦 Reglas Duras

1. **Init antes de Craft**: antes de `/impeccable craft`, ejecutar `/impeccable init` si `PRODUCT.md` o `DESIGN.md` no existen.
2. **Nunca inventar marca**: si falta un token o decisión de estilo, preguntar al usuario o derivar a `design-driven` D1b.
3. **MCPs Opcionales**: Figma (`figma-implement` canónico), 21st.dev y Fal.ai son opcionales. Si no están configurados, continuar con tokens locales y assets del proyecto.
4. **Límites de Dominio**: deferir animación compleja a `motion-framer`/`motion-gsap`, y tokens perceptivos a `design-system-tokens`/`oklch-theme-injector`.

## 🚪 Decision Gates

- **init**: crea `PRODUCT.md` tras escanear el proyecto.
- **document**: extrae tokens existentes a `DESIGN.md` (nunca sobrescribir D3 sin preguntar).
- **shape vs craft**: `shape` planifica en frío; `craft` implementa código y visuales.
- **evaluate vs refine**: `critique`/`audit` analizan sin mutar; `polish`/`typeset`/`layout` modifican código.

## 🛠️ Pasos de Ejecución (Path Feliz)

1. **Escanear**: ejecutar `/impeccable init` para analizar CSS/Tailwind y generar [PRODUCT.md](assets/PRODUCT.template.md).
2. **Documentar**: ejecutar `/impeccable document` para volcar tokens a [DESIGN.md](assets/DESIGN.template.md).
3. **Planificar**: correr `/impeccable shape` para estructurar el árbol de componentes y accesibilidad.
4. **Implementar**: ejecutar `/impeccable craft` componiendo UI real contra los tokens establecidos.
5. **Auditar**: correr `/impeccable critique` y `/impeccable audit` para revisar contraste y jerarquía.
6. **Pulir**: aplicar `/impeccable polish` y comandos de refinamiento para eliminar AI slop.

## 📦 Contrato de Salida

- `PRODUCT.md`: contexto durable de producto actualizado.
- `DESIGN.md`: tokens visuales Stitch sincronizados.
- Reporte conciso del comando ejecutado y cambios aplicados.

## 📚 Referencias

- [Protocolo Init y MCP](references/init-protocol.md)
- [Catálogo de 23 Comandos](references/commands.md)
- [Template PRODUCT.md](assets/PRODUCT.template.md)
- [Template DESIGN.md](assets/DESIGN.template.md)
