---
name: prisma-orm
description: Database access management using Prisma ORM. Covers schema design, type mapping, custom query safety, migrations, and relationship enforcement. Use when creating or modifying a Prisma schema, running migrations, or writing queries. Do NOT use for raw SQL administration or non-relational database design.
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*) Read
metadata:
  trigger: ["prisma", "ORM", "schema.prisma", "migraciones", "seed"]
  scope: [global, project]
  version: "1.1.0"
---

# 💎 Prisma ORM Integration (v5+ Standards)

> [!IMPORTANT]
> Consult [_shared/references/docs-cache/prisma-orm.md](../../_shared/references/docs-cache/prisma-orm.md) before querying Context7

Use this skill when designing `schema.prisma`, running migrations, or writing prisma client queries.

## 🚨 Implementation Standards

1. **Schema Design**:
   - Model all relations explicitly using Prisma `@relation` tags.
   - Enforce database-level defaults (`autoincrement()`, `dbgenerated("gen_random_uuid()")`).
   - Map roles and status flags using Prisma `enum`.

2. **Audit Raw Queries**:
   - The use of dynamic raw queries (`prisma.$queryRawUnsafe`) is strictly prohibited.
   - If raw SQL is necessary for performance, use `prisma.$queryRaw` with template placeholders to ensure prepared statements are generated automatically:
     ```typescript
     // Safe prepared raw query
     const results = await prisma.$queryRaw`SELECT * FROM "Account" WHERE status = ${status}`;
     ```

3. **Safe Migrations**:
   - Never edit generated SQL migration files manually unless performing advanced table splits.
   - Apply migrations in production using `prisma migrate deploy`. Never run `prisma migrate dev` on a production database.

## 📚 Schema Reference & Project Derivation

El archivo [`references/schema-template.md`](references/schema-template.md) contiene un esquema de e-commerce de referencia para consultar convenciones y sintaxis. El modelo real del proyecto debe derivarse de los requerimientos funcionales en `PRD.md` y la arquitectura técnica en `TRD.md`.

## 🔍 Performance Rules
- Avoid fetching entire tables when only checking IDs. Use `select` to filter properties (`select: { id: true }`).
- Limit relation loads to prevent N+1 queries. Use `include` only for directly required elements.
