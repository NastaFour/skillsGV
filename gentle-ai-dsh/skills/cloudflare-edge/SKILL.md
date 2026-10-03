---
name: cloudflare-edge
description: "Usala para configurar el patrón Cloudflare delante con proxy, WAF, Turnstile, edge cache y cabeceras de seguridad. No usar para bases de datos ni backend bare metal."
license: MIT
allowed-tools: Read Bash(node:*)
metadata:
  version: "1.0.0"
  trigger: ["cloudflare edge", "pon cloudflare delante", "cloudflare proxy", "waf rules", "edge caching", "turnstile", "cabeceras de seguridad"]
  scope: [global, project]
---

# Cloudflare Edge — Patrón Arquitectónico "Cloudflare Delante"

Patrón de arquitectura de infraestructura y seguridad de borde que posiciona Cloudflare como Reverse Proxy global frente al servidor de origen (VPS, contenedor Docker, Railway o PaaS). Centraliza la terminación SSL/TLS, reglas de WAF, mitigación de ataques DDoS, protección anti-bot con Turnstile, caché de activos en el edge y cabeceras HTTP de seguridad estricta.

---

## 🎯 Contrato de Activación

Usa esta skill cuando el usuario solicite:
- Configurar el patrón "Cloudflare delante" para una aplicación web o API.
- Gestionar DNS proxied (nube naranja), enrutamiento y terminación SSL/TLS Full (Strict).
- Configurar Cache Rules separando activos estáticos (`Cache Everything`) de endpoints dinámicos (`Bypass Cache`).
- Implementar reglas de WAF (Web Application Firewall), mitigación de DDoS y rate limiting perimetral.
- Proteger formularios y endpoints de autenticación contra bots con Cloudflare Turnstile.
- Inyectar cabeceras de seguridad HTTP mediante Transform Rules o middleware perimetral (HSTS, CSP, X-Content-Type-Options, Permissions-Policy).

**No usar para**:
- Aprovisionar bases de datos directas o túneles de bases de datos bare-metal (usar `04-backend/postgresql`).
- Configurar pipelines de despliegue continuo en repositorios (usar `08-devops/ci-cd`).

---

## 🛡️ Topología del Patrón "Cloudflare Delante"

```text
 Usuarios / Bots
       |
       v (HTTPS:443 - TLS 1.3)
+-------------------------------------------------------------+
|                     CLOUDFLARE EDGE                         |
|  - DNS Gestionado + DNSSEC                                  |
|  - WAF & OWASP Managed Rules (Mitigación DDoS L7)           |
|  - Rate Limiting (ej. /api/auth/login máx 5 req/min)        |
|  - Cloudflare Turnstile (Protección Anti-Bot Invisible)     |
|  - Edge Caching (/assets/* TTL 30d; /api/* Bypass)          |
|  - Response Headers Transform Rules (HSTS, CSP, nosniff)    |
+-------------------------------------------------------------+
       |
       v (HTTPS:443 cifrado con Cloudflare Origin Certificate)
+-------------------------------------------------------------+
|                    SERVIDOR DE ORIGEN                       |
|  - Firewall: solo permite IPs de Cloudflare o Cloudflare Tunnel
|  - Node.js / Express API / Frontend SPA                     |
+-------------------------------------------------------------+
```

---

## ⚙️ Especificaciones de Configuración

### 1. DNS y Modo de Proxy
- Todos los registros de cara al público (`@`, `www`, `api`) deben configurarse como **Proxied (Nube Naranja activada)**.
- Activar **DNSSEC** en el registrador de dominio y en el panel de Cloudflare para prevenir spoofing y envenenamiento de DNS.

### 2. Cifrado SSL/TLS de Extremo a Extremo
- **Modo SSL/TLS obligatorio**: `Full (Strict)`.
  - Evitar el modo *Flexible* (es inseguro porque deja desprotegida la conexión entre Cloudflare y el origen).
  - Instalar en el servidor de origen un **Cloudflare Origin CA Certificate** (válido por hasta 15 años).
- **Parámetros de Cifrado**:
  - *Minimum TLS Version*: `TLS 1.2`.
  - *TLS 1.3*: Activado con *0-RTT Connection Resumption*.
  - *Always Use HTTPS*: Activado (redirección 301 automática de HTTP a HTTPS).
  - *Automatic HTTPS Rewrites*: Activado.

---

### 3. Edge Cache Rules (Estático vs Dinámico)

Para evitar que datos privados de sesión queden cacheados y acelerar los recursos pesados:

