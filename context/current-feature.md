# Current Feature

**Login screen** — Feature A (Admin Auth) UI, built from `context/designs/pencil-mock-design-login.md`
and the matching Pencil mockup screens (credential step, credential error, 2FA/TOTP step, 2FA
error).

## Status

Completed

## Goals

- Centered card layout outside the dashboard shell (no sidebar/topbar), matching the brief's
  4 states: credential step, credential step with inline error, 2FA/TOTP step, 2FA step with
  inline error.
- Username/password fields with show/hide toggle; 6-digit segmented TOTP input with auto-advance
  focus; step transition credential → 2FA; loading state on submit buttons.
- Visual-only per `context/ai-design-interactions.md` — no real call to `finviet-be`'s
  admin-login endpoint or better-auth (`src/lib/auth.ts` / `src/app/api/admin/login/route.ts`
  already exist for that wiring, but this pass doesn't touch them). Client-side only: empty
  fields trigger the error state so both error screens are reachable for browser verification.

## Notes

- Route: `src/app/login/page.tsx` (outside the `(dashboard)` route group).

## History

<!-- Keep this updated. Earliest to latest -->

- 2026-08-04 — **Design system tokens + shared components**: replaced globals.css's
  create-next-app defaults with the light-theme tokens from the Pencil design briefs
  (base colors, status colors, radii; dark-mode block removed). Built the 5 shared
  components from `context/designs/web-design`'s Pencil components — Sidebar, Topbar,
  Stat Card, Tab Bar, Confirmation Modal — under `src/components/`, presentational
  only, CSS Modules, minimal `'use client'`. Added `context/ai-design-interactions.md`
  documenting the Pencil-to-code workflow. Merged to main on branch
  `feature/design-system-tokens-components` (deleted after merge).
- 2026-08-04 — **Overview screen**: first full screen built in code, matching the
  Pencil mockup and `context/designs/pencil-mock-design.md`. Added the shared
  dashboard shell (`src/app/(dashboard)/layout.tsx` + `sidebar-nav.tsx`, route-aware
  active nav via `usePathname`) and the Overview page itself — 6 stat cards, a
  Free/Premium split card, and 2 trend charts via `recharts` (decision recorded in
  project-spec.md). Wired root `/` to redirect to `/overview` and replaced the
  create-next-app boilerplate homepage/metadata. Built on branch
  `feature/overview-screen`.
- 2026-08-04 — **Login screen**: built `src/app/login/page.tsx` matching the Pencil mockup and
  `context/designs/pencil-mock-design-login.md` — centered card outside the dashboard shell,
  credential step (username/password, show/hide toggle) and 2FA/TOTP step (6-digit segmented
  input with auto-advance focus), both with inline error states. Visual-only per
  `context/ai-design-interactions.md`: no calls to `finviet-be`'s admin-login endpoint or
  better-auth; client-side validation (empty fields / incomplete code) drives the error states
  for demo purposes. Built on branch `feature/login-screen`.
