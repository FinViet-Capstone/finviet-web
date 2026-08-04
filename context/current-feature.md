# Current Feature

**AI Knowledge Base screen** — Feature F (AI Knowledge Base Management) UI, built from
`context/designs/pencil-mock-design-knowledge-base.md` (no matching `.pen` mockup screens exist
yet for this feature — briefs and screenshots are the visual source of truth here).

## Status

Completed

## Goals

- Page shell (header + `+ Tải lên tài liệu` button top-right, matching the sidebar's existing
  `knowledge-base` key, `Kho tri thức AI`) at `/knowledge-base`.
- **Table**: Tiêu đề, Trạng thái (Sẵn sàng/green vs. Đang xử lý/amber badge), Số đoạn (chunk
  count, `—` while processing), Ngày tải lên. Row action: `Xóa` (trash icon) → delete
  confirmation modal.
- **Upload modal — 3 states**, same modal swapping content:
  1. Idle: drag-and-drop PDF zone + title text field, `Tải lên` disabled until both are set.
  2. Progress: file name + animated progress bar, "Đang tải lên..." — no close affordance,
     upload can't be dismissed mid-flight.
  3. Success: checkmark, "Tải lên thành công", `Xong` button closes modal and adds a new
     "Đang xử lý" row to the table.
- **Delete confirmation modal**: reuses `ConfirmationModal` (destructive variant) — "Xóa tài
  liệu?" / "Xóa [tiêu đề]? Tài liệu sẽ không còn được AI sử dụng khi trả lời người dùng."
- Reuse `FormModal` for the upload modal's idle state; the progress/success states diverge
  enough visually (no header/close button, centered layout) that they render custom content
  rather than forcing them through the same header+footer shell.
- Visual-only per `context/ai-design-interactions.md` — no real fetch against `finviet-be`. Mock
  document array with a simulated (setTimeout-driven) upload progress/success flow so all 3
  modal states and the delete flow are reachable for browser verification.

## Notes

- Route: `src/app/(dashboard)/knowledge-base/page.tsx` — sidebar (`Kho tri thức AI`) and
  `sidebar-nav.tsx`'s `activeKeyByPath` already point at `/knowledge-base`, just needed the page
  built.

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
- 2026-08-04 — **AI Knowledge Base screen**: built `src/app/(dashboard)/knowledge-base/page.tsx`
  matching `context/designs/pencil-mock-design-knowledge-base.md` — a header with a top-right
  `+ Tải lên tài liệu` button above a document table (Tiêu đề, Trạng thái badge — green Sẵn sàng
  vs. amber Đang xử lý, both existing tokens (`--color-active`/`--color-warning`), Số đoạn, Ngày
  tải lên) with a per-row `Xóa` action. The upload modal is a 3-state flow: idle (drag-and-drop
  PDF zone + title field, reusing `FormModal`, `Tải lên` disabled until both are set — picking a
  file auto-fills an empty title from the filename), progress (custom shell, no `FormModal`
  header/close button since the upload can't be dismissed mid-flight — a `setInterval`-driven
  fake progress bar), and success (custom shell, checkmark + `Xong` button that adds the new
  "Đang xử lý" row and closes the modal — no toast, the success state is the feedback per the
  brief's micro-interactions). Delete reuses `ConfirmationModal` (destructive) and does show a
  toast, consistent with other screens with real mutations. Visual-only per
  `context/ai-design-interactions.md`: mock document array in `mock-documents.ts`, no
  `finviet-be` calls. Built on branch `feature/knowledge-base-screen`.
