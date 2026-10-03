---
name: signup-flow-cro
description: "Reducción de fricción y optimización de conversión en formularios y flujos de registro. Úsala para aumentar tasas de completitud de signup. No usar para lógica interna de JWT o base de datos."
license: MIT
metadata:
  version: "1.0.0"
  trigger: ["signup flow cro", "flujo de registro", "formulario de registro", "reducir friccion registro", "social login cro"]
  scope: [global, project]
allowed-tools: Read Bash(node:*)
---

# 📝 signup-flow-cro — Reducción de Fricción en Flujos de Registro

Directrices de optimización de conversión (CRO) especializadas en la reducción de fricción cognitiva y abandono en formularios de registro (*Sign Up*). Enfocadas en maximizar la tasa de completitud mediante el principio de fricción mínima, validación asistida en tiempo real y arquitectura progresiva por etapas.

---

## 📋 Cuándo Usar

- Al diseñar, maquetar o refactorizar pantallas o diálogos modales de registro de usuario.
- Al identificar tasas altas de abandono (*drop-off*) entre el acceso a `/registro` y la creación de la cuenta.
- Para simplificar formularios saturados que solicitan demasiada información antes de otorgar valor.
- Para implementar formularios multi-paso progresivos con indicadores claros de avance.
- Para incorporar validación en línea contextual, visibilidad de contraseña y sugerencias de corrección en campos de correo.
- **NO usar** para lógica de backend, almacenamiento de contraseñas, hashing criptográfico o emisión de JWT (usar `04-backend/jwt-bcrypt`).
- **NO usar** para formularios de facturación o cobros bancarios (usar habilidades de pagos o checkout).

---

## 🚦 Reglas Duras

1. **Principio de Fricción Mínima en el Paso 1**: Solicitar exclusivamente los datos imprescindibles para autenticar al usuario (Email y Contraseña o un botón de acceso social OAuth). Todo dato accesorio (número de teléfono, razón social, cargo, número de empleados) debe postergarse obligatoriamente para la etapa de onboarding posterior al registro.
2. **Prohibición de Campos Duplicados de Contraseña**: Queda estrictamente prohibido solicitar confirmación repetitiva de contraseña (*"Repetir contraseña"*). La verificación se resuelve proporcionando un interruptor de visibilidad claro y accesible (`Show/Hide password`) junto con un indicador visual de robustez.
3. **Validación Inline Asistida, Nunca Castigadora**: Prohibido retener la validación hasta el evento final `onSubmit` o desplegar mensajes de error en rojo antes de que el usuario termine de interactuar. Las comprobaciones de formato deben validarse tras el evento `onBlur` o mediante pausas de tipeo (*debounce*), premiando el cumplimiento con indicadores afirmativos verdes.
4. **Barra de Progreso Transparente en Flujos Multi-Step**: Si el proceso de registro requiere segmentación o configuración inicial forzosa en más de un paso, debe presentarse una barra de avance continua o un contador visual claro (ej. *"Paso 1 de 2: Tu Cuenta"*).
5. **Atributos Nativos de Autocompletado**: Cada campo de entrada debe incluir los atributos semánticos de accesibilidad y navegador correspondientes (`autoComplete="email"`, `autoComplete="new-password"`), habilitando gestores de contraseñas y reduciendo errores manuales.

---

## 🧠 Metodología Paso a Paso

### 1. Principio de Fricción Mínima (Fase de Entrada Inmediata)
- **Acceso con 1 Clic (Social Login / OAuth)**: Ubicar los botones de acceso de proveedores habituales (Google, GitHub) en la posición superior con alta visibilidad. Esto reduce la fricción a un solo toque y ahorra el ingreso manual de credenciales.
- **Separador Semántico Discreto**: Emplear un divisor sutil (*"O continúa con tu correo"*) para dar paso al formulario tradicional sin saturar visualmente.
- **Micro-Copy de Confianza**: Indicar de manera concisa que no se realizarán cargos ni se publicará nada en sus redes (*"No compartiremos tus datos con terceros"*).

