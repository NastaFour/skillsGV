---
name: popup-cro
description: "Diseño de popups, modales de exit-intent y banners de alta conversión sin degradar la experiencia de usuario. Úsala al implementar modales promocionales o de retención. No usar para notificaciones nativas push o correos transaccionales."
license: MIT
metadata:
  version: "1.1.0"
  trigger: ["popup cro", "exit intent modal", "slide in banner", "micro conversion", "modal de conversion"]
  scope: [global, project]
allowed-tools: Read Bash(node:*)
---

# 💡 popup-cro — Modales de Exit-Intent, Banners y Micro-Conversiones

Principios de Optimización de Tasa de Conversión (CRO) aplicados al diseño y comportamiento de ventanas modales, detección de intención de salida (*exit-intent*) y barras deslizantes (*slide-in banners*). Estructurado en **Guardrails de 2 Niveles** para capturar micro-conversiones legítimas, erradicar patrones oscuros (*dark patterns*) y adaptarse tanto a flujos PLG/e-commerce como a entornos regulados.

---

## 📋 Cuándo Usar

- Al implementar modales de intención de salida (*exit-intent*) para recuperar visitantes a punto de abandonar una página clave.
- Al diseñar banners deslizantes laterales o inferiores (*slide-ins*) activados por profundidad de lectura (*scroll depth*).
- Para capturar prospectos calificados ofreciendo recursos de utilidad inmediata (plantillas, calculadoras, guías o descuentos).
- Para prevenir carritos abandonados o pérdida accidental de formularios con cambios sin guardar.
- Para establecer políticas de frecuencia (*frequency capping*) y persistencia que eviten fatigar al usuario.
- **NO usar** para notificaciones nativas push del sistema operativo o navegador (usar `push-notifications`).
- **NO usar** para correos transaccionales, códigos OTP o alertas de servidor (usar `notifications-multichannel`).

---

## 🛡️ Guardrails de 2 Niveles (Invariantes Duros vs Heurísticas Contextuales)

### Nivel 1: Invariantes Duros (Innegociables en Todo Dominio)
1. **Cero Patrones Oscuros (*Zero Dark Patterns*)**: Nunca ocultar ni miniaturizar el control de cierre, nunca disfrazar anuncios como alertas del sistema y nunca emplear textos de culpabilización (*confirmshaming* como *"No, prefiero seguir perdiendo dinero"*).
2. **Accesibilidad Completa de Teclado y Lector de Pantalla**: Todo diálogo modal interactivo debe declarar `role="dialog"`, `aria-modal="true"` y `aria-labelledby`, atrapar el foco mientras esté abierto, devolver el foco al cerrarse y ofrecer tres vías de cierre claras (tecla `Escape`, clic en `backdrop` y botón `"X"` con área táctil `>= 44x44px` y `aria-label="Cerrar modal"`).
3. **Protección de Viewport Móvil y SEO**: En dispositivos móviles, evitar *interstitials* promocionales a pantalla completa que bloqueen la lectura del contenido principal al aterrizar desde buscadores. Preferir *bottom sheets* compactos o banners discretos (`<= 25%` del alto visible).

### Nivel 2: Heurísticas Contextuales CRO (Base PLG/B2C vs Excepciones Enterprise/Compliance)
1. **Disparadores Basados en Intención (Heurística Base)**:
   - *Por defecto (Marketing / Lead-Gen)*: Evitar mostrar modales promocionales en el evento `onLoad`. Disparar tras señales de intención demostrada: salida del puntero hacia la barra de pestañas (*exit-intent* en desktop), profundidad de lectura (`scroll depth > 60–70%`) o inactividad en checkout (`> 45s`).
   - *Excepción Contextual (`[Beyond-Baseline]`)*: Avisos regulatorios obligatorios (consentimiento legal/GDPR estricto, verificación de mayoría de edad, expiración de sesión bancaria, mantenimiento crítico o confirmación de pérdida de datos en formularios editados) están autorizados a activarse en carga o bloquear la vista hasta recibir respuesta explícita.
2. **Limitación de Frecuencia (*Frequency Capping*)**:
   - *Por defecto*: Máximo un modal promocional por sesión, con enfriamiento persistente (`14 a 30 días` tras el cierre).
   - *Excepción Contextual (`[Beyond-Baseline]`)*: Alertas operativas de seguridad, límites de cuota de API o confirmaciones transaccionales se rigen por el estado de la cuenta y no por un enfriamiento de marketing.
3. **Propuesta de Valor Inmediata y Fricción Mínima**:
   - Preferir un único campo de entrada (ej. correo electrónico) acompañado de un beneficio tangible e inmediato (*"Descarga el checklist en PDF"*) en lugar de textos pasivos (*"Suscríbete al boletín"*).

---

## 🧠 Metodología Paso a Paso