```yaml
# Regla 1: Bypass para APIs y Autenticación (Prioridad 1)
Matching Criteria:
  URI Path starts with: "/api" OR "/auth" OR "/admin"
Cache Eligibility:
  Eligible for cache: Bypass cache

# Regla 2: Cache Agresivo para Activos con Hash (Prioridad 2)
Matching Criteria:
  URI Path starts with: "/assets" OR "/static" OR File Extension in (css, js, woff2, webp, svg, png)
Cache Eligibility:
  Eligible for cache: Cache everything
  Edge Cache TTL: 30 days
  Browser Cache TTL: 30 days
  Respect Strong ETags: Enabled
```

---

### 4. WAF y Rate Limiting

1. **Firewall Rules / WAF**:
   - Activar el *Cloudflare Managed Ruleset* y *OWASP ModSecurity Core Rule Set*.
   - Configurar acción *Managed Challenge* para peticiones con score de amenaza medio/alto (*Threat Score > 15*).
2. **Rate Limiting Perimetral**:
   - Proteger rutas de autenticación (`POST /api/auth/login`, `POST /api/auth/register`):
     - Umbral: Máximo 5 peticiones por minuto por IP.
     - Acción: *Block* (429 Too Many Requests) o *Managed Challenge* durante 15 minutos.

---

### 5. Integración Anti-Bot con Cloudflare Turnstile

Cloudflare Turnstile sustituye captchas visuales invasivos por validaciones no interactivas:

#### Instalación en Frontend (React/Vite):
```bash
pnpm add @marsidev/react-turnstile
```

#### Uso en Formulario:
```tsx
import { Turnstile } from '@marsidev/react-turnstile';
import { useState } from 'react';

export function LoginForm() {
  const [turnstileToken, setTurnstileToken] = useState<string>('');

  return (
    <form onSubmit={(e) => { e.preventDefault(); /* Enviar token al backend */ }}>
      {/* Campos de usuario y contraseña */}
      <Turnstile
        siteKey="0x4AAAAAA..."
        onSuccess={(token) => setTurnstileToken(token)}
        options={{ theme: 'auto', size: 'flexible' }}
      />
      <button type="submit" disabled={!turnstileToken}>Iniciar Sesión</button>
    </form>
  );
}
```

#### Verificación en Backend (Node.js/Express):
```typescript
export async function verifyTurnstileToken(token: string, remoteIp?: string): Promise<boolean> {
  const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
  if (!secretKey) throw new Error('CLOUDFLARE_TURNSTILE_SECRET_KEY no configurado');

  const formData = new URLSearchParams();
  formData.append('secret', secretKey);
  formData.append('response', token);
  if (remoteIp) formData.append('remoteip', remoteIp);

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData,
  });

  const outcome = await res.json() as { success: boolean };
  return outcome.success;
}
```

---

### 6. Cabeceras HTTP de Seguridad Indispensables

Configurar en Cloudflare (*Rules -> Transform Rules -> Modify Response Headers*) o inyectar en el origen:

| Cabecera | Valor Recomendado | Propósito |
|---|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Forzar HTTPS estricto por 2 años y preparar para precarga en navegador |
| `X-Content-Type-Options` | `nosniff` | Prevenir ataques MIME-type sniffing |
| `X-Frame-Options` | `DENY` | Mitigar ataques de Clickjacking impidiendo iframes |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limitar fuga de URLs sensibles en peticiones cruzadas |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Bloquear acceso a APIs de hardware no utilizadas |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;` | Restringir orígenes permitidos de recursos y scripts |

---

## 🚦 Decision Gates

| Escenario | Decisión |
|---|---|
| Aplicación expuesta a internet con dominio propio | Habilitar Cloudflare Proxied con SSL Full (Strict) y Transform Rules. |
| Endpoints con riesgo de abuso o ataques de fuerza bruta | Implementar Turnstile en frontend + Rate Limiting perimetral en WAF. |
| Monitoreo de salud del servicio | Complementar con alertas perimetrales y monitoreo de `08-devops/monitoring`. |

---

## 📚 Referencias

- [`08-devops/ci-cd`](../ci-cd/SKILL.md) — Flujos de integración y despliegue continuo.
- [`08-devops/monitoring`](../monitoring/SKILL.md) — Observabilidad y health checks.
- [`04-backend/jwt-bcrypt`](../../04-backend/jwt-bcrypt/SKILL.md) — Seguridad de autenticación en backend.
- [Cloudflare Turnstile Documentation](https://developers.cloudflare.com/turnstile/) — Guía oficial de integración.
