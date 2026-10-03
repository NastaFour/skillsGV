---
name: page-cro
description: "Optimización de conversión para landing pages, precios y páginas de producto según Corey Haines. Úsala para maximizar registros y ventas. No usar para lógica backend o pagos."
license: MIT
metadata:
  version: "1.0.0"
  trigger: ["page cro", "cro landing page", "pricing cro", "optimizacion de conversion", "above the fold"]
  scope: [global, project]
allowed-tools: Read Bash(node:*)
---

# 🎯 page-cro — Optimización de Conversión para Landing Pages y Precios

Metodología de Optimización de Tasa de Conversión (CRO) inspirada en los principios de Corey Haines (*Refactoring Growth* y *Conversion Factory*). Aborda la optimización de páginas de aterrizaje, páginas de precios y fichas de producto mediante claridad en la propuesta de valor, reducción de la carga cognitiva y direccionamiento visual sin fricciones.

---

## 📋 Cuándo Usar

- Al diseñar, maquetar o auditar la estructura de landing pages, páginas de precios y páginas de producto.
- Al detectar altas tasas de rebote en el Hero o baja tasa de clics en las llamadas a la acción principales (CTA).
- Para estructurar el contenido *above the fold* de modo que comunique el valor esencial en menos de 5 segundos.
- Para diseñar tablas de precios efectivas con anclaje de precios, plan recomendado destacado y facturación transparente.
- Para transformar secciones de testimonios débiles en bloques de prueba social con métricas verificables y alta credibilidad.
- **NO usar** para lógica de backend, procesamiento de cobros o pasarelas de pago (usar habilidades de backend o billing).
- **NO usar** para microinteracciones o animaciones táctiles de bajo nivel (usar `emil-kowalski`).

---

## 🚦 Reglas Duras

1. **Prueba de los 5 Segundos en Above the Fold**: La combinación de titular (H1), subtítulo explicativo y CTA principal debe responder con absoluta nitidez tres preguntas inmediatas: ¿Qué es?, ¿Para quién es? y ¿Qué resultado concreto proporciona? Prohibido usar titulares vagos, abstractos o excesivamente poéticos.
2. **Un Único Objetivo Primario por Pantalla (Primary CTA)**: Cada sección debe contar con una única acción de conversión primaria claramente diferenciada. Cualquier opción secundaria (como "Ver demostración" o "Leer documentación") debe tener tratamiento visual subordinado (`variant="outline"` o enlace de texto discreto).
3. **Prueba Social Cuantitativa y Creíble**: Prohibido incluir citas genéricas sin respaldo ("Excelente plataforma, muy recomendada"). Cada testimonio o caso de estudio debe incluir métricas tangibles (% de tiempo ahorrado, ingresos generados), nombre completo, cargo y compañía identificable.
4. **Anclaje y Transparencia en Precios**: La tabla de tarifas debe destacar visiblemente un único plan recomendado ("Más Popular"), anclar el precio contra planes superiores o costos de inacción, y desglosar con transparencia el ahorro anual frente al mensual.
5. **Neutralización Inmediata de Objeciones**: Ubicar las preguntas frecuentes (FAQs) y las garantías de devolución (ej. "Garantía de reembolso de 30 días sin preguntas") en proximidad directa con los bloques de decisión de compra o suscripción.

---

## 🧠 Metodología Paso a Paso

### 1. Diagnóstico Above the Fold (La Regla de los 5 Segundos)
- **Titular (H1)**: Orientado al beneficio final o resultado de negocio, no a las características técnicas (ej. *"Automatiza tus reportes financieros en minutos, no en días"* en vez de *"Plataforma en la nube para procesamiento contable"*).
- **Subheadline**: Explicación de 1 a 2 oraciones que aterriza el cómo se logra el beneficio y elimina la incertidumbre tecnológica.
- **CTA Prominente**: Botón de alto contraste visual con verbo de acción y beneficio implícito (ej. *"Comenzar prueba gratis de 14 días"* en vez de *"Enviar"* o *"Registrarse"*). Añadir debajo un micro-copy desarmador de fricción: *"Sin tarjeta de crédito requerida • Configuración en 2 minutos"*.

### 2. Jerarquía del Hero y Flujo de Escaneo Visual
- **Z-Pattern (Páginas ligeras o B2C)**: Título y propuesta de valor arriba a la izquierda → Logotipo/Navegación arriba a la derecha → Elemento visual/gráfico en el centro-derecha → CTA en la esquina inferior izquierda/centro.
- **F-Pattern (Páginas de contenido técnico o B2B)**: Barrido horizontal del titular superior → Lectura de las primeras líneas del subtítulo → Puntos de viñeta destacados con iconos → Foco de atención directo en el botón de acción principal.
- **Punteros Direccionales**: El material gráfico (capturas de producto, gráficos o avatares) debe orientar su línea de mirada o perspectiva visual hacia el formulario o botón de conversión, nunca hacia el borde exterior de la pantalla.

