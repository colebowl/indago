---
title: 'Indago MVP — Property Due Diligence Platform'
slug: 'indago-mvp'
created: '2026-03-01'
status: 'review'
stepsCompleted: [1, 2, 3]
tech_stack:
  - pnpm-workspaces
  - fastify
  - drizzle-orm
  - postgresql
  - react
  - vite
  - shadcn-ui
  - tailwindcss
  - tanstack-react-query
  - zustand
  - react-hook-form
  - zod
  - react-router
  - anthropic-sdk
  - n8n
  - docker-compose
files_to_modify: []
code_patterns:
  - adapter-pattern-for-providers
  - check-definition-persona-skill
  - zod-schemas-as-source-of-truth
  - discriminated-unions
  - result-type-pattern
test_patterns:
  - fastify-inject-integration
  - mock-at-adapter-boundary
---

# Tech-Spec: Indago MVP — Property Due Diligence Platform

**Created:** 2026-03-01

## Overview

### Problem Statement

Residential property due diligence in British Columbia is fragmented across dozens of government portals, professional inspections, and conversations that buyers don't know to have. No single tool orchestrates the full process, explains why each check matters, or contextualizes what findings mean for the buyer's specific situation.

### Solution

An AI-native monorepo web app (Fastify API + React SPA) that:
- Uses Claude's web search tool to fetch listing data and research zoning/OCP information
- Guides manual lookups (LTSA title search) with step-by-step instructions and processes uploaded documents
- Drafts property history inquiries and tracks correspondence
- Calculates BC Property Transfer Tax with exemption checks
- Presents all findings as sourced, personalized insights organized by buyer questions
- Implements a modular check architecture (Definition + Persona + Skill) where each check is an independently testable, swappable AI agent

### Scope

**In Scope:**
- Monorepo scaffolding: Turborepo + pnpm workspaces
- Fastify API with versioned routes, provider pattern, Drizzle ORM + PostgreSQL
- React SPA with Vite, shadcn/ui, Tailwind CSS, React Query, Zustand, React Router
- Shared types package with Zod schemas
- Check architecture: Definition + Persona + Skill pattern per check
- Flow A: Listing intake (Claude web search) → zoning + OCP intelligence + PTT calculator
- Flow B: LTSA title search guidance + PDF upload + AI document parsing
- Flow C: Property history inquiry drafting + correspondence tracking
- Buyer type intake (1-3 questions) for insight prioritization
- Question-first report UI with sourced answers at three levels
- Tier 2 simulated sections (natural hazards, financial, strata) with mock data
- Tier 3 listed sections (all remaining checks visible but inactive)
- n8n for check workflow orchestration (parallel/sequential execution, retries, visual workflow)
- Docker Compose for local dev (Postgres + API + Web + n8n)

**Out of Scope:**
- Multi-province support (BC only for MVP)
- User authentication / accounts
- Real-time government API integrations (beyond Claude web search)
- Payment processing
- Mobile native apps
- Automated email sending (draft only)
- Digital Ocean deployment (stretch goal)
- Comprehensive test coverage (demo-focused MVP)

## Context for Development

### Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Monorepo | pnpm workspaces (no Turborepo — unnecessary for solo dev MVP) | |
| API Framework | Fastify | app.ts/server.ts split for testability |
| ORM | Drizzle ORM | TypeScript-native, lightweight |
| Database | PostgreSQL 16 | Local via Docker Compose |
| Web Framework | React 18 + Vite | |
| UI Components | shadcn/ui + Tailwind CSS | teal/blue-green primary palette |
| Server State | @tanstack/react-query | |
| UI State | Zustand | Global UI only (theme, modals, sidebar) |
| Forms | react-hook-form + @hookform/resolvers/zod | |
| Routing | React Router v6 | |
| Validation | Zod | Shared schemas in packages/types |
| LLM | Anthropic Claude API (@anthropic-ai/sdk) | Web search tool for research |
| PDF Processing | Claude document API | Send PDF directly to Claude |
| Orchestration | n8n (self-hosted) | Check workflow orchestration, parallel execution |
| Logging | Pino (Fastify built-in) | |
| Infrastructure | Docker Compose | postgres + api + web + n8n |

### Project Structure

```
/
  apps/
    api/
      src/
        app.ts                    ← Fastify instance, plugin registration
        server.ts                 ← entry point: app.listen()
        config/
          env.ts                  ← Zod env validation
        providers/
          llm/
            types.ts              ← interface LLMProvider
            index.ts              ← re-exports active implementation
            anthropic.ts          ← AnthropicProvider implements LLMProvider
          db/
            index.ts              ← re-exports Drizzle client
            schema.ts             ← all table definitions
        plugins/
          cors.ts
          multipart.ts            ← file upload support (title PDFs)
        routes/
          v1/
            properties/
              index.ts            ← route registration
              schema.ts           ← request/response Zod schemas
              handlers.ts         ← thin handlers → delegate to services
            checks/
              index.ts
              schema.ts
              handlers.ts
        services/
          property.service.ts     ← property CRUD, listing intake
          report.service.ts       ← generates question-first report with insights
        checks/                   ← CHECK ARCHITECTURE (see below)
          types.ts                ← CheckDefinition, CheckPersona, CheckSkill interfaces
          registry.ts             ← registers all checks, resolves activation rules
          executor.ts             ← load persona → run skill → format result
          categories.ts           ← check category and buyer question definitions
          zoning-designation/
            definition.ts
            persona.ts
            skill.ts
            index.ts
          ocp-status/
            definition.ts
            persona.ts
            skill.ts
            index.ts
          ptt-calculation/
            definition.ts
            persona.ts
            skill.ts
            index.ts
          title-search/
            definition.ts
            persona.ts
            skill.ts
            index.ts
          property-history/
            definition.ts
            persona.ts
            skill.ts
            index.ts
          natural-hazards/        ← Tier 2: simulated
            definition.ts
            persona.ts
            skill.ts
            index.ts
          financial-assessment/   ← Tier 2: simulated
            definition.ts
            persona.ts
            skill.ts
            index.ts
          strata-review/          ← Tier 2: simulated (conditional on property type)
            definition.ts
            persona.ts
            skill.ts
            index.ts
        db/
          queries/
            property.queries.ts
            check.queries.ts
          mutations/
            property.mutations.ts
            check.mutations.ts
          migrations/
        utils/
        types/
      Dockerfile
      tsconfig.json
    web/
      src/
        main.tsx
        App.tsx
        config/
          env.ts                  ← Zod env validation (VITE_API_URL)
        providers/
          api/
            client.ts             ← fetch wrapper, error handling
            index.ts              ← typed API call functions
            properties.api.ts
            checks.api.ts
        pages/
          property-list/
            PropertyListPage.tsx
          add-property/
            AddPropertyPage.tsx       ← Screen 1: paste URL, Screen 2: buyer type cards
          property-report/
            PropertyReportPage.tsx    ← expandable cards, no separate detail page
        components/
          ui/                     ← shadcn/ui primitives
          features/
            PropertyCard.tsx
            BuyerTypeSelector.tsx
            ForYouSummary.tsx
            ReportSection.tsx
            CheckItem.tsx
            CheckStatusBadge.tsx
            ProgressBar.tsx
            SourceCitation.tsx
            PTTCalculator.tsx
            TitleUpload.tsx
            InquiryDrafter.tsx
            KnowYourNeighbours.tsx  ← stubbed future section
          layouts/
            AppShell.tsx
            MobileNav.tsx
        hooks/
          useProperty.ts
          useChecks.ts
          useCheckExecution.ts
        stores/
          ui.store.ts             ← sidebar, modals, theme
        utils/
        types/
        styles/
          globals.css
      index.html
      vite.config.ts
      tsconfig.json
      Dockerfile
  packages/
    types/
      src/
        schemas/
          property.schema.ts
          check.schema.ts
          buyer.schema.ts
          report.schema.ts
        index.ts
      package.json              ← @indago/types
  n8n/
    workflows/
      property-created.json       ← main orchestration workflow (exported from n8n)
  docker-compose.yml
  tsconfig.base.json
  pnpm-workspace.yaml
  package.json
  .env.example
```

