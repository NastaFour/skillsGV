---
name: nano-banana
description: "Trigger: nano banana, generar imagen, generate image, crear imagen, thumbnail, banner, icono, imagen ia. Generate and edit images with Nano Banana (Gemini CLI nanobanana extension). Use when the user asks to create, generate, edit, or restore any image, icon, diagram, pattern, illustration, thumbnail, or banner — this is the canonical image-generation skill for the banana-image-gen group."
license: MIT
allowed-tools: Bash(gemini:*) Read
metadata:
  trigger: ["nano banana", "generate image", "crear imagen", "generar imagen", "image edit", "edit image", "thumbnail", "banner", "imagen ia"]
  scope: [global, project]
  version: "1.0.0"
---

# Nano Banana Image Generation

> **Atribución (contenido vendored)**: adaptación catálogo-nativa de la skill `nano-banana` de [cc-nano-banana](https://github.com/kkoppenhaver/cc-nano-banana) (kkoppenhaver), licencia MIT. Adaptada a las convenciones del catálogo (español neutral, frontmatter agentskills.io). Fuente: `skills/banana/SKILL.md` de `kkoppenhaver/cc-nano-banana`.

## Activation Contract

ALWAYS use this skill when the user asks for any image, graphic, illustration, or visual, or uses words like generate, create, make, draw, design, visualize. Do NOT attempt image generation through any other method.

## Hard Rules

- Verify the `nanobanana` extension is installed before first use.
- Use the `--yolo` flag to auto-approve tool actions.
- Never invent output; always confirm the generated file exists before reporting success.

## Execution Steps

1. Verify setup:
   ```bash
   gemini extensions list | grep nanobanana
   [ -n "$GEMINI_API_KEY" ] && echo "API key configured" || echo "Missing GEMINI_API_KEY"
   ```
2. Select the command by request:

| User Request | Command |
|---|---|
| "make me a blog header" | `/generate` |
| "create an app icon" | `/icon` |
| "draw a flowchart" | `/diagram` |
| "fix this old photo" | `/restore` |
| "remove the background" | `/edit` |
| "create a repeating texture" | `/pattern` |
| "make a comic strip" | `/story` |

3. Run the command:
   ```bash
   gemini --yolo "/generate 'prompt'" --preview
   gemini --yolo "/edit file.png 'instruction'"
   ```
4. Use `--count=N` for variations and `--aspect=16:9` for widescreen.
5. Present the result from `./nanobanana-output/`; offer refinements.

## Decision Gates

| Situation | Action |
|---|---|
| Higher quality needed | `export NANOBANANA_MODEL=gemini-3-pro-image-preview` |
| "Try again / give me options" | Regenerate with `--count=3` |
| "Edit this one" | `/edit nanobanana-output/filename.png 'adjustment'` |

## Prompt Tips

Be specific: style, mood, colors, composition. Add **"no text"** to avoid rendered text. Reference styles ("editorial photography", "flat illustration", "3D render"). Specify aspect-ratio context ("wide banner", "square thumbnail").

## Troubleshooting

| Problem | Solution |
|---|---|
| `GEMINI_API_KEY` not set | `export GEMINI_API_KEY="your-key"` |
| Extension not found | `gemini extensions install https://github.com/gemini-cli-extensions/nanobanana` |
| Generation failed | Simplify prompt, check policy violations |

## References

- [`11-mcp-hybrid/asset-generator-mcp`](../asset-generator-mcp/SKILL.md) — MCP-based asset generation (canonical for `banana-image-gen` group tie-breaking is `nano-banana`).
- Fuente original (MIT): [kkoppenhaver/cc-nano-banana](https://github.com/kkoppenhaver/cc-nano-banana).
