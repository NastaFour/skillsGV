---
name: expo-production-auditor
description: >
  Trigger: expo audit, production audit mobile, mobile antipatterns, check-mobile-antipatterns,
  expo release readiness. Pre-release static audit and runtime performance verification for Expo
  and React Native apps. Enforces zero-tolerance checks for removed Reanimated runOnJS, deprecated
  expo-av, dynamic asset require() calls, nested virtualized lists, universal deep links, Hermes
  TTI/bundle regressions, and OTA/native binary hygiene. Use before shipping or running frontend
  release gates on Expo/RN apps. Do NOT use for writing new React Native screens (use react-native),
  App Store/Play Console release automation (use store-deployment-eas), or native SwiftUI/Kotlin audits.
license: MIT
allowed-tools: Read Bash(node:*,pnpm:*)
metadata:
  author: skillsGV
  version: "2.0.0"
  category: 05-frontend
  tags: [expo, react-native, audit, static-analysis, performance, deep-links, production]
  trigger: ["expo audit", "production audit mobile", "mobile antipatterns", "check-mobile-antipatterns", "expo release readiness"]
  scope: [global, project]
  related-skills:
    - react-native
    - store-deployment-eas
    - design-driven
    - mobile-automation-mcp
---

# Expo & React Native Production Auditor (v2.0)

Deterministic pre-release gatekeeper for Expo and React Native codebases. Combines standalone static AST/regex analysis with Callstack's empirical performance verification and Universal Link checks before any build reaches EAS Submit or TestFlight.

## 1. Automated Static Gate (`check-mobile-antipatterns.mjs`)

Run the bundled standalone checker directly (or automatically through `verify-frontend-gates.mjs` when `hasReactNative` is detected):

```bash
node 05-frontend/expo-production-auditor/scripts/check-mobile-antipatterns.mjs --srcDir <projectRoot> --json
```

### Enforced Rules

| Rule ID | Severity | What It Catches & Exact Fix |
| :--- | :--- | :--- |
| `removed-rn-run-on-js` | Blocking (`FAIL`) | Reanimated 4 removed `runOnJS`. Migrate imports and invocations to `scheduleOnRN` from `react-native-worklets`. |
| `deprecated-expo-av` | Blocking (`FAIL`) | Legacy `expo-av` breaks modern Expo SDK targets. Replace with `expo-audio` and `expo-video`. |
| `dynamic-require-asset` | Blocking (`FAIL`) | Non-literal expressions inside `require(...)` break Metro static asset bundling. Replace with static literal strings or explicit lookup maps. |
| `nested-virtualized-list` | Advisory (`WARN`) | `FlatList` / `SectionList` / `FlashList` nested inside an outer `ScrollView` breaks recycling and clips scroll physics. Hoist headers/footers into `ListHeaderComponent` / `ListFooterComponent` or set intentional horizontal orientation. |

Exit code `0` indicates zero blocking findings; exit code `1` reports blocking findings on stderr/stdout JSON and halts release gates.

## 2. Deep Links, Navigation & Native Hygiene

- Verify Expo Router universal link manifests (`check-deep-links.mjs --dir <projectRoot>` when Expo web/universal routing is enabled) and confirm iOS `associatedDomains` + Android `intentFilters` match live domain verification files.
- Audit native config plugins and `runtimeVersion` policies (`app.config.ts`) before cutting OTA `eas update` payloads so JS bundles never boot against incompatible native modules.
- Confirm `@expo/ui`, `expo-image`, and `expo-symbols` assets resolve cleanly across both iOS and Android without missing material fallbacks or hardcoded `Dimensions.get()` constants.

## 3. Empirical Runtime & Bundle Verification (Callstack Loop)

When auditing lag, slow cold startup (TTI), or high JS memory:

1. **Baseline**: Capture cold TTI and scroll FPS in release build (`--no-dev` / release scheme), never judge performance solely on dev-client debug builds.
2. **Audit List & State Hotspots**: Inspect `FlashList` v2 recycling stability (remove obsolete `estimatedItemSize`, ensure uniform `getItemType`), search for heavy barrel imports delaying startup evaluation, and confirm Reanimated animations write only to GPU `transform`/`opacity`.
3. **Verify Asset & OTA Footprint**: Inspect source-map bundle sizes, strip unused locale/font weights, and confirm zero leftover `console.*` noise or debug menus in release code paths.
4. **Re-measure**: Attach before/after TTI, FPS, and bundle deltas alongside `check-mobile-antipatterns.mjs` output in the release report.
