# Coding Standards

## TypeScript

- Strict mode enabled
- No `any` types - use proper typing or `unknown`
- Define interfaces for all props, API responses, and data models
- Use type inference where obvious, explicit types where helpful

## React

- Functional components only (no class components)
- Use hooks for state and side effects
- Keep components focused - one job per component
- Extract reusable logic into custom hooks

## Next.js

- Server components by default
- Only use `'use client'` when needed (interactivity, hooks, browser APIs)
- Route Handlers are the standard mechanism for client-triggered mutations — see Data Fetching.
  Reach for one whenever a Client Component needs to call `finviet-be`.
- Use Server Actions only for the cases Route Handlers can't cover well: progressive-enhancement
  forms with no client-side state, or one-off server-only logic with no client caller.
- Otherwise, fetch data directly in server components
- Dynamic routes for item/collection pages

## Tailwind CSS v4

**CRITICAL**: We are using Tailwind CSS v4, which uses CSS-based configuration.

- **DO NOT** create `tailwind.config.ts` or `tailwind.config.js` files (those are for v3)
- All theme configuration must be done in CSS using the `@theme` directive in `src/app/globals.css`
- Use CSS custom properties for colors, spacing, etc.
- No JavaScript-based config allowed

Example v4 configuration:

```css
@import "tailwindcss";

@theme {
  --color-primary: oklch(50% 0.2 250);
}
```

## File Organization

- Components: `src/components/[feature]/ComponentName.tsx`
- Pages: `src/app/[route]/page.tsx`
- Route Handlers: `src/app/api/[feature]/route.ts`
- Types: `src/types/[feature].ts`
- Lib/Utils: `src/lib/[utility].ts`

## Naming

- Components: PascalCase (`ItemCard.tsx`)
- Files: Match component name or kebab-case
- Functions: camelCase
- Constants: SCREAMING_SNAKE_CASE
- Types/Interfaces: PascalCase (no prefix)

## Styling

- Tailwind CSS for all styling
- Use shadcn/ui components where applicable
- No inline styles
- light mode first, dark mode as option

## Data Fetching

- No direct database access from this app — `finviet-be` (a separate .NET API) is the only data
  source, reached server-side via Axios. The browser never holds the `finviet-be` JWT, only
  better-auth's session cookie.
- Client components use TanStack Query (`useQuery`/`useMutation`) as the one client-side data
  layer — calling Next.js Route Handlers, which attach the admin's JWT and call `finviet-be`.
  Don't call Server Actions directly from Client Components; route all client-triggered
  mutations through this same Route-Handler-via-TanStack-Query path for one consistent,
  auditable place to keep JWT-attachment and envelope-unwrapping (`{ success, message, data }`)
  logic.
- Validate all inputs with Zod

## Error Handling

- Use try/catch in Route Handlers
- Return `{ success, data, error }` pattern from Route Handler responses
- Display user-friendly error messages via toast

## Code Quality

- No commented-out code unless specified
- No unused imports or variables
- Keep functions under 50 lines when possible
