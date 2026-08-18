# Backend Gaps

Found while building out the admin dashboard's mock/frontend screens. Each entry is a place
where either no real `finviet-be` endpoint exists yet, or a real endpoint/entity doesn't fully
satisfy what the frontend needs. For the backend team to pick up — not tracked as frontend work.

**Note (2026-08-17):** several entries below were written when a domain was still mock-only and
have since gone stale — the backend team shipped the endpoint independently without this file
being updated. Before trusting an entry here, check the real endpoint against
`https://finviet-be-7t8w.onrender.com/swagger/v1/swagger.json` (or the `dev` branch's
`Controllers/`) rather than assuming this doc is current.

## No system-wide default budget allocation ratio (UC-15)

**Resolved (2026-08-18).** UC-15 ("admin updates the system's default budget allocation ratio")
had no backing anywhere — not just a missing endpoint, the whole concept didn't exist: `Bucket`
had no percentage column, and `Customer.NeedsPct/WantsPct/SavingsPct`'s `50/30/20` was a hard-coded
CLR default nothing read back from. See `context/backend-request-default-budget-ratio.md` for the
original request. `finviet-be` (branch `AdminBudget`, commit `c8f826c`, merged to `main`) added
`buckets.default_pct`, extended `BucketResponse`/`UpdateBucketRequest` with `DefaultPct`, and —
the part that actually makes it do something — `RegisterCommandHandler`/
`GoogleLoginCommandHandler` now read `Bucket.DefaultPct` when creating a new `Customer` instead of
relying on the CLR defaults. Scoped to new registrations only, exactly as requested: existing
customers who already customized their own ratio via `POST /api/profile/income-allocation` are
untouched.
`src/services/{real,mock}/buckets.ts` wired (`AdminBucket`/`BucketInput` gained `defaultPct`); the
Bucket edit modal (`buckets-tab.tsx`) gained a "Tỷ lệ mặc định" field with the same
sum-must-equal-100 client-side validation as Scoring Weights (no atomic server-side check either,
same reason — 3 independent single-bucket `PATCH`es), plus an inline note clarifying the
new-registrations-only scope so the admin doesn't assume it's retroactive.

## Category Correction Log has no joined view for its real endpoint

**Resolved (2026-08-18).** `GetCategoryCorrectionsQueryHandler` now `.Include()`s
`Customer`/`Transaction`/`CorrectedCategory`, and `CategoryCorrectionResponseDto` carries
`customerEmail`/`transactionDescription`/`amount`/`correctedCategoryName` directly (branch
`Announcements-&-Category-Corrections`, commit `8dccd00`, merged to `dev`). `src/services/real/
category-corrections.ts` is wired: reads the joined fields for its three main columns, and
separately resolves the category *filter dropdown's* name → id (via `GET /api/categories`, since
the dropdown still operates on names) before sending it as the `CategoryId` query param. The
filter dropdown itself is no longer a hardcoded 4-name list — it now reads real category names
from `GET /api/categories` (`useCategories()`), since the old hardcoded list
(`"Cà phê"`/`"Dịch vụ đăng ký"`) didn't match any category in the actual seeded catalog
(`"Ăn uống"`, `"Di chuyển"`, `"Giải trí"`, ... per `V6__normalize_category_buckets.sql`) and would
have silently returned zero results for 2 of its 4 options.

## Announcements has no broadcast/fan-out endpoint

