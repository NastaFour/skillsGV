---
name: app-resource-efficiency
description: "Trigger: resource efficiency, optimize cpu, memory leak, ram optimization, vram, gpu frame budget, token cost optimization, io backpressure, reducir consumo de recursos. Audits and optimizes CPU offloading, bounded RAM streaming, GPU/VRAM disposal & 60fps frame budgets, disk/network I/O backpressure, and LLM token/context efficiency. Do NOT use for speculative refactoring without a measured bottleneck (use karpathy-ponytail-simplicity) or visual aesthetic direction (use design-driven)."
license: MIT
compatibility: "Compatible with Gentle-AI 4.4.0+, Node.js 20+, TypeScript, Python 3.11+, React 19, Three.js/WebGL. Requires pnpm 9+."
allowed-tools: Read Write Edit Bash(node:*,pnpm:*) Glob Grep
metadata:
  tier: "extended"
  version: "1.0.0"
  author: skillsGV
  scope: "global, project"
  trigger: ["resource efficiency", "optimize cpu", "memory leak", "ram optimization", "vram", "gpu frame budget", "token cost optimization", "io backpressure", "reducir consumo de recursos"]
---

# ⚡ App & AI Resource Efficiency (CPU, RAM, GPU, I/O & Token Budgets)

Systematic runtime and AI resource governance targeting measurable bottlenecks across compute, memory, graphics, I/O, and LLM context windows.

---

## 🚫 Core Invariants (Floor)

1. **Measure Before Micro-Optimizing**: Establish a concrete bottleneck (`heapUsed`, frame ms, p95 latency, or token count) before changing algorithms or adding caching.
2. **Bounded Buffers & Explicit Cleanup**: Never buffer unbounded files/streams in memory or register listeners/intervals/WebGL resources without deterministic `finally` / unmount disposal.
3. **Zero Blocking on Hot Event Loops**: Keep synchronous CPU-heavy parsing, hashing, compression, or regex backtracking off HTTP/UI main threads.

---

## 🎯 The 5-Plane Efficiency Checklist

| Plane | Common Waste Pattern | Concrete Engineering Fix |
|---|---|---|
| **CPU & Event Loop** | `O(N^2)` nested array lookups, unindexed regex backtracking, synchronous crypto/compression on request threads | Use `Map`/`Set` `O(1)` indexes, `worker_threads` / Web Workers for heavy compute, and async streaming primitives |
| **RAM & Leaks** | Full-file `readFileSync` on large blobs, unbounded global caches, stale closures & orphaned `AbortController` / timers | Stream/chunk large payloads, cap caches (`maxEntries` + TTL + eviction), clear timers and listeners on teardown |
| **GPU / VRAM (`<= 16.6ms`)** | Animating `width`/`top`/`box-shadow`, leaked Three.js geometries/textures, uncapped `devicePixelRatio` | Animate only composited `transform`/`opacity`, call `.dispose()` on geometries/materials/textures, cap DPR (`<= 2`), pause off-screen loops |
| **Disk & Network I/O** | N+1 DB queries in loops, ignoring `stream.pipeline` backpressure, missing HTTP/DB timeouts | Batch queries (`WHERE id = ANY(...)`), enforce `pipeline()` backpressure & connection pooling, set explicit `AbortSignal.timeout()` |
| **LLM Token & Context** | Dumping whole large files or raw multi-KB logs into agent context, redundant system prompt preamble | Use symbol search + line-ranged slices, bound bash output to counts/`--stat`, deduplicate static context, compress stubs |

---

## 🚀 Floor, Not Ceiling (`[Beyond-Baseline]`)

Pair baseline resource hygiene with structural telemetry when hotspots persist (`[Beyond-Baseline: <measurement rationale>]`): automate flamegraph/heap snapshot regression checks or differential throughput benchmarks in isolated worktrees.

## 🔗 Cross-References

- [`../solid-clean-code/SKILL.md`](../solid-clean-code/SKILL.md) — Clean boundaries & proportional design
- [`../production-readiness-250/SKILL.md`](../production-readiness-250/SKILL.md) — Event-loop safety & production limits
- [`../karpathy-ponytail-simplicity/SKILL.md`](../karpathy-ponytail-simplicity/SKILL.md) — Surgical changes without speculative abstraction
- [`../../05-frontend/lazy-loading-patterns/SKILL.md`](../../05-frontend/lazy-loading-patterns/SKILL.md) — Route/component code splitting & suspense boundaries
