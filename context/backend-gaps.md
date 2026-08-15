# Backend Gaps

Found while building out the admin dashboard's mock/frontend screens. Each entry is a place
where either no real `finviet-be` endpoint exists yet, or a real endpoint/entity doesn't fully
satisfy what the frontend needs. For the backend team to pick up — not tracked as frontend work.

## Scoring weights aren't actually connected to the real score calculation

`ScoringCriterion` (`Code, CriterionName, WeightWeekly, WeightMonthly, Version`) exists as a real
table, but `FinViet.Infrastructure/Services/SpendingScoreService.cs` doesn't read from it — the
weights are hardcoded directly in C# (`baseWeights` dictionary in `ComputeAsync`). The System
Configuration → "Trọng số điểm" admin screen now shows the *real* criteria/weights
(Spike/Budget/Savings, 50/50 weekly, 30/40/30 monthly) so it's no longer misleading about what
the formula is, but editing and saving on that screen has no effect on real scores until
`SpendingScoreService.cs` is updated to read from `ScoringCriterion` instead of its hardcoded
dictionary.

## Bucket.IsLocked vs. "admin can edit everything"

The real `Bucket` entity has an `IsLocked` column, presumably meant to prevent editing the
Needs/Wants buckets. Per product direction, the admin frontend now allows editing all three
buckets (Needs/Wants/Savings) — the lock was removed from the UI. If `IsLocked` is enforced
server-side once a real Buckets CRUD endpoint ships, editing Needs/Wants from the admin UI will
fail. Needs a decision: either drop server-side enforcement of `IsLocked` for admin-initiated
edits, or reintroduce the UI restriction to match.

## SubscriptionPlan has no soft-delete field

The Plans tab's "delete" action was changed to a soft-delete ("Ngừng cung cấp" / discontinue) —
existing subscribers keep working, the plan just stops being offered to new customers. This needs
an `IsActive` (or similar) column on `SubscriptionPlan`, which doesn't exist today
(`PlanId, Code, Name, Price, FeaturesJson, CreatedAt` per project-spec.md). A hard `DELETE` on a
plan with live `CustomerSubscription` rows pointing at it would also be a referential-integrity
problem regardless of the UI decision.

## No storage for custom category icons

The category "Thêm danh mục" modal now supports uploading a custom `.svg` icon (client-side only,
stored as a data URL for the mock preview — nothing persisted). `Category.Icon` is just a
string field with no defined format and no upload endpoint. Needs: a file storage endpoint (e.g.
returns a URL after upload) and a decision on whether `Category.Icon` stores that URL directly or
a separate asset-reference table is used.

## Knowledge Base preview needs the real document Uri

The Knowledge Base "Xem trước" (preview) button currently only shows document metadata
(title/status/chunk count) since there's no real file content available anywhere in the current
mock/upload flow. The real `RagDocument` entity already has a `Uri` field for this — once
`POST /api/ai/documents` and a documents-list endpoint back this screen for real, the preview
should open/embed that `Uri` instead of the metadata-only placeholder.

## Knowledge Base delete has no backend endpoint

The Knowledge Base table's `Xóa` (delete) action is disabled in the UI (with a tooltip) since
`finviet-be`'s `AdminAiController` only exposes `POST`/`GET /api/ai/documents` — no `DELETE`. The
mutation hook (`useDeleteDocument`), its Route Handler
(`src/app/api/knowledge-base/documents/[id]/route.ts`), and the mock service's delete
implementation are all still intact so mock-mode demo behavior keeps working and re-enabling the
button is a one-line change once a real `DELETE /api/ai/documents/{id}` exists. Needs: a `DELETE`
action on `AdminAiController` (Admin role) that removes the `RagDocument` row (and its `RagChunk`
rows / uploaded file) — no CQRS command exists for this today.

## Category Correction Log date-range filter has nothing to filter

The "7/30/90 ngày qua" date-range select on `/category-corrections` doesn't do anything today —
even client-side, it was never wired to filter the mock data (only the category filter works).
Once this screen is backed by a real paginated endpoint, it needs a `createdAt`-range query
parameter to actually support this.

## Users / Category Correction Log pagination is client-side over the full mock list

Both `/users` and `/category-corrections` currently paginate by slicing an in-memory array on the
client. Once real endpoints back these lists (especially `/users`, which will have far more than
40 rows in production), they need real server-side pagination (`page`/`pageSize` query params,
total-count in the response) rather than the frontend fetching every row up front.