### Check Architecture: Definition + Persona + Skill

Each check is a self-contained module following the single-responsibility principle. This enables independent testing, A/B testing of different personas/strategies, and clean extensibility.

```typescript
// apps/api/src/checks/types.ts

interface CheckDefinition {
  id: string
  category: CheckCategory
  name: string
  description: string
  whyItMatters: string
  dataMode: 'programmatic' | 'manual' | 'ask'
  dataSource: string
  sourceUrl?: string
  tier: 1 | 2 | 3
  activationRules: ActivationRule[]
  relatedQuestions: BuyerQuestion[]
  estimatedCost?: string
  dependsOn?: string[]
}

interface ActivationRule {
  field: keyof PropertyAttributes
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'less_than' | 'greater_than'
  value: unknown
}

interface CheckPersona {
  name: string
  role: string
  systemPrompt: string
  expertise: readonly string[]
  citationGuidance: string
}

interface CheckSkill {
  execute(context: CheckContext): Promise<CheckResult>
}

interface CheckContext {
  property: Property
  existingResults: ReadonlyMap<string, CheckResult>
  llm: LLMProvider
}

interface CheckResult {
  status: 'complete' | 'needs_input' | 'awaiting_response' | 'error'
  riskLevel?: 'low' | 'medium' | 'high' | 'very_high'
  summary: string
  details: Record<string, unknown>
  sources: readonly Source[]
  guidance?: UserGuidance
  insight?: BuyerInsight
}

interface Source {
  name: string
  url?: string
  retrievedAt?: string
  type: 'data' | 'rule' | 'ai_inference'
  note?: string
}

interface UserGuidance {
  type: 'manual_lookup' | 'ask_someone' | 'upload_document'
  steps: readonly string[]
  url?: string
  contactInfo?: string
  emailDraft?: EmailDraft
  trackingId?: string
}

interface BuyerInsight {
  buyerType: BuyerType
  headline: string
  body: string
  implications: readonly string[]
}
```

### Database Schema (Drizzle)

```typescript
// apps/api/src/providers/db/schema.ts

const properties = pgTable('properties', {
  id: uuid('id').primaryKey().defaultRandom(),
  listingUrl: text('listing_url'),
  address: text('address').notNull(),
  municipality: text('municipality'),
  province: text('province').notNull().default('BC'),
  propertyType: text('property_type'),        // detached, townhouse, condo, land
  yearBuilt: integer('year_built'),
  lotSize: text('lot_size'),
  price: integer('price'),
  pid: text('pid'),                            // parcel identifier
  waterSource: text('water_source'),           // municipal, well
  sewerType: text('sewer_type'),               // municipal, septic
  isStrata: boolean('is_strata').default(false),
  buyerType: text('buyer_type'),               // first_time, investor, airbnb, renovation, family, downsizer
  buyerGoal: text('buyer_goal'),
  isFirstTimeBuyer: boolean('is_first_time_buyer'),
  listingData: jsonb('listing_data'),          // raw listing extraction
  zoningData: jsonb('zoning_data'),            // zoning analysis result
  ocpData: jsonb('ocp_data'),                  // OCP analysis result
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

const checkResults = pgTable('check_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  propertyId: uuid('property_id').notNull().references(() => properties.id),
  checkId: text('check_id').notNull(),         // e.g., "zoning-designation"
  status: text('status').notNull().default('not_started'),
  riskLevel: text('risk_level'),
  summary: text('summary'),
  details: jsonb('details'),
  sources: jsonb('sources'),
  guidance: jsonb('guidance'),
  insight: jsonb('insight'),
  tier: integer('tier').notNull(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

const inquiries = pgTable('inquiries', {
  id: uuid('id').primaryKey().defaultRandom(),
  propertyId: uuid('property_id').notNull().references(() => properties.id),
  checkResultId: uuid('check_result_id').references(() => checkResults.id),
  recipientName: text('recipient_name'),
  recipientEmail: text('recipient_email'),
  recipientOrg: text('recipient_org'),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  referenceId: text('reference_id').notNull(), // trackable ID e.g., IND-7829
  status: text('status').notNull().default('drafted'),
  responseSummary: text('response_summary'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

const uploadedDocuments = pgTable('uploaded_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  propertyId: uuid('property_id').notNull().references(() => properties.id),
  checkResultId: uuid('check_result_id').references(() => checkResults.id),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(),
  filePath: text('file_path').notNull(),
  aiAnalysis: jsonb('ai_analysis'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
```

### API Routes

```
POST   /v1/properties                    ← create property from listing URL + buyer info
GET    /v1/properties                    ← list all properties
GET    /v1/properties/:id                ← get property with all check results
DELETE /v1/properties/:id                ← remove property

POST   /v1/properties/:id/run-all-checks              ← triggers n8n workflow (or in-process fallback)
POST   /v1/properties/:id/checks/:checkId/execute   ← trigger a single check execution
PATCH  /v1/properties/:id/checks/:checkId            ← update check status (skip, complete)
GET    /v1/properties/:id/report                     ← get question-first report with insights

POST   /v1/properties/:id/upload                     ← upload document (title PDF)
POST   /v1/properties/:id/inquiries                  ← create inquiry draft
PATCH  /v1/properties/:id/inquiries/:inquiryId       ← update inquiry status

GET    /v1/properties/:id/ptt                        ← calculate PTT for property
```

