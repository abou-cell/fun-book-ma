# FunBook Morocco (Production-Ready Baseline)

Marketplace starter built with Next.js App Router, TypeScript, Prisma, and PostgreSQL.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Prisma ORM
- PostgreSQL
- NextAuth (credentials)
- Vitest + Testing Library

## 1) Local setup

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate:deploy
npm run dev
```

App runs on `http://localhost:3000`.

## 2) Environment configuration

Copy `.env.example` to `.env` and configure:

- Database: `DATABASE_URL`
- Auth: `AUTH_SECRET`
- Email placeholders: `EMAIL_PROVIDER`, SMTP values
- Storage placeholders: `STORAGE_*`
- Payment placeholders: `PAYMENT_*`, `MOCK_PAYMENT_SUCCESS_RATE`
- Monitoring/ops: `MONITORING_DSN`, `APP_LOG_LEVEL`, `MAINTENANCE_MODE`
- Public values: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPPORT_WHATSAPP`

Environment values are validated in `lib/env.ts` at runtime.

## 3) Security and operational baseline

Implemented:

- Centralized environment validation
- Security headers configured in `next.config.ts`
- Rate-limit-ready helper for auth and booking endpoints
- Structured logging with redaction in `lib/observability/logger.ts`
- Monitoring hooks/placeholders in `lib/observability/monitoring.ts`
- Global app error boundary and not-found page
- Health check endpoint: `GET /api/health`
- Secure upload checks for file type and size
- Provider/admin route protection kept server-side via middleware and role policies

## 4) Testing

```bash
npm run test
npm run test:coverage
```

Included tests cover:

- auth password utils
- role protection helpers
- commission calculations
- booking validation
- payment status logic
- localization utilities
- health-route integration readiness

E2E readiness scaffolding is in `tests/e2e/` (Playwright installed).

## 5) Database and migrations

Production-safe Prisma scripts:

```bash
npm run prisma:generate
npm run prisma:migrate:deploy
npm run prisma:migrate:dev
npm run prisma:seed:dev
```

- `prisma:seed:dev` is intended for development only.

## 6) Deployment (Vercel + managed Postgres)

1. Create managed PostgreSQL and set `DATABASE_URL`.
2. Set required environment variables in Vercel project settings.
3. Build command: `npm run build`.
4. Start command: `npm run start`.
5. Run migrations as part of release workflow: `npm run prisma:migrate:deploy`.
6. Verify `/api/health` after deployment.

## 7) Production checklist

- [ ] `AUTH_SECRET` is long/random
- [ ] `DATABASE_URL` points to managed Postgres
- [ ] Email/storage/payment provider secrets are set
- [ ] `NEXT_PUBLIC_APP_URL` uses production domain
- [ ] `npm run lint`, `npm run test`, `npm run build` pass
- [ ] Health check monitored
- [ ] Monitoring DSN configured (when provider selected)