### 3. Prueba Social Creíble y Verificable
- **Cintillo de Logos**: Ubicado inmediatamente debajo del Hero con logotipos de empresas clientes en escala de grises para no distraer la atención del CTA principal.
- **Métricas Destacadas (Stat-Callouts)**: Cifras de gran impacto visual (`+45% de conversión`, `3.2M de horas ahorradas`, `4.9/5 en satisfacción`).
- **Badges de Confianza y Seguridad**: Sellos de cifrado SSL, certificaciones de industria o valoraciones en plataformas independientes de reseñas ubicados junto a las zonas de interacción.

### 4. Tabla de Precios Orientada a Conversión
- **Efecto Anclaje (Price Anchoring)**: Colocar un plan avanzado de mayor valor o contrastar el precio frente a alternativas costosas tradicionales para que el plan recomendado se perciba como una inversión accesible y lógica.
- **Plan Recomendado Destacado**: Incrementar ligeramente la escala de la tarjeta central (`scale-105`), aplicar un borde de acento o incluir un badge superior *"Recomendado para equipos"*.
- **Selector de Facturación Anual vs Mensual**: Toggle accesible que declare explícitamente el porcentaje de descuento (ej. *"Ahorra 20% al año"*) y calcule el costo equivalente mensual para minimizar el impacto psicológico del desembolso total.
- **Garantías Claras**: Mensaje explícito de cancelación en cualquier momento y política de reembolso directo sin penalizaciones.

### 5. Matriz de Objeciones y FAQs Resolutivas
- Identificar y responder anticipadamente las 5 objeciones universales:
  1. *¿Cuánto tiempo tardaré en implementarlo?*
  2. *¿Necesito tarjeta de crédito para iniciar?*
  3. *¿Qué sucede si deseo cancelar mi suscripción?*
  4. *¿Cómo migro mis datos desde mi herramienta actual?*
  5. *¿Existe soporte técnico personalizado incluido?*

---

## 💻 Ejemplos de Implementación

### Ejemplo 1: Hero Section de Alta Conversión (React + Tailwind CSS)
```tsx
import React from "react";

export function HeroConversion() {
  return (
    <section className="relative overflow-hidden bg-slate-900 px-6 py-24 sm:py-32 lg:px-8 text-white">
      <div className="mx-auto max-w-4xl text-center">
        {/* Badge de anuncio o validación de mercado */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Más de 10,000 profesionales ya automatizan su flujo
        </div>

        {/* H1 enfocado en el resultado de negocio deseado */}
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-slate-50">
          Cierra ventas en minutos,{" "}
          <span className="text-emerald-400">sin tareas manuales</span>
        </h1>

        {/* Subtítulo resolutivo que elimina incertidumbre */}
        <p className="mt-6 text-lg leading-8 text-slate-300 max-w-2xl mx-auto">
          Centraliza tus propuestas comerciales, sincroniza firmas electrónicas y recibe pagos 3 veces más rápido desde una única pantalla interactiva.
        </p>

        {/* Zona de acción focalizada: CTA primario y secundario subordinado */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/registro"
            className="w-full sm:w-auto rounded-xl bg-emerald-500 px-8 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
          >
            Iniciar prueba gratis de 14 días
          </a>
          <a
            href="/demo"
            className="w-full sm:w-auto rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-4 text-base font-semibold text-slate-200 transition-colors hover:bg-slate-700"
          >
            Ver demo interactiva (2 min)
          </a>
        </div>

        {/* Micro-copy desarmador de fricción */}
        <p className="mt-4 text-xs text-slate-400">
          No requiere tarjeta de crédito • Configuración lista en 3 minutos • Cancela cuando quieras
        </p>

        {/* Logos de clientes en escala de grises subordinada */}
        <div className="mt-16 border-t border-slate-800 pt-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Equipos de alto rendimiento confían en nuestra plataforma
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-8 opacity-60 grayscale hover:opacity-100 transition-opacity">
            <span className="text-sm font-bold tracking-wider text-slate-300">ACME CORP</span>
            <span className="text-sm font-bold tracking-wider text-slate-300">GLOBALFLOW</span>
            <span className="text-sm font-bold tracking-wider text-slate-300">VERTEX LABS</span>
            <span className="text-sm font-bold tracking-wider text-slate-300">NEXUS DATA</span>
          </div>
        </div>
      </div>
    </section>
  );
}
```