### 1. Detección Inteligente de Intención
- **Exit-Intent en Escritorio**: Escuchar `mouseleave` en `document`. Cuando `e.clientY <= 0`, verificar el estado de enfriamiento y presentar el modal.
- **Scroll Depth**: Activar banners laterales solo cuando el lector haya consumido más del 65% del contenido.
- **Inactividad en Embudos Críticos**: En carritos o configuradores complejos, detectar pausas prolongadas (`> 45s`) para ofrecer ayuda contextual.

### 2. Ergonomía, Accesibilidad y Cierre Transparente
- Asignar `role="dialog"`, `aria-modal="true"`, `aria-labelledby` y `aria-describedby`.
- Garantizar contraste legible y una opción secundaria neutral de descarte (*"Ahora no, gracias"*).

---

## 💻 Ejemplos de Implementación

### Ejemplo 1: Detector de Exit-Intent con Capping Temporal (React Hook)
```tsx
import { useEffect, useState } from "react";

interface UseExitIntentOptions {
  storageKey?: string;
  cooldownDays?: number;
}

export function useExitIntent({
  storageKey = "cro_exit_modal_dismissed",
  cooldownDays = 14,
}: UseExitIntentOptions = {}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const dismissedAt = localStorage.getItem(storageKey);
    if (dismissedAt) {
      const daysPassed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysPassed < cooldownDays) {
        return;
      }
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setIsOpen(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [storageKey, cooldownDays]);

  const dismiss = () => {
    setIsOpen(false);
    localStorage.setItem(storageKey, Date.now().toString());
  };

  return { isOpen, dismiss };
}
```

### Ejemplo 2: Modal de Conversión Accesible con Tokens Semánticos (React + Tailwind CSS)
```tsx
import React, { useEffect, useRef } from "react";

interface ExitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExitIntentModal({ isOpen, onClose }: ExitModalProps) {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-primary/80 backdrop-blur-sm transition-opacity"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl border border-border-subtle bg-surface-elevated p-8 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-primary hover:text-text-primary transition"
          aria-label="Cerrar modal"
        >
          ✕
        </button>

        {!submitted ? (
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-surface-primary px-3 py-1 text-xs font-semibold text-accent-primary border border-border-subtle">
              Recurso Práctico
            </div>
            <h2 id="modal-title" className="mt-3 text-2xl font-bold text-text-primary">
              Antes de irte, descarga el Checklist de Auditoría CRO
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              25 puntos verificables para detectar fugas de conversión en tu flujo principal sin aumentar el gasto en adquisición.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@empresa.com"
                className="w-full rounded-xl border border-border-subtle bg-surface-primary px-4 py-3 text-sm text-text-primary outline-none focus:border-accent-primary"
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-accent-primary px-6 py-3 text-sm font-semibold text-surface-primary shadow-md hover:bg-accent-hover transition"
              >
                Obtener guía
              </button>
            </form>
          </div>
        ) : (
          <div className="py-6 text-center">
            <h3 className="mt-2 text-lg font-bold text-text-primary">
              ¡Checklist enviado con éxito!
            </h3>
            <p className="mt-1 text-xs text-text-secondary">
              Revisa tu bandeja de entrada en los próximos instantes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 🚀 Floor, Not Ceiling (`[Beyond-Baseline]`)

Los disparadores por intención y el *frequency capping* de 14–30 días son la línea base para evitar popups intrusivos en marketing y comercio electrónico. En flujos **Enterprise B2B, Fintech, Salud o Compliance** —donde se requiere bloqueo modal para aceptación de contratos legales actualizados, re-autenticación por inactividad (PSD2/HIPAA), advertencias de riesgo financiero o confirmación de operaciones destructivas—, se autoriza omitir el cierre por clic exterior o disparar el diálogo de forma inmediata, anotando `[Beyond-Baseline: <requisito regulatorio/seguridad>]` y preservando siempre la accesibilidad por teclado y lector de pantalla.

---

## 🚫 Anti-Patrones Comunes

| Anti-Patrón Inadecuado | Impacto Negativo en CRO | Solución Correcta |
| :--- | :--- | :--- |
| **Popup promocional invasivo en `onLoad`** | Tasa de rebote superior al 50%; deteriora la confianza inicial. | Disparar promociones tras intención (*exit-intent*, `scroll > 60%`) o usar banner no bloqueante. |
| **Ocultar o miniaturizar la `'X'` de cierre** | Frustración extrema; fuerza al usuario a cerrar la pestaña completa. | Botón de cierre visible (`>= 44x44px`), soporte de tecla `Escape` y clic en `backdrop`. |
| **Interstitials promocionales a pantalla completa en móvil** | Penalización directa de posicionamiento orgánico (SEO) por bloqueo de lectura. | Usar *bottom sheets* compactos que no superen el 25% de la altura visible. |
| **Copys manipuladores (*confirmshaming*)** | Deteriora la reputación de la marca y proyecta deshonestidad comercial. | Opción de descarte clara, respetuosa y neutral. |
