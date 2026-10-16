---
name: i18n-localization
description: Internationalization patterns using i18next with configurable primary and secondary locales (e.g., `es`/`en`). Covers web (react-i18next) and mobile (expo-localization + i18next) setup, translation file structure, and locale-aware formatting (dates, currencies). Use when adding multi-language support or localizing notification templates.
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+."
metadata:
  trigger: ["i18n", "internationalization", "localization", "idioma", "multi-idioma", "translation", "español ingles", "i18next", "locale"]
  scope: [global, project]
  version: "1.0.0"
allowed-tools: Bash(node:*) Read
---

# 🌐 i18n & Localization

Multi-language support for web and mobile applications using i18next with a configurable primary and fallback locale strategy (e.g., `es` primary / `en` secondary, or as defined by the target market).

## 📋 When to Use

- Use when adding multi-language support to web or mobile
- Use when localizing notification templates (email, SMS, push)
- Use when formatting dates, currencies, or numbers per locale
- Do NOT use before MVP is complete in the project's primary locale (e.g., `es` or `en`)

## 🚦 Hard Rules

- **Always** use i18next (not custom translation logic)
- **Always** namespace translations by feature (`common`, `booking`, `auth`, `notifications`)
- **Never** hardcode user-facing strings in components (always use `t()`)
- **Always** store locale in user preferences (not just device locale)

## 🛠️ Workflow

1. Read setup guide: [setup-guide.md](references/setup-guide.md)
2. Read formatting patterns: [formatting.md](references/formatting.md)
3. Run the checker to detect hardcoded strings:
   ```bash
   node 05-frontend/i18n-localization/scripts/check-hardcoded-strings.mjs
   ```

## 📚 References

- [Setup Guide](references/setup-guide.md) — i18next config for web + mobile
- [Formatting](references/formatting.md) — dates, currency, numbers per locale
- [`react-vite`](../react-vite/SKILL.md) — web i18n integration
- [`react-native`](../react-native/SKILL.md) — mobile i18n integration
- [`notifications-multichannel`](../../04-backend/notifications-multichannel/SKILL.md) — template localization
