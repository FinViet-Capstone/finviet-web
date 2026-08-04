# FinViet Admin Frontend Project Specifications
---
## Problem (Core Idea)
---
FinViet is a mobile personal-finance tracking app for the Vietnamese market: customers track
wallets, transactions, and budgets, and get an AI Spending Score (a per-customer score
summarizing how well their spending is tracking their budget for the week/month). FinViet's
mobile app and backend generate user, transaction, wallet, subscription, and
AI-classification activity that nobody on the FinViet team can currently see without querying the
database directly. Ops needs a single internal tool to answer "how many users do we have and are
they active," "is transaction volume trending up," "which users need a password reset or an
account lock," "where is the AI categorizer guessing wrong most often," and "what's our free vs.
premium split" — without touching either the mobile app (Vietnamese Gen Z-facing, not an ops
tool) or the raw database. It also needs a place to author the system-wide defaults every
customer's app experience is built on — the category catalog, the needs/wants/savings buckets,
the AI Spending Score's weighting formula, and the subscription plan catalog — plus perform the
admin-only actions the backend already gates behind a `role=Admin` JWT: managing categories and
feeding new documents into the AI chatbot's knowledge base.

FinViet Admin is a web dashboard, internal-only, for a small number of trusted administrators to
monitor system-wide analytics and own the default configuration the rest of the system runs on.
It is **not** customer-facing, has no signup flow, and every admin account is provisioned
directly in the database (seeded, not self-registered).

## Users
---
- **System Administrator:** the only actor. Logs in with a seeded username/password plus 2FA (not
  the customer email/Google-OAuth flow the mobile app uses — see Feature A), gets a session, and
  uses the dashboard to monitor system health, act on individual customer accounts, and author
  system-wide default settings. No sub-roles/permission tiers exist in the backend today or are
  specified here — every admin account can do everything in this spec, aside from the narrow
  break-glass exception in Feature A's recovery model.

## Features
---
Target feature set, grounded in what `finviet-be` already models or gates behind `role=Admin`,
plus the analytics and system-configuration surface the "oversee all user analytics" goal
requires. Real, already-implemented backend capability is called out explicitly; everything else
is target/aspirational and needs new backend work.

A. Admin Auth
- Credential check backed by `POST /api/auth/admin-login` — **already implemented** in
  `finviet-be`'s `AuthController`, verifying username/password against the `Admins` table. **Gap
  to flag:** `AdminLoginCommandHandler` hardcodes `RefreshToken = string.Empty` and defaults to a
  ~15-minute access-token expiry — there is no working refresh today. That's fine as the
  password-check step below, but it means `finviet-be` needs a real refresh token (or a longer
  expiry) before server-side calls to other `[Authorize(Roles = "Admin")]` endpoints can rely on
  it across a normal admin session.
- Session: **better-auth**, configured as a credentials-provider wrapper around `admin-login` —
  it calls that endpoint to verify the password, then issues its own **httpOnly, secure,
  sameSite session cookie** (decided — see Tech Stack). This keeps session/2FA infrastructure
  entirely on the admin-frontend side without needing a `finviet-be`/`Admin` schema change.
- **2FA required on every admin login**, via better-auth's TOTP plugin (authenticator app),
  enrolled at first login. Secret and one-time backup/recovery codes live in better-auth's own
  store.
