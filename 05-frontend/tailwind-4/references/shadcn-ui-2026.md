# Official `shadcn/ui` 2026 Conventions & CLI Rules (`pnpm`-Only)

Companion reference for [`../SKILL.md`](../SKILL.md) adapting the official `shadcn-ui/ui` skill contract for React + Tailwind CSS 4 + `pnpm`.

---

## 1. Live Inspection & Preset CLI (`pnpm dlx shadcn@latest`)

Before generating or updating `shadcn/ui` components, inspect the workspace's active configuration (`base`: `radix` vs `base`, icon library, style preset, component aliases):

```bash
pnpm dlx shadcn@latest info --json
pnpm dlx shadcn@latest preset resolve --json
pnpm dlx shadcn@latest apply <preset-code> --only theme,font
pnpm dlx shadcn@latest add button field dialog --dry-run
pnpm dlx shadcn@latest add button --diff src/components/ui/button.tsx
```

Never overwrite customized local `components/ui/*` files blindly — always inspect `--diff` first.

---

## 2. Critical `shadcn/ui` Component Rules (2026)

### Forms (`FieldGroup` + `Field` + `InputGroup`)
- Always wrap forms in `FieldGroup` → `Field` → `FieldLabel` + control + `FieldDescription` / `FieldError` (never raw `<div>` with `space-y-*`).
- Reflect validation state via `data-invalid` on `<Field>` and `aria-invalid` on `<Input>` / `<SelectTrigger>` / `<Textarea>`.
- Combine icons, prefixes, or action buttons inside inputs using `InputGroup` + `InputGroupInput`/`InputGroupTextarea` + `InputGroupAddon` (never hand-positioned `absolute` overlaps).
- Use `FieldSet` + `FieldLegend` for groups of checkboxes/radios, and `ToggleGroup` for `2–7` mutually exclusive visual options.

### Styling, Sizing & Button Icons
- **Use `flex gap-*` / `flex flex-col gap-*`** — avoid `space-x-*` and `space-y-*` helpers.
- **Equal Dimensions Use `size-*`**: Prefer `size-10`, `size-8`, `size-5` over `w-10 h-10`.
- **Icons Inside `<Button>`**: Pass `data-icon="inline-start"` or `data-icon="inline-end"` without explicit `w-4 h-4` / `size-4` sizing classes so the button primitive sizes icons consistently.
- **Loading State on Buttons**: `<Button>` has NO `isLoading` prop — compose `<Spinner data-icon="inline-start" />` alongside `disabled={isPending}`.
- **Semantic Surfaces**: Never scatter manual `dark:*` hex overrides or manual `z-index` values over overlays (`Dialog`, `Sheet`, `Popover`, `Tooltip`).

### `base` (`Base UI`) vs `radix` (`Radix UI`) Parity & AI Chat Primitives
- **Trigger composition**: When `info --json` reports `"base": "radix"`, use `asChild` + `sonner`; when `"base": "base"`, use the `render` prop + Base UI `toast`.
- **Dialog / Sheet / Drawer A11y**: Always render `*Title` inside dialogs/sheets/drawers (add `className="sr-only"` when visually omitted) alongside `*Description`.
- **Menu/Select/Command Items**: Always nest `SelectItem`, `DropdownMenuItem`, and `CommandItem` inside their matching `*Group` containers.
- **AI Chat Surfaces**: Use `MessageScroller`, `Message`, `Bubble`, `Attachment`, `Marker`, and `Trace` (`TraceLine`, `TraceCollapsible` for reasoning/tool invocations) instead of brittle custom `useStickToBottom` scroll listeners.