### 2. Eliminación de Campos Redundantes y Visibilidad de Contraseña
- **Interruptor de Contraseña**: Añadir un botón accesible de tipo `button` con icono de ojo para alternar el atributo `type="password"` a `type="text"`. Esto reduce en más de un 80% los errores tipográficos en dispositivos móviles y teclados compactos.
- **Requisitos Claros y Dinámicos**: En vez de un texto intimidante con reglas complejas (*"Debe contener 8 caracteres, mayúscula, símbolo..."*), mostrar una lista de comprobación dinámica debajo del campo que cambie de color a medida que el usuario cumple cada criterio.

### 3. Validación Inline Asistida en Tiempo Real
- **Detección de Errores de Dominio**: Verificar errores tipográficos habituales en correos populares (ej. sugerir *"¿Quisiste escribir @gmail.com?"* ante entradas como `@gmai.com`).
- **Estados de Éxito Visual**: Mostrar un icono de validación verde discreto cuando el formato del email sea correcto y la contraseña cumpla los requisitos mínimos, reforzando la sensación de avance rápido.
- **Manejo Amigable de Errores**: Si un correo ya está registrado, ofrecer de inmediato un enlace directo para iniciar sesión o recuperar contraseña, sin forzar a rellenar el formulario desde cero.

### 4. Formularios Progresivos Multi-Step
- **Paso 1 (Compromiso Mínimo)**: Creación de credencial (Email + Contraseña). Al hacer clic en *"Continuar"*, la cuenta base queda generada.
- **Paso 2 (Personalización Rápida)**: Nombre del espacio de trabajo o rol profesional, con opción accesible de *"Omitir por ahora"*.
- **Persistencia de Estado**: Guardar el progreso de los campos en memoria durante la sesión para que un retroceso accidental no borre la información ya ingresada.

---

## 💻 Ejemplos de Implementación

### Ejemplo 1: Formulario de Registro Minimalista con Toggle de Contraseña y Medidor de Fuerza (React + Tailwind CSS)
```tsx
import React, { useState } from "react";

export function MinimalSignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touchedEmail, setTouchedEmail] = useState(false);

  // Validación básica del formato de correo
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const showEmailError = touchedEmail && email.length > 0 && !isEmailValid;

  // Criterios de fortaleza de contraseña
  const hasMinLength = password.length >= 8;
  const hasNumberOrSymbol = /[\d!@#$%^&*]/.test(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEmailValid && hasMinLength && hasNumberOrSymbol) {
      // Proceder con el registro
    }
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Crea tu cuenta gratis</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Comienza tu prueba de 14 días en menos de un minuto.
        </p>
      </div>

      {/* Botón de Social Login prioritario */}
      <button
        type="button"
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        Registrarse con Google
      </button>

      {/* Divisor semántico */}
      <div className="relative my-6 flex items-center justify-center">
        <div className="w-full border-t border-slate-200 dark:border-slate-800" />
        <span className="absolute bg-white px-3 text-xs font-medium uppercase text-slate-400 dark:bg-slate-900">
          o con correo electrónico
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo de Correo Electrónico con validación asistida */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Correo corporativo o personal
          </label>
          <div className="relative mt-1">
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouchedEmail(true)}
              placeholder="tu@empresa.com"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition ${
                showEmailError
                  ? "border-rose-400 bg-rose-50/30 text-rose-900 dark:bg-rose-950/20 dark:text-rose-200"
                  : isEmailValid
                  ? "border-emerald-500 bg-emerald-50/20 text-slate-900 dark:text-white"
                  : "border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              }`}
            />
            {isEmailValid && (
              <span className="absolute right-3 top-3 text-emerald-500 text-sm">✓</span>
            )}
          </div>
          {showEmailError && (
            <p className="mt-1 text-xs text-rose-500">Por favor introduce un correo válido.</p>
          )}
        </div>

        {/* Campo de Contraseña sin repetición y con interruptor de vista */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Contraseña
          </label>
          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-10 text-sm outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>

          {/* Comprobadores visuales dinámicos de seguridad */}
          <div className="mt-2.5 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span className={`flex items-center gap-1 ${hasMinLength ? "text-emerald-500 font-medium" : ""}`}>
              {hasMinLength ? "✓" : "○"} 8+ caracteres
            </span>
            <span className={`flex items-center gap-1 ${hasNumberOrSymbol ? "text-emerald-500 font-medium" : ""}`}>
              {hasNumberOrSymbol ? "✓" : "○"} 1 número o símbolo
            </span>
          </div>
        </div>

        {/* Botón de acción primordial */}
        <button
          type="submit"
          className="mt-2 w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-slate-950 shadow-md transition hover:bg-emerald-400"
        >
          Crear cuenta y comenzar
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-slate-400">
        Al registrarte, aceptas nuestros{" "}
        <a href="/terminos" className="underline hover:text-slate-600 dark:hover:text-slate-300">
          Términos de Servicio
        </a>
        .
      </p>
    </div>
  );
}
```

### Ejemplo 2: Flujo Progresivo Multi-Paso con Indicador de Progreso
```tsx
import React, { useState } from "react";

