# App Store Connect CLI (`asc`) Release Flow Reference

Standardized terminal workflow for shipping iOS, macOS, and visionOS builds cleanly via `asc` (App Store Connect CLI) alongside EAS Submit.

## 1. Strict Preflight Validation (Before Review Submit)

Always validate metadata completeness, build attachment, screenshots, privacy declarations, and age ratings before locking a release:

```bash
asc validate --app "$APP_ID" --version "$APP_VERSION" --platform IOS --strict --output table
```

Address every `ERROR` (missing localized description, unresolved privacy URL, empty "What's New", invalid screenshot dimension, or unprocessed build) before continuing.

## 2. Canonical Metadata Sync

Keep store metadata version-controlled inside a canonical metadata directory (`./metadata` layout), never drifting in web UI edits alone:

```bash
asc metadata pull --app "$APP_ID" --version "$APP_VERSION" --dir ./metadata
asc metadata push --app "$APP_ID" --version "$APP_VERSION" --dir ./metadata --dry-run
```

Inspect diffs on `en-US`, `es-ES` / `es-419`, keywords (<=100 chars), and release notes before removing `--dry-run`.

## 3. Staged Release & Explicit Build Binding

Avoid race conditions in multi-branch CI by pinning explicit build numbers rather than implicit latest flags:

```bash
# Dry-run first to inspect target version, build ID, and phased-release plan
asc release stage --app "$APP_ID" --version "$APP_VERSION" --build-number "$BUILD_NUM" --platform IOS --dry-run

# Execute staged submission cleanly once verified
asc release stage --app "$APP_ID" --version "$APP_VERSION" --build-number "$BUILD_NUM" --platform IOS --confirm
```

For standard single-command publishing or explicit review submission:

```bash
asc publish appstore --app "$APP_ID" --version "$APP_VERSION" --build-number "$BUILD_NUM"
# or
asc review submit --app "$APP_ID" --version "$APP_VERSION" --build-number "$BUILD_NUM"
```

## 4. TestFlight, Phased Rollout & Post-Release Triage

- **TestFlight external testers**: Confirm export compliance (`ITSAppUsesNonExemptEncryption`), attach concise test instructions (`betaReviewDetail`), and distribute per group cleanly before App Store promotion.
- **Submission health & rejection recovery**: Poll submission state and structured resolution center messages from CLI; fix rejected metadata/screenshots in git and re-run `asc validate --strict` rather than resubmitting unchanged binaries.
- **Crash & MetricKit spikes**: Check App Store Connect crash feedback / PerfPowerMetrics regressions immediately during 7-day phased rollout and pause rollout (`phasedRelease` pause) if crash-free sessions drop below target SLA.
