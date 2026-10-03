---
name: openseo
description: "Usala para auditar SEO técnico, schemas JSON-LD y visibilidad en motores de IA con OpenSEO. No usar para campañas SEM de pago ni anuncios publicitarios."
license: MIT
allowed-tools: Read Bash(node:*)
metadata:
  version: "1.0.0"
  trigger: ["openseo", "seo tecnico", "datos estructurados", "json-ld", "sitemap dinamico", "open graph", "auditoria seo", "visibilidad ia"]
  scope: [global, project]
  requires-mcp: ["openseo"]
  mcp-fallback: "Servidor OpenSEO ausente -> auditar metadatos estáticos en HTML/TSX y diferir a recomendaciones locales de Schema.org y OpenGraph"
---

# OpenSEO — Auditoría de SEO Técnico, JSON-LD y Visibilidad en Motores de IA

Optimización técnica de motores de búsqueda (SEO) y visibilidad en motores generativos de IA (GEO / AI Search: Perplexity, ChatGPT Search, Claude, Gemini) mediante OpenSEO (`every-app/open-seo`) y su servidor MCP integrado. Permite auditar rastreo, indexación, encabezados canónicos, schemas estructurados Schema.org, metadatos OpenGraph y sitemaps.

---

## 🎯 Contrato de Activación

Usa esta skill cuando el usuario solicite:
- Conectar o auditar un sitio web mediante el servidor MCP de OpenSEO (`every-app/open-seo`).
- Auditar SEO técnico: rastreo (crawling), indexabilidad, canonicals, redirecciones y robots.txt.
- Generar esquemas estructurados JSON-LD validados (Organization, WebSite, BreadcrumbList, Product, Article, FAQPage).
- Configurar metadatos sociales OpenGraph y Twitter Cards con dimensiones y formatos estándar.
- Diseñar sitemaps XML dinámicos y archivos `robots.txt` que gestionen bots de búsqueda y crawlers de IA.
- Optimizar la visibilidad semántica ante motores de respuesta de IA (Generative Engine Optimization).

**No usar para**:
- Gestión de campañas de publicidad pagada SEM (Google Ads, Meta Ads).
- Redacción exclusiva de textos comerciales o copywriting persuasivo (usar `02-dev-roles/technical-writer`).

---

## 🔌 Integración MCP y Modo Fallback

### 1. Protocolo MCP Activo
Cuando el servidor MCP de OpenSEO está conectado (`openseo`), utiliza las herramientas nativas del servidor para:
- `audit_url(url)`: Auditoría en vivo de cabeceras HTTP, status codes, canonicals, meta robots y tiempos de respuesta.
- `extract_schemas(url)`: Extracción e inspección sintáctica de bloques JSON-LD existentes en el DOM.
- `validate_metadata(url)`: Validación de OpenGraph, Twitter Cards y etiquetas básicas de indexación.

### 2. Protocolo Fallback (Sin Servidor MCP)
Si el servidor MCP no está conectado, el agente no bloquea el flujo:
1. Inspecciona los archivos locales del repositorio (`index.html`, Next.js `layout.tsx`/`page.tsx`, componentes de meta-tags en React/Vite).
2. Valida la estructura del HTML estático buscando etiquetas esenciales.
3. Genera recomendaciones y bloques de código Schema.org locales conforme a los estándares de esta guía.

---

## 🧱 Schemas JSON-LD Estructurados (Schema.org)

Genera siempre bloques estructurados `<script type="application/ld+json">` válidos y tipados:

### 1. Organization & LocalBusiness
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Mi Plataforma",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "sameAs": [
    "https://twitter.com/miplataforma",
    "https://github.com/miplataforma"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Support",
    "email": "soporte@example.com"
  }
}
```

### 2. BreadcrumbList (Navegación Jerárquica)
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Inicio",
      "item": "https://example.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Productos",
      "item": "https://example.com/productos"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Detalle",
      "item": "https://example.com/productos/detalle"
    }
  ]
}
```

### 3. Product & E-commerce
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Suscripción Pro",
  "description": "Acceso ilimitado a todas las herramientas de la plataforma.",
  "image": "https://example.com/images/pro-plan.png",
  "offers": {
    "@type": "Offer",
    "price": "29.00",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "url": "https://example.com/pricing"
  }
}
```

---

## 🌐 Metadatos OpenGraph y Twitter Cards

Asegura que el `<head>` del HTML o los metadatos de Next.js/Vite contengan:

```html
<!-- Primarias -->
<title>Título Descriptivo y Único — Mi Plataforma</title>
<meta name="description" content="Descripción concisa de 140-160 caracteres orientada a la intención de búsqueda." />
<link rel="canonical" href="https://example.com/ruta-actual" />

<!-- OpenGraph (Facebook, LinkedIn, Slack) -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://example.com/ruta-actual" />
<meta property="og:title" content="Título Descriptivo y Único" />
<meta property="og:description" content="Descripción concisa y persuasiva para previews en redes." />
<meta property="og:image" content="https://example.com/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Título Descriptivo y Único" />
<meta name="twitter:description" content="Descripción concisa de 140-160 caracteres." />
<meta name="twitter:image" content="https://example.com/og-image.png" />
```

---

## 🤖 Directivas de Robots y Visibilidad en Motores de IA (GEO)

### Configuración de `robots.txt`
Permite a los rastreadores legítimos e indexadores de IA consumir la información pública mientras proteges rutas administrativas:

```text
# Crawlers Tradicionales
User-agent: Googlebot
User-agent: Bingbot
Allow: /
Disallow: /admin/
Disallow: /api/

# Crawlers de Motores de Búsqueda de IA
User-agent: PerplexityBot
User-agent: GPTBot
User-agent: ClaudeBot
Allow: /
Disallow: /admin/
Disallow: /api/

# Sitemap Principal
Sitemap: https://example.com/sitemap.xml
```

### Optimización Semántica para IA (GEO)
1. **Estructura H1-H3 Semántica**: Respuestas directas al inicio de cada sección en párrafos concisos de 40-60 palabras.
2. **Listas y Tablas Marcadas**: La IA prioriza datos tabulados y listas ordenadas para responder preguntas comparativas.
3. **Consistencia de Entidad**: Reforzar en JSON-LD el nombre de la organización, fundadores, licencias y enlaces sociales para elevar el índice de confianza (E-E-A-T).

---

## 🚦 Decision Gates

| Situación | Acción |
|---|---|
| Servidor OpenSEO conectado vía MCP | Ejecutar auditoría en vivo contra URLs desplegadas. |
| Entorno local sin servidor OpenSEO | Aplicar el protocolo fallback: auditar HTML/TSX y verificar schemas manualmente. |
| Dudas sobre accesibilidad y contraste | Coordinar con `11-mcp-hybrid/ux-auditor-agent`. |

---

## 📚 Referencias

- [`05-frontend/nextjs-15`](../../05-frontend/nextjs-15/SKILL.md) — Manejo de metadatos estáticos y dinámicos en App Router.
- [`05-frontend/react-vite`](../../05-frontend/react-vite/SKILL.md) — Inyección de meta-tags y Helmet en Vite.
- [`11-mcp-hybrid/ux-auditor-agent`](../ux-auditor-agent/SKILL.md) — Auditoría de accesibilidad y experiencia de usuario.
- [Schema.org Full Hierarchy](https://schema.org) — Especificación canónica de tipos y vocabularios.
