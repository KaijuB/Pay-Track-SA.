# PayTrack SA (MVP)

PayTrack SA is a POPIA-aware MVP for small South African organizations (Rental agencies, Schools, Gyms, SMEs) to:

- Register + login (JWT)
- Upload payment CSVs
- Calculate and store risk scores over time (0–1000)
- View a dashboard (table + charts)
- Generate AI-assisted warning letters (template-based; optional OpenAI enhancement)

This repo follows the provided system architecture diagram (`/docs/diagram.png`):
- **Frontend Web App**: React (Next.js pages) + Tailwind
- **Backend API**: Express (served as a Vercel serverless function)
- **Database**: PostgreSQL / Supabase

## Folder structure

```
/paytrack-sa
  /frontend
  /backend
  /database
  /docs
  /api
```

## Environment variables (Vercel)

Set these in Vercel Project Settings → Environment Variables:

- `DATABASE_URL` (PostgreSQL connection string)
- `JWT_SECRET` (strong random string)
- `NODE_ENV` (`production`)
- optional: `OPENAI_API_KEY` (if you want AI-polished letters)

## Database setup

Run the schema on your Postgres/Supabase database:

- `database/schema.sql`

Or via the provided migration script:

```bash
npm install
DATABASE_URL="..." node backend/scripts/migrate.js
```

## Local dev

```bash
npm install
npm --workspace frontend install
npm --workspace backend install

# 1) run DB migrations
DATABASE_URL="..." node backend/scripts/migrate.js

# 2) start frontend (3000) and backend (4000)
npm run dev
```

Frontend expects the backend at the same origin when deployed to Vercel. Locally, you can:
- run backend on `http://localhost:4000` and update `apiFetch` base URL if needed, or
- use a proxy.

## CSV format

Minimum required columns:
- ID Number
- Full Name
- Month (YYYY-MM)
- Amount Due
- Amount Paid

Optional:
- Date Paid
- Contact Email
- Contact Phone

The Upload page lets you map columns before sending to the backend.

## POPIA

- Organization registration requires acknowledging POPIA obligations.
- CSV uploads require confirming consumer consent.
- Letter generation is blocked for consumers where `consent_flag` is false.

