---
name: react-native
description: >
  Trigger: react native, expo router, expo ui, reanimated, flashlist, skia, react-native-worklets.
  Production React Native and Expo SDK 53-56+ engineering covering Expo Router file-based
  navigation, native UI primitives (@expo/ui, expo-image, expo-video, expo-audio, expo-symbols),
  Callstack Measure-Optimize-Re-measure performance loops (FlashList v2, React Compiler, Hermes TTI),
  and Software Mansion Reanimated 4 worklets (scheduleOnRN, CSS transitions, Gesture Handler v2,
  Skia, WebGPU). Use when building or refactoring React Native or Expo mobile screens, navigation,
  lists, or animations. Do NOT use for web apps, pure native SwiftUI (use swiftui-native), pure
  Kotlin/Jetpack Compose (use kotlin-android-compose), Flutter, pre-release audits (use
  expo-production-auditor), or store submission pipelines (use store-deployment-eas).
license: MIT
allowed-tools: Read Write Edit Bash(pnpm:*,node:*)
metadata:
  author: skillsGV
  version: "2.0.0"
  category: 05-frontend
  tags: [react-native, expo, expo-router, reanimated-4, flashlist, skia, mobile]
  trigger: ["react native", "expo router", "expo ui", "reanimated", "flashlist", "skia", "react-native-worklets"]
  scope: [global, project]
  related-skills:
    - expo-production-auditor
    - store-deployment-eas
    - mobile-automation-mcp
    - design-driven
---

# React Native & Expo Production Architecture (v2.0)

Modern React Native development runs on the New Architecture (Fabric, TurboModules, JSI) paired with Expo SDK 53–56+, performance-measured rendering, and Reanimated 4 worklets. Apply these defaults before designing screens or writing components.

## 1. Navigation & Route Hygiene (Expo Router)

- Keep route files inside the Expo Router directory thin and lowercase kebab-case; re-export feature screen components rather than placing business logic or styles directly in route wrappers.
- On Expo SDK 56+, import navigation primitives from `expo-router/react-navigation` instead of legacy `@react-navigation/*` subpackages when extending navigators.
- Use `<Link.Preview>` and `<Link.Menu>` for iOS native context menus and link previews where appropriate, and configure `Stack.SearchBar` inside screen headers instead of custom search chrome overlays.
- Always configure universal/app links and typed route params cleanly; pair with `store-deployment-eas` when domain verification (`apple-app-site-association` / `assetlinks.json`) reaches release staging.

## 2. Native-First UI Primitives

- Reach for platform-native surfaces first via `@expo/ui` (SwiftUI on iOS, Jetpack Compose views on Android) before styling nested JS `View` wrappers for system sheets, switches, menus, and pickers.
- Use `<ScrollView contentInsetAdjustmentBehavior="automatic" />` for iOS large titles and safe-area edge alignment instead of wrapping whole screens in legacy `SafeAreaView`.
- Replace deprecated `expo-av` immediately with `expo-video` and `expo-audio` — `expo-av` is removed/blocked in modern SDK targets and caught by `expo-production-auditor`.
- Use `expo-image` with explicit caching/contentFit policies for remote imagery and `expo-symbols` (`SymbolView` paired with Material icon `md` fallback on Android) for crisp vector iconography.
- Read `process.env.EXPO_OS` for compile-time platform branching and `useWindowDimensions()` (never module-level `Dimensions.get()`) for foldable/split-screen responsiveness.
- Pass only static string literals to `require(...)` for bundled assets so Metro resolves asset hashes deterministically at bundle time.

## 3. Performance Workflow: Measure -> Optimize -> Re-measure

Follow Callstack's empirical optimization cycle — never refactor state or memoization blindly without profiling first:

1. **Measure**: Capture baseline TTI, FPS drops, commit flamegraphs, or bundle breakdown in release/dev-client mode on real hardware (prefer `pnpm` scripts or `mobile-automation-mcp`).
2. **Optimize**:
   - Use `@shopify/flash-list` v2 for medium/large scrollable datasets. Drop deprecated `estimatedItemSize` props, keep cell layouts flat via `getItemType`, and never nest a vertical `FlatList`/`FlashList` inside a vertical `ScrollView`.
   - Rely on React Compiler when enabled; otherwise pass primitive props and atomic store selectors into list items so state mutations in one row never re-render siblings.
   - Eliminate heavy barrel re-export files inside hot UI trees so Metro/Hermes treeshaking keeps startup bytecode small.
3. **Re-measure & Validate**: Confirm frame budget, memory delta, and cold startup TTI improved before committing.

## 4. Animations, Gestures & Custom Canvas (Software Mansion Stack)

- **Reanimated 4 Worklets**: Import `scheduleOnRN` from `react-native-worklets` when crossing from UI worklets back to JS callbacks. **Never** use removed `runOnJS` from `react-native-reanimated`.
- **Declarative Transitions vs Worklets**: Use Reanimated 4 CSS transitions/animations for discrete state changes (enter/exit/hover/press feedback); reserve `useSharedValue` + `useAnimatedStyle` strictly for continuous gesture-driven frames (60–120fps) and limit animated style writes to GPU-composited `transform` and `opacity`.
- **Gestures & Keyboard**: Compose interactive drags/swipes with `react-native-gesture-handler` v2 (`GestureDetector`) paired directly with Reanimated shared values, and use `react-native-keyboard-controller` for interruptible interactive keyboard sheets.
- **Shaders & Heavy 2D/3D (Opt-In)**: Use `@shopify/react-native-skia` for procedural shaders, particle fields, or custom canvas gauges, and `react-native-wgpu` / TypeGPU only when 3D/compute shaders are explicitly requested.

## Anti-Patterns Guardrail

Before finishing mobile code changes, run `expo-production-auditor` (`node 05-frontend/expo-production-auditor/scripts/check-mobile-antipatterns.mjs --srcDir <projectDir>`) to block `runOnJS`, `expo-av`, dynamic `require()`, and nested virtualized lists automatically. For simulator E2E verification, hand off to `mobile-automation-mcp`.
