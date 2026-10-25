---
name: signup-flow-cro
description: "Reducción de fricción y optimización de conversión en formularios y flujos de registro. Úsala para aumentar tasas de completitud de signup. No usar para lógica interna de JWT o base de datos."
license: MIT
metadata:
  version: "1.1.0"
  trigger: ["signup flow cro", "flujo de registro", "formulario de registro", "reducir friccion registro", "social login cro"]
  scope: [global, project]
allowed-tools: Read Bash(node:*)
---

# 📝 signup-flow-cro — Reducción de Fricción en Flujos de Registro

Directrices de optimización de conversión (CRO) especializadas en la reducción de fricción cognitiva y abandono en formularios de registro (*Sign Up*). Estructuradas en **Guardrails de 2 Niveles** para maximizar la tasa de completitud mediante validación asistida, accesibilidad nativa con gestores de contraseñas y arquitectura progresiva adaptable tanto a SaaS PLG como a flujos B2B/Regulados.

---

## 📋 Cuándo Usar

- Al diseñar, maquetar o refactorizar pantallas o diálogos de creación de cuenta.
- Al identificar tasas altas de abandono (*drop-off*) entre la visita a `/registro` y la creación efectiva del usuario.
- Para simplificar formularios saturados o estructurarlos en etapas progresivas con indicadores de avance.
- Para incorporar validación en línea asistida (`onBlur` / debounce), interruptor de visibilidad de contraseña y soporte completo de autocompletado (`autoComplete`) y Passkeys/OAuth.
- **NO usar** para lógica de almacenamiento de contraseñas en servidor, hashing criptográfico o emisión de JWT (usar `04-backend/jwt-bcrypt`).
- **NO usar** para flujos de pasarela de pago o liquidación bancaria.

---

## 🛡️ Guardrails de 2 Niveles (Invariantes Duros vs Heurísticas Contextuales)

### Nivel 1: Invariantes Duros (Innegociables en Todo Dominio)
1. **Soporte Nativo de Gestores de Contraseñas y Accesibilidad**: Cada campo debe asociar un `<label>` explícito, declarar atributos semánticos (`type="email"`, `autoComplete="email"`, `autoComplete="new-password"`, `aria-invalid`, `aria-describedby`) y nunca bloquear el pegado (`onPaste`) en campos de contraseña o código OTP.
2. **Validación Inline Asistida, Nunca Castigadora**: No disparar errores en rojo en el primer carácter escrito (`onChange` temprano) ni esperar únicamente al `onSubmit`. Validar formato al perder el foco (`onBlur`) o tras pausa de escritura (*debounce*), manteniendo feedback en vivo solo para despejar un error ya corregido o mostrar criterios de fortaleza de contraseña.
3. **Preservación de Estado ante Errores**: Si falla el envío o un correo ya existe, conservar los datos ingresados y ofrecer acción directa (iniciar sesión o recuperar acceso) sin vaciar el formulario.

### Nivel 2: Heurísticas Contextuales CRO (Base Self-Serve vs Excepciones B2B/Compliance)
1. **Fricción Mínima en el Paso 1**:
   - *Por defecto (PLG / B2C Self-Serve)*: Solicitar únicamente las credenciales esenciales (Email + Contraseña, Passkey o botón OAuth/SSO) en el primer paso, posponiendo datos de perfil u organización para el onboarding posterior.
   - *Excepción Contextual (`[Beyond-Baseline]`)*: En productos **B2B Enterprise, Fintech (KYC/KYB), Salud o portales con aprovisionamiento por tenant/región**, donde la creación de la cuenta requiere legal o técnicamente el identificador fiscal, dominio corporativo, región de residencia de datos (`EU` vs `US`) o código de invitación, estructurar un **Flujo Multi-Paso Progresivo** (Paso 1: Identidad/Credencial -> Paso 2: Datos de Tenant/Compliance) con barra de progreso explícita.
