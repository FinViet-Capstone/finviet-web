# Current Feature

_(None right now — document the next feature/fix here, per `context/ai-interaction.md`'s
workflow, before starting work on it.)_

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
- 2026-08-04 — **Announcements screen**: built `src/app/(dashboard)/announcements/page.tsx`
  matching `context/designs/pencil-mock-design-announcements.md` — a compose panel (title input,
  body textarea with a 500-char counter that turns amber near the limit, target selector with
  only `Tất cả người dùng` selectable and `Phân khúc (sắp ra mắt)` disabled) above a read-only
  history table (Tiêu đề, Đối tượng, Số người nhận, Thời gian gửi). `Xem trước` opens a
  `FormModal`-based preview rendering the announcement inside a phone-frame mockup of the mobile
  notification center; `Gửi` opens the existing `ConfirmationModal` (destructive variant, reused
  as-is rather than adding the brief's one-off icon/close-button decoration, to stay consistent
  with every other confirm modal in the app) showing the live target-audience count, and
  confirming adds a new row to the top of the history table, resets the compose form, and shows a
  success toast — matching the pattern established by other screens with real mutations.
  Visual-only per `context/ai-design-interactions.md`: mock announcement array + a fixed mock
  target-audience count in `mock-announcements.ts`, no `finviet-be` calls. Built on branch
  `feature/announcements-screen`.
- 2026-08-05 — **Admin dashboard review fixes**: a batch of interaction bugs and UX gaps found
  walking through the already-built screens, tracked in an approved plan rather than a design
  brief since this pass started from live bug reports, not a Pencil mockup. Sidebar nav items
  were plain `<div>`s with no `href`/`onClick` → real `next/link`s. Overview charts: leftmost
  X-axis label was clipped (centered off-canvas) → edge-aware tick anchoring +
  `user-select: none` on the chart wrapper. Topbar: removed the non-functional search icon;
  moved the admin avatar into a new pinned bottom section of the sidebar with a dropdown (Tài
  khoản của tôi — a new visual-only account panel — / Đăng xuất, mock redirect to `/login`).
  Announcements: removed the disabled "Phân khúc (sắp ra mắt)" target option (spec'd as TBD).
  Users: pagination didn't slice the table at all → expanded mock data to 40 rows and made
  pagination real. System Configuration → Buckets: removed the Needs/Wants edit lock per product
  direction (admin can edit all buckets) and added sortOrder-uniqueness validation on save.
  Categories: added an SVG upload dropzone for custom icons alongside the 5 presets; renamed
  "Bắt buộc" → "Mặc định" in the UI to match its real meaning (underlying field stays
  `isMandatory`, matching the real `Category.IsMandatory` backend field). Scoring Weights: mock
  criteria didn't match the real formula in `finviet-be`'s `SpendingScoreService.cs` at all —
  replaced with the real 3 criteria/weights, added a live formula display, total-weight
  validation, and a notice that `ScoringCriterion` isn't actually read by the live scoring
  service yet. Plans: changed a hard delete to a soft-delete ("Ngừng cung cấp") so the plan stays
  visible with an "Đã ngừng" badge instead of disappearing, matching what the confirm copy
  already promised. Category Correction Log: added a client-side "Xuất CSV" export button.
  Knowledge Base: added a "Xem trước" metadata-preview button per ready document. New
  `context/backend-gaps.md` documents every place a real endpoint is missing or doesn't satisfy
  the frontend's needs, for the backend team. All changes visual/mock-only per
  `context/ai-design-interactions.md` — no real `finviet-be` calls added. Built across 10 focused
  commits on branch `fix/admin-dashboard-review-fixes`, merged to `dev`.
- 2026-08-05 — **Category Correction Log: real date filter + pagination**: follow-up from the
  dashboard review pass above. The date-range select (7/30/90 ngày qua) didn't filter anything,
  even client-side, and pagination had the same fake-slicing bug Users had before that pass.
  Expanded `mock-corrections.ts` to 60 rows spanning ~90 days with real timestamps, filtered by
  both category and date range, and paginated the actual filtered result. Extracted the
  page-number-list logic shared with Users into `src/lib/pagination.ts`. Built on branch
  `fix/category-corrections-filters`.
- 2026-08-14 — **Mock/real API switch + Route Handler migration**: replaced every screen's
  colocated `mock-*.ts` + local `useState` with a real TanStack Query + Route Handler data layer,
  per `context/coding-standards.md`'s Data Fetching section, with a seamless mock/real backend
  switch modeled on `finviet-mobile`'s `USE_MOCK` pattern. Since this app's browser never calls
  `finviet-be` directly, the switch lives server-side inside each domain's barrel
  (`src/services/<domain>.ts`, resolving `isMockMode() ? mock : real` per call, not once at
  module load, since a Route Handler module stays resident across many requests) rather than
  client-side. Shared infra: `src/lib/env.ts` (`isMockMode()`, env var `USE_MOCK_API`, default
  mock-on), `src/lib/api-client.ts` (`apiFetch`/`toQueryString`, browser → Route Handler),
  `src/lib/finviet-api.ts` (`finvietApi`/`unwrap`, scaffolded for when a domain flips real),
  `src/lib/api-response.ts` (`jsonSuccess`/`jsonError`), `src/services/mock/dev-store.ts`
  (`globalThis`-backed so mock state survives Fast Refresh) + `delay.ts`, `src/app/providers.tsx`
  (`QueryClientProvider`, wired into `layout.tsx`), `src/lib/query-keys.ts`,
  `requireAdminSession()` in `src/lib/auth.ts` (skipped in mock mode — Login isn't wired to
  better-auth yet, so enforcing it there would 401 every Route Handler). Migrated all 8 domains —
  Users, Category Corrections, Categories, Buckets, Scoring, Plans, Knowledge Base,
  Announcements — each getting `src/types/<domain>.ts`, `src/services/mock/<domain>.ts` (stateful,
  seeded from the old mock data), `src/services/real/<domain>.ts` (stub — throws "not
  implemented," no `finviet-be` endpoint exists yet for most domains), a barrel, Route Handler(s)
  with Zod validation, and `src/hooks/use<Domain>.ts` TanStack Query hooks. Fixed two long-standing
  gaps as a side effect of the migration: Category Correction Log's date-range filter is now
  genuinely server-side (was previously wired but silently a no-op per the entry above), and its
  CSV export now hits a dedicated unpaginated endpoint instead of reading the browser's
  now-paginated cache. Knowledge Base's upload flow was refactored to track the actual `File`
  object (previously only its name) so a real `FormData` POST could be wired.
  UI-only presentation constants that never went through the service layer (category/bucket icon
  and color options) were split into local `*-ui-options.ts` files alongside their tab component.
  Verified end-to-end in the browser per domain: every read, filter, and mutation exercised
  against its real Route Handler with network-request confirmation, plus an explicit
  `USE_MOCK_API=false` check confirming a domain with a stub `real/*.ts` fails cleanly (401/error
  response, no crash) rather than breaking the app. `npm run build` and `npm run lint` both clean
  (added an `argsIgnorePattern: "^_"` override to `eslint.config.mjs` for the intentionally-unused
  params in `real/*.ts` stubs, which must match the mock module's exact type signature). Deferred
  to a later session: JWT propagation from `src/app/api/admin/login/route.ts` into `finvietApi`
  (blocks flipping any domain to real), per-domain `USE_MOCK_API` overrides (not needed until the
  first real endpoint lands), and the `backend-web-todos.md` export itself. Built on branch
  `feature/mock-real-api-switch`.
