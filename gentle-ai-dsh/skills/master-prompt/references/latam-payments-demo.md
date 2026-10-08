# LATAM Multi-Currency & Local Payments Reference

This reference documents the simulation pattern for Latin American multi-currency payment flows (e.g., dual USD/local currency pricing, mobile instant bank transfers, and BNPL).

## Financial Flows

1. **Dual Currency Pricing**:
   - Primary prices indexed in USD.
   - Dynamic conversion to local currency (e.g. VES using official central bank rate BCV, or ARS/COP).
   - Display both currencies across product cards, order totals, and checkout receipts.

2. **Mobile Instant Transfer (e.g., Pago Móvil C2P)**:
   - Form fields: Destination bank, phone number, national ID, and dynamic OTP (One-Time Password) confirmation modal.
   - Simulation: Validates format, simulates 2-second bank processing delay, returns approved transaction hash.

3. **Buy Now Pay Later (BNPL / e.g., Cashea)**:
   - Interactive payment schedule: Down payment (e.g. 40%) due immediately + 3 bi-weekly remaining installments.
   - Simulation: Deep link redirect animation to BNPL app with fallback state confirmation.

4. **Cash on Delivery**:
   - Register physical cash collection with change calculation at destination point.