### Key Technical Decisions

1. **Anthropic Web Search for listing research** — Instead of scraping realtor.ca directly (fragile, ToS issues), use Claude's web search tool to find and extract listing data. The LLM searches, reads, and returns structured property details.

2. **Claude document API for PDF parsing** — Send title PDFs directly to Claude rather than using a separate PDF parsing library. Claude can read PDFs natively and extract structured information with contextual understanding.

3. **Check modules are provider-agnostic** — Skills receive an `LLMProvider` interface, not the Anthropic client directly. This enables swapping to OpenAI or local models for specific checks without changing check logic.

4. **Activation rules for dynamic checklists** — Property attributes drive which checks appear via declarative rules (e.g., `{ field: 'isStrata', operator: 'equals', value: true }` activates strata checks). No conditional logic scattered through the codebase.

5. **Tier system controls execution** — Tier 1 checks execute real AI skills. Tier 2 checks return realistic mock data. Tier 3 checks return only definition metadata (name, description, whyItMatters). The executor handles this transparently.

6. **Source attribution is structural** — Every `CheckResult` includes a `sources` array with typed entries (data, rule, ai_inference). The frontend renders these consistently without per-check formatting logic.

7. **n8n for workflow orchestration** — Check execution order, parallelism, retries, and error routing are managed by n8n workflows, not application code. The API exposes check execution endpoints; n8n calls them in the right order. This separates "how to run a check" (API + check modules) from "when and in what order to run checks" (n8n). It also provides a visual workflow canvas for the demo video and enables operators to modify check flows without code changes.

### n8n Orchestration Architecture

n8n sits between the frontend and the API's check execution endpoints. It owns the workflow logic.

**Separation of concerns:**

| Layer | Responsibility | Where |
|---|---|---|
| Check Modules | How to execute each check (Definition + Persona + Skill) | `apps/api/src/checks/` |
| n8n Workflows | When and in what order to run checks, parallel vs sequential, retries | n8n canvas |
| API Routes | HTTP interface to trigger individual checks and return results | `apps/api/src/routes/` |
| React Frontend | Display results, handle user input, track progress | `apps/web/` |

**Primary workflow — Property Created:**

```
[Webhook: POST from API on property creation]
    │
    ├──→ [Fetch Listing via Claude Web Search]
    │         POST /v1/properties/:id/checks/listing-intake/execute
    │         │
    │         ├──→ [Zoning Check]  ──────────────────────────┐
    │         │    POST /v1/.../zoning-designation/execute    │
    │         │                                              │ parallel
    │         ├──→ [OCP Check]  ─────────────────────────────┤
    │         │    POST /v1/.../ocp-status/execute            │
    │         │                                              │
    │         └──→ [PTT Calculation]  ───────────────────────┘
    │              POST /v1/.../ptt-calculation/execute
    │                          │
    │         ┌────────────────┘
    │         │
    ├──→ [Title Search Guidance]
    │         POST /v1/.../title-search/execute
    │         (returns guidance, sets status to needs_input)
    │
    ├──→ [Property History Inquiry]
    │         POST /v1/.../property-history/execute
    │         (returns draft email, sets status to needs_input)
    │
    ├──→ [Simulated Checks] (Tier 2, parallel)
    │         POST /v1/.../natural-hazards/execute
    │         POST /v1/.../financial-assessment/execute
    │         POST /v1/.../strata-review/execute (conditional)
    │
    └──→ [Generate Initial Report]
              GET /v1/properties/:id/report

[Webhook: Document Uploaded]
    │
    └──→ [Process Title Document]
              POST /v1/.../title-search/execute (with uploaded PDF)
              │
              └──→ [Regenerate Report]
                        GET /v1/properties/:id/report
```

**n8n configuration:**
- Self-hosted via Docker Compose
- Persists workflows to local volume
- API triggers n8n via webhook on property creation
- n8n calls API check execution endpoints
- Workflow JSON exported to `n8n/workflows/` for version control
- n8n admin UI accessible at http://localhost:5678 for workflow editing

### Party Mode Review Insights

Captured from multi-agent review of the tech spec:

1. **Convenience endpoint:** API should expose `POST /v1/properties/:id/run-all-checks` that triggers the n8n webhook internally. Frontend never talks to n8n directly. If n8n isn't ready, this endpoint falls back to calling checks sequentially in-process.

2. **Thin LLM abstraction:** Start with three methods on the LLMProvider interface: `chat()`, `chatWithWebSearch()`, `parseDocument()`. Don't over-abstract.

3. **Docker health checks:** Use `depends_on` with `condition: service_healthy` and `pg_isready` on Postgres so Fastify doesn't start before the DB is ready.

4. **Intake UX:** Two screens max. Screen 1: paste URL. Screen 2: buyer type as big tappable cards (not dropdown). Animated loading state showing checks ticking off as they complete — this IS the demo moment.

5. **Skip separate detail pages:** Use expandable cards / slide-up drawers within the report section instead. Fewer navigation hops, faster build, better mobile.

6. **Protect at all costs:** (a) Listing URL → AI analysis flow, (b) question-first report with 3+ sections showing real sourced answers, (c) one instance of each autonomy mode.

7. **Cut if behind:** n8n (use in-app orchestrator), extra Tier 2 simulations (keep natural hazards only), Know Your Neighbours stub, buyer type personalization (show one buyer type only).

8. **Build order:** Scaffold → PTT calculator (validates check architecture) → Flow A (star of show) → Frontend basics → Flow B + C → n8n wiring → Polish → Demo prep.

9. **Drop Turborepo:** Use plain pnpm workspaces with simple scripts. Turborepo is production optimisation, not MVP requirement.

10. **Allocate real time for the 500-word writeup.** It demonstrates systems thinking as much as the demo.

## Implementation Plan

**Build order rationale:** UI-first approach — nail the visuals and interactions with mock data, then wire up the backend, checks, and orchestration. This ensures the demo looks polished regardless of how far we get on the backend.

### Phase 1: Scaffolding + Types (Tasks 1-2)

