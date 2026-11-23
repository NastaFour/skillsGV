---
name: mobile-automation-mcp
description: >
  Trigger: maestro mcp, mobile-mcp, mobile automation, simulator e2e, mobilebuildmcp, ios simulator,
  android emulator. Live mobile simulator and emulator verification via Maestro MCP, mobile-mcp
  accessibility-tree driving, and optional MobileBuildMCP build/run pipelines. Use when executing
  declarative E2E flows, inspecting live accessibility hierarchies, or verifying UI interactions on
  iOS Simulator or Android Emulator. Do NOT use for web browser Playwright testing (use playwright),
  static React Native code audits (use expo-production-auditor), or App Store release validation
  (use store-deployment-eas).
license: MIT
allowed-tools: Read Bash(pnpm:*,maestro:*,adb:*,xcrun:*)
metadata:
  author: skillsGV
  version: "1.0.0"
  trigger: ["maestro mcp", "mobile-mcp", "mobile automation", "simulator e2e", "mobilebuildmcp", "ios simulator", "android emulator"]
  scope: [global, project]
  requires-mcp: ["maestro", "mobile-mcp"]
  mcp-fallback: "Maestro MCP or mobile-mcp absent -> fall back to Maestro CLI flows (`maestro test`) or native simulator CLIs (`xcrun simctl` / `adb`) -> limit: no live MCP accessibility-tree inspection"
---

# Mobile Automation MCP (Maestro + mobile-mcp + MobileBuildMCP)

Deterministic live simulator/emulator driving and end-to-end UI verification for React Native, Expo, SwiftUI, and Jetpack Compose apps.

## 1. Tool Selection Hierarchy

1. **Maestro MCP (`maestro`)**: Preferred for repeatable E2E assertions, flow authoring, onboarding/auth smoke tests, and visual tree inspection via declarative YAML flows.
2. **`mobile-mcp`**: Preferred for ad-hoc exploratory driving on live simulators/emulators using native accessibility hierarchy queries (`tapOn` accessible elements first; fall back to coordinates only for custom Skia/WebView canvases).
3. **`MobileBuildMCP` (optional build/run bridge)**: Use via configured MCP or `pnpm dlx` when no active app binary is booted yet and you need a deterministic iOS/Android debug scheme build + launch + console log capture.

## 2. Hard Invariants

- **Accessibility-first targeting**: Target controls by accessibility ID, testID, label, or semantic text — never hardcode brittle screen pixel coordinates unless interacting with a canvas/map surface that exposes no accessibility nodes.
- **No blind sleeps**: Wait on explicit UI state transitions (`extendedWaitUntil` with `visible` or element assertion), never arbitrary multi-second sleeps.
- **Clean state per flow**: Launch with deterministic state (`launchApp` with `clearState` or deep link route fixtures) so E2E passes never depend on leftover simulator session state.
- **Keep sample paths & YAML fenced**: Store flow specs cleanly under a dedicated workspace suite:

```yaml
# Example Maestro smoke flow (.maestro/smoke.yaml)
appId: com.example.app
---
- launchApp:
    clearState: true
- assertVisible: "Welcome"
- tapOn:
    id: "primary-cta"
- extendedWaitUntil:
    visible: "Dashboard"
    timeout: 8000
```

## 3. Execution Steps

1. Confirm a booted simulator/emulator (`xcrun simctl list devices booted` or `adb devices`) or boot/build one with MobileBuildMCP.
2. Inspect the live accessibility tree via `maestro` or `mobile-mcp` before writing selectors so IDs match real rendered native nodes.
3. Run the flow suite (`maestro mcp` tools or `maestro test`), capture failing screenshots + console logs when an assertion breaks, and hand static anti-pattern findings to `expo-production-auditor`.
4. Only mark a mobile UI flow verified after observing every asserted transition pass against the freshly built target.
