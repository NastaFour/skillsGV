---
name: solid-clean-code
description: "Software engineering quality and architectural proportionality — SOLID, DRY, KISS, and choosing between Clean/Hexagonal layering vs Vertical Slice cohesion. Use when reviewing, writing, or refactoring TypeScript, React, and Node.js code. Do NOT use for syntax-level language reference or build tool configuration."
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*) Read
metadata:
  trigger: ["SOLID", "DRY", "KISS", "clean code", "SRP", "DIP", "refactor god class"]
  scope: [global, project]
  version: "2.1.0"
---

# 📐 SOLID, Clean Code & Architectural Proportionality

Use this skill to guide architectural boundaries, refactoring sessions, and code review standards. It balances SOLID decoupling with KISS pragmatism—preventing both monolithic "God classes" and over-engineered "lasagna architectures" full of pass-through boilerplate.

---

## 🚫 Core Anti-Patterns & Pragmatic Remedies

| Anti-Pattern | Why It Hurts Maintainability | Engineering Remedy |
|---|---|---|
| **God Classes / Mega-Handlers** | Mixing validation, complex business pricing, 3rd-party SDK calls, and raw persistence in one giant method makes testing and change hazardous. | Separate pure domain rules from I/O boundaries (SRP). |
| **Speculative Indirection ("Lasagna Layers")** | Forcing `Controller -> UseCase -> Service -> RepositoryInterface -> RepositoryImpl -> Mapper` onto a simple 10-line CRUD read adds 6 files of zero-value pass-through code. | Match architectural depth to domain complexity (Architectural Proportionality). |
| **Untyped Domain Boundaries** | Passing unvalidated dictionaries across modules hides contract mismatches until runtime. | Validate inputs at system edges with schemas (Zod) and pass typed domain objects internally. |
| **Hardcoding Volatile 3rd-Party SDKs in Core Domain** | Instantiating payment, email, or LLM vendor SDKs directly inside domain calculations makes deterministic testing and vendor failover painful. | Inject a narrow port/interface at external side-effect boundaries (DIP). |
| **Dogmatic Line-Count Splitting** | Chopping a cohesive 55-line linear pipeline or state machine into 4 tiny private methods that share 7 parameters increases cognitive jumping. | Use ~40 lines as a **cognitive-complexity heuristic**, not a mechanical guillotine. Extract helpers when a block has an independent nameable purpose. |

---

## 🧭 Architectural Proportionality: Hexagonal vs Vertical Slice

Choose the structural pattern that matches the complexity and volatility of the feature:

| Dimension | Full Clean / Hexagonal (`UseCase + Port + Adapter`) | Vertical Slice / Cohesive Module (`Handler + Schema + Query`) |
|---|---|---|
| **When to Use** | Complex domain invariants, financial/inventory state machines, multi-step orchestration, or volatile external providers (Stripe, LLMs, queues) that require fakes in unit tests. | Straightforward CRUD endpoints, read projections, admin dashboards, internal webhooks, or BFF data loaders with minimal branching logic. |
| **Structure** | Pure domain entities/services isolated from HTTP and persistence; external I/O behind focused interfaces. | Colocate route handler, Zod input/output schema, and type-safe query in a single cohesive feature slice (`features/invoices/list-invoices.ts`). |
| **Rule of Three (KISS)** | Introduce an interface + adapter when crossing an external side-effect boundary or when 2+ implementations exist (e.g., `LiveGateway` + `FakeGateway`). | Do not create single-implementation interfaces for internal read queries that are tested against an ephemeral database. |

---

## 🏛️ SOLID Principles Applied Pragmatically

### 1. Single Responsibility Principle (SRP)
- A module or function should have **one primary reason to change** (one actor/axis of change).
- Separate **pure calculation/decision logic** (easy to test synchronously with zero mocks) from **side-effect orchestration** (HTTP, DB, external APIs).

### 2. Open/Closed Principle (OCP)
- Extend behavior (e.g., adding a new payment method or export strategy) via strategy maps or shared contracts rather than growing brittle `if/else` chains across multiple files.

