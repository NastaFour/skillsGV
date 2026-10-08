---
name: research
description: "Delegates reading legwork and source investigation to a background agent (Matt Pocock workflow). Use when delegating docs or API investigation. For full pre-implementation research spikes and reports, use research-first."
allowed-tools: Read Write Glob Grep Bash(git:*,gh:*)
license: MIT
metadata:
  trigger: ["matt research","investigar tecnologia","evaluar libreria pocock"]
  author: mattpocock
  version: "1.0.0"
---

Spin up a **background agent** to do the research, so you keep working while it reads.

Its job:

1. Investigate the question against **primary sources** (official docs, source code, specs, first-party APIs), not a secondary write-up of them. Follow every claim back to the source that owns it.
2. Write the findings to a single Markdown file, citing each claim's source.
3. Save it where the repo already keeps such notes; match the existing convention, and if there is none, put it somewhere sensible and say where.
