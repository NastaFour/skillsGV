---
name: implement
description: "Implement a piece of work based on a spec or set of tickets." Use when the task matches this skill.
allowed-tools: Read Write Glob Grep Bash(git:*,gh:*)
license: MIT
metadata:
  author: mattpocock
  version: "1.0.0"
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

Use /tdd where possible, at pre-agreed seams.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, use /code-review to review the work.

Commit your work to the current branch.
