---
name: popup-cro
description: "Diseño de popups, modales de exit-intent y banners de alta conversión sin degradar la experiencia de usuario. No usar para notificaciones nativas push o correos transaccionales."
license: MIT
metadata:
  version: "1.0.0"
  trigger: ["popup cro", "exit intent modal", "slide in banner", "micro conversion", "modal de conversion"]
  scope: [global, project]
allowed-tools: Read Bash(node:*)
---

# 💡 popup-cro — Modales de Exit-Intent, Banners y Micro-Conversiones

Principios de Optimización de Tasa de Conversión (CRO) aplicados al diseño y comportamiento de ventanas modales, detección de intención de salida (*exit-intent*) y barras deslizantes (*slide-in banners*). Diseñado para capturar micro-conversiones legítimas maximizando el valor entregado y erradicando prácticas intrusivas que deterioran la experiencia o el posicionamiento SEO.

---

## 📋 Cuándo Usar

- Al implementar modales de intención de salida (*exit-intent*) para recuperar visitantes a punto de cerrar la pestaña.
- Al diseñar banners deslizantes laterales o inferiores (*slide-ins*) activados por profundidad de lectura (*scroll depth*).
- Para capturar prospectos calificados ofreciendo recursos de alta utilidad (plantillas, calculadoras, guías o descuentos).
- Para prevenir carritos abandonados o pérdidas de formularios a medio rellenar.
- Para establecer políticas de frecuencia y persistencia que eviten hostigar al usuario en visitas recurrentes.
- **NO usar** para notificaciones nativas push del sistema operativo o navegador (usar `push-notifications`).
- **NO usar** para correos transaccionales, códigos OTP o alertas de cuenta (usar `notifications-multichannel`).

---

## 🚦 Reglas Duras

1. **Disparadores Basados en Intención, Nunca en Carga Inmediata**: Queda terminantemente prohibido mostrar modales promocionales de inmediato al cargar la página (`onLoad`). El despliegue debe fundamentarse en señales de intención demostrada: salida del cursor hacia la barra de pestañas (*exit-intent* en desktop), desplazamiento profundo de lectura (*scroll depth* > 60-70%) o inactividad controlada (> 45 segundos).
2. **Ergonomía y Control Total de Cierre**: El modal debe ofrecer tres vías de cierre instantáneas: (a) pulsación de la tecla `Escape`, (b) clic en el área oscura exterior (*backdrop*), y (c) un botón de cierre visual "X" con área táctil accesible (mínimo 44x44px) y atributo `aria-label="Cerrar modal"`.
3. **Limitación Estricta de Frecuencia (Frequency Capping)**: Máximo un modal interactivo por sesión. Si el usuario descarta o cierra el aviso, debe almacenarse la marca temporal para no volver a presentarlo durante un período mínimo de 14 a 30 días.
4. **Micro-Conversiones con Utilidad Inmediata**: Prohibido utilizar textos genéricos pasivos (*"Suscríbete a nuestro boletín"*). Toda solicitud de datos debe responder a una propuesta de valor tangible y consumible al instante (*"Descarga la guía en PDF"*, *"Calcula tu ROI en 30 segundos"* o *"Desbloquea 15% de descuento"*).
5. **Cumplimiento Estricto de Directrices Móviles (Evitar Penalizaciones SEO)**: En dispositivos móviles, prohibido superponer modales invasivos a pantalla completa que tapen el contenido principal (Directriz contra *Interstitials* intrusivos de Google). En su lugar, emplear banners inferiores compactos (*bottom sheets*) o barras fijas discretas que no ocupen más del 25% del visor.

---

## 🧠 Metodología Paso a Paso

### 1. Detección Inteligente de Intención
- **Exit-Intent en Escritorio**: Escuchar el evento `mouseleave` en el elemento `document`. Cuando `e.clientY <= 0` (el cursor se dirige hacia la barra de direcciones o pestañas para abandonar el sitio), verificar si el capping lo autoriza y disparar el modal.
- **Scroll Depth**: Disparar banners laterales únicamente cuando el lector haya consumido más del 65% del artículo o página de producto, garantizando que ya existe interés genuino.
- **Inactividad Razonable**: En flujos de compra o embudos largos, detectar pausas prolongadas (> 45s) para ofrecer asistencia en vivo o resolver dudas frecuentes.

