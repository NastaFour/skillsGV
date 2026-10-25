---
name: pwa-capacitor
description: "Standards for Progressive Web Apps (PWA) and Ionic Capacitor hybrid mobile builds. Covers service worker caching strategies, IndexedDB offline storage, background sync queues, and secure native hardware bridge plugins. Use when building a PWA, configuring service workers, or bridging native APIs via Capacitor. Do not use for pure React Native/Expo apps."
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*) Read
metadata:
  trigger: ["PWA", "capacitor", "offline", "service worker", "hybrid app"]
  scope: [global, project]
  version: "1.1.0"
---

# 📱 PWA & Capacitor Hybrid Development

Use this skill when building Progressive Web Apps (PWAs) with offline resilience or packaging web applications as native iOS/Android binaries using Ionic Capacitor.

## 🚨 PWA & Capacitor Standards

1. **Service Worker Caching Strategies**:
   - Use Workbox (`vite-plugin-pwa`) or standard Service Workers (`sw.js`) with explicit per-resource strategies:
     - **Static Assets (JS, CSS, Fonts, Icons)**: `CacheFirst` with content-hash revisioning.
     - **Read API Responses**: `StaleWhileRevalidate` or `NetworkFirst` backed by `IndexedDB` so views remain usable offline with an explicit staleness indicator.

2. **Offline Outbox & Background Sync**:
   - Queue user mutations performed while offline inside `IndexedDB` (never rely on volatile memory or small `localStorage` quotas for structured queues).
   - Replay queued mutations via the Background Sync API or Capacitor's `@capacitor/background-runner` / `@capacitor/network` reconnect listener using idempotency keys.

3. **Capacitor Native Bridge Security**:
   - Access device hardware (Camera, Geolocation, Biometrics, Secure Storage, Filesystem) strictly through audited `@capacitor/*` plugins.
   - Always check and request runtime permissions gracefully before invoking hardware APIs:
     ```typescript
     import { Geolocation } from '@capacitor/geolocation';

     export const ensureLocationPermission = async () => {
       const status = await Geolocation.checkPermissions();
       if (status.location !== 'granted') {
         return Geolocation.requestPermissions();
       }
       return status;
     };
     ```

## 🧩 Universal Hybrid App Patterns

- **Installability & Manifest**: Provide a complete `manifest.webmanifest` (icons, `display: standalone`, `theme_color`) and handle `beforeinstallprompt` cleanly for web-to-home-screen onboarding.
- **Safe Area & Viewport Adaptation**: Respect `env(safe-area-inset-top)` / `env(safe-area-inset-bottom)` and `viewport-fit=cover` so hybrid shells render natively around notches and home indicators.
- **Explicit Offline Status Banner**: When serving cached records offline, display a clear status badge indicating when data was last synchronized.

## 🚀 Floor, Not Ceiling (`[Beyond-Baseline]`)

Standard Service Worker caching + Capacitor plugins form the baseline. Elevate the architecture when needed (annotate with `[Beyond-Baseline: <reason>]`):
- **Local-First Sync Engines**: Use OPFS-backed SQLite (`wa-sqlite`), RxDB, PowerSync, or ElectricSQL for full local-first relational queries and automatic delta synchronization.
- **Native Biometric Vaults**: Store sensitive session tokens in `@aparajita/capacitor-biometric-auth` or iOS Keychain / Android Keystore plugins rather than Web `localStorage`.
