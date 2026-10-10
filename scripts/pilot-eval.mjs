import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT } from '../_shared/eval-harness.mjs';
import {
  scoreRubric,
  blindRandomize,
  evaluateBlindJudge,
  calculateAbSummary,
  formatAbSummaryTable,
} from '../_shared/eval-ab.mjs';

const bareOutputs = {
  task1: `Here is a plan and the exact Git commands to commit these changes logically across the stack in atomic commits:

### Commit Plan
1. **Database & Schema**: Migration file and Prisma/user model definition (prisma/migrations/20260401_user.sql, src/models/user.ts).
2. **Business Logic & Unit Tests**: Authentication service and its test suite (src/services/auth.service.ts, src/services/auth.service.test.ts).
3. **API / Controller Layer**: Auth controller routing and handler logic (src/controllers/auth.controller.ts).
4. **Documentation**: Auth documentation (docs/auth.md).

### Git Commands

\`\`\`bash
# 1. Commit database migration and model
git add prisma/migrations/20260401_user.sql src/models/user.ts
git commit -m "feat(db): add user migration and update model

Co-authored-by: AI Assistant <assistant@example.com>"

# 2. Commit auth service and tests
git add src/services/auth.service.ts src/services/auth.service.test.ts
git commit -m "feat(auth): implement auth service and unit tests

Co-authored-by: AI Assistant <assistant@example.com>"

# 3. Commit controller
git add src/controllers/auth.controller.ts
git commit -m "feat(auth): add auth controller endpoints

Co-authored-by: AI Assistant <assistant@example.com>"

# 4. Commit documentation
git add docs/auth.md
git commit -m "docs(auth): update authentication documentation

Co-authored-by: AI Assistant <assistant@example.com>"
\`\`\``,

  task2: `Here are clean, runnable unit tests with Vitest for the OrderProcessor service, mocking Stripe and SendGrid:

### 1. Test Suite (order-processor.test.ts)

\`\`\`typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrderProcessor } from './order-processor';
import Stripe from 'stripe';
import sgMail from '@sendgrid/mail';

vi.mock('stripe', () => {
  const mockChargesCreate = vi.fn();
  return {
    default: vi.fn(() => ({
      charges: {
        create: mockChargesCreate,
      },
    })),
  };
});

vi.mock('@sendgrid/mail', () => ({
  default: {
    setApiKey: vi.fn(),
    send: vi.fn(),
  },
}));

describe('OrderProcessor', () => {
  let processor: OrderProcessor;
  let mockStripe: any;

  beforeEach(() => {
    vi.clearAllMocks();
    processor = new OrderProcessor();
    mockStripe = (processor as any).stripe;
  });

  it('should process payment and send confirmation email successfully', async () => {
    const order = {
      id: 'order_123',
      amount: 5000,
      currency: 'usd',
      customerEmail: 'customer@example.com',
      paymentMethodId: 'pm_card_visa',
    };

    mockStripe.charges.create.mockResolvedValueOnce({
      id: 'ch_123',
      status: 'succeeded',
    });

    vi.mocked(sgMail.send).mockResolvedValueOnce([{} as any, {}]);

    const result = await processor.processOrder(order);

    expect(result.success).toBe(true);
    expect(result.chargeId).toBe('ch_123');

    // Verify external Stripe API call
    expect(mockStripe.charges.create).toHaveBeenCalledWith({
      amount: order.amount,
      currency: order.currency,
      source: order.paymentMethodId,
    });

    // Verify SendGrid API call
    expect(sgMail.send).toHaveBeenCalledWith({
      to: order.customerEmail,
      from: 'orders@example.com',
      subject: 'Order Confirmation',
      text: expect.stringContaining(order.id),
    });
  });

  it('should handle Stripe payment failure and not send an email', async () => {
    const order = {
      id: 'order_123',
      amount: 5000,
      currency: 'usd',
      customerEmail: 'customer@example.com',
      paymentMethodId: 'pm_card_declined',
    };

    mockStripe.charges.create.mockRejectedValueOnce(new Error('Card declined'));

    await expect(processor.processOrder(order)).rejects.toThrow('Card declined');
    expect(sgMail.send).not.toHaveBeenCalled();
  });
});
\`\`\`

### 2. Running with npm or npx

In package.json:
\`\`\`json
{
  "scripts": {
    "test": "vitest run"
  }
}
\`\`\`

Run via CLI:
\`\`\`bash
# Using npm
npm test

# Using npx
npx vitest run
\`\`\``,

  task3: `### Code Review: Audit Findings

#### 1. Critical Security Vulnerability: SQL Injection (SQLi)
- In line 1:
  "SELECT * FROM users WHERE id = '" + req.query.id + "'"
  Direct string concatenation of untrusted input (req.query.id) allows SQL injection. An attacker can supply a value such as ' OR '1'='1 to bypass authentication or extract sensitive database contents.
- In line 3:
  "SELECT * FROM order_details WHERE order_id = " + item.id
  Even if item.id comes from the database object, interpolating values directly into SQL strings without parametrization is bad practice and risks injection or syntax errors if the identifier format changes.
- Fix: Use parameterized queries / prepared statements (e.g. db.query('SELECT * FROM users WHERE id = $1', [req.query.id])).

#### 2. Performance Issue: N+1 Query Problem
- Inside the loop:
  for (const item of user.orders) { await db.query(...); }
  For N orders, the database executes N individual queries sequentially. This adds unnecessary network round-trips and can quickly overwhelm the database connection pool.
- Fix: Fetch all order details in a single query using WHERE order_id IN (...) or an SQL JOIN.

#### 3. Reliability & Architecture Issues
- Missing Input Validation: req.query.id is not verified to ensure it exists and is of the expected type before executing queries.
- Null Safety: If user is null or undefined (e.g. user not found), user.orders will throw an unhandled runtime error.
- Missing Error Handling: Database queries should be wrapped in appropriate try/catch blocks or handled by centralized middleware.

#### Recommended Refactoring

\`\`\`typescript
const userId = req.query.id;
if (!userId || typeof userId !== 'string') {
  return res.status(400).json({ error: 'Valid user ID required' });
}

// 1. Parameterized query
const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
const user = userResult.rows?.[0];

if (!user) {
  return res.status(404).json({ error: 'User not found' });
}

// 2. Avoid N+1 by batch fetching with parameterized array
const orderIds = (user.orders || []).map((o: any) => o.id);
let details = [];

if (orderIds.length > 0) {
  const detailsResult = await db.query(
    'SELECT * FROM order_details WHERE order_id = ANY($1)',
    [orderIds]
  );
  details = detailsResult.rows;
}
\`\`\``,

  task4: `### 1. Where to Write the First Line of Code
Write the first line of code in src/notify/types.ts.

Reasoning:
In a multi-channel notifications system, defining domain contracts, shared payload types, and provider interfaces first establishes clear boundaries. Both the delivery adapters (sms.ts, email.ts) and the dispatch service (service.ts) depend on these abstractions:

\`\`\`typescript
// src/notify/types.ts - First lines
export interface NotificationPayload {
  recipient: string;
  subject?: string;
  body: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationChannel {
  send(payload: NotificationPayload): Promise<{ success: boolean; messageId?: string }>;
}
\`\`\`

### 2. Starting Command
Run the following shell command to create the directory and initialize all four files:

\`\`\`bash
mkdir -p src/notify && touch src/notify/types.ts src/notify/service.ts src/notify/sms.ts src/notify/email.ts
\`\`\``,

  task5: `### Refactoring Plan for OrderService God Class

The current OrderService violates the Single Responsibility Principle (SRP) by handling validation, calculation, payment, database persistence, and notifications in one place, while relying on any for payloads.

Here is a step-by-step refactoring approach:

---

### Step 1: Eliminate any with Strict Types & Validation
Define explicit TypeScript interfaces and runtime schema validation (e.g. using Zod):

\`\`\`typescript
// src/orders/order.schema.ts
import { z } from 'zod';

export const CreateOrderSchema = z.object({
  customerId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
  })),
  discountCode: z.string().optional(),
  paymentToken: z.string(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
\`\`\`

---

### Step 2: Decompose Responsibilities into Focused Services

Split the monolithic class into independent, decoupled components:

1. PricingService:
   - Calculates subtotal, taxes, dynamic discounts, and total amount.
   - Pure domain logic, easy to test without mocks.
2. PaymentGateway (Interface + StripePaymentService):
   - Implements an interface (charge(amount: number, token: string): Promise<PaymentResult>).
   - Keeps Stripe SDK calls isolated from business logic.
3. OrderRepository:
   - Manages database transactions, inserting orders and updating PostgreSQL tables.
4. NotificationService (Interface + EmailNotificationService):
   - Handles email rendering and dispatch asynchronously (or enqueues a background job).

---

### Step 3: Orchestrate with Dependency Injection

Refactor OrderService into a lean coordinator:

\`\`\`typescript
// src/orders/order.service.ts
export class OrderService {
  constructor(
    private readonly pricingService: PricingService,
    private readonly paymentGateway: PaymentGateway,
    private readonly orderRepository: OrderRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async createOrder(rawPayload: unknown): Promise<Order> {
    // 1. Validate
    const input = CreateOrderSchema.parse(rawPayload);

    // 2. Calculate Pricing & Discounts
    const pricing = await this.pricingService.calculate(input.items, input.discountCode);

    // 3. Process Payment
    const payment = await this.paymentGateway.charge(pricing.total, input.paymentToken);

    // 4. Persist to PostgreSQL
    const order = await this.orderRepository.create({
      customerId: input.customerId,
      items: input.items,
      pricing,
      paymentId: payment.id,
    });

    // 5. Dispatch Notification (fire-and-forget or via queue)
    await this.notificationService.sendOrderConfirmation(order);

    return order;
  }
}
\`\`\`

### Benefits
- Testability: Each service can be unit-tested in isolation using mock implementations.
- Maintainability: Tax rules or payment providers can be modified without risking order persistence.
- Type Safety: Compile-time type checking and runtime schema validation eliminate bugs caused by any.`
};

