# Limitations of the Evaluation Harness & Benchmarks

This document provides a transparent and rigorous assessment of the current limitations, potential biases, and boundary conditions of the evaluation suite and benchmark harness in this repository (`evals/` and `scripts/benchmark-evals.mjs`).

---

## 1. Illustrative Sample Size Baseline ($n = 5$)

The automated A/B evaluation suite (`scripts/pilot-eval.mjs`, producing artifacts under `evals/results/ab-*.json`) evaluates agent outputs across **5 reference pilot tasks** ($n = 5$):
1. **Task 1**: Atomic commit decomposition of an authentication feature.
2. **Task 2**: Writing unit tests with mocks for an order processing service.
3. **Task 3**: Multi-vector security, performance, and architecture audit of an Express/SQL handler.
4. **Task 4**: System architecture & entry point design for a multi-channel notification engine.
5. **Task 5**: Refactoring a monolithic "God Class" order service using SOLID principles and strict types.

### Consequence & Scope
- **Illustrative, not statistically representative**: A sample size of $n = 5$ serves as a fast, reproducible sanity check and regression canary for CI and local verification. It demonstrates that rubric scoring and blind judge evaluation operate correctly.
- **Statistical power**: An $n = 5$ run lacks the statistical sample size necessary to generalize broad claims regarding general model capabilities, win rates, or performance deltas across diverse developer tasks. Statistically robust benchmarking requires higher sample sizes ($n \ge 50\text{--}100$), diverse prompt distributions, varying task complexity levels, and evaluation across different model families and sampling temperatures.

---

## 2. Adversarial Trap Prompts & User Compliance Penalization

Several pilot eval tasks employ adversarial prompts where the user request explicitly asks the model to perform an action that violates repository governance standards:
- **Task 1 (AI Attribution Trap)**: The user prompt requests Git commit commands including a `Co-Authored-By: AI Assistant <assistant@example.com>` trailer.
- **Task 2 (Legacy Package Runner Trap)**: The user prompt asks for running unit tests using legacy tools (`npm test` and `npx vitest run`).

### Asymmetric Evaluation Bias
- **Compliance penalty on bare models**: A standard base model with no injected repository rules or system prompts faithfully fulfills the user's explicit instructions (emitting `Co-Authored-By` and `npm`/`npx` commands). In the evaluation rubric, however, the bare model is severely penalized for failing policy checks (e.g., repository rules strictly banning AI attribution trailers and enforcing `pnpm-only`).
- **Interpretation**: While this metric demonstrates that skillsGV successfully enforces negative constraints (Absolute Bans) even when prompted contrarily, it penalizes the bare model for *cooperative user instruction-following* rather than technical or reasoning deficiency. Benchmark comparisons must clearly state that policy compliance deltas reflect prompt constraint injection, not inherent model capability differences.

---

## 3. Static Historical Kernel Reference (`HISTORICAL_KERNEL_BYTES = 24667`)

The token efficiency metrics in `scripts/benchmark-evals.mjs` calculate prompt savings by comparing current `AGENTS.md` context against a fixed constant:

```javascript
// FIXED HISTORICAL REFERENCE: the pre-T5 monolithic AGENTS.md (24,667 bytes, ~6,167 tokens).
const HISTORICAL_KERNEL_BYTES = 24667;
const HISTORICAL_KERNEL_TOKENS = bytesToTokens(HISTORICAL_KERNEL_BYTES); // ~6,167 tokens
```

### Limitations of Static Sizing
- **Snapshot baseline**: `HISTORICAL_KERNEL_BYTES` reflects a single historical version of the monolithic, pre-two-tier `AGENTS.md` file from early iterations. It is kept as a fixed reference point rather than being dynamically measured or compared against active competitor kernels.
- **Absence of multi-turn telemetry**: Real-world token consumption is dynamic. Multi-turn interactions accumulate message history, command outputs, tool call results, and dynamically loaded Tier 1 skill bodies (injected on-demand via `tier1-instructions.txt`).
- **Static vs. Runtime Footprint**: Measuring always-on bootstrap token savings (`AGENTS.md` + Tier 0 skills) provides a valid upper-bound comparison of initial context overhead, but does not capture dynamic turn-by-turn context expansion over a long-running development session.
