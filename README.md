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
lib/
  prisma.ts
  utils.ts
prisma/
  schema.prisma
```
