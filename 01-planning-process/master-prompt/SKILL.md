---
name: master-prompt
description: Master prompt template to generate autonomous Expo Go mobile demo applications. Use when you need a functional offline demo for client presentations, prototyping, or sales pitches. Do not use for production feature implementations.
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*) Read
metadata:
  trigger: ["generar demo", "app de prueba", "demo Expo Go", "prompt maestro", "aplicación de demostración", "mobile demo prototype"]
  scope: [global, project]
  version: "1.1.0"
---

# 📱 Master Prompt: Expo Go Mobile Demo Prototype

Este skill proporciona la plantilla de prompt maestro para generar aplicaciones móviles de demostración autónomas de alta fidelidad en **Expo Go** utilizando un asistente de inteligencia artificial.

Copia y pega las instrucciones del bloque inferior para iniciar el desarrollo autónomo de una demo local offline con mocks integrados.

---

```markdown
Actúa como un desarrollador experto en React Native, Expo Go y TypeScript. Tu objetivo es generar una aplicación móvil de demostración funcional de alta fidelidad para presentar una propuesta técnica o comercial de producción.

Como es una demo interactiva para ejecutar directamente en un dispositivo móvil mediante Expo Go, la aplicación debe ser COMPLETAMENTE AUTÓNOMA: simulará internamente (en memoria y estado local de React) la persistencia, notificaciones push, servicios de backend y mensajería en tiempo real. No requiere ningún backend externo activo para funcionar.

Para codificar esta aplicación, aplica y respeta las directrices especificadas en las siguientes habilidades del catálogo:

### 🛠️ 1. HABILIDADES Y DIRECTRICES DEL CATÁLOGO

1. **Diseño de Código Limpio y Arquitectura:**
   - **Skill:** `06-code-quality/solid-clean-code/SKILL.md`
   - **Aplicación:** Aplica estrictamente el Principio de Responsabilidad Única (SRP). Separa componentes de presentación pura de los hooks contenedores (`useCatalog`, `useCheckout`, `useLocationTracker`). Funciones concisas y sin duplicación (DRY).
   
2. **Optimización Móvil React Native:**
   - **Skill:** `05-frontend/react-native/SKILL.md` y `05-frontend/expo-production-auditor/SKILL.md`
   - **Aplicación:** Usa `FlatList` con optimizaciones de renderizado (`React.memo`). Interfaz fluida, segura y libre de bloqueos de hilo principal.

3. **Flujos de Pago y Checkout:**
   - **Skill:** `04-backend/payments-stripe/SKILL.md`
   - **Opcional (LATAM / Multi-moneda):** Consulta `references/latam-payments-demo.md` para simulaciones de pagos locales (Pago Móvil, BNPL, doble moneda).

4. **Tracking de Geolocalización y Mapas:**
   - **Skill:** `05-frontend/maps-gps/SKILL.md`
   - **Aplicación:** Simulación interactiva de marcadores en mapa vectorial SVG/Canvas con coordenadas predefinidas, refresco asíncrono y limpieza estricta de listeners al desmontar componentes.

5. **Mensajería en Tiempo Real y Eventos:**
   - **Skill:** `04-backend/socketio/SKILL.md` y `05-frontend/push-notifications/SKILL.md`
   - **Aplicación:** Simulación interna mediante un Bus de Eventos (`EventEmitter` local) para emular eventos bidireccionales (`order:created`, `status:updated`, etc.).

6. **Flujo de Integración Fullstack:**
   - **Skill:** `01-planning-process/application-workflow/SKILL.md`
   - **Aplicación:** Coordinación de estados y transiciones de entidad desde la creación hasta la finalización.

---

### 📱 2. ESTRUCTURA DE PANTALLAS DE LA APP MÓVIL
Diseña una UI con modo oscuro premium, tarjetas con glassmorphism, bordes redondeados y tipografías cuidadas:
1. **Catálogo:** Muestra productos, emojis o miniaturas, stock actual, precios y carrito flotante.
2. **Carrito y Checkout:** Resumen de compra, selector de método de pago, dirección y confirmación.
3. **Modales de Transacción:** Pantallas de validación, OTP o comprobantes según el método elegido.
4. **Tracking en Vivo:** Línea de tiempo de estados (`Recibido` -> `En Proceso` -> `En Ruta` -> `Completado`) y mapa interactivo simulado.
5. **Panel de Soporte / Asistente:** Componente desplegable (*BottomSheet*) para interactuar o resolver incidencias.

---

### ⚙️ 3. MENÚ DE DESARROLLADOR OCULTO (HERRAMIENTAS DE PRESENTACIÓN)
Incluye un botón de control accesible mediante 3 toques en la cabecera para abrir un panel flotante de control:
- **Modificar parámetros de entorno:** Modificar tasas de cambio o tarifas de inmediato.
- **Forzar estados:** Cambiar estados de stock o simular incidencias en vivo.
- **Ajustar velocidad del simulador:** Acelerar el avance de timers o posiciones en el mapa.
- **Reiniciar simulación:** Limpia datos y restablece el estado inicial.

Genera el código de componentes, estilos integrados (`StyleSheet.create`) y lógica simulada en una estructura TypeScript modular y limpia de Expo Go fácil de instalar y ejecutar en el dispositivo.
```
