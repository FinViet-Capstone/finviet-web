# Current Feature

**System Configuration screen** — Feature D (System Configuration) UI, built from
`context/designs/pencil-mock-design-system-config.md` and the matching Pencil mockup screens
(Danh mục tab + Add/Edit + Delete modals, Nhóm ngân sách tab + Edit modal, Trọng số điểm tab +
Save confirmation modal, Gói dịch vụ tab + Add/Edit + Delete modals).

## Status

Completed

## Goals

- One page shell (header + `TabBar`) with 4 tabs, matching the tab-shell pattern already used
  elsewhere: Danh mục / Nhóm ngân sách / Trọng số điểm / Gói dịch vụ.
- **Danh mục (Categories)**: table (Icon, Tên danh mục, Tên VI/EN, Loại badge, Bucket mặc định
  badge, Bắt buộc, Thứ tự) + Add/Edit form modal (name, name VI/EN, type select, mandatory
  toggle, default bucket select, icon picker, color swatch, sort order) + destructive delete
  confirmation reusing `ConfirmationModal`.
- **Nhóm ngân sách (Buckets)**: 3-row list (Needs/Wants/Savings) — locked rows show a lock icon
  + tooltip instead of an edit action; unlocked rows get an edit form modal (name VI/EN, color,
  icon, sort order).
- **Trọng số điểm (Scoring Weights)**: table with inline-editable weekly/monthly weight inputs,
  a "modified" dot next to changed cells, a `Lưu thay đổi` button that appears once dirty, and a
  warning-styled (`ConfirmationModal` `variant="warning"`) save confirmation — the highest-stakes
  action on the screen since it recalculates every customer's AI Spending Score.
- **Gói dịch vụ (Subscription Plans)**: card grid (not table) + Add/Edit form modal with a
  feature-bullet-list editor (add/remove rows) + destructive delete confirmation.
- Visual-only per `context/ai-design-interactions.md` — no real fetch/mutation against
  `finviet-be`. Mock data per tab with client-side CRUD/state so every modal variant (add, edit,
  delete, locked-vs-unlocked bucket, dirty-weights save) is reachable for browser verification.
- New shared component: `FormModal` (`src/components/form-modal/`) — generic modal shell (title
  + close X + body + footer slots) for the Add/Edit forms, since `ConfirmationModal` only covers
  simple confirm/cancel dialogs, not forms. Reused across Categories/Buckets/Plans.

## Notes

- Route: `src/app/(dashboard)/system-config/page.tsx` — already wired into the sidebar
  (`Cấu hình hệ thống`) and `sidebar-nav.tsx`'s `activeKeyByPath`, just needed the page built.

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
