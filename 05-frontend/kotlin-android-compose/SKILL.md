---
name: kotlin-android-compose
description: >
  Trigger: jetpack compose, kotlin android, android compose, lazycolumn, edge-to-edge android,
  android anr. Official Google Android Jetpack Compose performance, layout, UI correctness, and release
  engineering in Kotlin. Enforces phase deferral (Modifier.offset/graphicsLayer lambdas),
  read-then-write ordering, Strong Skipping Mode hygiene, LazyColumn/LazyGrid primitive keys and
  contentType, lifecycle-aware collection hoisting, edge-to-edge system bars, ANR prevention,
  and R8 + Baseline Profiles. Use when building, profiling, or fixing native Android Kotlin /
  Jetpack Compose apps. Do NOT use for Flutter, React Native / Expo (use react-native), Apple
  SwiftUI (use swiftui-native), or web apps.
license: MIT
allowed-tools: Read Write Edit Bash(./gradlew:*,adb:*)
metadata:
  author: skillsGV
  version: "1.0.0"
  category: 05-frontend
  tags: [kotlin, android, jetpack-compose, performance, edge-to-edge, r8, baseline-profiles, mobile]
  trigger: ["jetpack compose", "kotlin android", "android compose", "lazycolumn", "edge-to-edge android", "android anr"]
  scope: [global, project]
  related-skills:
    - mobile-automation-mcp
    - motion-accessibility
---

# Kotlin & Jetpack Compose Native Engineering

Performance-first rules grounded in modern Jetpack Compose runtime behavior, Android Edge-to-Edge UI standards, and production ANR/startup hardening.

## 1. Compose Phase Deferral & Read Ordering

Minimize invalidations across Composition -> Layout -> Drawing:

- **Defer state reads to Layout/Drawing**: For rapidly changing animation or scroll state (`State<Float>`, `ScrollState`), always pass lambda modifiers (`Modifier.offset { IntOffset(...) }`, `Modifier.graphicsLayer { alpha = ...; translationY = ... }`) instead of value-taking modifiers inside `@Composable` bodies.
- **Avoid backwards writes**: Never mutate compose state after reading it in the same composable frame; compute derived state cleanly before reading or trigger side effects in event callbacks / `LaunchedEffect`.
- **Minimize expensive derived work**: Use `remember(keys)` for heavy allocations and `derivedStateOf` (or `computedStateOf` on Compose 1.13+) strictly when source state changes more frequently than the boolean/threshold output.

## 2. Strong Skipping Mode & State Collection Hygiene

- With modern Strong Skipping Mode enabled by default, avoid littering domain data models with boilerplate `@Immutable` / `@Stable` annotations or wrapping every `List<T>` in `ImmutableList` purely to placate Compose stability — profile recompositions with Layout Inspector first and annotate only proven unstable hot paths.
- Hoist `CompositionLocal.current` reads and `collectAsStateWithLifecycle()` calls above `LazyColumn` / `LazyGrid` item boundaries; pass plain immutable data + lambdas down into individual row composables.

## 3. Lazy Lists & Recycler Parity

- Every `items(...)` / `itemsIndexed(...)` block in `LazyColumn`, `LazyRow`, or `LazyVerticalGrid` MUST provide a stable primitive `key = { it.id }` (String/Int/Long, Parcelable-safe across config changes).
- Whenever a list renders heterogeneous row templates, also supply `contentType = { it.rowType }` so Compose reuses composition slots across matching item types cleanly.
- Never nest scrollable containers of identical axis without explicit bounded heights (`Modifier.heightIn` / custom nested scroll connection).

## 4. Edge-to-Edge, Window Insets & Release Hardening (ANR / R8)

- Call `enableEdgeToEdge()` early in `ComponentActivity.onCreate()` before `setContent {}`, pair with system-bar-contrast configuration, and consume `WindowInsets.safeDrawing` / `imePadding()` selectively at leaf scrollable surfaces rather than clamping content behind opaque status/navigation bars.
- **ANR Prevention**: Keep `Application.onCreate()`, BroadcastReceivers, and main-thread Binder IPC free of disk I/O, synchronous SharedPreferences `.commit()`, database queries, and heavy DI reflection; move cold initialization off the main looper with `Dispatchers.Default` / `Dispatchers.IO`.
- **R8 & Baseline Profiles**: Ship release builds with full R8 shrinking/obfuscation (`isMinifyEnabled = true`, keep rules scoped strictly to reflection boundaries) and verify Macrobenchmark + Baseline Profile generation (`androidx.baselineprofile`) so critical cold startup paths are AOT-compiled before Play Store upload.

## 5. Verification Handoff

- Inspect recomposition counts in Android Studio Layout Inspector, enforce Android TalkBack content descriptions and 48dp minimum touch targets, and drive end-to-end flows on emulator via `mobile-automation-mcp` (`maestro` / `mobile-mcp`).
