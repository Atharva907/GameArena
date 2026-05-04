# GameArena Backend

This is the standalone Express backend for GameArena.

The backend owns all API behavior for authentication, users, players, tournaments, wallet operations, shop/order workflows, admin data, ImageKit media, email notifications, health checks, and database access. The Next.js frontend calls this service through `NEXT_PUBLIC_API_URL`.

The backend now runs on PostgreSQL with Prisma. MongoDB is no longer part of the active runtime.

## Commands

Install backend dependencies:

```bash
npm --prefix backend install
```

Validate backend environment:

```bash
npm --prefix backend run validate:env
```

Start backend:

```bash
npm --prefix backend run dev
```

Start backend in production mode:

```bash
npm --prefix backend run start
```

Prisma database commands:

```bash
npm --prefix backend run db:generate
npm --prefix backend run db:migrate:deploy
npm --prefix backend run db:migrate
npm --prefix backend run db:push
npm --prefix backend run db:studio
```

The backend defaults to `http://localhost:4000`.

## Docker

The backend can be run with the repository Docker Compose file from the project root:

```bash
docker compose up --build
```

For the backend service only, build the image from the repository root with:

```bash
docker build -f backend/Dockerfile .
```

The Compose stack runs a one-shot `migrate` service before the backend starts,
so database migrations are applied in a controlled step instead of inside the
main app process.

## Main Route Groups

```text
GET /api
GET /api/health
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/user/me
GET|POST|PUT /api/player
GET|POST|PUT|DELETE /api/products
GET|POST|PUT|DELETE /api/categories
GET|POST /api/orders
GET|PATCH|DELETE /api/admin/orders
GET /api/admin/overview
GET|POST|PUT|DELETE /api/tournaments
GET|POST /api/registration
GET /api/wallet
GET /api/media/library
POST /api/media/upload
DELETE|POST /api/media/delete
POST /api/media/create
```

## Frontend Integration

Set this in the frontend environment:

```text
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Set this in the backend environment:

```text
FRONTEND_ORIGIN=http://localhost:3000
```

For production, replace both values with deployed origins. Cookies require the frontend and backend CORS/cookie settings to agree.
