---
name: socketio
description: "Real-time event communication with Socket.io (v4.7+). Covers handshake authentication middleware, multi-tenant room/namespace isolation, Zod payload validation, and client listener lifecycle cleanup. Use when creating or modifying Socket.io events, rooms, or real-time streams. Do not use for standard stateless REST CRUD endpoints."
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*) Read
metadata:
  trigger: ["socket.io", "websocket", "tiempo real", "rooms", "handshake"]
  scope: [global, project]
  version: "1.1.0"
---

# 🔌 Real-Time Communication with Socket.io

Use this skill when implementing real-time event streams, collaborative rooms, live telemetry feeds, or push notification brokers.

## 🚨 Connection & Authorization (2026 Guardrails)

1. **Strict Handshake Middleware**:
   - Never allow unauthenticated socket connections on protected namespaces.
   - Validate the short-lived JWT or session credential inside `io.use()` before completing the handshake:
     ```typescript
     io.use((socket, next) => {
       const token = socket.handshake.auth?.token;
       if (!token) return next(new Error('Authentication error: Token missing'));

       try {
         const principal = verifyAccessToken(token);
         socket.data.user = principal;
         next();
       } catch {
         next(new Error('Authentication error: Invalid token'));
       }
     });
     ```

2. **Inbound Payload Schema Validation**:
   - Validate every client-emitted `socket.on` payload with Zod before executing domain logic or rebroadcasting, preventing prototype pollution and malformed broadcasts:
     ```typescript
     socket.on('resource:cursor_move', (rawPayload, ack) => {
       const parsed = CursorMoveSchema.safeParse(rawPayload);
       if (!parsed.success) {
         return ack?.({ ok: false, error: 'INVALID_PAYLOAD' });
       }
       socket.to(`resource:${parsed.data.resourceId}`).emit('resource:cursor_moved', parsed.data);
       ack?.({ ok: true });
     });
     ```

## 🏛️ Universal Room & Namespace Isolation Patterns

Scope broadcasts strictly using deterministic room naming conventions and verify authorization before calling `socket.join()`:

1. **Entity / Resource Room (`resource:${resourceId}`)**:
   -Subscribed clients watching or collaborating on a specific domain record receive state transition events (`resource:updated`, `resource:comment_added`) only after verifying read access to `resourceId`.

2. **Tenant / Workspace Broadcast Room (`tenant:${tenantId}`)**:
   - Isolates organization-wide announcements, quota alerts, or live operational metrics strictly to members of `tenantId`.

3. **Principal Private Channel (`user:${userId}`)**:
   - Joined automatically upon authenticated handshake (`socket.join(\`user:\${socket.data.user.sub}\`)`) for targeted notifications across multiple active tabs or devices.

## ♻️ Client Lifecycle Management

1. **Deterministic React / Mobile Cleanup**:
   - Always detach event listeners in the `useEffect` cleanup function to prevent duplicate handlers and memory leaks:
     ```typescript
     useEffect(() => {
       const onResourceUpdated = (payload: ResourceUpdatedEvent) => {
         setResourceState(payload.state);
       };

       socket.emit('resource:subscribe', { resourceId });
       socket.on('resource:updated', onResourceUpdated);

       return () => {
         socket.emit('resource:unsubscribe', { resourceId });
         socket.off('resource:updated', onResourceUpdated);
       };
     }, [resourceId]);
     ```

2. **Mobile & Reconnection Resilience**:
   - Configure bounded exponential backoff (`reconnectionDelay`, `reconnectionDelayMax`, `reconnectionAttempts`) and suspend non-essential streams when the app enters the background.

## 🚀 Floor, Not Ceiling (`[Beyond-Baseline]`)

Single-node Socket.io is the baseline. Scale or simplify the transport when architectural needs dictate (annotate with `[Beyond-Baseline: <reason>]`):
- **Horizontal Scaling with Redis / NATS Adapter**: Attach `@socket.io/redis-streams-adapter` and enable Connection State Recovery when running multiple backend replicas.
- **Server-Sent Events (SSE) for Unidirectional Feeds**: When communication is strictly server-to-client (e.g., LLM token streaming or status notifications), prefer standard HTTP/2 SSE over full-duplex WebSockets.
