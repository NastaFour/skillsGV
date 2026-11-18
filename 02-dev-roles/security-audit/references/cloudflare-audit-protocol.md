# Cloudflare Security Audit Protocol (6-Phase Coverage Ledger & 12 Attack Domains)

Complement to [`../SKILL.md`](../SKILL.md) adapting Cloudflare's `security-audit-skill` methodology for deterministic, falsification-first application security reviews.

---

## 1. The 6 Audit Phases (`quick` | `standard` | `deep`)

| Phase | Purpose | Output Artifact / Gate |
|---|---|---|
| **1. Reconnaissance** | Map entry points, auth boundaries, secrets/config sources, external sinks, and infra assumptions | Component & Trust-Boundary Inventory |
| **2. Coverage Ledger** | Partition attack surface into cells: `surface × boundary × attack_class × subsystem` | `coverage-ledger.json` (tracks `unexamined | audited | verified`) |
| **3. Scoped Hunting** | Assign non-overlapping ledger cells to hunters; check `bug-hunter` sibling variants | Candidate hypotheses in `<scratch>/agents/<id>/` |
| **4. Independent Verification** | Re-prove exploit reachability against actual code paths; run `fp-check` refutation | `confirmed` (with 6-tuple) vs `needs_validation` vs `refuted` |
| **5. Race-Safe Promotion** | Promote scratch artifacts safely to report staging (never blindly trusting child paths) | Sanitized verified evidence bundle |
| **6. Reporting** | Group `confirmed` findings by severity with exact `path:line` and drop-in patch; list `needs_validation` separately | Final Security Audit Report |

---

## 2. Subagent Budget & Prior-Run Ledger Reuse

- **Budget Allocation Order**: Allocate tokens/runs in strict order BEFORE launching hunters:
  1. Recon pass,
  2. Post-wave `coverage-critic` checks (flag unexamined high-risk cells),
  3. Final-clean critic sweep,
  4. **`>= 30%` Verifier Reserve** so confirmed candidates never ship unverified.
- **Prior-Run Carryover Guard**: Never blindly trust `coverage-ledger.json` status from an older commit. Carry forward `audited`/`verified` only if `git diff <prev_commit>..HEAD -- <cell_paths>` is empty.

---

## 3. 11-Step Race-Safe Artifact Promotion (Multi-Agent Runs)

When orchestrating external or multi-agent hunters writing to `<scratch>/agents/<agent-id>/`:
1. Constrain writer surface exclusively to `<scratch>/agents/<agent-id>/`.
2. Open target directory without following symlinks (`O_NOFOLLOW` / `lstatSync` check `!stat.isSymbolicLink()`).
3. Reject hardlinks (`nlink === 1`), FIFOs, sockets, and block/char devices (`isFile() === true`).
4. Enforce maximum byte cap per artifact before loading content.
5. Pre-scan promoted text through [`prompt-shield`](../../../03-ai-ml/prompt-shield/scripts/safe_read.py) (`9/8/10`) before parent synthesis.
6. Verify content hash before and after copying to `artifacts/` to prevent TOCTOU swaps.
7. Never promote executable scripts or dotfiles (`.git`, `.env`, `.ssh`) from untrusted scratch outputs.

---

## 4. The 12 Cloudflare Attack-Surface Domain Modules

Cross-check applicable cells in `coverage-ledger.json` against:
1. **Web Protocol & Auth**: CORS credentials + wildcard reflection, CSRF, OAuth `state`/PKCE, open redirects, cache-poisoning via unkeyed headers.
2. **AI & LLM Integration**: Indirect prompt injection, unsafe markdown image exfil, excessive agency in tool calls, RAG cross-tenant leakage.
3. **Cloud & Deployment**: IAM wildcard roles, public storage buckets, IMDS SSRF, permissive ingress / debug admin ports.
4. **Client-Side**: DOM XSS, `dangerouslySetInnerHTML`, `postMessage` wildcard origin checks, client bundle secret leaks.
5. **Data Isolation & Lifecycle**: Multi-tenant BOLA/IDOR missing `org_id` predicates, stale session revocation on role downgrade/password reset.
6. **Desktop, Mobile & Local IPC**: Deep-link intent hijacking, Electron `nodeIntegration`/preload bridges, WebView file:// traversal, localhost CSRF.
7. **Memory Safety & Binary Parsers**: Unsafe native bindings/FFI, zip slip / archive bombs, unguarded regex ReDoS (`(a+)+`).
8. **Protocols, RPC & Messaging**: Webhook HMAC replay/timing leaks, WebSocket origin bypass, Queue/Event spoofing.
9. **Resource Exhaustion & Availability**: Unbounded uploads/JSON payloads, algorithmic complexity DoS, missing query timeouts/connection pool caps.
10. **Supply-Chain & Release**: Unpinned lockfiles, lifecycle `postinstall` hooks, compromised CI secrets, `.pyc`/artifact tampering.
11. **Concurrency & State Races**: TOCTOU double-spend in coupons/credits/inventory, non-idempotent payment webhooks.
12. **Logging & Privacy**: PII/tokens written into structured logs, unredacted crash telemetry, verbose stack traces in HTTP 500s.