### Ejemplo 2: Tabla de Precios con Anclaje y Plan Recomendado (React + Tailwind CSS)
```tsx
import React, { useState } from "react";

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section className="bg-slate-950 py-24 px-6 text-white">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-base font-semibold text-emerald-400 uppercase tracking-wider">
          Precios Transparentes
        </h2>
        <p className="mt-2 text-3xl font-bold tracking-tight sm:text-5xl text-slate-100">
          Elige el plan que acelera tu crecimiento
        </p>

        {/* Toggle Anual / Mensual con incentivo visual */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <span className={`text-sm ${!isAnnual ? "text-white font-semibold" : "text-slate-400"}`}>
            Mensual
          </span>
          <button
            type="button"
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative h-7 w-14 rounded-full bg-slate-800 p-1 transition-colors focus:outline-none"
            aria-label="Alternar facturación anual o mensual"
          >
            <span
              className={`block h-5 w-5 rounded-full bg-emerald-400 transition-transform ${
                isAnnual ? "translate-x-7" : "translate-x-0"
              }`}
            />
          </button>
          <span className={`text-sm flex items-center gap-1.5 ${isAnnual ? "text-white font-semibold" : "text-slate-400"}`}>
            Anual
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300">
              Ahorra 20%
            </span>
          </span>
        </div>

        {/* Cuadrícula de Planes */}
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3 items-stretch">
          {/* Plan Inicial */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-left">
            <div>
              <h3 className="text-lg font-semibold text-slate-200">Inicial</h3>
              <p className="mt-2 text-sm text-slate-400">Para creadores independientes y prototipos.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">
                  ${isAnnual ? "19" : "24"}
                </span>
                <span className="text-xs text-slate-400">/mes</span>
              </div>
            </div>
            <a
              href="/registro?plan=starter"
              className="mt-8 block rounded-xl border border-slate-700 bg-slate-800 py-3 text-center text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
            >
              Comenzar con Starter
            </a>
          </div>

          {/* Plan Profesional (Destacado y Anclado) */}
          <div className="relative flex flex-col justify-between rounded-2xl border-2 border-emerald-500 bg-slate-900 p-8 text-left shadow-2xl shadow-emerald-500/10 lg:-translate-y-2">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-slate-950 uppercase tracking-wide">
              Más Popular
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-400">Pro</h3>
              <p className="mt-2 text-sm text-slate-300">Para equipos en expansión que requieren automatización total.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">
                  ${isAnnual ? "49" : "59"}
                </span>
                <span className="text-xs text-slate-400">/mes</span>
              </div>
            </div>
            <a
              href="/registro?plan=pro"
              className="mt-8 block rounded-xl bg-emerald-500 py-3 text-center text-sm font-semibold text-slate-950 hover:bg-emerald-400 shadow-md transition-colors"
            >
              Probar Pro gratis 14 días
            </a>
          </div>

          {/* Plan Empresa */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-left">
            <div>
              <h3 className="text-lg font-semibold text-slate-200">Escala</h3>
              <p className="mt-2 text-sm text-slate-400">Para organizaciones con requerimientos de seguridad avanzados.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">
                  ${isAnnual ? "99" : "119"}
                </span>
                <span className="text-xs text-slate-400">/mes</span>
              </div>
            </div>
            <a
              href="/contacto-ventas"
              className="mt-8 block rounded-xl border border-slate-700 bg-slate-800 py-3 text-center text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
            >
              Contactar Asesor
            </a>
          </div>
        </div>

        {/* Garantía de Reembolso */}
        <div className="mt-12 flex items-center justify-center gap-3 text-sm text-slate-400">
          <span className="text-emerald-400 text-lg">🛡️</span>
          <span>Garantía incondicional de reembolso por 30 días. Si no ahorras tiempo, te devolvemos el 100%.</span>
        </div>
      </div>
    </section>
  );
}
```

---

## 🚫 Anti-Patrones Comunes

| Anti-Patrón Inadecuado | Impacto Negativo en CRO | Solución Correcta |
| :--- | :--- | :--- |
| **Titular Críptico o Abstracto** (*"El futuro del software inteligente hoy"*) | Provoca rebote instantáneo porque el usuario no entiende qué hace el producto en 5 segundos. | Titular anclado en resultado tangible: *"Genera tus informes contables en 3 minutos"*. |
| **Carrusel / Slider Automático en el Hero** | El usuario ignora las diapositivas siguientes y el movimiento genera ceguera publicitaria. | Mensaje estático y unificado con alta jerarquía y foco en el CTA principal. |
| **Múltiples CTAs con Igual Peso Visual** | Provoca parálisis por análisis; el usuario no sabe cuál es el siguiente paso lógico. | Un solo botón primario llamativo; las opciones secundarias van en estilo texto o contorno sutil. |
| **Testimonios sin Nombre ni Datos Verificables** | Despierta desconfianza y sospecha de reseñas falsas inventadas por marketing. | Cita detallada con nombre, cargo, fotografía real, logotipo y métrica porcentual demostrable. |
| **Costos Ocultos o Falta de Precios Transparentes** | Abandono en el embudo final debido a la frustración por tarifas imprevistas. | Desglose honesto de precios, aclaración de impuestos y cálculo directo del beneficio anual. |
