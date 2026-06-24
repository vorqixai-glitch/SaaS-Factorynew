# SaaS Factory

A meta-platform for generating, managing, and deploying SaaS products from AI prompts. Users describe their product, AI generates the full codebase, and they deploy with one click.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/saas-factory run dev` — run the frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind + shadcn/ui (wouter routing)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/projects.ts` — DB schema (projects, deployments, files, activity)
- `artifacts/api-server/src/routes/` — backend route handlers
- `artifacts/saas-factory/src/pages/` — frontend pages
- `artifacts/saas-factory/src/components/layout/` — AppLayout + LandingLayout

## Architecture decisions

- Contract-first: OpenAPI spec gates all codegen; never hand-write types that Orval generates.
- Single dark theme throughout (hsl 240 10% 4% background, hsl 180 100% 50% electric cyan primary).
- AI generation is mocked (returns structured code); plug in a real LLM call in `routes/projects.ts:generateProject`.
- Deployments are mocked (returns a fake URL); integrate Vercel/Netlify APIs for real deploys.
- Credit system tracked per-project in `credits_used` column; global credit pool is currently fixed at 500.

## Product

- Landing page with features, templates, pricing, and CTAs
- Dashboard with project grid, stats cards, and activity feed
- New project creation with template picker
- Project detail with tabs: Overview, Code viewer, Preview iframe, Deploy, Settings
- AI generation page with model selector and prompt input
- Deploy manager with platform selector and deployment history
- Templates marketplace with search and category filter
- Billing page with plan comparison, credit usage bar, and top-up options

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After changing `lib/db/src/schema/`, always run `pnpm run typecheck:libs` before checking artifact packages — leaf typechecks need fresh workspace declarations.
- Orval body schema names must be entity-shaped (e.g. `ProjectInput`, not `CreateProjectBody`) to avoid TS2308 collisions.
- The `queryKey` field is required in orval-generated hooks — always pass it explicitly.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- Skill saved at `.agents/skills/saas-factory-orchestrator/SKILL.md`
