# Current Feature

**Category Correction Log screen** — Feature E (Category Correction Log) UI, built from
`context/designs/pencil-mock-design-category-corrections.md` and the matching Pencil mockup
screens (list view + row-click detail modal).

## Status

Completed

## Goals

- Page shell (header + filter bar, no tabs) at a route matching the sidebar's existing
  `category-corrections` key (`Sửa danh mục AI`).
- **Filter bar**: date range dropdown + corrected-category dropdown — no search-by-customer,
  this is a pattern-reading tool not a lookup tool.
- **Table**: Mô tả giao dịch, AI đề xuất (muted text, no badge — "less final" than the
  correction), → connector, Đã sửa (badge in the corrected category's own catalog color),
  Khách hàng (email), Thời gian. No row actions — clicking a row opens the detail modal.
- **Detail modal**: read-only — transaction description + amount, a larger AI-guess → corrected
  side-by-side comparison, customer email, corrected date/time. Single `Đóng` button, no
  edit/save affordance anywhere — reinforces this whole screen is observation-only. Reuses the
  `FormModal` shell from System Configuration.
- Read-only through and through: no primary-colored action buttons in table rows, no
  add/edit/delete affordances anywhere on the page, no toast (nothing is ever saved here).
- Visual-only per `context/ai-design-interactions.md` — no real fetch against `finviet-be`. Mock
  correction-log array with client-side category filtering so the table and modal are reachable
  for browser verification.

## Notes

- Route: `src/app/(dashboard)/category-corrections/page.tsx` — sidebar (`Sửa danh mục AI`) and
  `sidebar-nav.tsx`'s `activeKeyByPath` already point at `/category-corrections`, just needed
  the page built.

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
- 2026-08-04 — **System Configuration screen**: built `src/app/(dashboard)/system-config/page.tsx`
  matching the Pencil mockup and `context/designs/pencil-mock-design-system-config.md` — a
  4-tab shell (`TabBar`, extended with a new `onSelect` prop since it was presentational-only
  until now) covering Danh mục (table + Add/Edit + destructive delete confirm), Nhóm ngân sách
  (3-row list, Needs/Wants locked with a lock icon + tooltip, Savings editable — matches the
  mockup's "Sửa nhóm ngân sách" example, which is pre-filled with Savings' data), Trọng số điểm
  (inline-editable weight table, per-cell "modified" dot, `Lưu thay đổi` button that only
  appears once dirty, warning-styled `ConfirmationModal` save confirm), and Gói dịch vụ (card
  grid + Add/Edit modal with a feature-bullet editor + destructive delete confirm). Added a new
  shared component, `FormModal` (`src/components/form-modal/`), for the Add/Edit forms, since
  `ConfirmationModal` only covered simple confirm/cancel dialogs. Visual-only per
  `context/ai-design-interactions.md`: mock data per tab (`mock-categories.ts`,
  `mock-buckets.ts`, `mock-scoring.ts`, `mock-plans.ts`) with client-side CRUD/state so every
  modal variant is reachable for browser verification; no `finviet-be` calls. Built on branch
  `feature/system-config-screen`.
- 2026-08-04 — **Category Correction Log screen**: built
  `src/app/(dashboard)/category-corrections/page.tsx` matching the Pencil mockup and
  `context/designs/pencil-mock-design-category-corrections.md` — a filter bar (date range +
  corrected-category dropdown) above a read-only, paginated table (Mô tả giao dịch, AI đề xuất
  muted text, → connector, Đã sửa badge in the category's own catalog color, Khách hàng, Thời
  gian) where clicking a row opens a detail modal (larger AI-guess → corrected comparison,
  amount, customer email, corrected date/time, single `Đóng` button, no edit/save affordance
  anywhere). Reused the `FormModal` shell from System Configuration for the modal. Visual-only
  per `context/ai-design-interactions.md`: mock correction array in `mock-corrections.ts` with
  client-side category filtering (no `finviet-be` calls); no toast, since nothing is ever saved
  on this screen. Built on branch `feature/category-corrections-screen`.