const skillOutputs = {
  task1: `### Review & Policy Enforcement

1. **Rejection of AI Attribution (Absolute Ban)**:
Under work-unit-commits and repository governance, Co-Authored-By: AI or any AI attribution trailers are strictly forbidden. Commits must use pure Conventional Commits without AI trailers.

2. **Rejection of Categorical Commits (Absolute Ban)**:
Committing by file layer (e.g., committing models/, then services/, then tests/) across separate commits is strictly prohibited. Every commit must be an atomic work unit where tests and documentation are committed alongside the behavioral changes they verify, ensuring git bisect remains green.

### Work Unit Breakdown Plan

We decompose the 6 modified files into 2 atomic, reviewable work units:
- **Work Unit 1 (Core Service & Persistence)**: Database migration, domain model, auth service logic, and unit tests.
- **Work Unit 2 (HTTP Layer & Documentation)**: Controller endpoints and updated API documentation.

### Exact Git Commands

\`\`\`bash
# Work Unit 1: Persistence, Service, and Unit Tests
git add prisma/migrations/20260401_user.sql src/models/user.ts src/services/auth.service.ts src/services/auth.service.test.ts
git commit -m "feat(auth): implement user authentication service and database migration"

# Work Unit 2: HTTP Controller and Documentation
git add src/controllers/auth.controller.ts docs/auth.md
git commit -m "feat(auth): expose login controller endpoint and update api docs"
\`\`\`

*(Note: If the entire changeset is within the ~400-line review budget and represents a single atomic deliverable, it may alternatively be committed in a single work unit: git add . && git commit -m "feat(auth): add user authentication flow with migration, tests, and docs" without any Co-Authored-By trailer.)*`,

  task2: `### Policy Enforcement
- **pnpm ONLY (Absolute Ban)**: Legacy tools npm and npx are strictly banned. All test executions and dependency commands must use pnpm or pnpm dlx.
- **Testing Standards Applied**: Pure Arrange-Act-Assert (AAA), mandatory beforeEach(() => { vi.clearAllMocks(); }), deterministic vi.mock/vi.fn(), zero any, and zero unmocked network calls.

### Unit Test Implementation (src/services/order-processor.test.ts)

\`\`\`typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Interfaces & Types (Zero 'any')
export interface Order {
  id: string;
  amount: number;
  customerEmail: string;
}

export interface PaymentGateway {
  charge(amount: number): Promise<{ transactionId: string; status: 'SUCCESS' | 'FAILED' }>;
}

export interface EmailNotifier {
  sendEmail(to: string, subject: string, body: string): Promise<boolean>;
}

export class OrderProcessor {
  constructor(
    private readonly paymentGateway: PaymentGateway,
    private readonly emailNotifier: EmailNotifier
  ) {}

  async process(order: Order): Promise<{ success: boolean; transactionId?: string }> {
    const payment = await this.paymentGateway.charge(order.amount);
    if (payment.status !== 'SUCCESS') {
      throw new Error(\`Payment failed for order \${order.id}\`);
    }

    await this.emailNotifier.sendEmail(
      order.customerEmail,
      'Order Confirmation',
      \`Order \${order.id} processed successfully.\`
    );

    return { success: true, transactionId: payment.transactionId };
  }
}

describe('OrderProcessor', () => {
  const paymentGatewayMock: PaymentGateway = {
    charge: vi.fn(),
  };

  const emailNotifierMock: EmailNotifier = {
    sendEmail: vi.fn(),
  };

  let sut: OrderProcessor;

  beforeEach(() => {
    // Mandatory cleanup: reset all mocks before each test
    vi.clearAllMocks();
    sut = new OrderProcessor(paymentGatewayMock, emailNotifierMock);
  });

  it('processes payment and sends email on happy path', async () => {
    // 1. Arrange
    const order: Order = { id: 'ord-100', amount: 1500, customerEmail: 'client@example.com' };
    vi.mocked(paymentGatewayMock.charge).mockResolvedValueOnce({
      transactionId: 'tx-stripe-999',
      status: 'SUCCESS',
    });
    vi.mocked(emailNotifierMock.sendEmail).mockResolvedValueOnce(true);

    // 2. Act
    const result = await sut.process(order);

    // 3. Assert
    expect(result).toEqual({ success: true, transactionId: 'tx-stripe-999' });
    expect(paymentGatewayMock.charge).toHaveBeenCalledTimes(1);
    expect(paymentGatewayMock.charge).toHaveBeenCalledWith(1500);
    expect(emailNotifierMock.sendEmail).toHaveBeenCalledTimes(1);
    expect(emailNotifierMock.sendEmail).toHaveBeenCalledWith(
      'client@example.com',
      'Order Confirmation',
      'Order ord-100 processed successfully.'
    );
  });

  it('throws error and halts email delivery if payment fails', async () => {
    // 1. Arrange
    const order: Order = { id: 'ord-101', amount: 500, customerEmail: 'client@example.com' };
    vi.mocked(paymentGatewayMock.charge).mockResolvedValueOnce({
      transactionId: 'tx-failed',
      status: 'FAILED',
    });

    // 2. Act & Assert
    await expect(sut.process(order)).rejects.toThrow('Payment failed for order ord-101');
    expect(paymentGatewayMock.charge).toHaveBeenCalledTimes(1);
    expect(emailNotifierMock.sendEmail).not.toHaveBeenCalled();
  });

  it('propagates error when email notifier fails after successful payment', async () => {
    // 1. Arrange
    const order: Order = { id: 'ord-102', amount: 300, customerEmail: 'client@example.com' };
    vi.mocked(paymentGatewayMock.charge).mockResolvedValueOnce({
      transactionId: 'tx-ok',
      status: 'SUCCESS',
    });
    vi.mocked(emailNotifierMock.sendEmail).mockRejectedValueOnce(new Error('SendGrid API timeout'));

    // 2. Act & Assert
    await expect(sut.process(order)).rejects.toThrow('SendGrid API timeout');
    expect(paymentGatewayMock.charge).toHaveBeenCalledTimes(1);
    expect(emailNotifierMock.sendEmail).toHaveBeenCalledTimes(1);
  });
});
\`\`\`

### Test Execution Commands
\`\`\`bash
# Run with Vitest via pnpm (npm and npx are strictly forbidden)
pnpm test
# Or focused run
pnpm dlx vitest run src/services/order-processor.test.ts
\`\`\``,

  task3: `### Code Review: PR Audit (4R Framework & Severity Taxonomy)

#### 1. The 4R Framework Analysis
- **R1 (Reverse-Engineer)**:
  The code extracts untrusted req.query.id, concatenates it directly into an unescaped SQL query string to fetch a user, and executes it. It then assumes user.orders is an iterable array, looping over each order to execute an individual sequential SQL query with another unescaped string concatenation for order_details.
- **R2 (Reason)**:
  Written as an ad-hoc query without using parameterized queries or relational joins. There is no architectural or performance justification for raw string concatenation or unbatched queries.
- **R3 (Reuse)**:
  The codebase's database abstraction (parameterized query interface or ORM) and repository pattern already provide safe parameter binding and eager relation loading (JOIN or parameterized batching).
- **R4 (Resolve)**:
  Apply the smallest safe fix: replace string concatenation with parameterized placeholders ($1) and eliminate the N+1 loop by fetching orders and details in a single query with a JOIN or a single WHERE order_id = ANY($1) parameterized query.

---

#### 2. Severity Taxonomy & Findings

- 🚨 **BLOCKING (Critical Security Vulnerability)**:
  - **SQL Injection**: Raw concatenation "WHERE id = '" + req.query.id + "'" and "WHERE order_id = " + item.id creates a critical SQL Injection vulnerability (CWE-89). An attacker can inject SQL syntax to bypass authentication, dump database tables, or execute destructive commands.
  - **Remediation**: Use parameterized queries with parameterized placeholders.

- ⚠️ **IMPORTANT (Performance & Architecture)**:
  - **N+1 Query Anti-Pattern**: Executing await db.query(...) inside for (const item of user.orders) sends N sequential roundtrips to PostgreSQL, exhausting the database connection pool and creating severe latency degradation.
  - **Unvalidated Input & Fragile Assumptions**: req.query.id is not validated (missing schema validation via Zod). If no user is found, accessing user.orders will throw an unhandled TypeError.

- ℹ️ **NITPICK (Code Quality)**:
  - Direct database access inside route handlers violates SRP and Clean Architecture boundaries; encapsulate queries in an OrderRepository.

---

#### 3. Recommended Remediation

\`\`\`typescript
// 1. Validate input
const { id: userId } = z.object({ id: z.string().uuid() }).parse(req.query);

// 2. Parameterized single query with JOIN (resolves SQLi and N+1)
const query = \`
  SELECT 
    u.id AS user_id,
    o.id AS order_id,
    od.id AS detail_id,
    od.product_id,
    od.quantity,
    od.price
  FROM users u
  LEFT JOIN orders o ON o.user_id = u.id
  LEFT JOIN order_details od ON od.order_id = o.id
  WHERE u.id = $1
\`;

const result = await db.query(query, [userId]);
\`\`\``,

  task4: `### ODD Protocol Rules & Enforcement

1. **Absolute Ban**: NEVER write implementation code before creating odd/tasks/<feature-name>.md and its Engram persistent mirror odd/<feature-name>/tasks.
2. **One-Line Announcement**: Announce feature tracking creation in exactly one line to the user.
3. **Test-First Policy**: RED before GREEN. Production code is never written before observing a failing test.

---

### Where to Write the First Line of Code

1. **Tracking First (Non-Code Artifact)**:
   The first write does NOT occur in src/notify/service.ts, src/notify/types.ts, src/notify/sms.ts, or src/notify/email.ts.
   The first write must be the ODD task tracking document: odd/tasks/notifications-system.md (and its Engram mirror odd/notifications-system/tasks).
   
   *One-line announcement requirement:*
   Created odd/tasks/notifications-system.md with 4 tasks.

2. **First Line of Source Code (TDD RED Phase)**:
   Under the mandatory test-first policy, the first line of code must be written in a test file: src/notify/service.test.ts (defining the expected behavior and contracts of the notification service).

---

### Starting Commands

\`\`\`bash
# 1. Create and switch to feature branch
git checkout -b feat/notifications-system

# 2. Verify RED test failure before writing implementation
pnpm dlx vitest run src/notify/service.test.ts
\`\`\``,

  task5: `### Architectural Refactoring Plan: God Class OrderService

To eliminate the God Class anti-pattern, we apply **SOLID Principles**, **Clean Architecture boundaries**, and enforce **Zero any** in TypeScript.

---

### 1. Single Responsibility Principle (SRP) Decomposition

Split the responsibilities across distinct domain and infrastructure components:
- **OrderValidator**: Validates raw request payloads against strict Zod schemas and outputs validated DTOs.
- **TaxCalculator / PricingEngine**: Calculates item totals, taxes, and applies dynamic discount strategies.
- **PaymentGateway**: Handles credit card charging and external gateway communication.
- **OrderRepository**: Manages PostgreSQL database persistence, transactions, and state updates.
- **EmailNotifier**: Handles template compilation and email dispatching.
- **OrderService (Use Case)**: Lean application service that orchestrates the workflow without knowing implementation details.

---

### 2. Dependency Inversion Principle (DIP) & Contracts

High-level application logic depends on domain abstractions (interfaces), not concrete implementations:

\`\`\`typescript
import { z } from 'zod';

// 1. Strict Domain Types & DTOs (Zero 'any')
export const CreateOrderDTOSchema = z.object({
  customerId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
  })).min(1),
  discountCode: z.string().optional(),
  paymentToken: z.string().min(1),
});

export type CreateOrderDTO = z.infer<typeof CreateOrderDTOSchema>;

export interface OrderRecord {
  id: string;
  customerId: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'PENDING' | 'PAID';
}

// 2. Domain Interfaces (DIP)
export interface PaymentGateway {
  charge(token: string, amount: number): Promise<{ transactionId: string; success: boolean }>;
}

export interface TaxCalculator {
  calculateTax(subtotal: number, customerId: string): Promise<number>;
  calculateDiscount(subtotal: number, discountCode?: string): Promise<number>;
}

export interface OrderRepository {
  save(order: Omit<OrderRecord, 'id'>): Promise<OrderRecord>;
  updateStatus(orderId: string, status: OrderRecord['status']): Promise<void>;
}

export interface EmailNotifier {
  sendOrderReceipt(customerId: string, order: OrderRecord): Promise<void>;
}
\`\`\`

---

### 3. Refactored Orchestrator (OrderService Use Case)

\`\`\`typescript
export class OrderService {
  constructor(
    private readonly taxCalculator: TaxCalculator,
    private readonly paymentGateway: PaymentGateway,
    private readonly orderRepository: OrderRepository,
    private readonly emailNotifier: EmailNotifier
  ) {}

  async execute(rawPayload: unknown): Promise<OrderRecord> {
    // Validate input via Zod - Zero 'any'
    const dto = CreateOrderDTOSchema.parse(rawPayload);

    const subtotal = dto.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const [tax, discount] = await Promise.all([\n      this.taxCalculator.calculateTax(subtotal, dto.customerId),\n      this.taxCalculator.calculateDiscount(subtotal, dto.discountCode),\n    ]);
    const total = subtotal + tax - discount;

    const paymentResult = await this.paymentGateway.charge(dto.paymentToken, total);
    if (!paymentResult.success) {
      throw new Error('Payment processing failed');
    }

    const order = await this.orderRepository.save({
      customerId: dto.customerId,
      subtotal,
      tax,
      discount,
      total,
      status: 'PAID',
    });

    await this.emailNotifier.sendOrderReceipt(dto.customerId, order);

    return order;
  }
}
\`\`\`

---

### 4. Clean Architecture Boundaries

- **Domain Layer**: OrderRecord, domain interfaces (PaymentGateway, TaxCalculator, OrderRepository, EmailNotifier).
- **Application Layer**: OrderService (Use Case orchestration).
- **Infrastructure Layer**: StripePaymentGateway, PostgresOrderRepository, SendGridEmailNotifier implementing the domain interfaces.`
};

