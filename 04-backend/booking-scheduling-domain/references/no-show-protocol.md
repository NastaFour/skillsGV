# No-Show Protocol

## 1. No-Show Detection

A booking is marked `NO_SHOW` when the provider doesn't arrive within the tolerance window after the scheduled start time.

```
Scheduled start: 10:00 AM
Tolerance: 15 minutes
If provider hasn't marked ARRIVED by 10:15 AM → NO_SHOW triggered
```

## 2. Timeout Job (Background Job)

A background job (`background-jobs-queues`) is scheduled when a booking transitions to `ACCEPTED`:

```typescript
// Scheduled 15 minutes after startTime
await noShowQueue.add(
  "no-show-check",
  { bookingId: booking.id },
  {
    delay: booking.startTime.getTime() + 15 * 60 * 1000 - Date.now(),
    jobId: `no-show-${booking.id}`, // idempotency key
  }
);
```

## 3. Auto-Cancel Flow

When the no-show job fires:

```typescript
async function handleNoShow(bookingId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

  // Idempotency: if booking already completed or cancelled, skip
  if (booking.status === "COMPLETED" || booking.status === "CANCELLED") return;

  // If provider already arrived, skip
  if (booking.status === "ARRIVED" || booking.status === "EN_RUTA") return;

  // Mark as no-show
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "NO_SHOW" },
  });

  // Notify client
  await notificationService.send(booking.clientId, {
    template: "no-show",
    data: { bookingId, providerName: booking.provider.user.name },
  });

  // Offer reassignment or refund
  if (booking.prepaid) {
    await processRefund(booking);
  }

  // Trigger AI reassignment if client wants another provider
  await aiReassignQueue.add("suggest-alternative", { bookingId });
}
```

## 4. Fee Logic

| Scenario | Fee |
|---|---|
| Client no-show (didn't answer door) | Client charged cancellation fee if prepaid |
| Provider no-show (didn't arrive) | Full refund to client, provider penalized (rating impact) |
| Client cancels >2h before | No fee |
| Client cancels <2h before | 50% fee if prepaid |
| Provider cancels after accepting | Full refund, provider penalized |

## 5. Provider Penalty System

Repeated no-shows by a provider:

- **1st no-show**: Warning + rating impact
- **3 no-shows in 30 days**: Suspension (7 days)
- **5 no-shows in 30 days**: Account review + possible ban

Tracked in `UserProfile.noShowCount` + `UserProfile.lastNoShowAt`.
