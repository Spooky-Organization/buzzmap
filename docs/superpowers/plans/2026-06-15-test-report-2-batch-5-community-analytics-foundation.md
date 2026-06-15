# Test Report 2 Batch 5 Community Analytics Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the first backend data foundation for social privacy and commerce intelligence without building a full community product or analytics UI yet.

**Architecture:** Communities are represented by the existing interest and follow graph for this MVP. POV visibility becomes an explicit persisted field so personal social experiences can be public or follower-only. Analytics starts as authenticated write-only event capture with typed events from key commerce/social flows.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4, Express 5, Prisma 7, Postgres, Zod.

---

## MVP Decisions

- Community model: defer a first-class `Community` table; use existing `User.interests` and `Follow` graph.
- POV privacy: add `POVVisibility` with `PUBLIC` and `FOLLOWERS`; selected-user visibility is deferred until a friend/selected audience relation exists.
- Analytics: create a backend `analytics` module and `AnalyticsEvent` model for `BUSINESS_VIEWED`, `PRODUCT_VIEWED`, `POV_VIEWED`, `ADD_TO_CART`, `CHECKOUT_STARTED`, `ORDER_PLACED`, and `MESSAGE_STARTED`.
- Reporting UI: defer; this batch creates event data only.

## Files

- Modify: `AGENTHANDOFF.md`
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/src/modules/analytics/models/index.ts`
- Create: `backend/src/modules/analytics/validators/index.ts`
- Create: `backend/src/modules/analytics/services/analyticsService.ts`
- Create: `backend/src/modules/analytics/controllers/analyticsController.ts`
- Create: `backend/src/modules/analytics/routes.ts`
- Modify: `backend/src/core/routes.ts`
- Modify: `backend/src/modules/pov/models/index.ts`
- Modify: `backend/src/modules/pov/validators/index.ts`
- Modify: `backend/src/modules/pov/controllers/povController.ts`
- Modify: `backend/src/modules/pov/services/povService.ts`
- Modify: `backend/src/shared/builders/FeedQueryBuilder.ts`
- Modify: `backend/src/modules/feed/models/index.ts`
- Modify: `frontend/src/lib/routes.ts`
- Create: `frontend/src/lib/analytics.ts`
- Modify: `frontend/src/app/(customer)/pov/create/page.tsx`
- Modify: `frontend/src/app/(customer)/pov/[id]/page.tsx`
- Modify: `frontend/src/app/business/[id]/page.tsx`
- Modify: `frontend/src/app/(customer)/search/page.tsx`
- Modify: `frontend/src/app/(customer)/cart/page.tsx`
- Modify: `frontend/src/app/(customer)/messages/page.tsx`
- Modify: `frontend/src/app/business/messages/page.tsx`
- Modify: `CHANGELOG.md`

## Tasks

- [ ] **Task 1: Add schema support**
  - Add `POVVisibility` enum and `visibility POVVisibility @default(PUBLIC)` to `POV`.
  - Add `AnalyticsEventType` enum and `AnalyticsEvent` model with optional target IDs and metadata.
  - Add `analyticsEvents AnalyticsEvent[]` relation to `User`.

- [ ] **Task 2: Add backend analytics module**
  - Validate event type, optional target IDs, and metadata with Zod.
  - Persist authenticated user events through `POST /api/v1/analytics/events`.
  - Keep endpoint write-only for now.

- [ ] **Task 3: Wire POV visibility contract**
  - Accept optional `visibility` during POV creation.
  - Return `visibility` in POV/feed models.
  - Filter follower-only POVs to the author or users who follow the author.

- [ ] **Task 4: Add frontend analytics helper and route registry**
  - Add `apiRoutes.analytics.events`.
  - Add a fire-and-forget `trackAnalyticsEvent` helper that never blocks user workflows.

- [ ] **Task 5: Instrument key flows**
  - Track business, product, and POV views.
  - Track add-to-cart, checkout-started, order-placed, and message-started actions after successful user actions where appropriate.
  - Add a POV visibility selector to creation UI.

- [ ] **Task 6: Verify and document**
  - Run `cd backend && npx prisma generate`.
  - Apply dev DB schema with Docker Compose if Prisma generate passes.
  - Run `cd backend && npx tsc --noEmit`.
  - Run `cd frontend && npm run lint`.
  - Run `cd frontend && npx tsc --noEmit`.
  - Update `AGENTHANDOFF.md` and `CHANGELOG.md`.