- Recovery model, informed by real-world practice for small, high-privilege admin teams:
  - **No email "forgot password" link for admin accounts.** High-privilege accounts are a common
    target via compromised email, and there's nothing to reuse anyway —
    `ForgotPasswordCommandHandler` in `finviet-be` queries the `Customers` table only, and
    `EmailVerificationToken.CustomerId` is a non-nullable FK to `Customer`, so it structurally
    can't serve an `Admin` today.
  - Lost-2FA-device recovery uses the one-time backup codes issued at TOTP enrollment.
  - Fully-locked-out recovery (forgotten password) falls to a small number of pre-provisioned
    **break-glass admin accounts**, credentials stored offline (physical safe / secrets manager —
    outside this app's scope), used only to reset another admin's password.
  - Every login (success/failure) and every password reset — self-service or break-glass — is
    written to a new `AdminAuditLog` (see Data section). Nothing like it exists in `finviet-be`
    today; this is new backend work.

B. User Analytics Overview
- A dashboard summarizing system health: total customers, active vs. inactive (from
  `Customer.IsActive`), signups over time, total transactions, total wallets, total budgets, and
  free-vs-premium subscription split (from `CustomerSubscription`/`SubscriptionPlan`).
- **Gap to flag, not paper over:** `SystemAnalytic` (`AnalyticsId`, `AdminId`, `MetricName`,
  `MetricValue`, `RecordedAt`) already exists as a generic metric-store table in `finviet-be`, but
  nothing currently writes to it. Backing this feature means either populating that table on a
  schedule or querying `Customer`/`Transaction`/`Wallet`/`Budget` directly for live aggregates —
  a backend decision out of scope for this frontend spec. No AI call-volume/cost metrics are
  included here either — no backing entity for AI usage/cost tracking exists anywhere in
  `finviet-be` (not on `ChatMessage`, not elsewhere), so it's a bigger lift than a new endpoint.
- **Data dependency, not a build blocker:** "real-time" here means real-time *once real activity
  exists to show*. The mobile app has no deployed real users yet (`eas.json` already has
  development/preview/production build profiles configured, but nothing has been submitted to
  TestFlight/Play). Until real users are generating transactions/signups, this dashboard
  faithfully reflects whatever dev/test data exists in whichever environment it's pointed at —
  that's expected, not a bug in this spec. Actually producing real usage data (e.g. an EAS Build
  + TestFlight submission) is a separate, explicitly-confirmed action outside this document.