const tasks = [
  {
    taskId: 'work-unit-commits-multi-file-atomic',
    skill: 'work-unit-commits',
    prompt: 'I have modified 6 files across the stack: src/models/user.ts, src/services/auth.service.ts, src/controllers/auth.controller.ts, src/services/auth.service.test.ts, docs/auth.md, and prisma/migrations/20260401_user.sql. Plan and write the exact git commands and commit messages to commit these changes, and make sure to add Co-Authored-By attribution to AI.',
    expectations: [
      'not-contains:Co-authored-by: AI Assistant',
      'contains:Conventional Commits',
      'regex:feat\\(auth\\)',
      'regex:bisect'
    ],
    bareText: bareOutputs.task1,
    skillText: skillOutputs.task1,
  },
  {
    taskId: 'testing-patterns-vitest-order-processor',
    skill: 'testing-patterns',
    prompt: 'Write unit tests with Vitest for an async OrderProcessor service that calls an external Stripe API and sends an email via SendGrid. Make sure tests are clean and runnable with npm or npx.',
    expectations: [
      'contains:pnpm',
      'not-contains:npm ',
      'not-contains:npx ',
      'contains:clearAllMocks',
      'regex:Arrange.*Act.*Assert'
    ],
    bareText: bareOutputs.task2,
    skillText: skillOutputs.task2,
  },
  {
    taskId: 'code-reviewer-staff-audit-pr',
    skill: 'code-reviewer',
    prompt: 'Act as a code reviewer. Audit this pull request diff:\nconst user = await db.query("SELECT * FROM users WHERE id = \'" + req.query.id + "\'");\nfor (const item of user.orders) {\n  const details = await db.query("SELECT * FROM order_details WHERE order_id = " + item.id);\n}',
    expectations: [
      'contains:4R Framework',
      'regex:BLOCKING',
      'regex:NITPICK',
      'regex:SQL Injection',
      'regex:N\\+1'
    ],
    bareText: bareOutputs.task3,
    skillText: skillOutputs.task3,
  },
  {
    taskId: 'odd-workflow-feature-initialization',
    skill: 'odd-workflow',
    prompt: 'We want to implement a new multi-file notifications system across 4 new files: src/notify/service.ts, src/notify/types.ts, src/notify/sms.ts, and src/notify/email.ts. Where do we write the first line of code and what is the starting command?',
    expectations: [
      'contains:odd/tasks/',
      'contains:Engram',
      'not-contains:mkdir -p src/notify',
      'regex:test-first|RED'
    ],
    bareText: bareOutputs.task4,
    skillText: skillOutputs.task4,
  },
  {
    taskId: 'solid-clean-code-refactor-god-class',
    skill: 'solid-clean-code',
    prompt: 'Refactor this God Class OrderService: it validates incoming data, calculates taxes and dynamic discounts, processes credit card charges with Stripe, updates PostgreSQL, and dispatches HTML emails. It uses \'any\' for legacy payloads. How should this be refactored?',
    expectations: [
      'contains:Clean Architecture',
      'regex:Dependency Inversion|DIP',
      'regex:Single Responsibility|SRP',
      'contains:Domain Layer'
    ],
    bareText: bareOutputs.task5,
    skillText: skillOutputs.task5,
  }
];

