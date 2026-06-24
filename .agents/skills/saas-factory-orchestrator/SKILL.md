---
name: saas-factory-orchestrator
description: Master orchestrator for building complete SaaS products end-to-end. Use when the user asks to build a SaaS, app, platform, AI tool, website, dashboard, API system, automation pipeline, or wants to turn an idea into a monetized product. Also use for adding payments/subscriptions, authentication, user management, AI agents, compliance tools, analytics, or enterprise features to an existing product.
---

# SaaS Factory Orchestrator

Convert any product idea into a complete, buildable, production-ready SaaS system. This skill governs the end-to-end build process — from idea to deployed product.

## When to Use

- User asks to build a SaaS, app, platform, AI tool, website, or automation system
- User wants to monetize an idea or turn a concept into a product
- User needs a dashboard, API, backend, or full-stack application
- User wants to add payments, subscriptions, users, or authentication
- User wants to build AI agents, automation workflows, or integration pipelines
- User asks for compliance scanning, logistics systems, analytics, or enterprise tools

## Build Process

### 1. Capture the Product Concept

Before building, extract:
- Product name and one-line purpose
- Target users (who pays for it?)
- Core features (MVP first, then premium expansion)
- Tech preferences (default: React + Express + PostgreSQL + Stripe)

### 2. Architect the System

Always produce:
1. **Product architecture** — high-level system design (frontend, backend, database, integrations)
2. **Core features** — split into MVP / Premium / Enterprise tiers
3. **Database schema** — tables, relationships, key fields
4. **API routes** — REST endpoints with methods and auth requirements
5. **UI structure** — pages, routes, and one-line purpose per page
6. **Monetization strategy** — pricing tiers, revenue streams

### 3. Build Order (follow this sequence)

1. Write the OpenAPI spec first (`lib/api-spec/openapi.yaml`) — it gates all codegen
2. Run codegen: `pnpm --filter @workspace/api-spec run codegen`
3. Launch the DESIGN subagent immediately after codegen (it is the bottleneck)
4. In parallel: provision database, write schema, implement routes, seed data
5. Wait for design subagent, then fix integration issues
6. Present artifact and suggest deploy

### 4. Standard Stack Defaults

| Layer | Default |
|-------|---------|
| Frontend | React + Vite + Tailwind + shadcn/ui |
| Backend | Express 5 (already set up in api-server) |
| Database | PostgreSQL + Drizzle ORM |
| Auth | Replit Auth or Clerk |
| Payments | Stripe |
| AI | Replit AI Integrations (OpenAI-compatible, no key needed) |

### 5. Monetization Structure

Default pricing tiers for any SaaS:

| Plan | Price | Core Limits | Features |
|------|-------|------------|---------|
| Free | $0 | 1-2 resources | Basic access, community support |
| Starter | $29/mo | 5-10 resources | Core features, email support |
| Pro | $79/mo | 25-50 resources | Advanced features, priority support |
| Enterprise | $199/mo | Unlimited | White-label, SLA, dedicated support |

Revenue streams to consider: subscriptions, usage-based credits, marketplace commissions, API access fees.

### 6. Design Subagent Brief Rules

- Include product identity sentence (vivid, specific, 1-2 lines)
- List pages with routes and one-line purposes
- List all generated API hooks with exact signatures
- Set emotional tone appropriate to app type (productivity = dense/capable; consumer = personality/warmth; landing page = extraordinary creative push)
- Do NOT prescribe colors, layouts, or section structure — the DESIGN subagent owns all visual decisions

## Feature Templates

### Authentication
Use Replit Auth (read `replit-auth` skill) or Clerk (read `clerk-auth` skill) — never local auth (passport, bcrypt, JWT) unless explicitly requested.

### Payments
Read the `monetization` skill to pick the right provider. Default to Stripe for web SaaS.

### AI Features
Use Replit AI Integrations (read `ai-integrations-openai` skill) — no API key required from the user.

### File Storage
Use Replit Object Storage (read `object-storage` skill) for user uploads.

## Output Format

Always produce a working app, not just a plan. For every build:
- All navigation links must work
- All CRUD flows must use real API hooks (not mock data)
- Dashboard summaries and activity feeds must be real endpoints
- Seed at least 2-3 rows per table so the app is not empty on first load

## Common Patterns

### Credit/Usage System
Track `creditsUsed` per user/project. Decrement on AI operations. Block generation when credits exhausted.

### Multi-tenant
Add `userId` to all resource tables. Apply row-level filtering in all list endpoints.

### Status State Machine
Use explicit status fields with `enum` constraints. Common pattern: `draft → generating → ready → deployed → error`.

### Activity Feed
Append to an `activity` table on every significant event (create, generate, deploy, error). Surface via `/dashboard/activity`.
