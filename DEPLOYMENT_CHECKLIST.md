# GameArena Deployment Checklist

This checklist is used for the final project handoff after Phase 6.

## 1. Environment

- Copy `.env.example` to `.env.local` for local development.
- Set a long random `SECRET_KEY` of at least 32 characters.
- For Render deployment, use the committed `render.yaml` Blueprint. The old Vercel config has been removed.
- Keep frontend and backend as separate Render web services:
  - Frontend: `gamearena-frontend`
  - Backend: `gamearena-backend`
  - Database: `gamearena-postgres`
- Configure the database connection:
  - `DATABASE_PROVIDER=postgresql`
  - `DATABASE_URL=postgresql://gamearena:<password>@127.0.0.1:5432/gamearena?schema=public`
- Configure ImageKit keys before using admin media upload.
- Configure Nodemailer credentials before testing OTP and business emails.
- Run:

```bash
npm run validate:env
```

For production-style validation, run:

```bash
npm run validate:env:production
```

## 2. Database

- Confirm the PostgreSQL service or hosted database is reachable from the backend runtime.
- On Render, `DATABASE_URL` is injected into the backend from the `gamearena-postgres` database.
- Run the Prisma migration deploy if the database is empty:

```bash
npm --prefix backend run db:migrate:deploy
```

When using Docker Compose, the `migrate` service applies this step automatically
before the backend service starts. On Render, the backend `preDeployCommand`
applies migrations before the service starts.

- Run the seed scripts if the database is empty:

```bash
npm run seed
npm run seed:products
```

- Create or verify at least one admin user before deployment testing.
- Log out and log back in after role/auth changes so JWT cookies include the latest role claim.

## 3. Build Verification

Run the local verification sequence:

```bash
npm run lint
npm run build
```

The build is not production-ready until `/api/health` reports `status: "ok"` with `database: "ok"`.

## 4. Runtime Smoke Test

Start the app:

```bash
npm run dev
```

Then run:

```bash
npm run test:smoke
```

For a deployed URL:

```bash
$env:SMOKE_BASE_URL="https://your-domain.example"
npm run test:smoke
```

## 5. Feature Acceptance

- Authentication: register, verify OTP, login, logout, reset password.
- Admin: create products, categories, tournaments, upload media, manage users.
- Tournament: register with wallet deduction, generate bracket, update match result, verify standings.
- Shop: add to cart, validate checkout, deduct wallet, reduce stock, view order.
- Orders: admin status updates, cancellation refund, stock restoration, user order history.
- Notifications: OTP email, order confirmation email, order status email, tournament registration email.
- Health: `/api/health` returns `ok` when the PostgreSQL database is reachable.

## 6. Known External Dependency

The PostgreSQL service must allow the deployment runtime to connect. If it does not,
admin overview prerendering and `/api/health` will report database connection errors
even when the application build succeeds.

Render deployment requires the ImageKit and Nodemailer secrets to be filled after
the Blueprint is created. They are intentionally marked `sync: false` in
`render.yaml` so secrets are not committed.
