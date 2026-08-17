# Current Feature

_(None right now — document the next feature/fix here, per `context/ai-interaction.md`'s
workflow, before starting work on it.)_

## History

<!-- Keep this updated. Earliest to latest -->

- 2026-08-18 — **2FA login: "use a recovery code instead" on the TOTP challenge screen**:
  Vercel-style UX addition to `/login`'s TOTP challenge step (`src/app/login/totp-step.tsx`),
  prompted by comparing our screen to Vercel's own 2FA challenge (which offers a "Use a Recovery
  Code Instead" link alongside the 6-digit input). No backend work needed: better-auth's
  `twoFactor()` plugin (`src/lib/auth.ts`) composes `backupCode2fa` automatically, so
  `POST /api/auth/two-factor/verify-backup-code` was already live via the existing `[...all]`
  catch-all route, just unused until now. `totp-step.tsx` gained a toggle between the existing
  6-digit TOTP input and a single backup-code text field, wired to a new `useVerifyBackupCode()`
  hook (`src/hooks/useAdminLogin.ts`, mirroring the existing `useVerifyTotp()`). State
  (`verifyMode`, `backupCode`) lifted to `page.tsx`, matching how `digits`/`totpError` are already
  owned there. Enrollment (`enroll-step.tsx`) intentionally untouched — an admin doesn't have
  backup codes yet during their own enrollment. Deliberately did not build a full self-service
  "2FA recovery" flow (Vercel's second link) — that's the break-glass admin workflow, already a
  flagged spec gap in `project-spec.md` Feature A; the existing "Liên hệ quản trị viên khác..."
  footer text covers that case for now.
  Verified end-to-end in the browser (logged in as `master` against the real deployed
  `finviet-be`, reaching the real TOTP challenge): toggle switches correctly between the two
  input modes with correct instruction copy, submits to the correct endpoint per mode confirmed
  via network tab (`verify-totp` vs `verify-backup-code`), shows the right mode-specific error
  banner text on a wrong code (401), and resets cleanly when toggling back. `npm run build` and
  `npm run lint` both clean. Built on branch `feature/2fa-backup-code-login`.

- 2026-08-15 — **Overview dashboard wired to real analytics + Knowledge Base delete disabled**:
  started from a review of the Knowledge Base admin screen (does it let admins actually control
  AI, should there be a separate "AI" sidebar tab) — conclusion: no new tab needed, since
  `finviet-be`'s only admin-facing AI surface is RAG document upload/list, already covered by this
  screen. Two concrete gaps were fixed instead.
  **Overview** (`/overview`) was the one domain never migrated onto this codebase's mock/real
  service-layer pattern — every stat/chart value was a hardcoded literal, no type/service/hook/
  Route Handler existed. Companion backend work in `finviet-be` added `GET /api/analytics/summary`
  + `GET /api/analytics/trend` (see that repo's `context/current-feature.md`, branch
  `feature/admin-analytics-endpoint`, committed there). Added the full 7-file domain scaffold
  (`src/types/overview.ts`, `src/services/{mock,real}/overview.ts` + barrel, `src/hooks/useOverview.ts`,
  `src/app/api/overview/{summary,trend}/route.ts`, a `queryKeys.overview` entry) matching every
  other migrated domain's convention, plus a new `src/lib/format-number.ts` (`formatCount`,
  `Intl.NumberFormat("vi-VN")`) and `src/app/(dashboard)/overview/chart-data.ts` (`toChartPoints`
  for edge-labeled real dates replacing the old fake "week" labels, `computeTrendLabel` — a
  genuine first-half-vs-second-half split of the real fetched window, not a fabricated percentage,
  since the backend has no prior-period baseline to compare against). `page.tsx` converted to
  `'use client'`, consumes `useAnalyticsSummary()`/`useAnalyticsTrend()`, shows a loading
  placeholder per stat card and an inline error banner instead of a blank landing page on failure.
  Free/premium split percentage now computed from real `freeSubscriptions`/`premiumSubscriptions`
  with a divide-by-zero guard.
  `npm run build`/`npm run lint`/`npx tsc --noEmit` all clean. **Verified live in the browser, both
  modes**: mock mode rendered the seeded mock summary/trends with correctly edge-labeled dates and
  a correct 68%/32% split computed from the mock counts; real mode (pointed at a local `finviet-be`
  running the new endpoint, logged in as a freshly-created test admin to sidestep an unrelated
  stale-shadow-account mismatch in the local dev auth DB — see Notes) showed genuinely different,
  real numbers (4 customers, 394 transactions, 100%/0% free/premium since no paid subscriptions
  exist locally) with `GET /api/overview/summary` and both `GET /api/overview/trend` calls
  confirmed 200 in the network tab. Local `.env` was temporarily pointed at `localhost:5122` for
  this test and restored to its original values (`https://finviet-be-7t8w.onrender.com`) afterward
  — verify no diff remains there before committing anything.
  **Knowledge Base delete**: `finviet-be`'s `AdminAiController` has no `DELETE` endpoint for RAG
  documents at all (not just unwired — it doesn't exist). Per explicit product decision, the
  delete button in `src/app/(dashboard)/knowledge-base/page.tsx` is now unconditionally disabled
  with a tooltip, mirroring the file's existing pattern for the preview button (disabled when
  `status !== "ready"`) — the mutation hook, Route Handler, and mock service's delete
  implementation are all left intact so mock-mode demo behavior and future re-enablement both
  still work; only the UI trigger changed. `context/backend-gaps.md` updated.
  **Notes**: found real, unrelated, pre-existing uncommitted work sitting on `dev` mid-session —
  a coherent, consistent `isMockMode(domain)` change across every service barrel plus an
  `admin-login` mock-mode short-circuit, not authored by this session. Left untouched: stashed
  (not popped) so it doesn't interfere, `git stash list` still has it — **not lost, needs a
  deliberate `git stash pop` by whoever owns it**, not part of this branch's diff. Separately, a
  genuine pre-existing bug was found and already fixed upstream before this session started
  (`admin-login` route's botched two-mechanism JWT merge) — no action needed, just verified clean.
  Also flagged (not fixed, out of scope): `SubscriptionRenewalScheduler` logs a real
  `operator does not exist: subscription_status = text` error on every poll against a real
  Postgres — a Postgres enum/text comparison needing an explicit cast; unrelated to this feature.
  A throwaway test admin (`overview_test_admin` / `overview-test-admin@finviet.local`) was created
  on the local `finviet-be` dev database for login verification — `finviet-be` has no
  delete-admin endpoint yet to clean it up; harmless local dev-only row, flagged here for
  visibility rather than silently left.

- 2026-08-15 — **Real admin login + 2FA + sign-out**: wired `/login` (previously visual-only, per
  the 2026-08-04 Login screen entry) up to `/api/admin/login` and better-auth's `two-factor`
  plugin for real, plus real sign-out. `/api/admin/login` now returns
  `{step: "enroll", totpURI, backupCodes} | {step: "totp"} | {step: "done"}` instead of proxying
  better-auth's raw response: on a brand-new shadow account (first-ever login) it calls
  `auth.api.enableTwoFactor` immediately after `signUpEmail`, using the shadow password the admin
  never sees (passing the just-created session's own Set-Cookie back in as a `Cookie` header,
  since `enableTwoFactor` requires an authenticated session) — the client could never call that
  itself. Returning admins go through `signInEmail`; better-auth's own two-factor plugin downgrades
  that to a `twoFactorRedirect` pending state once 2FA is enabled, detected by inspecting the
  cloned response body. New `src/app/login/enroll-step.tsx`: QR code (`qrcode` package,
  `toDataURL`) + manual-entry secret parsed from the `totpURI`, backup codes list with a copy
  button, a "saved these" checkbox gating the confirm step, then the same 6-digit input pattern as
  `totp-step.tsx`. Both the enrollment-confirm step and the steady-state login's TOTP step submit
  to better-auth's own `/api/auth/two-factor/verify-totp` (already live via the `[...all]` catch-all
  route) — no custom wrapper endpoint needed there. New `src/hooks/useAdminLogin.ts`
  (`useAdminLogin`/`useVerifyTotp`). Real sign-out: new `POST /api/admin/logout` clears both
  better-auth's session cookie (`auth.api.signOut`) and the sibling `finviet_admin_jwt` cookie
  (which `auth.api.signOut` has no idea exists) in one response; `sidebar.tsx`'s `handleLogout` now
  awaits it before redirecting.
  **Bug found and fixed during verification**: `useAdminLogin` initially used the shared
  `apiFetch` helper, whose global 401 handler (`src/lib/api-client.ts`) treats any 401 as "your
  session died, redirect to /login" — correct for an already-authenticated call, but wrong for the
  login endpoint itself returning 401 for ordinary wrong-credentials, since that fired the redirect
  before the "wrong username or password" banner ever rendered (invisible in the browser — the page
  just silently reloaded back to itself). Fixed by having `useAdminLogin` call `fetch` directly,
  bypassing that global handler, matching `useVerifyTotp`'s existing pattern.
  Verified in the browser (`npm run dev` on a spare port against this worktree specifically, since
  the harness's named dev-server preview is hard-wired to the primary checkout's directory, which
  was on unrelated branch state): credential-step renders, and the wrong-credentials path was
  exercised end-to-end (finviet-be unreachable in this environment → 401 → error banner renders
  correctly) after the apiFetch fix.
  **Full success path later verified against the real deployed `finviet-be`** (`https://finviet-be-7t8w.onrender.com`,
  with a seeded `master` admin) and surfaced two more real bugs, both fixed:
  1. `emailAndPassword.disableSignUp: true` blocks `auth.api.signUpEmail` even when called
     server-side, not just the public HTTP endpoint — it's enforced inside the shared endpoint
     handler both paths funnel through. First-ever login always hit this and silently fell through
     to a confusing "Email and password sign up is not enabled" error. Fixed by adding the
     `admin` plugin (`better-auth/plugins/admin`) to `src/lib/auth.ts` and provisioning the shadow
     account via `auth.api.createUser` instead (the sanctioned bypass for server-side account
     provisioning outside public self-registration — its own HTTP route stays gated behind a
     session, so this doesn't reopen public sign-up), followed by a real `signInEmail` call to
     actually establish the session `createUser` doesn't create by itself. Needed a second
     `npx @better-auth/cli generate` + migration for the admin plugin's own schema
     (`user.role/banned/banReason/banExpires`, `session.impersonatedBy`).
  2. `auth.api.signInEmail({..., asResponse: true})` does not reliably throw on failure — a "no
     such user" outcome came back as a normal (non-2xx) `Response` rather than a rejected promise,
     which the original bare try/catch silently treated as a successful login (`step: "done"`) for
     credentials that had never actually signed in anywhere. Fixed by checking `.ok` on the
     response explicitly instead of relying on an exception.
  Re-verified the complete real flow end-to-end in the browser after both fixes, computing actual
  RFC 6238 TOTP codes from the enrollment secret (not a shortcut): credential login → enrollment
  screen (real QR + 10 backup codes + acknowledgement checkbox) → entering a freshly-computed
  6-digit code → redirect to `/overview`; and separately, a returning admin without 2FA confirmed
  goes straight to a full session (a known limitation, not a bug — `enableTwoFactor` alone doesn't
  flag the account as 2FA-required, only a confirmed `verifyTOTP` does, so an interrupted
  enrollment leaves 2FA unenforced until the admin actually finishes it).
  `npm run build` and `npm run lint` both clean. Not committed/pushed yet.

- 2026-08-15 — **Admin account management + fixed merge conflict**: an admin-created-admin flow
  (list/create admins at `/admins`, backed by `src/services/admins.ts`) was built independently in
  two places at once — one session on this same `feature/admin-account-management` branch, another
  as commit `bb28fe4` — and both landed in the same GitHub merge (PR #1, `feature/vnpay-subscriptions`
  → `dev`, merge commit `ae927a9`), resolved by accepting both sides instead of picking one. That
  broke `src/app/api/admin/login/route.ts` (duplicate variable declarations, unreachable code after
  an early `return`) and left two redundant JWT-propagation mechanisms in `src/lib/auth.ts`: a
  `session.additionalFields`-based one (dead — nothing outside the broken route used it) alongside
  the one `bb28fe4`/vnpay-subscriptions already established and wired through the rest of the app
  (`src/lib/finviet-admin-token.ts`'s `getFinvietAdminToken()`, a sibling `finviet_admin_jwt`
  cookie). Fixed by keeping the cookie-based mechanism as the single source of truth: rewrote
  `route.ts` to only set that cookie (no session-field write), removed the dead
  `getFinvietJwt`/`stashFinvietJwt`/`session.additionalFields` code from `auth.ts`, and repointed
  `src/services/real/admins.ts` at `getFinvietAdminToken()`. Also added the one piece the merged
  commit didn't include: real admin change-password — new `POST /api/admin/change-password` Route
  Handler, `changeAdminPassword` added to the `admins` service barrel (mock + real), and the
  previously visual-only "Tài khoản của tôi" panel (`account-panel.tsx`) now has a current-password
  field and actually calls the mutation instead of just closing on save. Companion backend work
  (`ChangeAdminPasswordCommand`/`Handler` + `POST /api/auth/admin-change-password`,
  `CreateAdminCommand`/`Handler` + `AdminsController`) implemented independently in `finviet-be` —
  see that repo's `context/current-feature.md`. Also fixed, while in `finviet-api.ts`: axios rejects
  on any non-2xx response before a caller's `unwrap()` runs, so a real finviet-be error message
  (e.g. "Current password is incorrect.") was getting replaced by axios's generic "Request failed
  with status code 400" — added a response interceptor that re-throws with the real envelope
  message when present, fixing error display for every `real/*.ts` caller, not just this one.
  `npm run build` and `npm run lint` both clean. Built in an isolated worktree
  (`finviet-web-admin-mgmt`) off `origin/dev` rather than the primary checkout, since that was
  mid-flight on the unrelated `feature/vnpay-subscriptions` work. Not committed/pushed.

- 2026-08-15 — **Plans domain goes real (VNPay subscriptions companion)**: wired the System
  Configuration → Gói dịch vụ (Plans) tab to a real `finviet-be` backend, as the frontend half of
  the new VNPay auto-renewing subscription feature built in `finviet-be` on branch
  `feature/vnpay-subscriptions`. Solved the JWT-propagation blocker flagged in the mock/real-API-
  switch entry below: `src/app/api/admin/login/route.ts` now sets a sibling httpOnly
  `finviet_admin_jwt` cookie (separate from better-auth's own session cookie, which has no hook
  for storing an opaque third-party JWT) alongside the existing better-auth sign-in/sign-up
  response; new `src/lib/finviet-admin-token.ts` (`getFinvietAdminToken()`) reads it back per-call
  for `src/services/real/*.ts`; `src/lib/api-client.ts`'s `apiFetch` now redirects to `/login` on
  any 401 (the two cookies have different lifetimes, so this can fire even with a valid
  better-auth session). Replaced `AdminPlan`/`PlanInput`'s fragile `priceValue`/`priceUnit`
  string pair (flagged in an earlier code review — parsed via naive whitespace-splitting) with a
  numeric `price` + `billingIntervalMonths`, matching the real backend's `decimal`/`smallint`
  columns; added `src/lib/currency.ts` (`formatVnd`/`formatBillingInterval`) for display-only
  formatting, updated the Route Handler Zod schemas, and replaced the Plans tab's free-text price
  field with a numeric input + a Tháng/Năm select (`parsePrice()` deleted entirely). Wired
  `src/services/real/plans.ts` — this codebase's first genuinely-implemented `real/*.ts` module,
  every other domain is still a stub — to `GET/POST/PATCH /api/admin/subscription-plans[...]`.
  Verified in the browser against mock mode (`USE_MOCK_API` still default-on): create, edit
  (price+interval round-trip confirmed via actual network payloads, not just UI), and discontinue
  all work correctly with the new numeric shape. `npm run build` and `npm run lint` both clean (one
  necessary `eslint-disable` on the 401 redirect's `window.location.href`, since that's a plain
  utility function outside any component/hook, and a hard reload is actually wanted there to clear
  client state). Companion backend work (migration, `LockedPrice` snapshot guarantee, VNPay
  client, CQRS, renewal job) implemented independently in `finviet-be` — see that repo's
  `context/current-feature.md`. Not committed/pushed/merged in either repo.

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
