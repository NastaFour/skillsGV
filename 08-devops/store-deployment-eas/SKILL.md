---
name: store-deployment-eas
description: >
  Trigger: eas build, eas submit, eas update, eas workflows, app store connect, asc cli,
  testflight release. End-to-end mobile release engineering for Expo Application Services
  (EAS Build, EAS Submit, EAS Update OTA, EAS Workflows CI) and App Store Connect CLI (`asc`)
  release validation, staged rollouts, metadata parity, and crash/submission health triage. Use
  when automating iOS or Android store builds, TestFlight/Play internal distribution, OTA update
  channels, or App Store Connect pre-submission checks. Do NOT use for writing RN UI screens (use
  react-native), running simulator E2E tests (use mobile-automation-mcp), or web hosting deploys.
license: MIT
allowed-tools: Read Write Edit Bash(pnpm:*,eas:*,asc:*,node:*)
metadata:
  author: skillsGV
  version: "2.0.0"
  category: 08-devops
  tags: [eas, expo, app-store-connect, google-play, ota, mobile-devops, ci-cd]
  trigger: ["eas build", "eas submit", "eas update", "eas workflows", "app store connect", "asc cli", "testflight release"]
  scope: [global, project]
  related-skills:
    - expo-production-auditor
    - react-native
    - mobile-automation-mcp
---

# Store Deployment, EAS Workflows & App Store Connect CLI (v2.0)

Deterministic release pipeline for React Native / Expo apps targeting Apple App Store / TestFlight and Google Play Console. Zero ad-hoc manual clicks when CLI + workflow automation can validate builds before review.

## 1. Pre-Build & Pre-Submit Hard Gates

Never queue a store build until local static & runtime verification passes:
1. Run `expo-production-auditor`:
   ```bash
   node 05-frontend/expo-production-auditor/scripts/check-mobile-antipatterns.mjs --srcDir <projectRoot> --json
   ```
2. Run E2E smoke tests (`mobile-automation-mcp` / Maestro `.yaml` flows) against a release-like build on simulator/emulator.
3. Confirm native binary boundary: lock `runtimeVersion` (`policy: "appVersion"` or `"fingerprint"`) whenever changing native dependencies, permissions, or `app.config.ts` plugins before shipping OTA updates.

## 2. EAS Build, Update & Declarative Workflows

Use `pnpm dlx eas-cli` (or repo-local `eas` binary) and declarative `.eas/workflows/` pipelines:

- **Profiles (`eas.json`)**:
  - `development`: internal client (`developmentClient: true`, `distribution: "internal"`)
  - `preview`: TestFlight / internal APK (`channel: "preview"`)
  - `production`: signed store `.ipa` / `.aab` (`channel: "production"`, `autoIncrement: true`)
- **EAS Workflows (`.eas/workflows/*.yml`)**: Chain `fingerprint -> build (only when fingerprint changed) -> maestro e2e -> submit` in CI so JS-only changes ship via `eas update` instead of wasting full native binary builds.
- **OTA Update Safety (`eas update`)**:
  - Target explicit channels (`--channel preview`, `--channel production`) with rollouts/branches matching the native binary fingerprint.
  - Never push native module additions or `Info.plist`/`AndroidManifest.xml` permission edits via OTA — bump binary version and rebuild.

## 3. App Store Connect CLI (`asc`) Release Discipline

For Apple App Store Connect metadata, strict preflight checks, TestFlight distribution, phased rollout, and submission triage, read the detailed reference playbook:

- [asc-cli-release-flow.md](references/asc-cli-release-flow.md)

Core invariants:
- Run `asc validate --app "APP_ID" --version "1.2.3" --platform IOS --strict --output table` before every review submission.
- Keep canonical metadata rooted cleanly (`./metadata` per ASC conventions) and dry-run release actions (`asc release stage --dry-run`) before confirming.
- Bind submissions to explicit `--build-number` values (`asc review submit --build-number`), never ambiguous `--latest` flags on shared release branches.