**Resolved (2026-08-18).** New `POST`/`GET /api/admin/announcements` (`AdminAnnouncementsController`,
`[Authorize(Roles = "Admin")]`, same branch/commit as above) — `POST` fans a `Notification` row out
to every `IsActive` customer in a batched transaction and records one `AnnouncementBroadcast`
history row; `GET` lists past broadcasts, paginated, newest first. `src/services/real/
announcements.ts` is wired: `sendAnnouncement`/`listAnnouncements` call these directly.
`targetAudienceCount` (shown in the pre-send confirmation dialog) has no dedicated "active
customer count" endpoint to call, so it reuses `GET /api/analytics/summary`'s `activeCustomers`
field (the Overview dashboard's own source) — the same `IsActive` definition the backend fan-out
itself uses, so the confirm-dialog count matches what will actually happen.

## User list is missing transaction/wallet counts and subscription plan

**Partially resolved (2026-08-18):** `UserResponseDto` now has `totalTransactions`, `totalWallets`,
and `subscriptionPlanCode` (subquery counts + most recent `active` `CustomerSubscription`, joined
server-side in `GetUsersQueryHandler` — no migration needed, `Transaction`/`Wallet` already carry
`CustomerId`). Shipped on `finviet-be` branch `fix-dto` (commit `d75ec57`), not yet merged to
`dev`/deployed as of this note. `src/services/real/users.ts` reads these fields now instead of
hardcoding 0/0/"free"; `subscriptionPlanCode` (a real code like `"premium_monthly"`) is collapsed
to the UI's binary free/premium badge since `AdminCustomerSummary.plan` only distinguishes those
two. **Still open:** no `status` (active/locked) server-side filter — only `Search` — so the
status filter dropdown still pages through every `Search`-matching result and filters in Node
(see the comment in `real/users.ts`) rather than a real `isActive` query param.

## No account-reactivation endpoint

`PUT /api/account/deactivate/{customerId}` (Admin) exists and is wired, but it's one-directional
— there's no matching "reactivate"/"unlock" endpoint anywhere in `finviet-be`. The Users screen's
"Mở khóa" (unlock) action throws a clear "not implemented" error in real mode rather than
silently no-op'ing. Needs a `PUT /api/account/activate/{customerId}` (or similar) counterpart.

## Category icon upload exists but is the wrong role for this screen

`POST /api/categories/icons` is real, but `[Authorize(Roles = "Customer")]` — the admin JWT this
app holds gets a 403 from it. The category "Thêm danh mục" modal's custom `.svg` icon upload
stays client-side-only (a data URL, nothing persisted) for this reason, same as before this
endpoint existed. `Category.Icon`/`CategoryInput.customIconDataUrl` still has no real storage
path for an *admin*-uploaded icon. Needs either an additional `Authorize(Roles = "Admin")` on
that endpoint (if that's intended) or a separate admin-scoped upload endpoint.

## Scoring weights are now connected to the real score calculation

Resolved — `SpendingScoreService.cs` reads live from `ScoringCriterion` as of `dev`'s
`0de917a "fix: wire spending score weights to scoring_criteria"`. `GET`/`PATCH
/api/scoring-criteria` (Admin) are wired in `src/services/real/scoring.ts`; saving on the System
Configuration → "Trọng số điểm" screen now has a real effect on live scores. (Left this entry as
a record that it *was* a gap, since the original note is still referenced elsewhere.)

## Bucket.IsLocked vs. "admin can edit everything"

Still accurate. The real `Bucket` entity has an `IsLocked` column; `UpdateBucketCommandHandler`
deliberately does not enforce it ("Admin can edit every bucket, including the locked 'savings'
row — IsLocked is deliberately not enforced here per product direction"), matching the admin
frontend's decision to allow editing all three buckets. `GET`/`PATCH /api/buckets` are wired in
`src/services/real/buckets.ts`, `isLocked` intentionally left out of `AdminBucket`.

## SubscriptionPlan has no soft-delete field

The Plans tab's "delete" action was changed to a soft-delete ("Ngừng cung cấp" / discontinue) —
existing subscribers keep working, the plan just stops being offered to new customers. This needs
an `IsActive` (or similar) column on `SubscriptionPlan`, which doesn't exist today
(`PlanId, Code, Name, Price, FeaturesJson, CreatedAt` per project-spec.md). A hard `DELETE` on a
plan with live `CustomerSubscription` rows pointing at it would also be a referential-integrity
problem regardless of the UI decision.

## Knowledge Base preview needs the real document Uri

The Knowledge Base "Xem trước" (preview) button currently only shows document metadata
(title/status/chunk count) since there's no real file content available anywhere in the current
flow. `RagDocumentResponse` (backing `GET /api/ai/documents`, now wired in
`src/services/real/knowledge-base.ts`) already has a `uri` field for this — the preview should
open/embed that `Uri` instead of the metadata-only placeholder. Not done in this pass, since it's
a UI change beyond wiring the existing list/upload calls.

## Knowledge Base delete has no backend endpoint

Still accurate. The Knowledge Base table's `Xóa` (delete) action is disabled in the UI (with a
tooltip) since `finviet-be`'s `AdminAiController` only exposes `POST`/`GET /api/ai/documents` —
no `DELETE`. The mutation hook (`useDeleteDocument`), its Route Handler
(`src/app/api/knowledge-base/documents/[id]/route.ts`), and the mock service's delete
implementation are all still intact so mock-mode demo behavior keeps working and re-enabling the
button is a one-line change once a real `DELETE /api/ai/documents/{id}` exists. Needs: a `DELETE`
action on `AdminAiController` (Admin role) that removes the `RagDocument` row (and its `RagChunk`
rows / uploaded file) — no CQRS command exists for this today.