- [ ] Task 1: Initialize monorepo with pnpm workspaces
  - File: `package.json` — workspace root with `"workspaces": ["apps/*", "packages/*"]` and shared dev scripts
  - File: `pnpm-workspace.yaml` — workspace definition
  - File: `tsconfig.base.json` — base TS config with strict mode, path aliases
  - File: `.env.example` — all env vars with placeholder values
  - File: `.gitignore` — node_modules, dist, .env, uploads/, n8n_data/
  - Action: `pnpm init` at root, create workspace config, create base tsconfig

- [ ] Task 2: Create shared types package
  - File: `packages/types/package.json` — name: `@indago/types`, main entry
  - File: `packages/types/tsconfig.json` — extends base, strict mode
  - File: `packages/types/src/schemas/property.schema.ts` — Property Zod schemas (CreatePropertyInput, PropertyAttributes, BuyerType, Province)
  - File: `packages/types/src/schemas/check.schema.ts` — Check Zod schemas (CheckDefinition, CheckResult, CheckStatus, RiskLevel, Source, UserGuidance, BuyerInsight, DataMode)
  - File: `packages/types/src/schemas/buyer.schema.ts` — BuyerType enum, BuyerQuestion type, buyer type config
  - File: `packages/types/src/schemas/report.schema.ts` — ReportSection, ReportSummary schemas
  - File: `packages/types/src/index.ts` — re-export all schemas and inferred types

### Phase 2: Frontend with Mock Data (Tasks 3-10)

- [ ] Task 3: Scaffold React + Vite app
  - File: `apps/web/package.json` — dependencies: react, react-dom, react-router-dom, @tanstack/react-query, zustand, react-hook-form, @hookform/resolvers, zod, lucide-react, tailwindcss, class-variance-authority, clsx, tailwind-merge
  - File: `apps/web/tsconfig.json` — extends base, path alias `@/` → `src/`
  - File: `apps/web/vite.config.ts` — React plugin, path alias, proxy API to 3001
  - File: `apps/web/index.html` — root HTML with app div
  - File: `apps/web/src/main.tsx` — ReactDOM.createRoot, QueryClientProvider, RouterProvider
  - File: `apps/web/src/App.tsx` — routes: / → PropertyListPage, /add → AddPropertyPage, /property/:id → PropertyReportPage
  - File: `apps/web/src/config/env.ts` — Zod validation of VITE_API_URL
  - Action: Initialize shadcn/ui with `pnpm dlx shadcn-ui@latest init` (teal theme, CSS variables)

- [ ] Task 4: Set up shadcn/ui + Tailwind with Indago theme
  - File: `apps/web/src/styles/globals.css` — Tailwind directives + CSS custom properties for Indago color palette (teal primary, light backgrounds, status colors)
  - File: `apps/web/tailwind.config.ts` — extend colors with indago palette: primary (teal/blue-green), background (near-white), card (white), text (dark gray not black), status-complete (green), status-progress (amber), status-not-started (gray), status-flagged (red)
  - Action: Install shadcn/ui components: button, card, badge, progress, collapsible, input, textarea, select, separator, skeleton, tabs, accordion
  - File: `apps/web/src/lib/utils.ts` — cn() helper (clsx + tailwind-merge)

- [ ] Task 5: Create mock data fixtures
  - File: `apps/web/src/mocks/properties.ts` — 2 sample properties: (1) 123 Main St, Vancouver — detached, $849K, first-time buyer, 62% complete with mixed check statuses; (2) 456 Oak Ave, Squamish — townhouse, $629K, investor, 15% complete, checks still running
  - File: `apps/web/src/mocks/checks.ts` — mock CheckResult data for all check types: zoning (complete, RS-1 data), OCP (complete, under review), PTT (complete, calculation breakdown), title-search (needs_input, LTSA guidance steps), property-history (awaiting_response, draft email), natural-hazards (complete, simulated risk scores), plus Tier 3 definitions (not started)
  - File: `apps/web/src/mocks/report.ts` — mock report with ForYou summary (4 personalized insights for first-time buyer), all 10 question-first sections with statuses, source citations at all levels
  - Notes: Mock data should be realistic and match the exact shape of @indago/types schemas. This is what powers the UI during visual development. When the API is ready, swap mock imports for real API calls.

- [ ] Task 6: Build API client provider (mock-backed initially)
  - File: `apps/web/src/providers/api/client.ts` — fetch wrapper with base URL from env, JSON headers, error handling (throws typed ApiError), generic request/response handling
  - File: `apps/web/src/providers/api/properties.api.ts` — createProperty, listProperties, getProperty, deleteProperty, runAllChecks, uploadDocument, getReport, calculatePTT. Initially returns mock data with simulated delays (setTimeout 500-2000ms).
  - File: `apps/web/src/providers/api/checks.api.ts` — executeCheck, updateCheckStatus, createInquiry, updateInquiry. Initially returns mock data.
  - File: `apps/web/src/providers/api/index.ts` — re-exports all API functions
  - Notes: Each API function should have a `// TODO: replace mock with real API call` comment. The mock delay simulates network latency so loading states get exercised.

- [ ] Task 7: Build layout and navigation
  - File: `apps/web/src/components/layouts/AppShell.tsx` — responsive shell: mobile-first with header (Indago logo + nav), main content area, bottom nav on mobile. teal accent header bar.
  - File: `apps/web/src/components/layouts/MobileNav.tsx` — bottom navigation bar (Properties, Add, Settings placeholder)
  - File: `apps/web/src/stores/ui.store.ts` — Zustand store: sidebarOpen, activeModal

- [ ] Task 8: Build Property List page
  - File: `apps/web/src/pages/property-list/PropertyListPage.tsx` — lists all properties as cards, shows completion %, last updated, "Add Property" CTA when empty. Uses mock data.
  - File: `apps/web/src/components/features/PropertyCard.tsx` — card showing address, municipality, property type, overall progress bar, status badges, completion %, last updated timestamp
  - File: `apps/web/src/components/features/ProgressBar.tsx` — animated progress bar with percentage label, uses indago status colors
  - File: `apps/web/src/hooks/useProperty.ts` — React Query hooks: useProperties (list), useProperty (single with checks), useCreateProperty, useDeleteProperty

- [ ] Task 9: Build Add Property page
  - File: `apps/web/src/pages/add-property/AddPropertyPage.tsx` — two-step form. Step 1: URL input with "Paste a realtor.ca listing URL" placeholder, large input, "Next" button. Step 2: BuyerTypeSelector + isFirstTimeBuyer toggle + optional freetext concerns, "Generate Report" CTA. On submit: calls createProperty → navigates to /property/:id with loading state.
  - File: `apps/web/src/components/features/BuyerTypeSelector.tsx` — 6 large tappable cards (First-time buyer, Investor, Airbnb, Renovation, Family, Downsizer) with icons and short descriptions. Single-select. Mobile-optimized grid (2 columns).

