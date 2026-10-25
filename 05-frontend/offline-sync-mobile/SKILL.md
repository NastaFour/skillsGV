---
name: offline-sync-mobile
description: "Offline-first synchronization patterns for Expo and React Native mobile apps. Covers persistent outbox queues for offline mutations, deterministic conflict resolution on reconnect, and optimistic UI updates with rollback. Use when a mobile client needs to operate without network connectivity or resolve sync conflicts. Do not use for online-only stateless fetches."
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and Expo SDK 52+."
metadata:
  trigger: ["offline sync", "offline first", "sin conexion", "conflict resolution", "optimistic update", "mobile queue", "sync conflict", "outbox pattern", "offline mode"]
  scope: [global, project]
  version: "1.1.0"
allowed-tools: Bash(node:*) Read
---

# 📴 Offline-First Mobile Synchronization (Outbox & Conflict Resolution)

Offline-first patterns for Expo and React Native applications. Mutations created while disconnected are persisted in a local transactional outbox, reflected via optimistic UI, and synchronized deterministically when connectivity returns.

## 📋 When to Use

- Use when a mobile client must support creating or updating records without active network connectivity
- Use when designing idempotency keys, retry backoff, and conflict resolution (`409 Conflict`) on reconnect
- Use when implementing optimistic UI updates with deterministic rollback on failure

## 🚦 Hard Rules

- **Always** persist pending offline mutations in a durable local outbox (`expo-sqlite` or persisted store) with a unique client-generated `idempotencyKey` and `baseVersion`
- **Always** surface an explicit sync status indicator (`pending`, `syncing`, `synced`, `conflict`) in the UI
- **Always** handle server `409 Conflict` responses with a deterministic merge strategy or user-facing conflict resolution prompt
- **Never** assume the local outbox is empty on cold start — hydrate and flush the queue on app launch and network reconnect (`NetInfo`)

## 🛠️ Workflow

1. Read sync & outbox patterns: [sync-patterns.md](references/sync-patterns.md)
2. Read conflict resolution strategies: [conflict-resolution.md](references/conflict-resolution.md)
3. Run the checker to verify offline sync implementation:
   ```bash
   node 05-frontend/offline-sync-mobile/scripts/check-offline-sync.mjs
   ```

## 🚀 Floor, Not Ceiling (`[Beyond-Baseline]`)

A persistent FIFO Outbox + version check (`409 Conflict`) is the baseline. Adopt advanced local-first primitives when concurrent multi-device editing is central to the product (annotate with `[Beyond-Baseline: <reason>]`):
- **CRDTs & Local-First Sync Engines**: Use Yjs, Automerge, PowerSync, WatermelonDB, or TinyBase over `expo-sqlite` for automatic field-level merge resolution without manual `409` modals.
- **Background Fetch Reconciliation**: Register `expo-background-fetch` / `expo-task-manager` tasks to flush pending outbox mutations opportunistically even when the app is backgrounded.

## 📚 References

- [Sync Patterns](references/sync-patterns.md) — persistent outbox queue + background flush
- [Conflict Resolution](references/conflict-resolution.md) — `409` version vectors, LWW vs field-merge, and user choice
- [`zustand-5`](../zustand-5/SKILL.md) — persisted client state integration
- [`background-jobs-queues`](../../04-backend/background-jobs-queues/SKILL.md) — server-side idempotent ingestion and retry strategy
