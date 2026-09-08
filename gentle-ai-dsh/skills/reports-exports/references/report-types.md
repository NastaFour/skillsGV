# Report Types

## 1. PDF Booking Receipt

**Who**: Client (after completed booking)
**Data**: Booking details, service, provider, price, payment method, date

```typescript
interface ReceiptData {
  bookingId: string;
  clientName: string;
  providerName: string;
  serviceName: string;
  date: string;
  price: { usd: number; ves: number };
  paymentMethod: string;
  paymentReference?: string;
}
```

## 2. CSV Revenue Report (Admin)

**Who**: Admin
**Data**: Daily/weekly/monthly revenue breakdown

```csv
date,booking_id,client,provider,service,amount_usd,amount_ves,payment_method,status
2026-06-17,abc123,Carlos,José,Corte,15.00,450.00,cash,COMPLETED
```

## 3. staff performance Report

**Who**: Admin / Provider
**Data**: Bookings completed, avg rating, revenue, no-show count

```typescript
interface StaffPerformance {
  providerId: string;
  providerName: string;
  period: { start: string; end: string };
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  noShowCount: number;
  averageRating: number;
  totalRevenueUsd: number;
  totalRevenueVes: number;
}
```

## 4. Booking Summary Report

**Who**: Admin
**Data**: Bookings by status, by service, by provider

## 5. Client History Export

**Who**: Client (GDPR data portability)
**Data**: All bookings, reviews, payments for the client