- [ ] Task 10: Build Property Report page (full UI)
  - File: `apps/web/src/pages/property-report/PropertyReportPage.tsx` — header with address + buyer type + overall progress. ForYouSummary at top. Expandable ReportSections below. Loading state with animated checklist while checks run. Renders all data from mock fixtures.
  - File: `apps/web/src/components/features/ForYouSummary.tsx` — card with "What Matters Most For You" header, 4-6 insight items with teal accent, source citations beneath each
  - File: `apps/web/src/components/features/ReportSection.tsx` — collapsible card: question header (e.g., "What am I allowed to do with this property?"), status icon (green check, amber warning, gray circle, spinner), AI answer summary, source citations, expandable check items within
  - File: `apps/web/src/components/features/CheckItem.tsx` — individual check within a section: name, status badge, summary if complete, guidance steps if needs_input, source links
  - File: `apps/web/src/components/features/CheckStatusBadge.tsx` — badge component: Complete (green), In Progress (amber), Not Started (gray), Needs Input (blue), Awaiting Response (purple), Skipped (light gray)
  - File: `apps/web/src/components/features/SourceCitation.tsx` — renders Source objects: name, URL link, retrieval timestamp, type indicator (data/rule/ai_inference with subtle label)
  - File: `apps/web/src/components/features/TitleUpload.tsx` — file upload dropzone for title PDF within the title-search section. Shows LTSA guidance steps when no document uploaded. Upload progress indicator. Shows AI analysis results after upload (mock).
  - File: `apps/web/src/components/features/InquiryDrafter.tsx` — displays drafted email from property-history check. Editable subject/body fields. "Copy to Clipboard" and "Mark as Sent" buttons. Shows reference ID prominently.
  - File: `apps/web/src/components/features/PTTCalculator.tsx` — visual breakdown of PTT calculation: purchase price, base PTT, exemption amount, estimated total. Highlights savings for first-time buyers.
  - File: `apps/web/src/components/features/KnowYourNeighbours.tsx` — "Coming Soon" card with section title, description of planned checks, "Why this matters" text. Visually distinct as future vision.
  - File: `apps/web/src/hooks/useChecks.ts` — React Query hooks: useCheckResults, useExecuteCheck, useUpdateCheckStatus, useUploadDocument
  - File: `apps/web/src/hooks/useCheckExecution.ts` — hook that polls for check completion status, updates UI as checks complete (for animated loading state). Initially uses mock data with simulated progression.
  - Notes: Reference `_bmad-output/planning-artifacts/ui-design-spec.md` for exact visual specs, colors, spacing, and component details.

### Phase 3: Frontend Polish (Tasks 11-12)

- [ ] Task 11: Loading state + animation
  - File: `apps/web/src/pages/property-report/PropertyReportPage.tsx` — add animated loading state: show checklist items appearing and ticking off as checks complete. Items start as "⏳ Waiting..." in gray, transition to spinner + teal "Researching...", then green checkmark + "Complete". Progress bar fills smoothly. Use mock data with staggered setTimeout to simulate check progression.
  - Notes: This IS the demo moment. Spend time making this feel polished and delightful.

- [ ] Task 12: Mobile + empty + error states
  - Action: Mobile responsive review — test all pages at 375px width
  - Action: Add loading skeletons (shadcn Skeleton) for all data-fetching states
  - Action: Add error states for API failures
  - Action: Add empty states ("No properties yet — add your first one")

### Phase 4: API + Database Foundation (Tasks 13-16)

- [ ] Task 13: Create Docker Compose stack
  - File: `docker-compose.yml` — postgres (with healthcheck using pg_isready), api, web, n8n services as specified in Docker Compose Services section
  - File: `apps/api/Dockerfile` — Node 24 alpine, pnpm install, build, start
  - File: `apps/web/Dockerfile` — Node 24 alpine, pnpm install, build, serve with preview
  - Action: `docker compose up postgres` must start and pass healthcheck
  - Notes: API `depends_on` postgres with `condition: service_healthy`. Mount `./apps/api/uploads` for PDF storage.

- [ ] Task 14: Scaffold Fastify API
  - File: `apps/api/package.json` — dependencies: fastify, @fastify/cors, @fastify/multipart, drizzle-orm, postgres, zod, @anthropic-ai/sdk, uuid
  - File: `apps/api/tsconfig.json` — extends base, path alias `@/` → `src/`
  - File: `apps/api/src/server.ts` — entry point, calls app.listen() only
  - File: `apps/api/src/app.ts` — Fastify instance creation, plugin registration, route registration, export for testing
  - File: `apps/api/src/config/env.ts` — Zod env validation (DATABASE_URL, ANTHROPIC_API_KEY, PORT, NODE_ENV, LOG_LEVEL, N8N_WEBHOOK_URL)
  - File: `apps/api/src/plugins/cors.ts` — CORS plugin registration
  - File: `apps/api/src/plugins/multipart.ts` — Multipart plugin for file uploads
  - Action: Verify `pnpm dev` starts Fastify on port 3001 and responds to GET /health

- [ ] Task 15: Set up database with Drizzle
  - File: `apps/api/src/providers/db/schema.ts` — all table definitions (properties, checkResults, inquiries, uploadedDocuments) exactly as specified in Context for Development
  - File: `apps/api/src/providers/db/index.ts` — Drizzle client creation from DATABASE_URL, re-export
  - File: `apps/api/drizzle.config.ts` — Drizzle Kit config for migrations
  - Action: Run `pnpm drizzle-kit generate` to create initial migration
  - Action: Run `pnpm drizzle-kit migrate` to apply against Docker Postgres
  - Notes: Tables must include all columns from schema section. Use `pgTable` from drizzle-orm/pg-core.

- [ ] Task 16: Implement property CRUD routes and service
  - File: `apps/api/src/services/property.service.ts` — createProperty (inserts property, triggers run-all-checks), getProperty (with check results), listProperties, deleteProperty
  - File: `apps/api/src/routes/v1/properties/schema.ts` — Zod schemas for CreatePropertyInput (listingUrl, buyerType, isFirstTimeBuyer, buyerGoal), PropertyResponse, PropertyListResponse
  - File: `apps/api/src/routes/v1/properties/handlers.ts` — thin handlers delegating to property.service
  - File: `apps/api/src/routes/v1/properties/index.ts` — route registration (POST /, GET /, GET /:id, DELETE /:id, POST /:id/run-all-checks, POST /:id/upload, POST /:id/inquiries, PATCH /:id/inquiries/:inquiryId, GET /:id/report, GET /:id/ptt)
  - File: `apps/api/src/db/queries/property.queries.ts` — findById, findAll (with check results joined)
  - File: `apps/api/src/db/mutations/property.mutations.ts` — insert, update, softDelete

