# OneAtlas.dev

OneAtlas is a responsive AI model discovery and comparison app. The included catalog is a demo snapshot: pricing and benchmark scores are illustrative and are **not verified live provider data**.

## Requirements

- Node.js 20.9 or newer
- npm
- PostgreSQL only if you want to use the database-backed catalog

## Run in demo mode

```bash
npm install
npm run dev
```

The app uses its typed in-repository demo catalog when `DATABASE_URL` is not set. No database is required for the dashboard, model explorer, recommendations, comparison, or rankings.

## Use PostgreSQL

1. Copy `.env.example` to `.env` and set `DATABASE_URL` to your PostgreSQL connection string.
2. Apply the schema and load the demo records:

```bash
npm run db:migrate -- --name init
npm run db:seed
```

`npm run db:studio` opens Prisma Studio. The seed can be run again safely to refresh provider, model, capability, and benchmark demo records.

## Useful commands

```bash
npm run dev       # Local development
npm run lint      # ESLint
npm run typecheck # TypeScript
npm run build     # Production build
npm start         # Run the production build
```

## Included routes

- `/` — dashboard, pricing overview, cost calculator, and featured models
- `/models` and `/models/[slug]` — searchable catalog and model specifications
- `/compare` — side-by-side comparison for three models
- `/rankings` — overall, coding, reasoning, speed, and cost rankings
- `/providers` and `/providers/[slug]` — provider directory and model listings
- `/finder` — budget, task, context, and capability-based recommendations
- `/favorites` — browser-local saved models

The REST API lives under `/api`: models, providers, rankings, benchmarks, and compare. Set `DATABASE_URL` to use PostgreSQL; otherwise the same API reads from the demo data module.
