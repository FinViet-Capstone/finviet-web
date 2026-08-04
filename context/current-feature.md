# Current Feature

**Users screen** — Feature C (User Management) UI, built from
`context/designs/pencil-mock-design-users.md` and the matching Pencil mockup screens (list view,
lock confirmation, unlock confirmation, password reset confirmation).

## Status

Completed

## Goals

- Users list view inside the dashboard shell: toolbar (search input + status filter dropdown)
  above a paginated table (Tên, Email, Trạng thái, Ngày tạo, Tổng GD, Tổng ví, Gói, row actions).
- Row actions: lock/unlock toggle icon button, `Đặt lại mật khẩu` icon button — reusing the
  existing `ConfirmationModal` shared component for all 3 confirmation states (lock =
  destructive/red, unlock = primary/neutral, password reset = primary).
- Visual-only per `context/ai-design-interactions.md` — no real fetch/mutation against
  `finviet-be`. Mock row data with client-side lock/unlock toggle state so both modal variants
  are reachable for browser verification; search/filter are visual only (no functional
  filtering wired).

## Notes

- Route: `src/app/(dashboard)/users/page.tsx` (inside the dashboard shell, unlike Login).

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
- 2026-08-04 — **Users screen**: built `src/app/(dashboard)/users/page.tsx` matching the Pencil
  mockup and `context/designs/pencil-mock-design-users.md` — toolbar (search + status filter)
  above a paginated customer table with status/plan badges and row actions (lock/unlock,
  password reset), plus the 3 `ConfirmationModal` variants (lock = destructive, unlock/reset =
  primary) reusing the existing shared component. Visual-only per
  `context/ai-design-interactions.md`: mock customer array in `mock-users.ts` with client-side
  search/status filtering and lock-state toggling (no `finviet-be` calls) so all modal states and
  the success toast are reachable for browser verification. Built on branch
  `feature/users-screen`.
