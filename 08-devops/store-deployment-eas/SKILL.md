---
name: store-deployment-eas
description: "Deployment patterns for publishing Expo and React Native apps to Apple App Store and Google Play Store using EAS (Expo Application Services). Covers EAS Build, Submit, Update (OTA), environment profiles (development/preview/production), and version management. Use when preparing for production release, submitting to stores, or configuring OTA updates. Do not use for web-only deployments."
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Expo SDK 52+ and EAS CLI."
metadata:
  trigger: ["app store", "play store", "eas build", "eas submit", "eas update", "ota update", "production deploy", "store deploy", "expo publish", "production release"]
  scope: [global, project]
  version: "1.1.0"
allowed-tools: Bash(node:*) Read
---

# 🚀 Store Deployment (Expo EAS Build, Submit & OTA)

Deploy Expo and React Native applications to the Apple App Store and Google Play Store using EAS (Expo Application Services). Covers native builds, store submission, OTA updates, and multi-environment configuration.

## 📋 When to Use

- Use when preparing a mobile binary for staging or production release
- Use when submitting a build to App Store Connect (TestFlight) or Google Play Console
- Use when configuring `eas update` OTA channels for JS/asset hotfixes that do not modify native code
- Do NOT use for local development server startup (use `pnpm --filter <mobile-package> start`)

## 🚦 Hard Rules

- **Always** maintain isolated EAS profiles (`development`, `preview`/`staging`, `production`) in `eas.json`
- **Always** manage user-facing `version` and native build numbers (`ios.buildNumber`, `android.versionCode` or `"autoIncrement": true`) before store submission
- **Never** submit a build to production tracks without verifying the `preview`/`staging` binary first
- **Always** verify runtime compatibility (`runtimeVersion` policy in `app.json` / `app.config.ts`) before publishing an `eas update` OTA bundle so incompatible native binaries never crash
- **Never** hardcode environment-specific API URLs in source files — inject them via EAS environment variables (`EXPO_PUBLIC_*`) per profile

## 🛠️ Workflow

1. Read EAS setup: [eas-setup.md](references/eas-setup.md)
2. Read release process: [release-process.md](references/release-process.md)
3. Run the checker to verify EAS configuration:
   ```bash
   node 08-devops/store-deployment-eas/scripts/check-eas-config.mjs
   ```

## 🚀 Floor, Not Ceiling (`[Beyond-Baseline]`)

Standard EAS Build + manual Submit is the baseline. Automate mobile release engineering as the team scales (annotate with `[Beyond-Baseline: <reason>]`):
- **Fingerprint-Based Runtime Versioning**: Use `"runtimeVersion": { "policy": "fingerprint" }` (`@expo/fingerprint`) to automatically detect when native dependencies or config plugins change, routing pure JS diffs to `eas update` and native diffs to `eas build`.
- **Automated CI Release Tracks**: Trigger `eas build --profile production --auto-submit --non-interactive` from GitHub Actions on signed release tags.

## 📚 References

- [EAS Setup](references/eas-setup.md) — `eas.json`, profiles, signing credentials
- [Release Process](references/release-process.md) — version bump → build → submit → OTA rollout
- [`expo-production-auditor`](../../05-frontend/expo-production-auditor/SKILL.md) — pre-build production audit
- [`ci-cd`](../ci-cd/SKILL.md) — CI/CD pipeline integration
- [`env-management`](../../06-code-quality/env-management/SKILL.md) — environment variables per profile
