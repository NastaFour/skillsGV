---
name: interface-design
description: "Craft-first interface design for dashboards, admin panels, SaaS apps, tools, settings pages, data interfaces, and interactive products. Covers Anti-Reinvention primitive hierarchy, semantic design tokens, 4 pre-delivery tests, 2-pass surgical design-deslop, and 6-lens design-review. Use when designing, building, reviewing, or refining product UI where visual craft and consistency matter. Do NOT use for marketing landing pages or brand campaign copywriting."
allowed-tools: Bash(node:*) Read
license: MIT
metadata:
  trigger: ["interface design", "dashboard design", "SaaS UI", "admin panel UI", "craft UI", "design deslop", "design review"]
  scope: [global, project]
  version: "2.1.0"
---

# 🎨 Interface Design — Craft-First Product UI, Anti-Reinvention & Surgical Deslop

Build product interfaces with genuine architectural craft (`Linear`, `Stripe`, `Vercel`, `Apple`). Delegates the canonical 3-line `Design Read` and Archetypes `A–H` to [`../design-driven/SKILL.md`](../design-driven/SKILL.md), resolving system artifacts in strict order: `DESIGN_SYSTEM.md` → `design-artifacts/<project>/design-dna.md` → `DESIGN.md` → `.interface-design/system.md`.

---

## 🚫 Hard Rules: Anti-Reinvention Control & Style Hierarchy

Stop hand-rolling fragile custom widgets when proven accessible primitives exist:
1. **Control Precedence (Hard Blocker on `<div onClick>` or Keyboardless Dropdowns/Modals)**:
   `1. Native HTML (<button>, <a>, <dialog>)` → `2. Battle-Tested Headless Primitive (Radix, Base UI, React Aria, Ark, Vaul, cmdk)` → `3. Custom Hand-Roll` strictly as last resort with complete `Arrow` / `Enter` / `Escape` navigation, focus trap/restore, scroll lock, and ARIA roles.
2. **Styling Precedence & Zero Structural Hacks**:
   `1. Design-System Component (<Button variant>)` → `2. Extracted CVA Component (on 2nd real reuse)` → `3. Semantic Token (bg-surface-*, border-border-*)` → `4. Single-use Utility`. Never undo a container's padding with negative outer margins or brittle `calc()` escape hatches.

---

## 🏛️ Visual Craft Floor & Pre-Delivery 4 Checks

- **Hierarchy & Elevation**: One unambiguous focal point per view; differentiate tiers via weight (`600 / 500 / 400`) + contrast before bloating font size; use `tabular-nums` on numbers/timestamps; enforce `4/8px` grid rhythm, concentric radii (`outer = inner + padding`, capped at `24px`), and complete states (`default/hover/focus-visible/active/disabled` + `loading/empty/error`).
- **The 4 Pre-Delivery Checks**:
  1. **Swap Test**: Replace the brand name — does the layout still look unmistakably tied to its domain?
  2. **Squint Test**: Blur the screen mentally — is there ONE clear visual gravity center?
  3. **Signature Test**: Name 5 concrete UI elements where the chosen craft signature appears.
  4. **Token Test**: Read your CSS variable names aloud — do they express semantic domain intent?

---

## 🔬 Surgical `design-deslop` (2 Passes on Diff) & 6-Lens `design-review`

- **2-Pass Surgical `design-deslop` (Inspect only files in `git diff`)**:
  - *Pass 1 — Squint*: Fix flat hierarchy, missing focal anchor, timid contrast, monotone rhythm, and borders doing the work of negative space.
  - *Pass 2 — Scan*: Replace hardcoded colors, `<div onClick>` controls, missing interactive states, and inconsistent gaps — obeying the **"What is NOT slop"** guard so intentional bold choices are preserved untouched.
- **6-Lens `design-review` (`Blocker | Should-fix | Note`, with *Taste ≠ defect* filter)**:
  - **Lens A · Hierarchy** · **Lens B · Typography & Color** · **Lens C · Surfaces & Depth** · **Lens D · Composition & Rhythm** · **Lens E · States, Polish & Motion** · **Lens F · Structure, Reuse & Content**.

---

## 🚀 Floor, Not Ceiling (`[Beyond-Baseline]`) & Reference

This skill establishes the craft, accessibility, and anti-reinvention floor. Expressive custom layouts, bespoke data tables, and modern CSS patterns are encouraged via `[Beyond-Baseline: <reason>]`. Deep essays live in [`references/craft-principles.md`](references/craft-principles.md).
