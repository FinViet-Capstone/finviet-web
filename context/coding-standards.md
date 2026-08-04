# Next.js / React / TypeScript Coding Standards

You are an expert in TypeScript, Next.js App Router, and React, working on finviet-web — the
FinViet Admin internal dashboard (see [project-spec.md](project-spec.md)).

Note: this repo pins a pre-release Next.js version with breaking changes vs. training-data
knowledge. Before writing routing/data-fetching code, check `node_modules/next/dist/docs/` per
[AGENTS.md](../AGENTS.md).

## Code Style and Structure
- Write concise, technical TypeScript code with accurate examples.
- Use functional and declarative programming patterns; avoid classes.
- Prefer iteration and modularization over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., `isLoading`, `hasError`).
- Structure files: exported component, subcomponents, helpers, static content, types.

## Naming Conventions
- Use lowercase with dashes for directories (e.g., `components/auth-wizard`).
- Favor named exports for components.

## TypeScript Usage
- Use TypeScript for all code; prefer interfaces over types.
- Avoid enums; use maps instead.
- Use functional components with TypeScript interfaces.

## Syntax and Formatting
- Use the "function" keyword for pure functions.
- Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.
- Use declarative JSX.

## UI and Styling
- Current convention is CSS Modules (`*.module.css`, colocated with the component) — this is the
  `create-next-app` scaffold default, not yet a final decision (project-spec.md's Tech Stack
  section lists styling as still open/TBD). Don't introduce Tailwind, Shadcn UI, or another
  styling system without confirming first.
- Desktop-first layout — this is an internal ops tool, no phone-form-factor constraint (see
  project-spec.md's UI/UX section). Mobile/tablet breakpoints are explicitly out of scope.
- Vietnamese-first UI copy, matching the mobile app's language convention.

## Data Fetching and Server State
- **TanStack Query** (`@tanstack/react-query`) is the client-side data layer — use it for
  fetching, caching, and mutations in client components.
- **Axios calls to `finviet-be` stay server-side only** (Route Handlers / Server Components/Actions)
  — the browser only ever holds better-auth's session cookie, never the `finviet-be` JWT. Don't
  add client-side axios calls to `finviet-be`; go through a Next.js route handler instead.
- `finviet-be` responses are enveloped as `{ success, message, data }` — unwrap consistently
  rather than reaching into `.data.data` ad hoc at call sites.

## Auth
- `better-auth` ([src/lib/auth.ts](../src/lib/auth.ts)) owns session cookies and 2FA (TOTP). It
  does **not** own password verification — `finviet-be`'s `POST /api/auth/admin-login` is the
  source of truth for credential checks. Don't add competing auth logic without checking this
  split first.
- Public sign-up is disabled (`disableSignUp: true`) — admin accounts are provisioned
  server-side only, never via a public form.

## Performance Optimization
- Minimize `'use client'`, `useEffect`, and `setState`; favor React Server Components (RSC).
- Wrap client components in Suspense with a fallback.
- Use dynamic loading (`next/dynamic`) for non-critical components.
- Optimize images: WebP format, explicit size data, lazy loading via `next/image`.

## Key Conventions
- Optimize Web Vitals (LCP, CLS, FID).
- Limit `'use client'`:
  - Favor server components and Next.js SSR.
  - Use only for Web API access or interactivity in small, leaf components.
  - Avoid for data fetching or global state management.
- Confirmation step required before destructive/high-impact actions in the UI (account lock,
  password reset trigger, delete, announcement send) — matches the interaction convention in
  project-spec.md.

Follow the Next.js docs bundled in `node_modules/next/dist/docs/` for Data Fetching, Rendering,
and Routing — not general training-data knowledge, since this version has breaking changes.
