# GameArena Database Setup

GameArena now uses PostgreSQL with Prisma as the active runtime database.
This document explains how to prepare the local database used by the backend
and how to seed the initial tournament and shop data.

## Prerequisites

1. PostgreSQL 18 or compatible PostgreSQL server running on the local machine.
2. Node.js and npm installed.
3. The backend `.env.local` file configured with:
   - `DATABASE_PROVIDER=postgresql`
   - `DATABASE_URL=postgresql://gamearena:<password>@127.0.0.1:5432/gamearena?schema=public`

## Local Database Preparation

1. Confirm that PostgreSQL is listening on port `5432`.
2. Confirm that the `gamearena` database exists and that the `gamearena`
   user has access.
3. From the backend directory, deploy the Prisma migration:

```bash
npm --prefix backend run db:migrate:deploy
```

This applies the migration that creates the tables and constraints defined in
`backend/prisma/schema.prisma`.

## Seeding Initial Data

Use the seed scripts after the schema is ready:

```bash
npm run seed
npm run seed:products
```

The tournament seed populates public tournament records. The product seed
creates the initial categories and shop items used by the storefront and
admin panel.

## Data Model Summary

The PostgreSQL schema contains the following main entities:

- `users` for authentication, role control, and profile ownership.
- `players` for tournament profiles and wallet balances.
- `tournaments` and `tournament_registrations` for competitive events.
- `tournament_matches` for bracket and match results.
- `products` and `categories` for the shop catalogue.
- `orders`, `order_items`, and `order_status_history` for commerce flow.
- `otps` for verification, login, and reset-code tracking.
- `medias` for ImageKit-backed uploaded assets.
- `player_transactions` for wallet movements and audit history.

## Troubleshooting

1. **Connection fails**
   - Verify `DATABASE_URL` points to the local PostgreSQL server.
   - Confirm the PostgreSQL service is running.

2. **Schema push fails**
   - Make sure the database exists and the user in `DATABASE_URL` can create
     tables and indexes.

3. **Seed scripts skip data**
   - The scripts skip inserts when data already exists. Delete the records or
     use a fresh database if a clean reseed is required.
