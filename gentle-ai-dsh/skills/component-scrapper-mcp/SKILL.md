---
name: component-scrapper-mcp
description: "Trigger: scrape component, scrapper, extraer componente, reutilizar UI, component scraper. Scrape components from a live site or design source via an MCP server and turn them into reusable, project-ready UI code. Use when the user wants to extract a real component, page section, or pattern from an existing site and reuse it locally instead of rebuilding it by hand."
license: MIT
allowed-tools: Read Bash(node:*) Write
metadata:
  trigger: ["scrape component", "component scraper", "scrapper", "extraer componente", "reutilizar componente", "scrape ui"]
  scope: [global, project]
  version: "1.0.0"
---

# Component Scraper (MCP hybrid)

Captures a real UI component, section, or page pattern from a live source through an MCP server and rewrites it as project-ready code.

## Activation Contract

Run when the user wants to reuse an existing component or UI pattern from another site or design file. Do NOT use for brand-new designs from scratch (that is `frontend-design` / `frontend-designer`).

## Hard Rules

- Never copy proprietary or licensed code verbatim; rewrite structure, rename tokens and classes, and normalize to the project's stack.
- Validate the scraped output with the project's own lint/typecheck before claiming success.
- Do not import whole CSS frameworks just because the source used them.
- Respect the MCP server's rate limits and auth; never reuse another user's session tokens.

## Decision Gates

| Situation | Action |
|---|---|
| User provides a URL / node ID / DOM selector | Query the MCP server for the rendered element subtree |
| MCP server unavailable | Fall back to a manual fetch of the element's HTML/CSS and note the deviation |
| Component has nested state or events | Scrape structure + interactions, then re-implement the state locally |

## Execution Steps

1. Identify the MCP server for the source (browser DOM, design tool, or repository indexer) and confirm it is connected.
2. Query the target element/section; capture the semantic HTML structure, classes, inline styles, and any assets.
3. Map classes to the project's design tokens (`design-system-tokens` if present) instead of copying raw values.
4. Extract JS/TS behavior and re-implement it with the project's state patterns.
5. Write the component into the project's components directory; run the validator/typecheck.
6. Report what was scraped, what was normalized, and any assets downloaded.

## Output Contract

- The new component file(s) and their paths.
- A list of scraped vs. rewritten decisions.
- Confirmation that lint/typecheck passes.
- Any deviations from the source (e.g. dropped vendor-specific styling).

## References

- [`04-backend/mcp-integration`](../mcp-integration/SKILL.md) — MCP server setup and security.
- [`05-frontend/design-system-tokens`](../design-system-tokens/SKILL.md) — token mapping when normalizing scraped styles.
