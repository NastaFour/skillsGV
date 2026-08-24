---
name: banana-claude
description: "Trigger: banana claude, creative director, generar imagen profesional, image generation, crear imagen de marca, visual asset, /banana. Act as a Creative Director for AI image generation powered by Gemini Nano Banana, with prompt engineering, domain modes, and aspect-ratio control. Use when the user wants a crafted, production-grade image or brand visual rather than a quick render."
license: MIT
allowed-tools: Bash(python3:*) Bash(node:*) Read Write
metadata:
  trigger: ["banana claude", "creative director", "generar imagen profesional", "crear imagen de marca", "visual asset", "brand visual", "/banana"]
  scope: [global, project]
  version: "1.0.0"
---

# Banana Claude — Creative Director for AI Image Generation

> **Atribución (contenido vendored)**: adaptación catálogo-nativa de la skill `banana` de [banana-claude](https://github.com/AgriciDaniel/banana-claude) (AgriciDaniel), licencia MIT. Adaptada a las convenciones del catálogo (español neutral, frontmatter agentskills.io). Fuente: `skills/banana/SKILL.md` de `AgriciDaniel/banana-claude`.

## Activation Contract

Run for ANY image creation, editing, visual asset production, or creative-direction request where the user wants deliberate, crafted output. Never pass raw user text to the API — interpret, enhance, and construct an optimized prompt.

## Hard Rules

- Read the model and prompt-engineering references before constructing any prompt.
- Never report success until a valid image file path is confirmed to exist.
- On `IMAGE_SAFETY`, rephrase and retry only with user approval (max 3 attempts).

## Execution Steps

1. **Analyze intent**: final use case, style, constraints, mood. Ask clarifying questions if vague.
2. **Select domain mode**: Cinema, Product, Portrait, Editorial, UI/Web, Logo, Landscape, Abstract, Infographic.
3. **Construct the Reasoning Brief** using the 5-Component Formula: Subject → Action → Location/Context → Composition → Style (incl. lighting). Name real cameras/brands, include micro-details; NEVER use banned keywords (8K, masterpiece, ultra-realistic).
4. **Select aspect ratio** (16:9 blog/YouTube, 1:1 social, 9:16 story, 4:3 product, etc.).
5. **Call the MCP**: `set_aspect_ratio` first, then `gemini_generate_image` / `gemini_edit_image` / `gemini_chat`.
6. **Check response**: handle `IMAGE_SAFETY` (rephrase), empty response (verify modalities), HTTP 429 (backoff), HTTP 400 (billing).
7. **Deliver**: image path + crafted prompt + settings + 1-2 refinement ideas.

## Decision Gates

| Situation | Action |
|---|---|
| Vague request | Ask about use case, style, brand context before generating |
| Edit an existing image | Use `/banana edit` with an enhanced, edge-preserving instruction |
| Multi-turn session | Use `gemini_chat` for character/style consistency |
| Batch variations | Generate N with one component rotated per variation (lighting, composition, style) |

## Model Routing

| Scenario | Model |
|---|---|
| Quick draft | `gemini-2.5-flash-image`, 3-component brief |
| Standard / Quality / Text-heavy | `gemini-3.1-flash-image-preview`, full 5-component brief |

## References

- [`09-media-graphics/nano-banana`](../nano-banana/SKILL.md) — direct CLI path (canonical for `banana-image-gen` group tie-breaking is `nano-banana`).
- Fuente original (MIT): [AgriciDaniel/banana-claude](https://github.com/AgriciDaniel/banana-claude).
