# Backend Gaps

Found while building out the admin dashboard's mock/frontend screens. Each entry is a place
where either no real `finviet-be` endpoint exists yet, or a real endpoint/entity doesn't fully
satisfy what the frontend needs. For the backend team to pick up — not tracked as frontend work.

**Note (2026-08-17):** several entries below were written when a domain was still mock-only and
have since gone stale — the backend team shipped the endpoint independently without this file
being updated. Before trusting an entry here, check the real endpoint against
`https://finviet-be-7t8w.onrender.com/swagger/v1/swagger.json` (or the `dev` branch's
`Controllers/`) rather than assuming this doc is current.

## Category Correction Log has no joined view for its real endpoint

`GET /api/category-corrections` is real ([Authorize(Roles = "Admin")], paginated, with
`CreatedAtFrom`/`CreatedAtTo`/`CategoryId` filters — the date-range gap noted in an earlier
version of this entry is resolved on the backend side). But `CategoryCorrectionResponseDto` only
returns raw `customerId`/`transactionId`/`correctedCategoryId` GUIDs plus `originalAiGuess` and
`createdAt` — no join to the customer's email, the transaction's description, or its amount,
which are this screen's three most important columns (`transactionDescription`, `customerEmail`,
`amount` in `CategoryCorrectionView`, per project-spec.md Feature E). There's also no admin-
accessible way to resolve those separately: `TransactionsController` is
`[Authorize(Roles = "Customer")]` only, and there's no admin customer-lookup-by-id endpoint.
`src/services/real/category-corrections.ts` stays a stub for this reason — needs either a joined
DTO on this endpoint, or a dedicated admin transaction/customer lookup.

## User list is missing transaction/wallet counts and subscription plan

`GET /api/users` is real and paginated ([Authorize(Roles = "Admin")], `Page`/`PageSize`/`Search`),
but `UserResponseDto` only has `customerId, email, fullName, isActive, isEmailVerified,
createdAt` — no `totalTransactions`, `totalWallets`, or subscription-plan code, which
project-spec.md Feature C calls for ("row-level counts... for a quick sanity check"). Also no
`status` (active/locked) server-side filter — only `Search`. `src/services/real/users.ts`
defaults these three fields (0/0/"free") rather than fabricating a lookup, and the status filter
dropdown is currently a no-op in real mode. Needs: the counts/plan joined onto this DTO (or a
per-customer stats endpoint), plus an `isActive` query param.

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