### Phase 5: Check Architecture + All Checks (Tasks 17-24)

- [ ] Task 17: Implement check type system, registry, and executor
  - File: `apps/api/src/checks/types.ts` — all interfaces exactly as specified: CheckDefinition, ActivationRule, CheckPersona, CheckSkill, CheckContext, CheckResult, Source, UserGuidance, BuyerInsight, EmailDraft. Also LLMProvider interface with three methods: `chat()`, `chatWithWebSearch()`, `parseDocument()`
  - File: `apps/api/src/checks/categories.ts` — CheckCategory const object (ownership-title, physical-structure, land-natural-hazards, environmental-legacy, land-use-zoning, financial, neighbourhood-context, regulatory-compliance, transaction-risk). BuyerQuestion const array with all 10 questions mapped to check categories.
  - File: `apps/api/src/checks/registry.ts` — CheckRegistry class: registers checks, resolves activation rules against property attributes, returns list of active checks for a property. Method: `getActiveChecks(property: Property): CheckModule[]`
  - File: `apps/api/src/checks/executor.ts` — CheckExecutor class: takes a check module + context, loads persona as system prompt, calls skill.execute(), persists result to DB. Handles tier logic: Tier 1 runs real skill, Tier 2 runs mock skill, Tier 3 returns definition metadata only.
  - Notes: Use `as const` objects, not enums. All types exported with `export type`. Registry auto-discovers checks by importing from each check folder's index.ts. Executor wraps execution in try/catch with structured error logging.

- [ ] Task 18: Implement LLM provider (Anthropic adapter)
  - File: `apps/api/src/providers/llm/types.ts` — LLMProvider interface: `chat(systemPrompt: string, userMessage: string): Promise<string>`, `chatWithWebSearch(systemPrompt: string, userMessage: string): Promise<{text: string, sources: Source[]}>`, `parseDocument(systemPrompt: string, documentBase64: string, mimeType: string): Promise<string>`
  - File: `apps/api/src/providers/llm/anthropic.ts` — AnthropicProvider implements LLMProvider using @anthropic-ai/sdk. `chatWithWebSearch` uses web_search_20250305 tool type. `parseDocument` sends document as base64 content block.
  - File: `apps/api/src/providers/llm/index.ts` — instantiates and re-exports AnthropicProvider
  - Notes: Never import @anthropic-ai/sdk outside of providers/llm/. All check skills use LLMProvider interface.

- [ ] Task 19: Implement check execution routes
  - File: `apps/api/src/routes/v1/checks/schema.ts` — Zod schemas for ExecuteCheckInput, UpdateCheckStatusInput, CheckResultResponse
  - File: `apps/api/src/routes/v1/checks/handlers.ts` — executeCheck (loads check from registry, runs executor), updateCheckStatus (skip/complete)
  - File: `apps/api/src/routes/v1/checks/index.ts` — route registration (POST /:propertyId/checks/:checkId/execute, PATCH /:propertyId/checks/:checkId)
  - File: `apps/api/src/db/queries/check.queries.ts` — findByPropertyId, findByCheckId, findInquiriesByPropertyId
  - File: `apps/api/src/db/mutations/check.mutations.ts` — upsertResult, updateStatus, insertInquiry, updateInquiry

- [x] Task 20: Implement PTT calculation check
  - File: `apps/api/src/checks/ptt-calculation/definition.ts` — CheckDefinition: id "ptt-calculation", category "financial", tier 1, dataMode "programmatic", activationRules: always active, relatedQuestions: ["Am I going to get hit with surprise costs?"]
  - File: `apps/api/src/checks/ptt-calculation/persona.ts` — "BC Tax Specialist" persona with system prompt explaining PTT rules, exemptions, and citation requirements
  - File: `apps/api/src/checks/ptt-calculation/skill.ts` — Pure math calculation: 1% on first $200K, 2% on $200K-$2M, 3% on $2M+. First-time buyer exemption (full under $500K, partial $500K-$525K). Newly built exemption (full under $750K, partial $750K-$800K). Foreign buyer 20% surcharge in specified areas. Returns CheckResult with breakdown, exemption eligibility, and Source entries citing BC Property Transfer Tax Act.
  - File: `apps/api/src/checks/ptt-calculation/index.ts` — re-exports definition, persona, skill as CheckModule
  - File: `apps/api/src/checks/ptt-calculation/skill.test.ts` — unit tests for PTT calculation with edge cases (under $200K, exactly $500K, $525K partial, $2M+, foreign buyer)

- [x] Task 21: Implement listing intake check
  - File: `apps/api/src/checks/listing-intake/definition.ts` — id "listing-intake", tier 1, dataMode "programmatic", always active
  - File: `apps/api/src/checks/listing-intake/persona.ts` — "Real Estate Listing Analyst" persona. System prompt instructs Claude to use web search to find the listing at the provided URL, extract structured data (address, municipality, property type, year built, lot size, price, PID, bedrooms, bathrooms, water source, sewer type, strata status), and return as JSON.
  - File: `apps/api/src/checks/listing-intake/skill.ts` — calls llm.chatWithWebSearch() with listing URL. Parses structured response. Updates property record in DB with extracted attributes. Returns CheckResult with summary of extracted data and sources.
  - File: `apps/api/src/checks/listing-intake/index.ts`
  - Notes: This check populates property attributes that other checks depend on. Must run first. Define the structured JSON response as a Zod schema in the skill.

- [x] Task 22: Implement zoning + OCP checks
  - File: `apps/api/src/checks/zoning-designation/definition.ts` — id "zoning-designation", category "land-use-zoning", tier 1, dataMode "programmatic", dependsOn: ["listing-intake"], relatedQuestions: ["What am I allowed to do with this property?", "Can I rent this out or Airbnb it?"]
  - File: `apps/api/src/checks/zoning-designation/persona.ts` — "Municipal Zoning Analyst" persona. System prompt: expert in BC municipal zoning bylaws, must identify the municipality's zoning portal, find the designation, extract permitted uses, ADU/secondary suite eligibility, short-term rental rules. Must cite bylaw section numbers.
  - File: `apps/api/src/checks/zoning-designation/skill.ts` — calls llm.chatWithWebSearch() with address + municipality. Returns CheckResult with structured zoning data and sources.
  - File: `apps/api/src/checks/zoning-designation/index.ts`
  - File: `apps/api/src/checks/ocp-status/definition.ts` — id "ocp-status", category "land-use-zoning", tier 1, dataMode "programmatic", dependsOn: ["listing-intake"], relatedQuestions: ["What am I allowed to do with this property?"]
  - File: `apps/api/src/checks/ocp-status/persona.ts` — "Municipal Planning Researcher" persona.
  - File: `apps/api/src/checks/ocp-status/skill.ts` — calls llm.chatWithWebSearch() for OCP info. Returns adoption date, review status, area designation, planning goals.
  - File: `apps/api/src/checks/ocp-status/index.ts`

