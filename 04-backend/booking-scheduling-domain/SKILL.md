---
name: booking-scheduling-domain
description: Core booking and scheduling domain logic — slot availability, conflict detection with ACID transactions, no-show timeout protocols, and resource reassignment. Use when implementing createBooking, availability queries, slot management, or debugging double-booking race conditions. Do NOT use for client-side booking UI components.
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+."
metadata:
  trigger: ["booking", "reserva", "slot", "availability", "disponibilidad", "conflict", "race condition", "double booking", "no-show", "no show", "reasignacion", "scheduling"]
  scope: [global, project]
  version: "2.0.0"
allowed-tools: Bash(node:*) Read
---

# 📅 Booking & Scheduling Domain Architecture

Universal scheduling and reservation patterns covering slot availability windows, conflict detection with atomic database transactions, no-show timeouts, and resource re-allocation. Prevents double-booking race conditions when multiple users attempt to claim identical slots simultaneously.

## 📋 When to Use

- Use when implementing `createBooking`, `getAvailability`, or slot management APIs.
- Use when debugging double-booking concurrency bugs or race conditions.
- Use when implementing no-show expiration rules or provider/resource reassignment.
- Do NOT use for the booking UI (use `05-frontend/react-native/SKILL.md` or `05-frontend/interface-design/SKILL.md`).

## 🚦 Hard Rules (Non-Negotiable)

- **Always** use `$transaction` with inline conflict detection when creating a booking.
- **Never** check availability and create a booking in separate disjoint queries (concurrency race condition).
- **Always** store all timestamps in UTC in the database, formatting to localized timezone solely for display.
- **Always** account for service duration + transition buffers when calculating slot availability.
- **Never** permit a booking that overlaps an existing confirmed reservation for the same resource or provider.

## 🛠️ Workflow

1. Read the slot logic rules: [slot-logic.md](references/slot-logic.md)
2. Read the conflict resolution pattern: [conflict-resolution.md](references/conflict-resolution.md)
3. Read the no-show protocol: [no-show-protocol.md](references/no-show-protocol.md)
4. Check type definitions: [types.md](references/types.md)
5. Run the query auditor to verify booking queries use atomic transactions:
   ```bash
   node 04-backend/booking-scheduling-domain/scripts/check-booking-queries.mjs
   # Or within installed project environments:
   node <skill-dir>/scripts/check-booking-queries.mjs
   ```

## 📚 References

- [Slot Logic](references/slot-logic.md) — duration, buffer, and working hours calculation
- [Conflict Resolution](references/conflict-resolution.md) — ACID transaction + concurrency state diagram
- [No-Show Protocol](references/no-show-protocol.md) — timeout thresholds, auto-cancellation, and reassignment
- [Types](references/types.md) — BookingSlot, AvailabilityWindow, ConflictCheck schemas
- [`prisma-orm`](../prisma-orm/SKILL.md) — transaction patterns
- [`socketio`](../socketio/SKILL.md) — real-time booking event broadcasting
- [`background-jobs-queues`](../background-jobs-queues/SKILL.md) — no-show timeout workers
