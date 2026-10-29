---
name: dod-checker
description: "Act as the strict Gatekeeper for the Definition of Done (DoD). Use when evaluating whether a feature or task is ready to close. Blocks checkoffs if SOLID, DRY, architectural proportionality, or 2026 security guardrails are bypassed. Do not use for initial feature planning."
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*) Read
metadata:
  trigger: ["dod checker", "definition of done", "audit completion"]
  scope: [global, project]
  version: "1.1.0"
---

# 🛡️ Definition of Done (DoD) Gatekeeper

This skill audits the current implementation against the Definition of Done before allowing any task or feature to be declared complete. Every claim requires observed verification evidence.

---

## 🏛️ The DoD Gatekeeper Process

When asked to evaluate if a task or feature is finished, execute these checks proportionately to the project's architecture:

### 1. SOLID, Clean Code & Architectural Proportionality
- **DRY Verification**: Ensure shared data schemas, validation contracts, and TypeScript types live in shared modules or packages when consumed across boundaries. Unjustified duplication of domain rules across client and server triggers a **FAIL**.
- **SRP & Layering Proportionality**: Verify separation of concerns according to the project's chosen architecture:
  - In **Layered / Hexagonal** architectures: keep transport/controllers, domain services, and persistence repositories decoupled.
  - In **Vertical Slice / Feature-Folder** or lightweight serverless handlers: co-locating route, schema, and query within a cohesive feature slice is valid when domain invariants remain testable.
  - In **Frontend UI**: keep complex network/socket orchestration in hooks or state stores rather than tangling side effects into purely presentational views.
- **KISS & Readability**: Flag bloated functions (heuristically > 40–60 lines of mixed abstraction levels) unless justified by cohesive state machines or exhaustive pattern matching.
- Refer to [SOLID and Clean Code Guidelines](../../06-code-quality/solid-clean-code/SKILL.md).

### 2. Functional Integrity (Zero Dead Ends)
- **Dead Elements**: Scan UI code for buttons, links, or forms that lack wired event handlers (`onClick`, `href`, `onSubmit`, or action bindings).
- **End-to-End Flow Verification**: Verify the primary user or system flow executes completely (`input validation -> domain logic -> persistence -> side effects/events -> UI/response feedback`) rather than stopping halfway.
- **No Unresolved Placeholders**: Ensure no hardcoded dummy placeholders (`TODO`, `FIXME`, `Lorem Ipsum`, mock stubs in production paths) remain where dynamic logic was required.

### 3. Resilience and Edge States
- **Feedback States**: Verify async operations expose appropriate loading, empty, success, and error states.
- **No Silent Failures**: Reject empty `catch (e) {}` blocks that swallow errors without structured logging, recovery, or user-facing feedback.

### 4. Security & Guardrails Audit (`[Beyond-Baseline]`)
- **Token Policies**: Web clients must not store raw sensitive JWT access tokens in vulnerable `localStorage` without explicit threat-model justification.
- **Mobile Storage**: Sensitive credentials on mobile must use hardware-backed encrypted storage (`expo-secure-store` / Keychain / Keystore), never plain `AsyncStorage`.
- **Boundary Validation**: All external inputs (HTTP bodies/params, WebSocket `socket.on` payloads, webhook events, queue messages) must be validated with a schema (e.g., Zod).
- **Pre-Release Live CVE & Lifecycle Audit (`live-cve-security-intel`)**: Before closing a project or release milestone, verify the stack's exact runtime/dependency versions against live CVEs/OSV advisories and audit worker/memory state cleanup on error/OOM paths (`../live-cve-security-intel/SKILL.md`).
- **Floor, Not Ceiling (`[Beyond-Baseline]`)**: When an implementation intentionally departs from a baseline convention to achieve a superior technical or creative outcome, it must be documented with `[Beyond-Baseline: <reason>]` in the code, commit, or task log. Unexplained violations of security or architectural invariants cause an immediate **FAIL**.

---

## 📋 Delivery & Verdict

Provide a concise **Gatekeeper Report** containing:

1. **Verdict**: `[ 🟢 PASS - TASK/FEATURE COMPLETE ]` or `[ 🔴 FAIL - RETURN TO WORK ]`.
2. **Observed Proof**: Commands executed (tests, typecheck, validator) and their exit codes/output summary.
3. **Blockers (If Failed)**: Specific files, lines, and missing invariants that violated functional, security, or clean-code rules. If failed, **refuse** to mark the item complete in the ODD task doc or project tracker.
4. **Deferred Tolerances & `[Beyond-Baseline]` Notes (If Passed)**: Document any accepted `[Beyond-Baseline: <reason>]` decisions and minor non-blocking follow-ups.