### 2. Formulación de la Oferta de Micro-Conversión
- **Un Solo Campo de Entrada**: Limitar la captura exclusivamente al correo electrónico. Cada campo adicional reduce la conversión del modal en más del 25%.
- **Titular Enfocado en el Resultado**: *"Llévate la plantilla de métricas CRO lista para usar"* en vez de *"Únete a nuestra lista de correo"*.
- **CTA con Beneficio Explicito**: Botón de alto contraste que declare el resultado (*"Obtener plantilla gratis"*).

### 3. Ergonomía, Accesibilidad y Cierre Accesible
- **Atributos Semánticos**: Asignar `role="dialog"`, `aria-modal="true"`, `aria-labelledby` y `aria-describedby` para compatibilidad completa con lectores de pantalla.
- **Gestión de Teclado**: Retener el foco dentro del modal mientras esté activo y devolver el foco al elemento desencadenante al cerrarse.
- **Cierre Transparente**: No esconder el botón de salida ni usar botones engañosos con textos de culpabilización (*"No, no me interesa crecer"*).

### 4. Políticas de Persistencia y Capping
- Registrar en el almacenamiento local del navegador (`localStorage.getItem("modal_dismissed_at")`) la fecha del descarte.
- Validar antes de cada ejecución si la diferencia entre la fecha actual y la guardada supera el umbral configurado (14 a 30 días). Si no se supera, la función permanece en silencio sin alterar el DOM.

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
    // Comprobar si el usuario ya descartó el aviso dentro del periodo de enfriamiento
    const dismissedAt = localStorage.getItem(storageKey);
    if (dismissedAt) {
      const daysPassed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysPassed < cooldownDays) {
        return;
      }
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Disparar solo cuando el puntero sale por la parte superior de la ventana
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

### Ejemplo 2: Modal de Conversión Accesible con Backdrop (React + Tailwind CSS)
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

  // Escuchar tecla Escape para cerrar
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Contenedor del Modal (detiene la propagación del clic para evitar cierre accidental) */}
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        {/* Botón Accesible de Cierre */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
          aria-label="Cerrar modal"
        >
          ✕
        </button>

        {!submitted ? (
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500">
              🎁 Recurso Exclusivo
            </div>
            <h2 id="modal-title" className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
              Antes de irte, llévate el Checklist de Auditoría CRO
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              25 puntos clave para identificar fugas de conversión en tu landing page y aumentar tus ventas sin invertir más en tráfico.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingresa tu correo"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-md hover:bg-emerald-400 transition"
              >
                Descargar Gratis
              </button>
            </form>

            <p className="mt-3 text-center text-xs text-slate-400">
              Cero spam. Te enviaremos el enlace al instante.
            </p>
          </div>
        ) : (
          <div className="py-6 text-center">
            <span className="text-4xl">🎉</span>
            <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
              ¡Checklist enviado con éxito!
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
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

## 🚫 Anti-Patrones Comunes

| Anti-Patrón Inadecuado | Impacto Negativo en CRO | Solución Correcta |
| :--- | :--- | :--- |
| **Popup invasivo inmediato en `onLoad`** | Tasa de rebote superior al 50%; destruye la confianza inicial del visitante. | Disparar solo tras intención: *exit-intent*, profundidad de scroll (>60%) o inactividad. |
| **Ocultar o miniaturizar la 'X' de cierre** | Genera frustración extrema y fuerza al usuario a cerrar la pestaña del navegador. | Botón de cierre visible (área mínima 44x44px), soporte de tecla Escape y clic en el backdrop. |
| **Popups a pantalla completa en dispositivos móviles** | Penalización directa de posicionamiento por Google (SEO) por bloqueo de lectura. | Usar banners inferiores compactos (*bottom sheets*) que no superen el 25% de la altura visible. |
| **Preguntar una y otra vez en cada recarga** | Hostigamiento y fatiga visual en usuarios recurrentes o clientes ya suscritos. | Establecer límite estricto de frecuencia (*capping*) con enfriamiento de 14 a 30 días si se cierra. |
| **Copys manipuladores o culpabilizadores** (*"No, prefiero perder dinero"*) | Deteriora la reputación de la marca y proyecta deshonestidad comercial. | Respetar la decisión del usuario con una opción limpia y neutral de descarte sin reproches. |