2. **Campo Único de Contraseña con Interruptor de Visibilidad**:
   - *Por defecto*: Evitar el campo duplicado *"Repetir contraseña"* utilizando en su lugar un botón accesible `Mostrar/Ocultar contraseña` (`aria-label`) e indicadores dinámicos de requisitos.
   - *Excepción Contextual (`[Beyond-Baseline]`)*: En generación de frases semilla sin custodia o claves maestras no recuperables donde el soporte no puede restablecer la clave, se autoriza un paso de verificación explícita documentado con `[Beyond-Baseline: non-custodial key verification]`.

---

## 🧠 Metodología Paso a Paso

### 1. Fase de Entrada Rápida (SSO / OAuth / Email)
- **Acceso con 1 Clic**: Cuando el dominio lo permita, ubicar proveedores de identidad (Google, GitHub, Microsoft Entra / SAML SSO) en posición prioritaria.
- **Divisor Semántico**: Separar claramente el acceso federado del formulario de correo electrónico.

### 2. Visibilidad de Contraseña y Requisitos en Tiempo Real
- Añadir un botón `type="button"` para alternar `type="password"` y `type="text"`, reduciendo errores tipográficos en teclados móviles.
- Mostrar criterios verificables (`8+ caracteres`, `número o símbolo`) que cambien de estado conforme el usuario escribe.

### 3. Arquitectura Multi-Paso cuando Existan Datos de Negocio
- Si se requieren campos adicionales de organización o cumplimiento, asegurar la creación o reserva del progreso en el Paso 1 y mostrar un indicador claro (`Paso 1 de 2: Tu Cuenta` -> `Paso 2 de 2: Organización`).

---

## 💻 Ejemplos de Implementación

### Ejemplo 1: Formulario de Registro con Toggle de Contraseña y Validación Asistida (React + Tailwind CSS)
```tsx
import React, { useState } from "react";

export function MinimalSignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touchedEmail, setTouchedEmail] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const showEmailError = touchedEmail && email.length > 0 && !isEmailValid;

  const hasMinLength = password.length >= 8;
  const hasNumberOrSymbol = /[\d!@#$%^&*]/.test(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEmailValid && hasMinLength && hasNumberOrSymbol) {
      // Proceder con el registro
    }
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl border border-border-subtle bg-surface-primary p-8 shadow-sm">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Crea tu cuenta</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Comienza en menos de un minuto sin configuraciones complejas.
        </p>
      </div>

      <button
        type="button"
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-border-subtle bg-surface-elevated px-4 py-3 text-sm font-semibold text-text-primary shadow-xs transition hover:border-accent-primary"
      >
        Continuar con SSO / Google
      </button>

      <div className="relative my-6 flex items-center justify-center">
        <div className="w-full border-t border-border-subtle" />
        <span className="absolute bg-surface-primary px-3 text-xs font-medium uppercase text-text-secondary">
          o con tu correo
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="signup-email" className="block text-xs font-medium text-text-primary">
            Correo electrónico
          </label>
          <div className="relative mt-1">
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouchedEmail(true)}
              aria-invalid={showEmailError}
              aria-describedby={showEmailError ? "email-error" : undefined}
              placeholder="tu@empresa.com"
              className="w-full rounded-xl border border-border-subtle bg-surface-elevated px-3.5 py-2.5 text-sm text-text-primary outline-none transition focus:border-accent-primary"
            />
            {isEmailValid && (
              <span className="absolute right-3 top-2.5 text-accent-primary text-sm" aria-hidden="true">
                ✓
              </span>
            )}
          </div>
          {showEmailError && (
            <p id="email-error" role="alert" className="mt-1 text-xs text-text-secondary">
              Por favor introduce una dirección de correo válida.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="signup-password" className="block text-xs font-medium text-text-primary">
            Contraseña
          </label>
          <div className="relative mt-1">
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="w-full rounded-xl border border-border-subtle bg-surface-elevated px-3.5 py-2.5 pr-16 text-sm text-text-primary outline-none transition focus:border-accent-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-xs font-semibold text-text-secondary hover:text-text-primary"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>

          <div className="mt-2.5 flex items-center gap-4 text-xs text-text-secondary">
            <span className={hasMinLength ? "text-text-primary font-semibold" : ""}>
              {hasMinLength ? "✓" : "○"} 8+ caracteres
            </span>
            <span className={hasNumberOrSymbol ? "text-text-primary font-semibold" : ""}>
              {hasNumberOrSymbol ? "✓" : "○"} 1 número o símbolo
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="mt-2 w-full rounded-xl bg-accent-primary py-3 text-sm font-semibold text-surface-primary shadow-md transition hover:bg-accent-hover"
        >
          Crear cuenta y continuar
        </button>
      </form>
    </div>
  );
}
```

