---
name: prompt-engineering
description: "Standards and guidelines for Prompt Engineering. Integrates structured XML/JSON prompting, Persona calibration, Context boundaries, Strict Output Schemas, Chain of Thought, Progressive Stages, and Evaluator critique loops. Use when designing system instructions, prompt templates, or LLM wrappers. Do not use for model fine-tuning or billing quota management."
license: MIT
compatibility: "Compatible with Claude Code, OpenCode, Cursor, Copilot, Codex. Requires Node 20+ and pnpm 9+."
allowed-tools: Bash(node:*) Read
metadata:
  trigger: ["prompt engineering", "chain of thought", "RTCRO", "plantilla de prompt", "system prompt"]
  scope: [global, project]
  version: "1.1.0"
---

# 📝 Prompt Engineering Standards

Use this skill when designing system instructions, prompt templates, structured output schemas, or user-query wrappers for LLM-powered features.

---

## 🚨 Core Prompt Engineering Patterns

### 1. Role & Calibration Pattern
- Define the model's domain role, objective, and communication posture clearly at the top of the system instruction.
- **Example**: *"You are a Principal Security & Compliance Reviewer for a multi-tenant SaaS platform. Your analysis is precise, evidence-backed, and concise."*

### 2. Delimited Context & Grounding Constraints
- Isolate untrusted user input and retrieved reference documents inside explicit XML tags (`<domain_context>`, `<policy_rules>`, `<user_input>`) to prevent prompt injection and hallucination.
- **Example**: *"Rely exclusively on facts present inside `<domain_context>`. Do not extrapolate unverified claims. If the required data is missing, set `status` to `'INSUFFICIENT_CONTEXT'`."*

### 3. Native Structured Outputs (JSON Schema / Zod)
- Enforce deterministic schemas for downstream programmatic consumption using native structured outputs (`response_format` / `zodResponseFormat`) or explicit JSON schema instructions.
- **Example**: *"Return ONLY a JSON object conforming to the `ResolutionProposalSchema`."*

### 4. Bounded Chain of Thought (CoT)
- Instruct the model to evaluate constraints step-by-step before committing to a classification or action proposal.
- **Example**: *"First, verify which policy clauses apply to the request. Second, check whether the requested parameters fall within tenant quotas. Third, emit the structured decision."*

### 5. Progressive Decomposition
- Split high-complexity workflows into focused stages (Intent Classification → Grounded Retrieval → Synthesis → Critique) rather than overloading a single prompt with conflicting instructions.

### 6. Human-in-the-Loop Critique & Preview
- Any state-mutating or externally visible action drafted by an LLM should return a structured preview payload so the UI or operator can inspect, edit, or approve it before execution.

---

## 🤖 Production Prompt Template (XML + Structured JSON)

```markdown
<instructions>
You are an expert Technical Support & Resolution Assistant. Analyze the incoming workspace issue and propose a grounded, policy-compliant action plan.

Follow this reasoning sequence:
1. Identify the core failure mode or request described in <user_message>.
2. Cross-reference the tenant's active configuration and entitlements in <domain_context>.
3. Match the issue against the approved remediation playbooks in <playbook_context>.
4. Output the final response strictly matching the target JSON schema.

Return ONLY a valid JSON object matching this shape:
{
  "reasoningSteps": ["Step 1 analysis", "Step 2 verification"],
  "category": "CONFIGURATION_DRIFT" | "QUOTA_EXCEEDED" | "INTEGRATION_TIMEOUT" | "ESCALATE_TO_HUMAN",
  "confidence": 0.95,
  "proposedAction": {
    "playbookId": "string",
    "requiresHumanApproval": true,
    "remediationSummary": "string"
  }
}
</instructions>

<domain_context>
Tenant ID: ${tenant.id}
Plan & Entitlements: ${JSON.stringify(tenant.entitlements)}
Recent Diagnostics: ${JSON.stringify(diagnostics)}
</domain_context>

<playbook_context>
${JSON.stringify(approvedPlaybooks)}
</playbook_context>

<user_message>
${sanitizedUserMessage}
</user_message>
```

## 🚀 Floor, Not Ceiling (`[Beyond-Baseline]`)

This XML + JSON template is the baseline for reliable prompting. Extend it with modern techniques when appropriate (annotate with `[Beyond-Baseline: <reason>]`):
- **Native Constrained Decoding**: Prefer SDK-level structured outputs (OpenAI `zodResponseFormat`, Gemini `responseSchema`, Anthropic tool-use schemas) over prompt-only JSON formatting instructions.
- **Prompt Caching & Few-Shot Curations**: Place static system instructions, schemas, and canonical few-shot examples in the prefix to maximize provider KV-cache hit rates.
