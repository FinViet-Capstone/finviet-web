# AI Design Interactions

Guidance specific to the **Pencil mockup → React code** phase — turning the finished
`.pen` designs into real screens under `src/`. General coding/workflow rules still
apply from [ai-interaction.md](ai-interaction.md); this file only covers what's
different when a task involves the design system.

## Files to check before building anything

1. [project-spec.md](project-spec.md) — the feature's actual requirements/data shape.
   Never add UI for something not in this spec.
2. `context/designs/pencil-mock-design-<screen>.md` — the brief for the specific
   screen being built (layout, copy, modal states, color/icon tokens).
3. `context/designs/web-design` — the `.pen` file itself, the **visual source of
   truth**. If it and the brief disagree, the `.pen` file wins (briefs can drift after
   a design gets refined in Pencil). Only touch it via the `pencil` MCP tools —
   never `Read`/`Grep` it, it's an encrypted binary format.
4. [coding-standards.md](coding-standards.md) — CSS Modules, functional components,
   minimal `'use client'`, etc.
5. `src/components/` — check what already exists before writing anything new.

## Always reuse existing components

This is the most important rule for this phase, in both directions:

- **In code**: before creating a component, check `src/components/` for one that
  already covers it (`sidebar`, `topbar`, `stat-card`, `tab-bar`,
  `confirmation-modal`, and whatever gets added after). Extend via props rather than
  forking a near-duplicate.
- **In Pencil**: before designing a new screen element, check the `.pen` file's
  existing reusable components (via `get_app_state`) and reuse/copy them rather than
  drawing from scratch, so the mockup and the eventual code stay in sync.
- Only add a new shared component (either side) when no existing one actually fits —
  not for a one-off tweak.

## Working with Pencil (`.pen` file)

- Every new session is cold — call
  `get_app_state({include_schema:true, include_canvas_design:true, include_scripts_and_shaders:false, include_browser:false})`
  first. It lists the current top-level frames, reusable components, and confirms
  which `.pen` file is actually open — don't assume state from a prior conversation.
- Before hardcoding any color/spacing value, call `GetVariables()` inside `execute`
  and reuse an existing token if one already matches. Token values should mirror
  `src/app/globals.css` (see below) — don't let Pencil and code drift apart.
- Use `get_screenshot` on the relevant top-level frame to visually confirm a screen
  after building it, not just the accessibility/structure read.
- Finish one screen at a time in Pencil before starting the next (per Pencil's own
  guidelines) — don't leave multiple screens half-built.

## Design tokens

`src/app/globals.css` is the single source of truth for color/radius tokens in code.
When a Pencil variable and a CSS custom property represent the same thing, they must
carry the same value — if you change one, update the other in the same pass.

## Rules specific to this phase

- Mockup-to-code screens are still visual-only unless explicitly told otherwise —
  don't wire real data fetching, mutations, or auth while translating a screen from
  Pencil into code (see [ai-interaction.md](ai-interaction.md)'s existing
  don't-add-features rule).
- Verify every screen with `npm run build` and a real browser check
  (`http://localhost:3000/<route>`) before considering it done — a passing build does
  not mean the layout is correct.
- **Delete throwaway/verification pages once they've served their purpose.** If a
  temporary route or component is created only to preview something in the browser
  (e.g. a scratch page rendering several components together), remove it before
  committing — it must never linger in the codebase as dead code.