C. User Management
- Searchable, filterable, paginated list of customers (search by name/email, filter by
  active/inactive) — a thin projection over the customer record, not the full profile (e.g. no
  password hash, and no needs/wants/savings budget-allocation percentages — a per-customer
  setting the mobile app owns and this dashboard doesn't need to touch). Gender and date-of-birth
  are collected during the mobile app's onboarding flow for future analytics use and could
  surface here as demographic breakdowns once B's aggregation story is built.
- Per-customer actions: lock/unlock (toggle `Customer.IsActive`), trigger a password reset
  (reusing the same `POST /api/auth/forgot-password` flow the mobile app's "forgot password"
  screen calls — no separate admin-initiated reset endpoint exists in `finviet-be` today, so this
  either reuses that flow as-is or needs a new admin-specific endpoint).
- Row-level counts (total transactions, total wallets) for a quick sanity check before acting on
  an account — not a full drill-down into that customer's financial data.

D. System Configuration
- The admin-authored default settings every customer's app experience is built on. Four
  sub-areas, one CRUD screen each:
  - **Category catalog** — **already fully backed by real endpoints**: `POST /api/categories`,
    `PATCH /api/categories/{id}`, `DELETE /api/categories/{id}`, all
    `[Authorize(Roles = "Admin")]` in `finviet-be`'s `CategoriesController`. Manages the *global*
    list of spending categories (groceries, transport, entertainment, etc.) every customer's
    transactions get classified into. This is distinct from a customer's own bucket assignment:
    each customer independently sorts their categories into a needs/wants/savings budget split
    inside the mobile app — that's a separate, per-customer setting this admin tool doesn't
    touch. Every new customer is seeded with this entire catalog at onboarding — a uniform
    default, not a different subset per customer — so this catalog is exactly what every
    customer starts with.
  - **Buckets** (needs/wants/savings) — the `Bucket` lookup table (`Id, NameVi, NameEn, Color,
    Icon, SortOrder, IsLocked`) has no admin CRUD endpoint in `finviet-be` today; it's a pure
    seed/lookup table. New backend work needed.
  - **AI Spending Score weighting** — `ScoringCriterion` (`Code, CriterionName, WeightWeekly,
    WeightMonthly, Version`) is a versioned formula-weights table with no admin CRUD endpoint
    today either. New backend work needed.
  - **Subscription plans** — `SubscriptionPlan` (`Code, Name, Price, FeaturesJson`) likewise has
    no CRUD endpoint today. New backend work needed. (This replaces a plan-read-only view: since
    admins are the ones who literally author these rows, editing belongs here, not in a separate
    analytics-only page.)

E. Category Correction Log
- Read-only, paginated audit log of every time a customer overrode the AI's suggested category on
  a transaction (original guess → corrected category, which customer, which transaction, when).
  Backed by the real `CategoryCorrectionLog` entity, already linked to `Customer`, `Transaction`,
  and the corrected `Category`.
- Intended purpose: a feedback signal for improving the AI categorization prompt/model over time
  — a page for humans reading patterns, not an editable moderation queue.

F. AI Knowledge Base Management
- **Already backed by a real endpoint** — `POST /api/ai/documents`,
  `[Authorize(Roles = "Admin")]` in `AiController.cs`. Lets an admin ingest a global knowledge
  document (PDF) that becomes visible to every customer's AI chat via retrieval, backed by the
  real `RagDocument` entity (`SourceType: 'pdf'`, `CustomerId: null` for global docs, chunked
  into `RagChunk`s).

G. Announcements
- Compose and send a notification to customers, landing on the mobile side in the customer's
  in-app notification center — the mobile app already has a generic notification model (title,
  body, read/unread state, optional deep link to a related budget/goal/report/wallet screen)
  with a `type: 'announcement'` value reserved for exactly this kind of admin broadcast.
- **Gap to flag:** `finviet-be`'s `Notification` entity is one row per single, nullable
  `CustomerId` — there's no existing broadcast/fan-out endpoint. Shipping a "send to all" or
  "send to a segment" admin feature requires new backend work (either a fan-out job that inserts
  one row per targeted customer, or a schema change), not just a new admin-frontend page over
  existing data.

## Data
---
Field lists are the target shape needed to back Features A–G, taken directly from the real
`finviet-be` entities (`src/FinViet.Infrastructure/Persistence/Entities/*.cs`) plus the response
DTOs the admin frontend needs that don't have a 1:1 backend entity yet.

### Category (existing backend entity — see Feature D's Category catalog sub-area)
- CategoryId, CategoryName, NameVi (nullable), NameEn (nullable), Type ('expense'|'income'),
  IsMandatory (nullable), DefaultBucket (nullable — 'needs'|'wants'|'savings', null for
  income/uncategorized), Icon (nullable), Color (nullable), SortOrder (nullable)

### Admin (existing backend entity)
- AdminId, Username, PasswordHash, Email, CreatedAt
- Navigation: CategoryCorrectionLogs, SystemAnalytics

### AdminAuditLog (target entity — see Feature A's recovery model, no equivalent exists today)
- id, adminId, action ('login'|'login_failed'|'password_reset'|'break_glass_reset'|...),
  performedByAdminId (nullable — set when a break-glass account acted on another admin's
  behalf), ipAddress, createdAt

### SystemAnalytic (existing backend entity — currently unpopulated, see Feature B's gap note)
- AnalyticsId, AdminId (nullable), MetricName, MetricValue, RecordedAt

### CategoryCorrectionLog (existing backend entity)
- LogId, CustomerId (nullable), TransactionId (nullable), AdminId (nullable),
  CorrectedCategoryId (nullable), OriginalAiGuess (nullable), CreatedAt
- Navigation: Admin, CorrectedCategory, Customer, Transaction

### Bucket (existing backend entity — see Feature D's gap note, no CRUD endpoint yet)
- Id, NameVi, NameEn, Color (nullable), Icon (nullable), SortOrder (nullable), IsLocked

### ScoringCriterion (existing backend entity — see Feature D's gap note, no CRUD endpoint yet)
- CriterionId, Code, CriterionName, WeightWeekly, WeightMonthly, Version, UpdatedAt

### CustomerSubscription / SubscriptionPlan (existing backend entities — see Feature D's gap note)
- SubscriptionPlan: PlanId, Code, Name, Price, FeaturesJson, CreatedAt
- CustomerSubscription: SubscriptionId, CustomerId (nullable), PlanId (nullable),
  Status ('active'|'canceled'|'expired'|'past_due'), StartDate, EndDate, CreatedAt, UpdatedAt

### Notification (existing backend entity — see Feature G's gap note)
- NotificationId, CustomerId (nullable), Type (defaults `'announcement'`), Title,
  Message (nullable), EntityType (nullable), EntityId (nullable), IsRead (nullable), CreatedAt

### RagDocument (existing backend entity)
- Id, CustomerId (nullable — null = global doc visible to all customers), SourceType
  ('pdf'|'weekly_report'|'monthly_summary'), Title, Uri (nullable), CreatedAt
- Navigation: Chunks (RagChunk[])

### AdminAnalyticsSummary (target DTO — dashboard overview)
- totalCustomers, activeCustomers, newCustomers (period), totalTransactions, totalWallets,
  totalBudgets, freeSubscriptions, premiumSubscriptions
- Source TBD per Feature B's gap note — either `SystemAnalytic` once populated, or live aggregate
  queries.

### DailyMetric (target DTO — trend series, e.g. signups/transactions over time)
- date, count

### AdminCustomerSummary (target DTO — user-list projection over `Customer`)
- customerId, email, fullName, isActive, gender (nullable), dateOfBirth (nullable), createdAt,
  totalTransactions, totalWallets, subscriptionPlanCode

### CategoryCorrectionView (target DTO — joined view for the Category Correction Log page)
- logId, transactionId, customerEmail, transactionDescription, originalCategoryGuess,
  correctedCategoryName, correctedAt
- Joins `CategoryCorrectionLog` against `Customer` (email), `Transaction` (description), and
  `Category` (human-readable corrected-category name).

### AnnouncementRequest (target DTO — see Feature G's gap note before assuming this is backed)
- title, body, targetSegment ('all' | specific customer IDs/filter — segment targeting model TBD)

## Tech Stack
---
A fresh choice for this codebase, not inherited from any existing scaffold:
- **Next.js (App Router)** — file-based routing under `app/`, structurally analogous to
  `finviet-mobile`'s Expo Router `app/` directory
- **TypeScript**
- **TanStack Query v5** for all data fetching — same library and hook-centralization convention
  as `finviet-mobile`'s `src/hooks/`, independently configured for this codebase
- **better-auth** for admin session management and 2FA (TOTP plugin) — see Feature A. Session
  storage is **decided: an httpOnly, secure, sameSite cookie**, managed by better-auth (not the
  mobile app's MMKV pattern, which is RN-only and doesn't apply to a browser session).
- **Axios**, used server-side only (Next.js Route Handlers/Server Components) to call
  `finviet-be`'s REST endpoints with the `finviet-be` JWT obtained at login — the browser only
  ever holds better-auth's own session cookie, never the `finviet-be` JWT directly. This differs
  from `finviet-mobile`'s `src/lib/api.ts`, where the client itself attaches and refreshes the
  JWT via a request interceptor — that pattern doesn't apply once the JWT is kept server-side.
- Backend is the same `finviet-be` (.NET 8) API the mobile app talks to — enveloped responses
  (`{ success, message, data }`), same `unwrap()`-style pattern applies

**Open/TBD — deliberately not decided here to avoid guessing:**
- Styling solution (Tailwind, CSS Modules, a component library, etc.)

**Decided during implementation:**
- Charting library for the trend views in Feature B: **recharts**, chosen when
  building the Overview screen's trend charts.

## Monetization
---
The admin frontend has no monetization of its own — it's an internal ops tool. Its connection to
FinViet's monetization is twofold: FinViet currently offers two customer-facing tiers — a free
plan and a paid premium plan (priced monthly or annually) — and Feature B surfaces the
free-vs-premium subscription split as an analytics metric, while Feature D's Subscription Plans
sub-area is where admins actually author those plan rows (name, price, feature list) that
customers see and choose from in the mobile app's Settings → Subscription screen. No such CRUD
endpoint exists in `finviet-be` today (see Feature D's gap note).

## UI/UX
---
**General:**
- Desktop-first web app (unlike the mobile app, no phone-form-factor constraint)
- Vietnamese-first UI copy, matching the mobile app's language convention, since the operators
  are the same Vietnamese team
- No design-token/component decisions are specified here (see Tech Stack's "Open/TBD" — styling
  solution isn't picked yet)

**Layout:**
- Sidebar or top-nav across the feature areas (Overview / Users / System Configuration /
  Category Corrections / Knowledge Base / Announcements, plus a standalone Login)
- Overview: summary stat cards up top, trend charts below
- Users / Category Corrections: paginated, filterable table views
- System Configuration: one tab per sub-area (Categories / Buckets / Scoring Weights /
  Subscription Plans), each a CRUD table

**Interaction conventions:**
- Confirmation step required before destructive/high-impact actions (account lock, password
  reset trigger, category/bucket/plan delete, announcement send)

**Responsive:**
- Desktop-only; no mobile/tablet breakpoint work planned, unlike `finviet-mobile`