- [x] Task 23: Implement title search + property history checks
  - File: `apps/api/src/checks/title-search/definition.ts` — id "title-search", category "ownership-title", tier 1, dataMode "manual", relatedQuestions: ["Do I actually own what I think I'm buying?"]
  - File: `apps/api/src/checks/title-search/persona.ts` — "Title Examiner" persona.
  - File: `apps/api/src/checks/title-search/skill.ts` — Two modes: (1) No document: returns `needs_input` with UserGuidance (myLTSA.ca steps, PID, cost). (2) Document uploaded: calls llm.parseDocument() with title PDF, extracts charges/liens/easements with plain-language explanations.
  - File: `apps/api/src/checks/title-search/index.ts`
  - File: `apps/api/src/checks/property-history/definition.ts` — id "property-history", category "environmental-legacy", tier 1, dataMode "ask"
  - File: `apps/api/src/checks/property-history/persona.ts` — "Environmental Investigator" persona.
  - File: `apps/api/src/checks/property-history/skill.ts` — calls llm.chatWithWebSearch() for municipality contact info. Generates EmailDraft with trackable reference ID. Checks BC Site Registry. Returns `needs_input` with guidance and draft email.
  - File: `apps/api/src/checks/property-history/index.ts`

- [x] Task 24: Implement simulated + Tier 3 checks
  - File: `apps/api/src/checks/natural-hazards/definition.ts` — id "natural-hazards", category "land-natural-hazards", tier 2
  - File: `apps/api/src/checks/natural-hazards/persona.ts` — "Natural Hazard Assessor" persona
  - File: `apps/api/src/checks/natural-hazards/skill.ts` — returns realistic mock data: earthquake zone, flood risk, wildfire, radon, with mock sources (NRCan, PreparedBC, BCCDC)
  - File: `apps/api/src/checks/natural-hazards/index.ts`
  - File: `apps/api/src/checks/tier3/definitions.ts` — array of ~50 CheckDefinition objects for all remaining checks (physical structure, neighbourhood, regulatory, transaction). Each has name, description, whyItMatters, dataSource, tier: 3.
  - File: `apps/api/src/checks/tier3/index.ts` — registers all Tier 3 definitions with the registry
  - Notes: Tier 3 shows breadth of problem understanding. ~50 definitions, just data, no persona/skill needed.

### Phase 6: Report Service + Wire Frontend to API (Tasks 25-26)

- [x] Task 25: Implement report service
  - File: `apps/api/src/services/report.service.ts` — generateReport: takes property ID, loads all check results, groups by BuyerQuestion, synthesizes section answers from completed checks, calculates overall completion %, generates "For You" summary (top 4-6 insights based on buyer type), returns structured report with sections, sources at all levels.
  - File: `apps/api/src/routes/v1/properties/handlers.ts` — add getReport handler, add getPTT handler, add uploadDocument handler (multipart, saves to disk, triggers title-search re-execution), add createInquiry and updateInquiry handlers

- [x] Task 26: Swap mock data for real API calls in frontend
  - File: `apps/web/src/providers/api/properties.api.ts` — replace mock implementations with real fetch calls to API
  - File: `apps/web/src/providers/api/checks.api.ts` — replace mock implementations with real fetch calls
  - Action: Test end-to-end with real API: create property → checks run → report renders
  - Notes: Keep mock fixtures as fallback / storybook reference. The UI should not change — only the data source.

### Phase 7: n8n Orchestration (Tasks 27-28)

- [x] Task 27: Wire n8n orchestration
  - File: `apps/api/src/services/property.service.ts` — in createProperty, after DB insert, POST to N8N_WEBHOOK_URL with property ID and data. If n8n POST fails, fall back to calling checks sequentially via executor.
  - File: `apps/api/src/routes/v1/properties/handlers.ts` — runAllChecks handler: same logic (try n8n webhook, fall back to in-process)
  - Notes: n8n webhook URL configured via env var. The API doesn't need to know what n8n does internally — it just fires the webhook.

