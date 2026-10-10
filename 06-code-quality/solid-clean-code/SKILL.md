---
name: solid-clean-code
description: Enforces software engineering quality and clean coding principles. Covers SOLID, DRY, and KISS guidelines applied to TypeScript, React, and Node.js to minimize technical debt. Use when reviewing, writing, or refactoring code to keep functions ≤40 lines, avoid 'any', and enforce SRP and DIP. Do NOT use for syntax-level language reference or build tool configuration.
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*) Read
metadata:
  trigger: ["SOLID", "DRY", "KISS", "clean code", "SRP", "DIP", "refactor god class"]
  scope: [global, project]
  version: "2.0.0"
---

# 📐 SOLID & Clean Code Standards (DRY / KISS)

Use this skill to guide architectural boundaries, refactoring sessions, and code review standards. It ensures code is modular, decoupled, and testable without convoluted or premature abstractions.

---

## 🚫 Absolute Bans

| Anti-Pattern | Why It Is Banned | Enforced Alternative |
|---|---|---|
| **God Classes / Mega-Services** | Classes handling multiple concerns violate SRP, cause merge conflicts, and are impossible to unit test. | Decompose into focused single-responsibility services (e.g., `OrderValidator`, `PricingEngine`, `PaymentGateway`). |
| **Direct Persistence in Controllers** | Embedding database queries directly into route handlers tightly couples HTTP with persistence. | Encapsulate database access in repository classes or domain data mappers. |
| **Untyped Domain Contracts (\`any\`)** | Using \`any\` destroys compiler safety and masks structural regressions. | Define strict TypeScript interfaces and validate input payloads with Zod schemas. |
| **Coupling to Concrete Implementations** | Depending directly on 3rd-party vendor classes makes unit testing and provider swapping painful. | Invert dependencies (DIP): high-level logic depends on domain interfaces, not vendor SDKs. |
| **Functions Exceeding 40 Lines** | Long methods hide multiple responsibilities and increase cognitive load. | Extract cohesive sub-helpers and pure domain calculation functions. |
| **Premature Abstraction** | Creating deep class hierarchies for single-use logic introduces unnecessary indirection. | Follow KISS and the Rule of Three: keep logic simple until 2+ distinct consumers emerge. |

---

## 🏛️ SOLID Principles Reference

### 1. Single Responsibility Principle (SRP)
* A module or class must have exactly **one reason to change**.
* **Controllers**: Receive HTTP request, parse/validate DTO, delegate to application service, return HTTP response.
* **Services**: Execute domain business logic and coordinate dependencies.
* **Repositories**: Execute database queries and map rows to domain entities.

### 2. Open/Closed Principle (OCP)
* Open for extension, closed for modification.
* Introduce new payment processors, notification channels, or export formats by implementing shared domain interfaces rather than modifying core workflow conditionals (`switch/case`).

### 3. Liskov Substitution Principle (LSP)
* Subclasses or interface implementations must be interchangeable without breaking caller expectations.
* Every payment gateway adapter (`StripeGateway`, `MockGateway`) must return the same contract and throw standard domain exceptions.

### 4. Interface Segregation Principle (ISP)
* Clients must not be forced to depend on methods they do not need.
* Split bloated contracts into cohesive, role-based interfaces (e.g., `OrderReader` vs `OrderWriter`).

### 5. Dependency Inversion Principle (DIP)
* High-level business logic must depend on abstractions (interfaces), never concrete vendor implementations.

---

## 📊 Before & After Refactoring Patterns

### 1. Eliminating the God Class / Monolithic Controller

**❌ Anti-Pattern (Violates SRP, DIP, and Type Safety):**
\`\`\`typescript
export class OrderController {
  async handleCheckout(req: any, res: any) {
    // 1. Inlined validation
    if (!req.body.items || !req.body.cardToken) throw new Error('Invalid');
    
    // 2. Direct tax & discount calculation
    let total = req.body.items.reduce((acc: number, i: any) => acc + i.price * i.qty, 0);
    if (req.body.coupon === 'SAVE10') total *= 0.9;
    
    // 3. Direct vendor call
    const stripe = new Stripe(process.env.STRIPE_KEY!);
    const charge = await stripe.charges.create({ amount: total, source: req.body.cardToken });
    
    // 4. Direct raw database query
    await db.query('INSERT INTO orders (total, charge_id) VALUES ($1, $2)', [total, charge.id]);
    
    // 5. Inlined notification
    await sendgrid.send({ to: req.body.email, subject: 'Receipt', text: 'Paid ' + total });
    res.json({ success: true });
  }
}
\`\`\`

**✅ Approved Pattern (Clean Architecture & SOLID):**
\`\`\`typescript
// Pure application orchestrator depending on abstractions
export class CheckoutUseCase {
  constructor(
    private readonly pricingEngine: PricingEngine,
    private readonly paymentGateway: PaymentGateway,
    private readonly orderRepository: OrderRepository,
    private readonly notificationService: NotificationService
  ) {}

  async execute(dto: CheckoutDTO): Promise<OrderRecord> {
    const pricing = await this.pricingEngine.calculate(dto.items, dto.couponCode);
    const payment = await this.paymentGateway.charge(dto.paymentToken, pricing.total);
    
    const order = await this.orderRepository.save({
      customerId: dto.customerId,
      total: pricing.total,
      transactionId: payment.id,
    });

    await this.notificationService.sendReceipt(dto.customerEmail, order);
    return order;
  }
}
\`\`\`

---

## 🔄 Incremental Refactoring Checklist
1. **Preserve Green Tests**: Verify automated test coverage before refactoring.
2. **Extract Interfaces**: Define domain contracts before replacing concrete references.
3. **Migrate Incrementally**: Move one responsibility at a time in atomic work-unit commits.
4. **Re-verify Zero Regressions**: Run test suite after each atomic extraction.
