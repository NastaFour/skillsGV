---
name: swiftui-native
description: >
  Trigger: swiftui, swift 6, @Observable, navigationstack, ios native ui, macos swiftui.
  Apple-platform native UI and state architecture for SwiftUI (iOS, iPadOS, macOS, visionOS) on
  Swift 6.4+ and modern Observation APIs. Enforces @Observable models, NavigationStack /
  NavigationSplitView routing, foregroundStyle(), Dynamic Type, VoiceOver semantics, Reduce Motion,
  adaptive iPad/iPhone sizing, and clean body logic without Binding(get:set:) hacks or legacy
  UIKit wrappers. Use when writing, reviewing, or refactoring native Apple SwiftUI views and models.
  Do NOT use for React Native / Expo apps (use react-native), Android Kotlin / Jetpack Compose
  (use kotlin-android-compose), Flutter, or web interfaces.
license: MIT
allowed-tools: Read Write Edit Bash(swift:*,xcodebuild:*)
metadata:
  author: skillsGV
  version: "1.0.0"
  category: 05-frontend
  tags: [swiftui, swift, ios, macos, apple, observation, accessibility, mobile]
  trigger: ["swiftui", "swift 6", "@Observable", "navigationstack", "ios native ui", "macos swiftui"]
  scope: [global, project]
  related-skills:
    - mobile-automation-mcp
    - store-deployment-eas
    - motion-accessibility
---

# SwiftUI Native Engineering (Swift 6.4+ / Observation Standard)

Architecture, performance, and accessibility standards for native Apple interfaces built with modern SwiftUI, structured concurrency, and `@Observable`.

## 1. Modern State & Concurrency Boundaries

- Use `@Observable` (`Observation` framework) with `@State` for view-owned reference models instead of legacy `ObservableObject` / `@StateObject` / `@ObservedObject` boilerplate.
- Never synthesize ad-hoc `Binding(get:set:)` wrappers directly inside `body` to trigger side effects; bind directly to model properties and isolate side effects inside `.onChange(of:)` or `.task(id:)`.
- Keep view structs pure and lightweight (`body` computes declarations fast without allocating formatters, network clients, or heavy derived collections inline).
- Honor Swift 6+ strict concurrency: mark view-bound observable models `@MainActor`, run async work cleanly via `.task` (cancels automatically on disappear), and never block the main actor with synchronous I/O.

## 2. Navigation, Styling & Layout Discipline

- Prefer `NavigationStack` and value-driven `.navigationDestination(for:)` or `NavigationSplitView` for multi-column iPad/macOS workspaces — avoid deprecated `NavigationView` and eager destination links inside tight lists.
- Use `.foregroundStyle(...)` rather than deprecated `.foregroundColor(...)`, and `.clipShape(.rect(cornerRadius: ...))` over legacy `.cornerRadius(...)`.
- Avoid unnecessary `UIViewRepresentable` / `UIViewControllerRepresentable` UIKit bridges whenever SwiftUI native APIs (`PhotosPicker`, `ShareLink`, `.searchable`, `.sensoryFeedback`, `.sheet`, `.presentationDetents`) already cover the requirement cleanly.
- Build adaptive layouts (respecting horizontal/vertical size classes, iPad multitasking, Dynamic Island safe areas, and `ViewThatFits` / `AnyLayout` transitions) rather than hardcoding screen dimensions via `UIScreen.main.bounds`.

## 3. Accessibility, Dynamic Type & Motion Defaults

- Every icon-only `Button` or interactive glyph MUST expose an explicit `.accessibilityLabel(...)` (`Label("...", systemImage: "...")` is preferred because it preserves label semantics automatically).
- Support Dynamic Type seamlessly: use semantic `Font` text styles (`.headline`, `.body`, `.caption`) or relative scaling instead of fixed unscalable font sizes inside multi-line copy, and wrap tall overflow-prone forms in `ScrollView`.
- Observe `@Environment(\.accessibilityReduceMotion)` around custom spring/matched-geometry transitions, swapping translational motion for subtle cross-fades when Reduce Motion is enabled.
- Ensure minimum interactive hit targets (>=44x44pt via `.contentShape(.rect)` or padding) on compact toolbar and card controls.

## 4. Verification Handoff

- Validate layout variants cleanly across compact/regular size classes, Dark Mode, and XXL Dynamic Type sizes using Xcode Previews (`#Preview`) and native simulator automation (`mobile-automation-mcp`).
- When preparing App Store builds and metadata validation, coordinate release checks with `store-deployment-eas` (`asc validate --strict`).
