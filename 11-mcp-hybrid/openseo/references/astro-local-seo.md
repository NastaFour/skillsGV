# Technical & Local SEO in Astro (Generalized Blueprint)

Apply these rules across static and hybrid Astro sites to maximize organic search ranking, Core Web Vitals, and clean social link previews.

## 1. Centralized `<SeoHead.astro />` Component

Create `src/components/SeoHead.astro` and render it in the base layout `<head>`:

- **`<title>`**: `<= 60` characters. Pattern: `[Brand] | [Core Offering + City/Region]`.
- **`<meta name="description">`**: `145–160` characters with natural domain keywords and a direct action hook.
- **`<link rel="canonical">`**: Absolute URL built via `new URL(Astro.url.pathname, Astro.site)`.
- **Open Graph & Twitter Cards**: `og:type="website"`, `og:title`, `og:description`, `og:url`, `og:locale` matching the site language (e.g. `es_ES` / `es_VE` / `en_US`), and `og:image` pointing to a `1200x630px` `.jpg`/`.png` raster asset resolved as an absolute URL against `Astro.site`.

## 2. Structured Data (JSON-LD in Astro)

Always inject Schema.org JSON-LD using Astro's `set:html` directive so HTML entities are never escaped:

```astro
---
const schema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness", // or domain subtype e.g. HealthClub, Store, EducationalOrganization
  name: brandName,
  description,
  url: Astro.site?.toString(),
  image: ogImageUrl,
  sameAs: socialLinks,
  address: {
    "@type": "PostalAddress",
    addressLocality: city,
    addressRegion: stateOrRegion,
    addressCountry: countryCode,
  },
  areaServed: serviceArea,
};
---
<script type="application/ld+json" set:html={JSON.stringify(schema)} />
```

## 3. Semantics, Assets & Crawling (CWV)

- **Strict Heading Hierarchy**: Exactly **one `<h1>`** per page in the hero containing the primary search intent; `<h2>` for major sections; `<h3>` for sub-items.
- **Images via `astro:assets` `<Image />`**: Auto-convert to WebP/AVIF with explicit `width` and `height` (zero CLS). Use `loading="eager"` + `fetchpriority="high"` **only** on the above-the-fold Hero image; use `loading="lazy"` + descriptive `alt` on all lower images.
- **Sitemap & Robots**: Set `site` in `astro.config.mjs`, configure `@astrojs/sitemap`, and provide `public/robots.txt` pointing to `sitemap-index.xml`.
- **External Link Hygiene**: Add `rel="noopener noreferrer"` and `target="_blank"` on external social/messaging links (`wa.me`, Instagram, etc.).
