<p align="center">
  <img src="docs/logo.png" alt="FinViet logo" width="112" height="112">
</p>

<h1 align="center">FinViet Admin</h1>

<p align="center">
  The internal web dashboard for FinViet. Administrators use it to monitor system activity, act on
  individual customer accounts, and author the system-wide defaults the mobile app is built on.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white" alt="Next.js 16">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white" alt="TypeScript strict mode">
  <img src="https://img.shields.io/badge/better--auth-TOTP_2FA-6366F1" alt="better-auth with TOTP two-factor">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL">
</p>

## What it does

FinViet's mobile app and backend generate customer, transaction, wallet, and AI-classification activity that nobody on the team could see without querying the database directly. This dashboard is the answer to that: how many customers there are and how many are active, whether transaction volume is moving, which account needs a lock or a password reset, and where the AI categorizer is guessing wrong most often.

It is also where the system's defaults are authored. The category catalog, the needs/wants/savings buckets, the spending-score weighting, the subscription plan catalog, the chatbot's knowledge base, and the AI prompt configuration all live behind admin-only endpoints and are edited here.

It is not customer-facing. There is no sign-up flow. Admin accounts are provisioned directly in the database, and every login requires a time-based one-time code.

## Part of FinViet

FinViet is three repositories:

| Repo | Role |
| --- | --- |
| [finviet-web](https://github.com/FinViet-Capstone/finviet-web) | This repo. The internal admin dashboard. |
| [finviet-be](https://github.com/FinViet-Capstone/finviet-be) | The .NET 8 API and PostgreSQL database this dashboard reads and writes through. |
| [finviet-mobile](https://github.com/FinViet-Capstone/finviet-mobile) | Expo / React Native app. The customer-facing product. |

```mermaid
flowchart TD
    mobile["finviet-mobile<br/>Expo / React Native"]
    web["finviet-web<br/>Next.js admin dashboard"]
    api["finviet-be<br/>.NET 8 REST API"]
    db[("PostgreSQL<br/>pgvector + pgcrypto")]
    gemini["Google Gemini<br/>categorization, reports, RAG chat"]
    sepay["SePay<br/>bank linking and sync"]

    mobile -->|customer JWT| api
    web -->|admin JWT| api
    web -.->|better-auth tables| db
    api --> db
    api --> gemini
    api --> sepay

    style web fill:#2563EB,stroke:#2563EB,color:#ffffff
```

## Features

- **Admin authentication with mandatory 2FA** — the password is verified against the backend's admin login endpoint, then better-auth issues its own httpOnly session cookie. A TOTP authenticator app is enrolled on first login and required on every login after that, with one-time backup codes for a lost device.
- **Overview dashboard** — system-wide counts and trends for customers, transactions, wallets, and the free-versus-premium subscription split.
- **Customer management** — a searchable, filterable, paginated customer list with per-customer lock and unlock, and a password-reset trigger.
- **Admin management** — list and provision the other administrator accounts.
- **Category and bucket configuration** — edit the system category catalog and the default needs, wants, and savings bucket ratios every new customer starts from, with sliders that rebalance to a total of 100 percent.
- **Spending-score criteria** — author the weighting formula behind the score the mobile app shows its customers.
- **AI category corrections** — review where customers overrode the AI's category choice, which is the feedback signal for where categorization is weakest.
- **Chatbot knowledge base** — upload and manage the documents the customer-facing chatbot retrieves its answers from.
- **AI prompt configuration** — edit the prompts driving categorization, weekly reports, and chat, without a redeploy.
- **Announcements and subscription plans** — publish in-app announcements and maintain the plan catalog.

## Tech stack

Next.js 16 with the App Router and React 19, TypeScript in strict mode. Server components by default, with route handlers as the mechanism for client-triggered mutations. better-auth for sessions, with its two-factor and admin plugins, backed by its own tables in PostgreSQL through `pg`. TanStack Query for client-side server state. Recharts for charts. CSS Modules per component, with design tokens as custom properties in a single global stylesheet, no utility framework. Lucide for icons.

## Getting started

### Prerequisites

- Node.js 20 or newer
- A running instance of [finviet-be](https://github.com/FinViet-Capstone/finviet-be) with at least one seeded admin account
- A PostgreSQL database for better-auth's session, two-factor, and account tables. This can be the same database the backend uses; the tables do not collide.
- An authenticator app for the TOTP enrollment on first login

### Configure

Create a `.env` file in the repository root:

```bash
BETTER_AUTH_SECRET=<a long random string>
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=postgres://user:password@localhost:5432/finviet
FINVIET_API_BASE_URL=http://localhost:5122
ADMIN_SHADOW_SECRET=<a long random string>
USE_MOCK_API=false
```

`USE_MOCK_API` defaults to `true` when unset, which serves fixture data instead of calling the backend. Set it to `false` to run against a real API.

Apply better-auth's schema once, before the first login:

```bash
npx @better-auth/cli migrate
```

The generated SQL for that schema is checked in under `better-auth_migrations/` if you would rather apply it by hand.

### Run

```bash
npm install
npm run dev
```

The dashboard is at `http://localhost:3000`. Sign in with a seeded backend admin username and password, then scan the QR code to enroll your authenticator app and save the backup codes it shows you. They are displayed once.

```bash
npm run build   # must pass before committing
npm run lint
```

The dashboard is deployed on Vercel and runs against the live backend on Render. Its URL is not published here: it is an internal tool, and without provisioned credentials and an enrolled authenticator there is nothing behind the login screen to see.

## Design notes

- **better-auth wraps the backend rather than replacing it.** The backend already had an admin login endpoint that verifies a password against its own `Admins` table, but the token it returns has no working refresh and a short expiry. Rather than change the backend's schema, this app treats that endpoint purely as a password check and then issues its own session cookie. That put 2FA, session lifetime, and backup codes entirely on the frontend side, with no backend migration.
- **No email-based password recovery for admins.** High-privilege accounts are a standard target through compromised email, and the backend's existing forgot-password flow structurally serves customers only. Recovery is by backup codes, or by a pre-provisioned break-glass account whose credentials are held offline.

## Limitations and what's next

- **No automated tests.** There is no test suite in this repository. Verification today is `npm run build` plus manual checking, which is the weakest part of this project and the first thing worth fixing.
- **Analytics read live aggregates, not a metrics table.** The backend has a generic metrics table that nothing writes to yet, so the overview queries customers, transactions, and wallets directly. That is fine at current data volume and will need a scheduled aggregation job before it is not.
- **No AI cost or call-volume metrics.** Nothing in the backend records AI usage, so the dashboard cannot report on what the Gemini integration costs to run. Adding it means new backend storage, not just a new endpoint.
- **No admin audit log.** Logins, lockouts, and password resets are not recorded anywhere. For a tool where every account can perform every action, that is a real gap.

## How this was built

This is a team capstone project. Development ran through a spec-driven workflow: the `context/` directory holds the living project specification, coding standards, and the feature currently in progress, and `CLAUDE.md` encodes this repository's real conventions for AI coding assistants. Features were written into the specification before implementation, and the specification names each place where the backend does not yet support what the dashboard needs rather than papering over it.