export function MultiStepSignup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    workspaceName: "",
    role: "Desarrollo",
  });

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  return (
    <div className="w-full max-w-lg mx-auto rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Barra de Progreso Superior */}
      <div className="mb-8">
        <div className="flex justify-between text-xs font-semibold uppercase text-slate-400 mb-2">
          <span>Paso {step} de 2</span>
          <span>{step === 1 ? "Credenciales" : "Espacio de trabajo"}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>
      </div>

      {step === 1 ? (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Empieza con tu correo</h3>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="ejemplo@empresa.com"
            className="w-full rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <button
            type="button"
            onClick={nextStep}
            className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Continuar al paso siguiente →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Personaliza tu entorno</h3>
          <input
            type="text"
            value={formData.workspaceName}
            onChange={(e) => setFormData({ ...formData, workspaceName: e.target.value })}
            placeholder="Nombre de tu proyecto o equipo"
            className="w-full rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={prevStep}
              className="w-1/3 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
            >
              Atrás
            </button>
            <button
              type="button"
              onClick={() => alert("Registro completado")}
              className="w-2/3 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Finalizar configuración
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 🚫 Anti-Patrones Comunes

| Anti-Patrón Inadecuado | Impacto Negativo en CRO | Solución Correcta |
| :--- | :--- | :--- |
| **Pedir datos no esenciales de inmediato** (teléfono, empresa, dirección) | Incrementa la resistencia psicológica y genera más de un 40% de abandonos tempranos. | Solo email/contraseña o OAuth en el registro; trasladar preguntas opcionales al onboarding. |
| **Obligar a repetir la contraseña** (*"Confirmar Contraseña"*) | Provoca frustración por discrepancias de tipeo y duplica la longitud percibida del formulario. | Un único campo con botón de ver/ocultar contraseña e indicador de requisitos en tiempo real. |
| **Validación agresiva en el evento `onChange` inicial** | Alerta al usuario con textos rojos de error antes de que haya terminado de escribir el correo. | Validar al perder el foco (`onBlur`) o tras pausa (*debounce*), mostrando checks positivos al acertar. |
| **Flujos de múltiples pasos sin indicador de avance** | La incertidumbre sobre cuántos pasos faltan impulsa a cerrar la pestaña. | Barra de avance continua o contador claro (*"Paso 1 de 2"*) con opción de omitir pasos secundarios. |
| **Ausencia de botones de Social Login (Google / GitHub)** | Obliga a recordar una nueva contraseña, elevando la fricción en usuarios móviles. | Botón de Social Login en la cabecera del formulario para permitir el registro en 1 toque. |
