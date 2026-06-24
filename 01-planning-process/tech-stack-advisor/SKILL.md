---
name: tech-stack-advisor
description: Autonomously select the optimal technology stack for a new project or feature based exclusively on the developer's known skills and proficiencies. Use this skill when proposing architectures, starting new projects, or dynamically updating the PROJECT_TRACKER.md.
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*) Read
metadata:
  trigger: ["tech stack advisor"]
  scope: [global, project]
  version: "1.0.0"
---

This skill acts as an architectural advisor. It guides the AI to propose, select, and justify technologies for a project by relying strictly on the developer's mastered toolbelt. It prevents the AI from suggesting random frameworks, ensuring high development velocity.

## The Developer's Arsenal (Context)

The developer (Nasta) is highly proficient in the following domains. **ONLY** select technologies from this list when architecting solutions, unless the user explicitly asks to explore something completely new:

### 🎨 Frontend
- **Frameworks**: [React / Vite](../../05-frontend/react-vite/SKILL.md), [Next.js](../../05-frontend/nextjs/SKILL.md)
- **Languages**: [TypeScript](../../06-code-quality/typescript/SKILL.md)
- **Styling**: [Tailwind CSS](../../05-frontend/tailwindcss/SKILL.md) (or Vanilla CSS depending on instructions)

### ⚙️ Backend
- **Core**: [Node.js](../../04-backend/nodejs/SKILL.md), [Express.js](../../04-backend/expressjs/SKILL.md)
- **Database**: [PostgreSQL](../../04-backend/postgresql/SKILL.md)
- **ORM/Data**: [Prisma ORM](../../04-backend/prisma-orm/SKILL.md)

### 🏗️ Arquitectura & DevOps
- **Structure**: [Microservicios](../../04-backend/microservices/SKILL.md), [pnpm Workspaces](../../06-code-quality/pnpm-workspaces/SKILL.md)
- **Real-Time**: [Socket.io](../../04-backend/socketio/SKILL.md)
- **Security**: [JWT / bcryptjs](../../04-backend/jwt-bcrypt/SKILL.md)

### 🧠 Inteligencia Artificial
- **Capabilities**: [AI Orchestration](../../03-ai-ml/ai-orchestration/SKILL.md), [LLM Integration](../../03-ai-ml/llm-integration/SKILL.md)
- **Optimization**: [Prompt Engineering](../../03-ai-ml/prompt-engineering/SKILL.md)
- **Infrastructure**: [API AI Billing](../../03-ai-ml/api-ai-billing/SKILL.md)

### 📱 Apps Multiplataforma
- **Mobile Native**: [React Native](../../05-frontend/react-native/SKILL.md), [Expo](../../05-frontend/expo-production-auditor/SKILL.md)
- **Desktop**: [Electron.js](../../05-frontend/electronjs/SKILL.md)
- **Web App**: [PWA / Capacitor](../../05-frontend/pwa-capacitor/SKILL.md)

## Tech Selection Guidelines

When the user asks you to start a project or suggest an architecture, execute this routine:

1. **Analyze Requirements**: 
   - *¿Es un proyecto centrado en SEO o e-commerce?* -> Sugiere Next.js.
   - *¿Es un panel de administración rápido?* -> Sugiere React + Vite.
   - *¿Necesita chat o notificaciones en vivo?* -> Sugiere Node + Express + Socket.io.
   - *¿Es app de escritorio?* -> Sugiere Electron.js + Vite.
2. **Compile the Stack**: Pick exactly what is needed from the arsenal above. Do not over-engineer.
3. **Present & Justify**: Present the chosen stack to the user, briefly explaining *why* those specific tools from their arsenal are the best fit for this specific project.
4. **Update the Ledger**: Once the user approves the stack, assume the initiative and gracefully update the `Tech Stack` and `Decision Log` sections in the `PROJECT_TRACKER.md` file without being told.

**CRITICAL**: NEVER suggest tools outside of this list (e.g., Do not suggest MongoDB, Vue.js, Angular, Django, Go) unless specifically commanded. Maximize the developer's existing strengths.
