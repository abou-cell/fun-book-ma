# FunBook Morocco - MVP Step 1

Next.js App Router + TypeScript + Tailwind CSS + Prisma + PostgreSQL starter for an activities marketplace in Morocco.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env
```

3. Generate Prisma client:

```bash
npm run prisma:generate
```

4. Start dev server:

```bash
npm run dev
```

## Project structure

```txt
app/
  layout.tsx
  page.tsx
  globals.css
components/
  Navbar.tsx
  SearchBar.tsx
  ActivityCard.tsx
  SectionHeader.tsx
features/
  home/
    components/
      HeroSection.tsx
      CategoriesSection.tsx
      PopularActivitiesSection.tsx
    data.ts
lib/
  prisma.ts
  utils.ts
prisma/
  schema.prisma
```

## Best practices

### App Router and component design

- Keep route-level concerns in `app/` and reusable UI in `components/` or `features/*/components`.
- Default to Server Components; add `"use client"` only when you need browser APIs, local state, or event handlers.
- Keep components focused and composable. Favor small presentational components over large, multi-purpose files.

### Data and database workflow

- Treat Prisma schema changes as source of truth and run migrations for every schema update.
- Regenerate Prisma Client after schema edits:

```bash
npm run prisma:generate
```

- Centralize DB access through `lib/prisma.ts` and avoid creating multiple Prisma clients.

### Styling and UI consistency

- Use Tailwind utility classes directly in components, and use `lib/utils.ts` helpers for safe class composition.
- Reuse shared UI primitives (cards, section headers, navigation) before adding new variants.
- Keep spacing, typography, and color usage consistent with existing patterns in `app/globals.css` and current components.

### Code quality

- Run lint checks before committing:

```bash
npm run lint
```

- Prefer strict typing and avoid `any`; model domain data with explicit TypeScript types/interfaces.
- Keep mock or seed-style data (like home page fixtures) isolated in feature data files.

### Environment and operations

- Never commit `.env`; copy from `.env.example` and keep secrets local.
- Validate app changes in development (`npm run dev`) and verify production builds (`npm run build`) before release.

### API and authentication hygiene

- Validate incoming request payloads at API boundaries (for example, in `app/api/auth/*`) before touching business logic or the database.
- Keep authentication and session logic centralized in `lib/auth/*`; avoid duplicating cookie/session rules across route handlers.
- Return consistent, minimal error messages from auth endpoints to avoid leaking sensitive implementation details.

### Security and privacy

- Hash passwords with a strong one-way algorithm and never log credentials or full session tokens.
- Use least-privilege database access and avoid exposing internal IDs or sensitive fields in client-facing responses.
- Keep dependencies current (`npm outdated`) and apply security fixes promptly.

### Performance and maintainability

- Prefer server-side data fetching in App Router routes to reduce client bundle size.
- Avoid unnecessary re-renders by keeping client component state local and passing only needed props.
- When adding new features, colocate domain-specific code under `features/<feature-name>/` to keep modules discoverable.
