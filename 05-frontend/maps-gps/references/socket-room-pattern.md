# Socket.io Room Pattern for Live Location Tracking

Each active tracking session uses a dedicated Socket.io **room** so only authorized subscribers, the mobile publisher, and optional operators receive location updates.

## 🏠 Room Naming

```
session:<session-uuid>
```

- Subscriber joins on opening the live tracking view
- Publisher joins on starting the active tracking session
- Operator (optional) joins when monitoring the session

## 🤝 Join on Authenticated Handshake

```javascript
// Server: validate JWT in handshake, then auto-join on subscribe
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    socket.data.userId = payload.sub;
    socket.data.role = payload.role;
    next();
  } catch {
    next(new Error('unauthorized'));
  }
});

socket.on('subscribe:order', async (orderId) => {
  const owns = await verifyOrderOwnership(socket.data.userId, orderId);
  if (!owns) return socket.emit('error', { code: 'forbidden' });
  socket.join(`order:${orderId}`);
});
```

## 📡 Broadcast Pattern

```javascript
// Driver emits → server validates → broadcast to room
socket.on('driver:location:update', (raw) => {
  const parsed = CoordinatesSchema.parse(raw); // Zod first
  io.to(`order:${parsed.orderId}`).emit(`delivery:location:${parsed.orderId}`, parsed);
});
```

## 🚪 Cleanup on Disconnect

Socket.io removes the socket from all rooms automatically on disconnect. No manual cleanup needed.

## 🔒 Security Checklist

- [ ] JWT verified in `io.use` middleware
- [ ] `subscribe:order` validates ownership (buyer/courier/admin only)
- [ ] All payloads validated with Zod before broadcast
- [ ] No cross-room leaks (verify with `io.sockets.adapter.rooms`)
- [ ] Rate-limit `driver:location:update` per socket (e.g. `socket.use((pkt, next) => rateLimit(...)(pkt, next))`)