### Ejemplo 2: Flujo Progresivo Multi-Paso para Entornos B2B / Tenant Setup
```tsx
import React, { useState } from "react";

export function MultiStepSignup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    workspaceName: "",
    dataRegion: "eu-west-1",
  });

  return (
    <div className="w-full max-w-lg mx-auto rounded-2xl border border-border-subtle bg-surface-primary p-8 shadow-sm">
      <div className="mb-8">
        <div className="flex justify-between text-xs font-semibold uppercase text-text-secondary mb-2">
          <span>Paso {step} de 2</span>
          <span>{step === 1 ? "Identidad" : "Organización y Región"}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-surface-elevated overflow-hidden">
          <div
            className="h-full bg-accent-primary transition-all duration-300"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>
      </div>

      {step === 1 ? (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-text-primary">Empieza con tu correo corporativo</h3>
          <input
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="nombre@empresa.com"
            className="w-full rounded-xl border border-border-subtle bg-surface-elevated p-3 text-sm text-text-primary"
          />
          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full rounded-xl bg-accent-primary py-3 text-sm font-semibold text-surface-primary hover:bg-accent-hover"
          >
            Continuar al paso siguiente →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-text-primary">Configura tu Tenant</h3>
          <input
            type="text"
            autoComplete="organization"
            value={formData.workspaceName}
            onChange={(e) => setFormData({ ...formData, workspaceName: e.target.value })}
            placeholder="Nombre de la organización"
            className="w-full rounded-xl border border-border-subtle bg-surface-elevated p-3 text-sm text-text-primary"
          />
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-1/3 rounded-xl border border-border-subtle bg-surface-elevated py-3 text-sm font-semibold text-text-primary"
            >
              Atrás
            </button>
            <button
              type="button"
              className="w-2/3 rounded-xl bg-accent-primary py-3 text-sm font-semibold text-surface-primary hover:bg-accent-hover"
            >
              Finalizar aprovisionamiento
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 🚀 Floor, Not Ceiling (`[Beyond-Baseline]`)

El formulario de un solo paso (Email + Contraseña/OAuth) es la heurística óptima para productos SaaS autogestionados. En arquitecturas **B2B Enterprise, Fintech regulado (KYC/KYB), Salud (HIPAA) o sistemas multi-tenant con residencia de datos inmutable**, donde ciertos campos organizacionales, códigos de verificación MFA/OTP o validaciones de dominio son indispensables antes de emitir la sesión inicial, implementa un flujo multi-paso transparente con persistencia de estado, documentando la razón con `[Beyond-Baseline: <requisito B2B tenant/KYC/seguridad>]`.

---

## 🚫 Anti-Patrones Comunes

| Anti-Patrón Inadecuado | Impacto Negativo en CRO | Solución Correcta |
| :--- | :--- | :--- |
| **Pedir campos de marketing no esenciales en el Paso 1** | Incrementa el abandono temprano en más de un 40%. | Posponer encuestas opcionales al onboarding o dividir en pasos claros si son requisitos técnicos de tenant. |
| **Bloquear pegado (`onPaste`) o carecer de `autoComplete`** | Impide el uso de gestores de contraseñas (1Password, Bitwarden, iCloud Keychain). | Respetar eventos nativos del portapapeles e incluir `autoComplete="new-password"`. |
| **Validación agresiva en el primer `onChange`** | Muestra errores en rojo mientras el usuario aún está escribiendo su correo. | Validar en `onBlur` o con *debounce*, limpiando el error inmediatamente al corregirse. |
| **Flujos de múltiples pasos sin indicador de avance** | Genera incertidumbre sobre la longitud real del registro. | Mostrar barra de progreso (`Paso 1 de 2`) y preservar los valores al navegar atrás. |
