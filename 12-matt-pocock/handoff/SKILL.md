---
name: handoff
description: "Trigger: handoff, context compaction. Use when the session must be compacted into a handoff document for another agent to pick up."
allowed-tools: Read Write Glob Grep Bash(git:*,gh:*)
license: MIT
metadata:
  trigger: ["handoff","traspaso de tarea","context handoff","entregar sesion"]
  author: mattpocock
  version: "1.0.0"
argument-hint: "What will the next session be used for?"
disable-model-invocation: true
---

Write a handoff document summarising the current conversation so a fresh agent can continue the work. Save to the temporary directory of the user's OS - not the current workspace.

Include a "suggested skills" section in the document, naming which skills (`<category>/<skill>/SKILL.md` or via [`skill-router`](../../00-meta-skills/skill-router/SKILL.md)) the next agent should read and follow.

Do not duplicate content already captured in other artifacts (specs, plans, ADRs, issues, commits, diffs). Reference them by path or URL instead.

Redact any sensitive information, such as API keys, passwords, or personally identifiable information.

If the user passed arguments, treat them as a description of what the next session will focus on and tailor the doc accordingly.
