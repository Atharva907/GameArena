# GameArena

GameArena is a separated full-stack esports platform built with a Next.js 15 frontend, an Express backend, React 19, PostgreSQL, Prisma, Tailwind CSS v4, JWT authentication, Nodemailer, ImageKit, Redux Persist, Radix UI, and Framer Motion.

The repository uses a PostgreSQL data layer under `backend/prisma/` and `backend/src/lib/postgres.js`.

The platform supports multi-game tournament registration, wallet-based participation fees, a shop/cart/checkout flow, admin management, media uploads, OTP-based authentication, leaderboards, bracket generation, order fulfillment, refunds, and business email notifications.

## Main Modules

- Public website: landing page, game pages, leaderboard, rewards, shop, tournament detail pages.
- Authentication: registration, OTP verification, login, logout, reset password.
- User dashboard: account, wallet, tournament registrations, orders.
- Tournament engine: participant registration, wallet deduction, bracket generation, match result updates, standings.
- Shop and checkout: cart persistence, stock validation, wallet checkout, order history.
- Admin panel: users, categories, products, orders, tournaments, media uploads, brackets.
- Notifications: OTP, email verification, order confirmation, order status, tournament registration confirmation.
- Operations: environment validation, health endpoint, smoke test script.

## Tech Stack

- Frontend: Next.js 15 App Router
- Backend: Express 4 API service in `backend/`
- UI: React 19, Tailwind CSS v4, Radix UI, Lucide icons, Framer Motion
- Database: PostgreSQL with Prisma
- Authentication: JWT cookies using `jose`
- State: Redux Persist and React cart context
- Email: Nodemailer
- Media: ImageKit

## Local Setup

Install dependencies:

```bash
npm install
```

Create local environment configuration:

```bash
Copy-Item .env.example .env.local
```

Update `.env.local` with frontend and backend values. For local development, keep:

```text
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000/api
FRONTEND_ORIGIN=http://localhost:3000
BACKEND_PORT=4000
```

Validate environment:

```bash
npm run validate:env
```

Seed demo data when required:

```bash
npm run seed
```

Start the backend API:

```bash
npm run backend:dev
```

Start the frontend in a second terminal:

```bash
npm run dev
```

Open `http://localhost:3000`. The backend runs at `http://localhost:4000/api`.

## Dockerized Setup

To run the full stack with PostgreSQL in containers:

```bash
npm run docker:up
```

That starts PostgreSQL, the backend API, and the frontend app. The companion commands are `npm run docker:build`, `npm run docker:logs`, and `npm run docker:down`.

## Render Deployment

The repository is ready for separate Render services through `render.yaml`:

- `gamearena-backend`: Express API from `backend/`
- `gamearena-frontend`: Next.js frontend from the repository root
- `gamearena-postgres`: managed PostgreSQL database

Use Render Blueprints from this repository. The backend runs Prisma migrations with `npm run db:migrate:deploy` before each deploy.
The Blueprint uses Render free plans. Render free PostgreSQL is intended for demos and expires after 30 days, so export or reseed data before it expires.

Default deployed URLs expected by `render.yaml`:

```text
Frontend: https://gamearena-frontend.onrender.com
Backend: https://gamearena-backend.onrender.com/api
Health: https://gamearena-backend.onrender.com/api/health
```

If you rename either Render service, update these variables in Render before deploying:

```text
Frontend service:
NEXT_PUBLIC_BASE_URL=https://your-frontend-service.onrender.com
NEXT_PUBLIC_API_URL=https://your-backend-service.onrender.com/api

Backend service:
FRONTEND_ORIGIN=https://your-frontend-service.onrender.com
```

Set these secret values in Render after creating the Blueprint:

```text
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY
IMAGEKIT_PRIVATE_KEY
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
NODEMAILER_HOST
NODEMAILER_EMAIL
NODEMAILER_PASSWORD
```

## Verification

Run lint:

```bash
npm run lint
```

Run production build:

```bash
npm run build
```

Run smoke tests against the configured local URL:

```bash
npm run test:smoke
```

For a deployed URL:

```bash
$env:SMOKE_BASE_URL="https://your-domain.example"
npm run test:smoke
```

Run the full production readiness check:

```bash
npm run check:production
```

The repository also includes a GitHub Actions workflow that runs linting, build validation, database seeding, smoke tests, and Docker image builds on every push and pull request.

## Health Check

The backend exposes:

```text
GET http://localhost:4000/api/health
```

It reports app, database, mail, and ImageKit readiness. A `503` response means the app is running but the PostgreSQL database or another external dependency is not reachable.

## Deployment Notes

- Deploy the frontend and backend as separate services. The committed `render.yaml` is the active deployment config.
- Configure `NEXT_PUBLIC_API_URL` in the frontend to point to the backend `/api` URL.
- Configure `FRONTEND_ORIGIN` in the backend to the deployed frontend origin.
- Configure all production environment variables in the appropriate hosting service.
- Ensure PostgreSQL access allows the deployment runtime.
- Configure ImageKit before using admin media upload.
- Configure Nodemailer before testing OTP and notification emails.
- After auth or role changes, log out and log back in so the JWT cookie contains the latest role claim.
- Follow [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) before final submission or hosting.

## Completed Implementation Phases

1. Core stabilization and broken flow fixes.
2. Security, role authorization, and rate limiting.
3. Tournament engine with brackets, match results, and standings.
4. Transactional commerce and wallet order flow.
5. Business notifications and operational traceability.
6. Final deployment readiness, validation scripts, smoke tests, and handoff documentation.