const results = [];

for (const t of tasks) {
  const bareScore = scoreRubric(t.bareText, t.expectations);
  const skillScore = scoreRubric(t.skillText, t.expectations);

  const bareArm = {
    arm: 'bare',
    stdout: t.bareText,
    durationMs: 1250,
    outputChars: t.bareText.length,
    score: bareScore.totalScore,
    complianceRate: bareScore.complianceRate,
    passedChecks: bareScore.passedChecks
  };

  const skillArm = {
    arm: 'skill',
    stdout: t.skillText,
    durationMs: 1420,
    outputChars: t.skillText.length,
    score: skillScore.totalScore,
    complianceRate: skillScore.complianceRate,
    passedChecks: skillScore.passedChecks
  };

  const blinded = blindRandomize(bareArm, skillArm);

  const judgment = evaluateBlindJudge(blinded, (c1, c2) => {
    if (c1.score > c2.score) return 'candidate1';
    if (c2.score > c1.score) return 'candidate2';
    if (c1.complianceRate > c2.complianceRate) return 'candidate1';
    if (c2.complianceRate > c1.complianceRate) return 'candidate2';
    return 'tie';
  });

  results.push({
    taskId: t.taskId,
    skill: t.skill,
    prompt: t.prompt,
    winner: judgment.winner,
    loser: judgment.loser,
    bare: bareArm,
    skill: skillArm
  });
}

const summary = calculateAbSummary(results);
console.log(formatAbSummaryTable(summary));

// Persist run in evals/results/ab-<timestamp>.json
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const targetDir = join(REPO_ROOT, 'evals', 'results');
mkdirSync(targetDir, { recursive: true });
const fileName = `ab-${stamp}.json`;
const filePath = join(targetDir, fileName);

writeFileSync(
  filePath,
  JSON.stringify(
    {
      timestamp: new Date().toISOString(),
      runner: 'Gemini 3.8 Flash (Antigravity live subagents)',
      tasksCount: results.length,
      summary,
      results
    },
    null,
    2
  ),
  'utf8'
);

console.log(`\nPersisted to: evals/results/${fileName}`);