### 3. Liskov Substitution Principle (LSP)
- Implementations of a port (`StripeGateway`, `InMemoryPaymentGateway`) must honor the same input/output invariants and domain error semantics.

### 4. Interface Segregation Principle (ISP)
- Keep dependency contracts narrow. A use case that only sends a receipt needs `ReceiptSender`, not a 25-method `OmnibusNotificationManager`.

### 5. Dependency Inversion Principle (DIP)
- Core business policies depend on domain-owned contracts, not low-level vendor SDK types.

---

## 📊 Refactoring Patterns in Practice

### 1. Complex Domain Workflow -> Clean Orchestrator + Pure Domain Logic

**❌ Anti-Pattern (Monolithic Handler Mixing Validation, Pricing Math, and Vendor SDKs):**
```typescript
export class OrderController {
  async handleCheckout(req: Request, res: Response) {
    const body = await req.json();
    if (!body.items || !body.cardToken) throw new Error('Invalid payload');

    let total = body.items.reduce(
      (acc: number, item: { price: number; qty: number }) => acc + item.price * item.qty,
      0
    );
    if (body.coupon === 'SAVE10') total = Math.round(total * 0.9);

    const stripe = new Stripe(process.env.STRIPE_KEY ?? '');
    const charge = await stripe.charges.create({ amount: total, source: body.cardToken });

    await db.query('INSERT INTO orders (total, charge_id) VALUES ($1, $2)', [total, charge.id]);
    return Response.json({ success: true });
  }
}
```

**✅ Approved Pattern (Pure Domain Calculation + Focused Orchestrator):**
```typescript
// 1. Pure, zero-mock domain calculation
export function calculateOrderTotal(items: readonly LineItem[], couponCode?: string): number {
  const subtotal = items.reduce((acc, item) => acc + item.unitPriceCents * item.quantity, 0);
  return couponCode === 'SAVE10' ? Math.round(subtotal * 0.9) : subtotal;
}

// 2. Application use case with narrow external ports
export class CheckoutUseCase {
  constructor(
    private readonly paymentGateway: PaymentGateway,
    private readonly orderRepository: OrderRepository
  ) {}

  async execute(dto: CheckoutDTO): Promise<OrderRecord> {
    const totalCents = calculateOrderTotal(dto.items, dto.couponCode);
    const payment = await this.paymentGateway.charge(dto.paymentToken, totalCents);

    return this.orderRepository.save({
      customerId: dto.customerId,
      totalCents,
      transactionId: payment.id,
    });
  }
}
```

---

### 2. Simple Read / CRUD Feature -> Cohesive Vertical Slice

When an endpoint simply validates query parameters and returns a filtered projection, avoid creating 4 pass-through classes:

```typescript
// features/orders/get-order-summary.ts
import { z } from 'zod';
import type { DatabaseClient } from '@/db/client';

export const GetOrderSummaryParams = z.object({
  customerId: z.string().uuid(),
});

export async function getOrderSummary(db: DatabaseClient, rawParams: unknown) {
  const { customerId } = GetOrderSummaryParams.parse(rawParams);
  return db.orders.findMany({
    where: { customerId },
    select: { id: true, totalCents: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
}
```

---

## 🚀 Floor, Not Ceiling (`[Beyond-Baseline]`)

SRP, type-safe boundaries, and isolating volatile external side effects are the engineering floor. Neither a mechanical 40-line cap nor mandatory `UseCase + Repository + Adapter` ceremonies should be forced onto simple vertical slices, declarative UI components, or cohesive parsers/compilers where keeping logic together is clearer; document intentional architectural choices with `[Beyond-Baseline: <architectural reason>]`.

---

## 🔄 Incremental Refactoring Checklist
1. **Preserve Green Tests**: Verify automated test coverage before structural refactoring.
2. **Separate Pure Logic First**: Extract pure calculations from I/O before introducing interfaces.
3. **Migrate Incrementally**: Move one responsibility at a time in reviewable work-unit commits.
4. **Re-verify Zero Regressions**: Run the test suite after each extraction.