- [ ] Task 28: Build n8n workflow
  - Action: In n8n admin UI (http://localhost:5678), create "Property Created" workflow:
    - Webhook trigger node (receives property ID + data)
    - HTTP Request node → POST /v1/properties/:id/checks/listing-intake/execute (wait for response)
    - Split into 3 parallel branches: zoning-designation, ocp-status, ptt-calculation (each HTTP Request node)
    - Wait for all 3 → merge
    - Parallel branch: title-search + property-history (both return needs_input, no wait needed)
    - Parallel branch: natural-hazards (simulated)
    - Final: HTTP Request → GET /v1/properties/:id/report
  - File: `n8n/workflows/property-created.json` — export workflow JSON for version control
  - Notes: Second workflow for "Document Uploaded" can be added as stretch goal (title-search re-execution on upload)

### Phase 8: Demo Prep (Tasks 29-30)

- [ ] Task 29: End-to-end testing
  - Action: Start full Docker Compose stack
  - Action: Test complete flow: paste listing URL → select buyer type → generate report → view For You summary → expand zoning section → expand title section → upload mock PDF → view analysis → expand property history → view draft email → view PTT calculation → view natural hazards
  - Action: Test with at least 2 different BC properties (Vancouver + smaller municipality like Squamish or Kelowna)
  - Action: Verify all source citations render correctly
  - Action: Verify mobile layout on phone or simulator

- [ ] Task 30: Record demo video and write explanation
  - Action: Record 2-3 minute demo video showing the system working end-to-end
  - Action: Write 500-word explanation covering: what the human can now do, what AI is responsible for, where AI must stop, what breaks first at scale
  - Notes: Demo flow suggestion: paste URL → show loading animation → show For You summary → walk through zoning + OCP findings → show title search guidance → show property history email draft → show PTT calculation → briefly show Tier 3 breadth → show n8n workflow canvas. Writeup should mention: check module architecture, three autonomy modes, source attribution, n8n orchestration, and scalability path (province expansion, Temporal, real APIs).

### Acceptance Criteria

**UI (verifiable with mock data, no API needed):**

- [ ] AC 1: Given a user on the property list page, when they view the page, then they see property cards with address, type, price, progress bar, and status — or an empty state with "Add Property" CTA
- [ ] AC 2: Given a user clicks "Add Property," when the form loads, then they see a two-step intake (Step 1: URL input, Step 2: buyer type cards + first-time buyer checkbox)
- [ ] AC 3: Given the report page loads for a property with completed checks, when displayed, then the "For You" summary shows 4-6 personalized insights with source citations beneath each
- [ ] AC 4: Given the report page is displayed, when the user taps a section header, then it expands to show individual check items with status, summary, and sources
- [ ] AC 5: Given a section has a title-search check in needs_input status, when expanded, then the user sees step-by-step LTSA instructions, the PID, and a file upload dropzone
- [ ] AC 6: Given a section has a property-history check, when expanded, then the user sees a draft email with editable subject/body, reference ID, and "Copy to Clipboard" / "Mark as Sent" buttons
- [ ] AC 7: Given a PTT calculation is complete, when the user views it, then they see a visual breakdown of purchase price, base PTT, exemption amount, and estimated total
- [ ] AC 8: Given the user views Tier 3 checks, when displayed, then each shows the check name, "why this matters" text, and "Not yet checked" status
- [ ] AC 9: Given a property report is generating, when the loading state is shown, then the user sees an animated checklist with items progressing from waiting → researching → complete
- [ ] AC 10: Given any insight or finding, when the user views it, then it includes at least one source citation with name, URL (where applicable), and source type label (Data/Rule/AI interpretation)

**Backend (requires API + database):**

- [ ] AC 11: Given a user submits a listing URL and buyer type, when the API processes it, then the property is created in the database and checks begin executing
- [ ] AC 12: Given the listing intake check runs, when it completes, then the property record is updated with extracted attributes (address, municipality, type, year, price, PID)
- [ ] AC 13: Given the zoning check runs, when it completes, then the report shows the zoning designation, permitted uses, ADU/STR eligibility with municipal bylaw citations
- [ ] AC 14: Given the OCP check runs, when it completes, then the report shows OCP adoption date, review status, and municipality's goals for the property's area
- [ ] AC 15: Given a property with a price and buyer type, when PTT calculation runs, then it returns the correct tax breakdown with exemption eligibility
- [ ] AC 16: Given a user uploads a title PDF, when the AI processes it, then the report shows extracted charges, liens, easements with plain-language explanations

**Orchestration (requires n8n):**

- [ ] AC 17: Given the full Docker Compose stack is running, when the n8n workflow triggers on property creation, then checks execute in the correct order (listing-intake first, then zoning/OCP/PTT in parallel)
- [ ] AC 18: Given n8n is unavailable, when the API's run-all-checks endpoint is called, then it falls back to executing checks sequentially in-process without error

## Additional Context

### Dependencies

**Runtime:**
- @anthropic-ai/sdk — Claude API client with web search tool
- fastify, @fastify/cors, @fastify/multipart — API framework + file uploads
- drizzle-orm, drizzle-kit, postgres — ORM + migrations + driver
- zod — validation
- pino — logging (Fastify built-in)
- react, react-dom, react-router-dom — UI framework
- @tanstack/react-query — server state
- zustand — UI state
- react-hook-form, @hookform/resolvers — forms
- tailwindcss, @tailwindcss/typography — styling
- lucide-react — icons (shadcn default)

**Infrastructure:**
- n8n (Docker image: n8nio/n8n) — workflow orchestration for check execution

**Dev:**
- typescript — language
- vite — web bundler
- drizzle-kit — migration tooling
- docker, docker-compose — local infra (postgres + api + web + n8n)

### Docker Compose Services

```yaml
services:
  postgres:
    image: postgres:16-alpine
    ports: ["5432:5432"]
    environment:
      POSTGRES_USER: indago
      POSTGRES_PASSWORD: indago
      POSTGRES_DB: indago
    volumes: [pgdata:/var/lib/postgresql/data]

  api:
    build: ./apps/api
    ports: ["3001:3001"]
    depends_on: [postgres]
    environment:
      DATABASE_URL: postgresql://indago:indago@postgres:5432/indago
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      N8N_WEBHOOK_URL: http://n8n:5678
    volumes: [./apps/api/uploads:/app/uploads]

  web:
    build: ./apps/web
    ports: ["3000:3000"]
    depends_on: [api]

  n8n:
    image: n8nio/n8n:latest
    ports: ["5678:5678"]
    depends_on: [api]
    environment:
      N8N_HOST: 0.0.0.0
      N8N_PORT: 5678
      WEBHOOK_URL: http://localhost:5678
      N8N_DIAGNOSTICS_ENABLED: "false"
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  pgdata:
  n8n_data:
```

### Environment Variables

```bash
# apps/api/.env
DATABASE_URL=postgresql://indago:indago@localhost:5432/indago
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
NODE_ENV=development
LOG_LEVEL=debug
N8N_WEBHOOK_URL=http://localhost:5678

# apps/web/.env
VITE_API_URL=http://localhost:3001
```

### Testing Strategy

For MVP demo: manual testing focused on the three flows. Unit tests for PTT calculation (pure math, easy to test). Integration test for check executor with mocked LLM provider. Full test suite is post-MVP.

### Notes

- BC Property Transfer Tax rules: 1% on first $200K, 2% on $200K-$2M, 3% on $2M+. First-time buyer exemption under $500K (full), $500K-$525K (partial). Newly built exemption under $750K (full), $750K-$800K (partial). Foreign buyer additional 20% in specified areas.
- LTSA title search costs ~$15 per title. Requires myLTSA.ca account.
- Each municipality has different zoning portals and OCP documents. The zoning check skill must be flexible enough to handle this variation via LLM web search.
- Demo deadline: March 2, 2026 at 11:59pm EST.
- n8n workflow JSON should be exported and committed to `n8n/workflows/` for version control. n8n stores workflows in its internal DB, but exporting ensures reproducibility.
- n8n fallback: if n8n integration runs over time budget, the API can call checks directly via a simple in-app orchestrator. The check module architecture and API endpoints don't change — only the caller does. Build API + checks first, add n8n orchestration second.
- Production evolution path: n8n for MVP orchestration. Evaluate Temporal for durable execution guarantees at scale, especially for multi-day correspondence tracking workflows.
