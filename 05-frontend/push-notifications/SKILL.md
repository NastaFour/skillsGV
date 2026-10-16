---
name: push-notifications
description: Implementation of mobile push notifications across Expo, React Native, APNs, and FCM. Covers permission lifecycle, token registration, notification channels, deep-linking routing, and decoupled server-side dispatch. Use when configuring push tokens, user permissions, notification handlers, or backend dispatch services. Do NOT use for desktop web notifications or SMS delivery.
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*) Read
metadata:
  trigger: ["push notifications", "expo push", "notificaciones", "alertas", "APNs", "FCM", "device token"]
  scope: [global, project]
  version: "2.0.0"
---

# 🔔 Mobile Push Notifications Architecture

Standardized cross-platform implementation for push notification permissions, device token lifecycle, deep-linking routing, and resilient backend delivery.

---

## 📱 1. Permission Lifecycle & Token Registration (Client)

Request notification permissions gracefully and persist device tokens on the server:

```typescript
// hooks/usePushNotifications.ts
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { api } from '../lib/api';

export function usePushNotifications(userId: string) {
  useEffect(() => {
    (async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') return;

      const { data: token } = await Notifications.getExpoPushTokenAsync();
      // Register or update device token on backend
      await api.post('/api/users/push-tokens', { token, platform: process.env.EXPO_OS });
    })();
  }, [userId]);
}
```

### Backend Persistence (Multi-device Support)

```prisma
model DeviceToken {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  platform  String   // 'ios' | 'android' | 'web'
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

---

## 📤 2. Server-side Dispatch Service (SRP)

Isolate notification dispatch from business domain logic (see [SOLID](../../06-code-quality/solid-clean-code/SKILL.md)):

```typescript
// services/notification.service.ts
import fetch from 'node-fetch';

export interface PushPayload {
  token: string;
  title: string;
  body: string;
  data?: Record<string, unknown>; // Deep linking payload
  channelId?: string;
}

export class NotificationService {
  async send(payload: PushPayload): Promise<void> {
    if (!payload.token) return;

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: payload.token,
          title: payload.title,
          body: payload.body,
          data: payload.data ?? {},
          sound: 'default',
          channelId: payload.channelId ?? 'default',
        }),
      });

      const result = await response.json() as { data?: { status: string; details?: { error?: string } } };
      if (result.data?.details?.error === 'DeviceNotRegistered') {
        // Automatically prune stale/uninstalled token from database
        await this.pruneToken(payload.token);
      }
    } catch (err) {
      // Notification failures MUST NEVER abort primary database transactions
      console.error('[NotificationService] Dispatch failure:', err);
    }
  }

  private async pruneToken(token: string): Promise<void> {
    // Database deletion logic
  }
}
```

---

## 🧭 3. Deep-Linking Integration

Provide structured route navigation data within notification payloads:

```typescript
// Example payload dispatch
await notificationService.send({
  token: userDeviceToken,
  title: 'Update Received',
  body: 'Your request has been processed.',
  data: {
    route: '/activity/details',
    entityId: activity.id,
  },
});
```

On the client, subscribe to notification response listeners to route the user:

```typescript
// App root or navigation container
Notifications.addNotificationResponseReceivedListener((response) => {
  const { route, entityId } = response.notification.request.content.data as { route?: string; entityId?: string };
  if (route) {
    navigation.navigate(route, { id: entityId });
  }
});
```

---

## 🛡️ 4. Security & Operational Hard Invariants

1. **Zero Sensitive Data**: Payloads MUST NEVER contain passwords, authentication tokens, payment details, or PII.
2. **Non-Blocking Delivery**: Notification delivery failures must be logged and handled asynchronously; they must never cause a rollback of committed business operations.
3. **Stale Token Pruning**: Clean up inactive or revoked device tokens upon receiving invalid token responses from push gateways.
