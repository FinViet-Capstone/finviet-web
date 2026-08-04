# Current Feature

Design system tokens (globals.css) + the 5 shared components identified from the
Pencil mockup (`context/designs/web-design`): Sidebar, Topbar, Stat Card, Tab Bar,
Confirmation Modal. First step of translating the finished Pencil mockups
(`context/designs/pencil-mock-design*.md`) into real code — full screens come after,
one at a time, reusing these primitives.

## Status

In Progress

## Goals

- Replace globals.css's create-next-app defaults with the light-theme design tokens
  established across all 7 design briefs (base colors, status colors, radii);
  remove the unused dark-mode media query since the product is light-only.
- Build the 5 shared components as presentational (no data-fetching/business logic)
  React components with colocated CSS Modules, matching coding-standards.md
  conventions (functional components, named exports, CSS Modules, minimal
  'use client').
- Components take content via props (nav active key, stat values, tab list, modal
  copy) — no hardcoded screen-specific content baked in, so every screen mockup can
  reuse them as-is.

- Added `context/ai-design-interactions.md` (referenced from CLAUDE.md) documenting
  the Pencil-to-code workflow: which files to check, how to work with the `.pen`
  file, and the reuse-existing-components rule for both Pencil and code.

## Notes

- lucide-react added as a dependency to match the "Icon Mapping (Lucide)" section of
  every design brief.
- ConfirmationModal is the only one of the 5 needing `'use client'` (it takes
  onCancel/onConfirm click handlers) — the other 4 stay Server Components.
- Verified all 5 components render correctly via a throwaway `src/app/dev-preview`
  page + browser accessibility-tree read (screenshot capture wasn't available), then
  deleted that page per convention — verification pages never linger in the repo.

## History

<!-- Keep this updated. Earliest to latest -->
