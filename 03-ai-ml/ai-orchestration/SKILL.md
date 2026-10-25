---
name: ai-orchestration
description: "Guidelines for managing multi-agent orchestrations. Enforces Chain of Thought (CoT) reasoning traces, progressive execution stages, explicit state machines, evaluator-optimizer loops, and human-in-the-loop verification hooks. Use when coordinating multiple LLM agents or staged AI workflows. Do not use for simple single-prompt completions."
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*) Read
metadata:
  trigger: ["orquestación AI", "multi-agente", "chain of thought", "progressive prompting", "agent orchestration"]
  scope: [global, project]
  version: "1.1.0"
---

# 🤖 AI Orchestration (Multi-Agent Design Patterns)

Use this skill when designing systems where multiple LLM calls, specialist workers, or deterministic tools coordinate to solve complex user or backend tasks.

---

## 🚨 Multi-Agent Orchestration Guardrails

1. **Explicit State Machine Management**:
   - Maintain an explicit workflow state object (persisted in PostgreSQL, Redis, or durable execution state) that tracks the lifecycle of each step (`PENDING | RUNNING | NEEDS_APPROVAL | COMPLETED | FAILED`).
   - Do not rely solely on unstructured chat history to track multi-step progress. Pass compact, typed state handoffs between agents.

2. **Structured Reasoning Traces (CoT)**:
   - Prompt router and planner agents to emit structured reasoning before selecting tools or delegating subtasks.
   - Include a bounded `reasoningSummary` or `rationale` field in structured output schemas so observability pipelines can audit why a route or tool was chosen.

3. **Progressive Execution Stages (Router → Specialist → Evaluator)**:
   - Avoid monolithic prompts that attempt intent classification, retrieval, mutation planning, and compliance checking in one fragile step.
   - Decompose workflows into composable stages:
     - **Stage 1 (Router & Intent Classification)**: Parse user input, validate constraints, and route to the appropriate specialist workflow.
     - **Stage 2 (Context & Tool Retrieval)**: Query authorized knowledge bases, APIs, or domain records matching the classified intent.
     - **Stage 3 (Specialist Worker Synthesis)**: Generate the structured proposal, artifact, or action plan from verified context.
     - **Stage 4 (Evaluator / Verifier Gate)**: Validate schema compliance, policy rules, and factual grounding before emitting the result.

4. **Human-in-the-Loop (HITL) Safeguards**:
   - Any high-consequence, financial, or irreversible state-mutating action proposed by an agent must pause at a `NEEDS_APPROVAL` checkpoint.
   - **Prohibited**: Allowing an autonomous agent loop to execute destructive mutations or external billing actions without explicit policy bounds and human confirmation.
   - **Required**: Persist the proposed action payload and require an authenticated reviewer's confirmation before committing the mutation.

---

## 🏗️ Universal Orchestration Topology (Router → Workers → Verifier)

```text
                        [Incoming Request / Event]
                                    │
                                    ▼ (Stage 1: Intent & Triage)
                             [Router Agent]
                     (Classifies intent & risk level)
                                    │
                 ┌──────────────────┴──────────────────┐
                 ▼ (Stage 2A: Retrieval)               ▼ (Stage 2B: Computation)
       [Knowledge Specialist]                [Domain Task Worker]
   (Queries vector/SQL context)         (Executes deterministic tools)
                 │                                     │
                 └──────────────────┬──────────────────┘
                                    ▼ (Stage 3: Quality & Safety Gate)
                          [Evaluator / Verifier]
                   (Checks schema, grounding & policies)
                                    │
                                    ▼ (Stage 4: Conditional HITL)
                       [Human Approval Checkpoint]
                    (Required if riskLevel === 'HIGH')
```

- **Traceability**: Every stage writes its input hash, latency, token usage, and structured decision to the workflow audit log (`correlationId`) for observability and MLOps evaluation (`03-ai-ml/ai-scalability-mlops/SKILL.md`).
- **Bounded Retries**: If the **Evaluator / Verifier** rejects an output due to schema or policy violations, feed the deterministic validation error back to the **Specialist Worker** for at most `N` (typically 2) self-correction turns before escalating.

## 🚀 Floor, Not Ceiling (`[Beyond-Baseline]`)

This staged topology is the baseline for reliable multi-agent systems. You are encouraged to adopt higher-leverage orchestration patterns when justified (annotate with `[Beyond-Baseline: <reason>]`):
- **Single-Agent with Tool Use First**: If a task can be solved deterministically by a single model invocation with well-typed tools, prefer a single agent over multi-agent complexity.
- **Durable Execution Engines**: Use Temporal, Inngest, LangGraph, or Cloudflare Workflows for long-running, resumable state machines with automatic retries and human-approval webhooks.
