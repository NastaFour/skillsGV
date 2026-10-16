---
name: postgresql
description: Relational database design, indexing strategy, and administration using PostgreSQL. Covers schema layout (3NF, constraints, TIMESTAMPTZ), composite and partial indexes, foreign key cascading, query optimization, ACID transaction boundaries, and secure pg_dump routines. Use when designing schemas, adding indexes, optimizing queries, or configuring database backups. Do NOT use for NoSQL or document store design.
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*) Read
metadata:
  trigger: ["postgresql", "base de datos", "índices", "ACID", "pg_dump", "database schema", "relational design"]
  scope: [global, project]
  version: "2.0.0"
---

# 🐘 PostgreSQL Database Design & Administration

Universal relational database standards, indexing strategy, and transactional integrity for PostgreSQL.

---

## 🚨 Relational Design Standards

1. **Schema Integrity & Types**:
   - Every table MUST have an immutable primary key (preferably `UUID` / `gen_random_uuid()` or autoincrementing `BIGINT`).
   - Use `TIMESTAMPTZ` for all timestamps with default `NOW()`; avoid naive `TIMESTAMP` without timezone.
   - Enforce strong referential integrity through foreign keys with explicit cascade actions (`ON DELETE RESTRICT` for financial/audit data, `ON DELETE CASCADE` for parent-child ownership).
   - Use database-level constraints (`CHECK`, `UNIQUE`) to enforce business invariants at the persistence layer (e.g. `amount >= 0`, `status IN (...)`).

2. **Index Strategy**:
   - Always index foreign key columns used in `JOIN` conditions.
   - Create composite indexes matching frequent query patterns (`tenant_id, created_at DESC`), ordering columns from highest selectivity to lowest.
   - Use partial indexes for soft-deletes or status queues to keep index size minimal:
     ```sql
     CREATE INDEX idx_users_active_email ON users(email) WHERE deleted_at IS NULL;
     CREATE INDEX idx_jobs_pending ON background_jobs(priority DESC, scheduled_at) WHERE status = 'PENDING';
     ```
   - Avoid over-indexing: each index adds overhead to `INSERT`, `UPDATE`, and `DELETE`.

3. **ACID Transactions**:
   - Wrap operations that mutate multiple related entities in an explicit transaction block (`BEGIN ... COMMIT / ROLLBACK`).
   - Guarantee atomicity (e.g., deducting an inventory count and creating a line item in one atomic boundary).
   - Roll back immediately on invariant violations with clear diagnostic codes.

---

## 🔒 Security & Backups

1. **SQL Injection Mitigation**:
   - NEVER build SQL queries dynamically through string interpolation or concatenation.
   - Always use prepared statements and parameterized queries via the driver or ORM.

2. **Automated Backups & Disaster Recovery**:
   - Establish daily automated `pg_dump` cron jobs.
   - Store backups offsite in encrypted object storage (e.g. S3 / GCS with CMEK or GPG encryption).
   - Never write unencrypted raw database dumps to shared disk volumes.
   - Maintain a 30-day retention schedule with point-in-time recovery (PITR) for critical workloads.

---

## 📚 Reference Models & Templates

- **Reference Architecture Schema**: [`references/schema-reference.md`](references/schema-reference.md) provides an illustrative multi-role and transactional e-commerce schema. Use it as a structural example; real project schemas MUST be derived from `PRD.md` and `TRD.md`.
- **Prisma Integration**: When accessing PostgreSQL through Prisma, see [`../prisma-orm/SKILL.md`](../prisma-orm/SKILL.md).
