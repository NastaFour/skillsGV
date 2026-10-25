---
name: maps-gps
description: "Implements real-time GPS telemetry streaming and interactive geospatial map views. Covers map rendering in Expo and React Native, throttled location streaming via WebSockets/Socket.io, and Zod-validated coordinate contracts. Use when building live location tracking, geospatial telemetry feeds, or interactive map displays. Do not use for static map embeds."
license: MIT
compatibility: "Requires Expo SDK 50+, pnpm 9+, Node 20+. Uses react-native-maps, expo-location, and a WebSocket/Socket.io backend."
metadata:
  trigger: ["mapa", "GPS", "tracking", "geolocalización", "location tracking", "real-time location", "geospatial"]
  scope: [global, project]
  version: "2.1.0"
allowed-tools: Read Edit Write Bash(pnpm:*) Bash(node:*)
---

# 🗺️ Maps & Real-Time Geospatial Telemetry

Use this skill when implementing live GPS telemetry streaming, geofencing, or interactive map views across mobile and web clients.

## 📋 When to Use

- Use when building a real-time device or asset location stream
- Use when rendering an interactive map with live markers, polylines, or geofences
- Use when defining geospatial coordinate payload contracts (Zod schemas)
- Do NOT use for static map image embeds

## 🚦 Hard Rules

- **Always** validate inbound telemetry payloads (`telemetry:location:update`) with Zod before any server broadcast or persistence
- **Always** throttle location emissions (e.g., max 1 update per 3–5 seconds or minimum distance delta `distanceInterval`) to preserve battery and bandwidth
- **Always** verify principal authorization and resource/session ownership before broadcasting coordinates to a room
- **Never** persist sensitive user location history in unencrypted `localStorage` or `AsyncStorage`
- **Never** use `any` in geospatial contracts — use Zod-inferred types with latitude/longitude bounds

## 🛠️ Architecture Workflow

1. **Define the shared contract** in `packages/contracts/src/location.ts` (Zod schema + inferred TypeScript type)
2. **Telemetry emitter** captures coordinates via `expo-location` `watchPositionAsync` (with time + distance thresholds)
3. **Server validates** with Zod, verifies resource authorization, and broadcasts to the scoped room (`session:<id>` or `asset:<id>`)
4. **Observer client subscribes** via a dedicated `useLocationStream` hook
5. **Map component renders** as a pure presentational view (`<LiveTelemetryMap />`)

## 📍 Presentational Map vs Stream Hook (Expo / React Native)

Keep the map component presentational—receiving `coords`, `heading`, and `routePolyline` via props—while isolating socket subscriptions in a custom hook:

```typescript
// hooks/useLocationStream.ts (Stateful subscription — NO UI rendering)
import { useEffect, useState } from 'react';
import { socket } from '../lib/socket';
import { CoordinatesSchema, type Coordinates } from '@org/contracts/location';

export function useLocationStream(sessionId: string) {
  const [coords, setCoords] = useState<Coordinates | null>(null);

  useEffect(() => {
    const handler = (raw: unknown) => {
      const parsed = CoordinatesSchema.safeParse(raw);
      if (parsed.success) setCoords(parsed.data);
    };
    socket.on(`telemetry:location:${sessionId}`, handler);
    return () => {
      socket.off(`telemetry:location:${sessionId}`, handler);
    };
  }, [sessionId]);

  return { coords };
}
```

## 📡 Geospatial Pipeline: Emitter → Server → Subscribers

```typescript
// Mobile Emitter (throttled by timeInterval and distanceInterval)
import * as Location from 'expo-location';

const subscription = await Location.watchPositionAsync(
  { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 10 },
  ({ coords, timestamp }) => {
    socket.emit('telemetry:location:update', {
      sessionId,
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy ?? undefined,
      timestamp,
    });
  }
);
// Always call subscription.remove() on unmount
```

```typescript
// Server Relay (Zod validation + room scoping)
socket.on('telemetry:location:update', (rawPayload) => {
  const parsed = CoordinatesSchema.safeParse(rawPayload);
  if (!parsed.success) return;
  io.to(`session:${parsed.data.sessionId}`).emit(
    `telemetry:location:${parsed.data.sessionId}`,
    parsed.data
  );
});
```

## 🛡️ Security & Coordinate Schema Validation

```typescript
// packages/contracts/src/location.ts
import { z } from 'zod';

export const CoordinatesSchema = z.object({
  sessionId: z.string().uuid(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().nonnegative().optional(),
  heading: z.number().min(0).max(360).optional(),
  timestamp: z.number().int().positive().optional(),
});

export type Coordinates = z.infer<typeof CoordinatesSchema>;
```

## ⚡ Performance & Battery Rules

- **Adaptive Throttling**: Combine `timeInterval` (e.g., `5000ms`) and `distanceInterval` (e.g., `10m`) so stationary devices do not spam redundant coordinates.
- **Memoized Rendering**: Wrap `<LiveTelemetryMap />` and custom `<Marker />` subtrees in `React.memo` with `tracksViewChanges={false}` once marker icons load.
- **Deterministic Cleanup**: Always remove both the native location watcher and socket listeners on unmount.

## 🚀 Floor, Not Ceiling (`[Beyond-Baseline]`)

Point-to-point coordinate relay is the baseline. Scale geospatial capabilities when the domain requires it (annotate with `[Beyond-Baseline: <reason>]`):
- **Spatial Indexing & Geofencing**: Use PostGIS (`GEOGRAPHY(Point, 4326)`), H3 hexagonal indexing, or Redis geospatial commands (`GEOADD`/`GEOSEARCH`) for proximity queries and server-side geofence triggers.
- **Smooth Dead-Reckoning Interpolation**: Interpolate marker transitions on the client using `react-native-reanimated` and bearing angles (`heading`) for 60fps marker motion between 5-second telemetry ticks.

## 📚 References

- [Expo Location](references/expo-location-permissions.md) — permissions, foreground/background modes
- [react-native-maps](references/react-native-maps-config.md) — config plugin and provider keys
- [Socket.io rooms](references/socket-room-pattern.md) — room naming for telemetry streams
- [Socket.io skill](../../04-backend/socketio/SKILL.md) — server-side socket setup and Zod validation

## 🧪 Validation

```bash
node ./05-frontend/maps-gps/scripts/validate-location-payload.mjs ./path/to/payload.json
```
