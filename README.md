# OneAtlas.dev

**AI Model Discovery & Intelligence Platform**

OneAtlas.dev helps developers explore AI models from multiple providers, compare their specifications, and find options that fit a workload. The project is built as a responsive full-stack web application and can run with its included demo catalog or an optional PostgreSQL database.

[Live demo](https://oneatlas-eta.vercel.app) · [GitHub repository](https://github.com/nitinjaiswal-tech/OneAtlas)

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2d3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-optional-4169e1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

## Project overview

The application includes a model catalog, provider directory, rankings, and comparison tools. Search and filters help narrow the catalog by provider, capabilities, price, context length, and category. Model pages show specifications such as pricing, context window, modalities, capabilities, and benchmark scores.

> **Demo data notice:** Model prices and benchmark scores in the included catalog are illustrative values for demonstration. They are not verified live information and should not be used for purchasing or production decisions.

## Features

- Search, filter, sort, and paginate the AI model catalog.
- View model details, specifications, capabilities, and benchmark scores.
- Compare models side by side.
- Explore model rankings and benchmark visualizations.
- Browse providers and their model profiles.
- Save favorite models in browser local storage.
- Use the Smart Model Finder to shortlist models by budget, task, context, and capabilities.
- Review a responsive dashboard with catalog summaries and a token cost calculator.
- Access REST API routes for models, providers, rankings, benchmarks, and comparisons.
- Use the bundled demo catalog without database credentials, or optionally connect PostgreSQL through Prisma.

## Technology

- **Application:** Next.js App Router, React, TypeScript, Node.js
- **Styling and UI:** Tailwind CSS, Lucide React
- **Data visualization:** Recharts
- **Validation:** Zod
- **Data layer:** Prisma ORM with optional PostgreSQL; typed demo data is used when `DATABASE_URL` is unset

## Run locally

### Requirements

- Node.js 20.9 or newer
- npm
- PostgreSQL only if using the optional database-backed catalog

### Demo mode

```bash
git clone https://github.com/nitinjaiswal-tech/OneAtlas.git
cd OneAtlas
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). With `DATABASE_URL` unset, the application uses the included demo catalog and does not require a database.

### Optional PostgreSQL setup

1. Copy `.env.example` to `.env`. In PowerShell, use:

   ```powershell
   Copy-Item .env.example .env
   ```

2. Set `DATABASE_URL` in `.env` to a PostgreSQL connection string for your database. The example file contains a local development URL; replace it with a URL appropriate for your environment.
3. Apply the Prisma schema and seed the catalog:

   ```bash
   npm run db:migrate -- --name init
   npm run db:seed
   ```

   The seed command loads demo providers, models, capabilities, and benchmark values. `.env` contains local configuration and should not be committed.

To open Prisma Studio after configuring the database:

```bash
npm run db:studio
```

## Common commands

| Command | Description |
| --- | --- |
| `npm run dev` | Generate the Prisma client and start the development server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run the TypeScript compiler without emitting files |
| `npm run build` | Generate the Prisma client and create a production build |
| `npm start` | Start the production server after building |
| `npm run db:migrate -- --name init` | Create and apply a development database migration |
| `npm run db:seed` | Seed the configured database with catalog demo data |
| `npm run db:studio` | Open Prisma Studio |

## Application pages

| Route | Description |
| --- | --- |
| `/` | Dashboard, pricing overview, featured models, and cost calculator |
| `/models` | Searchable and filterable model explorer |
| `/models/[slug]` | Model specifications and benchmark details |
| `/compare` | Side-by-side model comparison |
| `/rankings` | Overall, coding, reasoning, speed, and cost-efficiency rankings |
| `/providers` | Provider directory |
| `/providers/[slug]` | Provider profile and associated models |
| `/finder` | Smart Model Finder |
| `/favorites` | Models saved in the current browser |

## REST API

All endpoints use `GET` and return JSON.

| Endpoint | Description |
| --- | --- |
| `/api/models` | List models. Supports the query parameters below. |
| `/api/models/[slug]` | Retrieve a model by slug. |
| `/api/providers` | List providers with model counts. |
| `/api/providers/[slug]` | Retrieve a provider and its models. |
| `/api/rankings` | Retrieve the top 10 models for a ranking category. |
| `/api/benchmarks` | Retrieve benchmark groups and their top five models. |
| `/api/compare` | Retrieve models selected by slug. |

### Model list parameters

`GET /api/models` accepts:

| Parameter | Description |
| --- | --- |
| `search` | Search model and provider names. |
| `provider` | Filter by provider slug, such as `anthropic`. |
| `capability` | Filter by capability name, such as `Coding`. |
| `category` | Filter by model category. |
| `maxPrice` | Maximum input price per million tokens. |
| `minContext` | Minimum context window in tokens. |
| `sort` | `popularity` (default), `inputPrice`, `contextWindow`, or `speedScore`. |
| `page` | One-based page number (default `1`). |
| `pageSize` | Results per page (default `8`, maximum `50`). |

Example:

```text
/api/models?search=claude&provider=anthropic&maxPrice=5&minContext=128000&sort=inputPrice&page=1&pageSize=8
```

The response contains `models`, `total`, `page`, and `pageSize`.

### Other endpoint parameters

- `/api/rankings?category=overall` supports `overall` (default), `coding`, `reasoning`, `speed`, and `value`.
- `/api/compare?slugs=claude-3-7-sonnet,gpt-4o` accepts comma-separated model slugs and supports up to four models.
- Provider detail and model detail endpoints take the slug from their respective URL path.
- `/api/benchmarks` does not require query parameters.

When `DATABASE_URL` is unset, API routes use the bundled demo catalog. When it is set, catalog data is read through the Prisma/PostgreSQL data layer.

## Project structure

```text
prisma/
  schema.prisma          # PostgreSQL data models
  seed.ts                # Demo catalog seed
src/
  app/
    api/                 # REST API route handlers
    compare/             # Model comparison page
    favorites/           # Saved models page
    finder/              # Smart Model Finder page
    models/              # Model explorer and detail pages
    providers/            # Provider directory and profile pages
    rankings/             # Rankings and benchmark views
    page.tsx              # Dashboard
    layout.tsx            # Root application layout
    globals.css           # Global styles
  components/
    app-shell.tsx         # Shared navigation and application shell
    tools.tsx             # Finder and cost calculator
    ui.tsx                # Shared UI components
  lib/
    data.ts               # Demo/database data abstraction
    db.ts                 # Prisma client setup
    demo-data.ts          # Illustrative catalog data
    types.ts              # Shared TypeScript types
public/                   # Static assets
.env.example              # Optional local database URL template
prisma.config.ts          # Prisma configuration
```

## Data and production considerations

The included prices and benchmark scores are sample values, not verified or continuously refreshed provider data. Confirm current pricing, availability, and benchmark methodology with the provider before making decisions. Favorites are stored locally in the browser; this project does not provide account-based synchronization.
