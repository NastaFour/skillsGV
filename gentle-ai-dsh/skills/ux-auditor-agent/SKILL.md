---
name: ux-auditor-agent
description: "Trigger: ux audit, auditoria ux, auditoria de experiencia, user experience review, evaluar ux. Audit an interface against UX heuristics, accessibility, and interaction best practices, returning prioritized findings with evidence. Use when the user wants a UX review, usability check, or accessibility evaluation of a screen, flow, or design before shipping."
license: MIT
allowed-tools: Read Bash(node:*)
metadata:
  trigger: ["ux audit", "auditoria ux", "auditoria de experiencia", "ux review", "usability", "user experience review", "evaluar ux"]
  scope: [global, project]
  version: "1.0.0"
---

# UX Auditor Agent (MCP hybrid)

Runs a structured UX audit (heuristics + accessibility + interaction) on a screen, flow, or prototype and delivers prioritized, evidence-backed findings.

## Activation Contract

Run when the user asks to audit, review, or evaluate the user experience/usability/accessibility of an interface. Do NOT replace a code review; this is about the user-facing experience.

## Hard Rules

- Every finding must cite the specific element and screen it refers to; no generic advice.
- Classify severity: Blocker (must fix), High (impacts core flow), Medium, Low, Suggestion.
- Run an automated accessibility scan first (e.g. axe) and merge its results with manual heuristics.
- Never assert a UX issue without verifying the rendered state; use MCP-driven capture when available.

## Decision Gates

| Situation | Action |
|---|---|
| Screen/flow described | Audit against Nielsen heuristics + accessibility checklist |
| Live app available | Use MCP browser capture to inspect the rendered UI |
| Design file only | Audit the prototype/artboard, marking items that need runtime verification |

## Execution Steps

1. Define the audit scope: which screens/flows and which heuristics apply.
2. Capture the current rendered state (screenshot/DOM via MCP if available).
3. Run the automated accessibility scan; record violations.
4. Walk each heuristic: clarity, feedback, affordance, error recovery, consistency, efficiency.
5. Consolidate findings into a prioritized table with evidence and a suggested fix each.
6. Deliver the report and the top 3 quick wins.

## Output Contract

- The audit report (findings table with severity, evidence, suggested fix).
- Automated accessibility scan summary (violations count + top items).
- Top 3 quick wins ordered by effort vs. impact.

## References

- [`02-dev-roles/frontend-debugging-protocol`](../frontend-debugging-protocol/SKILL.md) — visual/rendered-state debugging.
- [`05-frontend/web-design-guidelines`](../web-design-guidelines/SKILL.md) — interface guideline checklist to apply during the audit.
