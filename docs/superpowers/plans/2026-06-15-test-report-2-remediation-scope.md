# BuzzMap Test Report 2 Remediation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert `docs/buzzmap test report 2.docx` into a structured remediation sequence that preserves BuzzMap as both a social platform and a commerce platform.

**Architecture:** POV content is the trust primitive. Customer profiles, feeds, search, messaging, QR review capture, business profiles, and commerce flows should all route around that primitive instead of behaving like separate tools. The first implementation pass should repair hard contract mismatches and product routes before larger community modeling work.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4, NextAuth v5, Express 5, Prisma 7, Postgres, Socket.IO, RustFS/S3-compatible media storage.

---

## Source

- `docs/buzzmap test report 2.docx`

## Client Product Thesis Captured

BuzzMap is both:

- a social platform where customers build profiles, share experiences, follow and message each other, and belong to interest/community contexts
- a commerce platform where businesses convert authentic POV evidence into discovery, purchase confidence, orders, and repeat customer conversations

POVs must be collected centrally, shown on author profiles, distributed to feeds, attached to businesses when relevant, and used as commerce decision data. Clicks, views, skipped purchases, messages, cart/order events, and POV engagement are analytics inputs even when the UI does not yet expose the full analytics product.

## Audit Summary

### Already Implemented Or Mostly Implemented

- Customer dashboard route exists:
  - `frontend/src/app/(customer)/dashboard/page.tsx`
- Customer user profile route exists with QR, follow state, account settings, security, and recent POVs:
  - `frontend/src/app/user/[id]/page.tsx`
- Customer POV detail and comments exist:
  - `frontend/src/app/(customer)/pov/[id]/page.tsx`
  - `backend/src/modules/pov/controllers/povController.ts`
- Business dashboard route exists:
  - `frontend/src/app/business/dashboard/page.tsx`
- Business QR generation exists, but points to business profile:
  - `backend/src/modules/business/services/businessService.ts`
  - `frontend/src/app/business/settings/page.tsx`
  - `frontend/src/app/business/[id]/page.tsx`
- Customer messaging recommendations and contact sync exist:
  - `frontend/src/app/(customer)/messages/page.tsx`
  - `backend/src/modules/messaging/services/messagingService.ts`
- Business messaging recommendations exist:
  - `frontend/src/app/business/messages/page.tsx`
  - `backend/src/modules/messaging/services/messagingService.ts`
- Business shelf contract was repaired in the previous remediation:
  - `frontend/src/app/business/shelf/page.tsx`
  - `backend/src/modules/products/controllers/productController.ts`

### Broken Or Incomplete Relative To Report 2

- Customer home/dashboard is present but not a social profile-style home. It does not show enough community/profile identity, friends/follow graph, customer POV collage, or people discovery.
- POV creation copy says text-only POVs are allowed, but the frontend still blocks submit without a business and the backend requires `businessId`.
  - `frontend/src/app/(customer)/pov/create/page.tsx`
  - `backend/src/modules/pov/validators/index.ts`
  - `backend/src/modules/pov/services/povService.ts`
  - `backend/prisma/schema.prisma`
- The database schema requires every POV to belong to a business, which prevents personal experiences outside a business context.
- Feed/query types currently assume every POV has a business.
  - `backend/src/shared/builders/FeedQueryBuilder.ts`
  - `backend/src/modules/feed/models/index.ts`
  - `backend/src/modules/feed/services/feedService.ts`
  - `frontend/src/components/feed/pov-card.tsx`
- Business QR code destination does not match the report. It opens `/business/:id`; the client wants the QR to open POV creation for that business.
- Business create post currently creates a post but does not automatically attach the business owner's business profile, so business-side posts can become unattached generic user posts.
  - `frontend/src/app/business/posts/create/page.tsx`
  - `backend/src/modules/posts/services/postService.ts`
- Customer messages technically support search/recommendations, but the "New Conversation" flow hides search results behind a single name input. Users feel they cannot find people.
  - `frontend/src/app/(customer)/messages/page.tsx`
  - `backend/src/modules/search/services/searchService.ts`
- Profile page includes account/security/dashboard tasks that the client now wants moved out of the public profile presentation.
  - `frontend/src/app/user/[id]/page.tsx`
- Public business profile is improved but still not Instagram/TikTok-like enough: QR/dashboard/account settings and operational information compete with content tabs.
  - `frontend/src/app/business/[id]/page.tsx`
- Orders cannot be retested by the client until product creation and shelf visibility are verified live.

### Needs New Product Modeling

- "Communities" are referenced by the client, but the current app has interests, follows, profiles, businesses, and feeds. There is no `Community` model or route.
- Friend-only or selected-friend POV visibility is requested, but the current schema has no visibility enum and no friend relation beyond follows.
- Analytics for "what did they click, buy, or see before not buying" requires event capture beyond the current app routes.

## Recommended Execution Order

### Batch 1: POV Optional Business Link And QR Review Destination

Focus:
- Allow customers to post POVs without selecting a business.
- Keep ratings/recommendation required only when a business is attached.
- Keep text-only POV support honest.
- Make business QR codes route to `/pov/create?businessId=:id`.
- Prefill business on the POV creation page from `businessId`.
- Update feed, POV detail, profile, business dashboard, recommendations, admin summaries, and types for nullable POV business.

Why first:
- This is the clearest root-cause mismatch in report 2.
- It unlocks personal social content while preserving business review content.
- It makes QR capture drive new reviews instead of just profile visits.

Primary files:
- `backend/prisma/schema.prisma`
- `backend/src/modules/pov/validators/index.ts`
- `backend/src/modules/pov/models/index.ts`
- `backend/src/modules/pov/services/povService.ts`
- `backend/src/modules/pov/controllers/povController.ts`
- `backend/src/modules/feed/models/index.ts`
- `backend/src/shared/builders/FeedQueryBuilder.ts`
- `backend/src/modules/business/services/businessService.ts`
- `backend/src/modules/messaging/services/messagingService.ts`
- `backend/src/modules/recommendations/services/recommendationService.ts`
- `backend/src/modules/admin/models/index.ts`
- `backend/src/modules/admin/services/adminService.ts`
- `frontend/src/lib/routes.ts`
- `frontend/src/app/(customer)/pov/create/page.tsx`
- `frontend/src/components/feed/pov-card.tsx`
- `frontend/src/app/(customer)/pov/[id]/page.tsx`
- `frontend/src/app/(customer)/dashboard/page.tsx`
- `frontend/src/app/business/dashboard/page.tsx`
- `frontend/src/app/business/[id]/page.tsx`

### Batch 2: Customer Social Home And People Discovery

Focus:
- Convert customer dashboard into a social home/profile summary.
- Show profile identity, follower/following counts, POV count, recent POVs, recent/followed people, and recommended people.
- Replace the "enter name and hope" message start flow with visible search results.
- Add an explicit people/community discovery section using the existing user search endpoint.

Primary files:
- `frontend/src/app/(customer)/dashboard/page.tsx`
- `frontend/src/app/(customer)/messages/page.tsx`
- `backend/src/modules/search/services/searchService.ts` if richer people fields are needed
- `backend/src/modules/users/services/userService.ts` if dashboard-specific profile summary is needed

### Batch 3: Business Posting And Dashboard Verification

Focus:
- Ensure business-side post creation attaches to the owner business by default.
- Show create-post output in a business profile content tab.
- Verify business shelf create/edit live against backend validators.
- Keep shelf/order/message workflow links intact.

Primary files:
- `backend/src/modules/posts/services/postService.ts`
- `backend/src/modules/posts/controllers/postController.ts`
- `frontend/src/app/business/posts/create/page.tsx`
- `frontend/src/app/business/[id]/page.tsx`
- `frontend/src/app/business/dashboard/page.tsx`
- `frontend/src/app/business/shelf/page.tsx`

### Batch 4: Profile Restructure

Focus:
- Make public user and business profiles content-first:
  - avatar/logo
  - name
  - counts
  - bio/description
  - follow/message actions
  - content tabs for posts and POVs
- Move operational/account/security details to dashboards/settings.
- Keep QR download/generation in dashboard/settings, not dominant on public profiles.

Primary files:
- `frontend/src/app/user/[id]/page.tsx`
- `frontend/src/app/(customer)/dashboard/page.tsx`
- `frontend/src/app/business/[id]/page.tsx`
- `frontend/src/app/business/dashboard/page.tsx`
- `frontend/src/app/business/settings/page.tsx`

### Batch 5: Community And Analytics Foundation

Focus:
- Treat "community" initially as interests plus the existing follow graph; defer a real `Community` schema.
- Add privacy/visibility model for personal POVs:
  - `PUBLIC`
  - `FOLLOWERS`
  - future `SELECTED_USERS`
- Add event capture for commerce intelligence:
  - product viewed
  - business viewed
  - POV viewed
  - add-to-cart
  - checkout started
  - order placed
  - message started

Primary files:
- new backend analytics/event module if approved
- `backend/prisma/schema.prisma`
- frontend route/action instrumentation after event contract exists

Implemented outcome:
- Added a new `POVVisibility` enum and persisted POV `visibility` field with `PUBLIC` and `FOLLOWERS`.
- Added a write-only analytics event foundation through a new backend analytics module mounted at `/api/v1/analytics/events`.
- Added `AnalyticsEventType` values for:
  - `BUSINESS_VIEWED`
  - `PRODUCT_VIEWED`
  - `POV_VIEWED`
  - `ADD_TO_CART`
  - `CHECKOUT_STARTED`
  - `ORDER_PLACED`
  - `MESSAGE_STARTED`
- Added frontend instrumentation for the events above without adding an analytics/reporting UI.
- Added a small frontend analytics helper that skips tracking when no signed-in session exists, so public browsing is not redirected by analytics writes.
- Added a real add-to-cart action on public business product cards so `ADD_TO_CART` records a successful commerce action.

Implemented files:
- `docs/superpowers/plans/2026-06-15-test-report-2-batch-5-community-analytics-foundation.md`
- `backend/prisma/schema.prisma`
- `backend/src/core/routes.ts`
- `backend/src/modules/analytics/models/index.ts`
- `backend/src/modules/analytics/validators/index.ts`
- `backend/src/modules/analytics/services/analyticsService.ts`
- `backend/src/modules/analytics/controllers/analyticsController.ts`
- `backend/src/modules/analytics/routes.ts`
- `backend/src/modules/pov/models/index.ts`
- `backend/src/modules/pov/validators/index.ts`
- `backend/src/modules/pov/controllers/povController.ts`
- `backend/src/modules/pov/services/povService.ts`
- `backend/src/modules/feed/models/index.ts`
- `backend/src/modules/feed/services/feedService.ts`
- `backend/src/modules/feed/controllers/feedController.ts`
- `backend/src/shared/builders/FeedQueryBuilder.ts`
- `frontend/src/lib/routes.ts`
- `frontend/src/lib/analytics.ts`
- `frontend/src/app/(customer)/pov/create/page.tsx`
- `frontend/src/app/(customer)/pov/[id]/page.tsx`
- `frontend/src/app/business/[id]/page.tsx`
- `frontend/src/app/(customer)/search/page.tsx`
- `frontend/src/app/(customer)/cart/page.tsx`
- `frontend/src/app/(customer)/messages/page.tsx`
- `frontend/src/app/business/messages/page.tsx`

## Fresh Parallel Agent Split

Use root `AGENTHANDOFF.md` as the active ownership contract.

### Matthew Assignment

Matthew owns Batch 1 because it crosses schema, POV contract, feed, QR, and shared response types.

Target outcomes:
- Personal POVs can be created without a business.
- Business-linked POVs still feed business reviews, ratings, recommendations, and dashboards.
- Business QR codes open prefilled POV creation.
- Null business data does not break feed, profile, admin, dashboard, or recommendations.

### Jarvis Assignment

Jarvis owns Batch 2 while Matthew is working Batch 1.

Target outcomes:
- Customer dashboard stops feeling blank and becomes a profile/community home.
- Customer messaging exposes visible people search results before creating a conversation.
- User discovery is clear enough that users can find each other on the platform.

Jarvis must not edit Batch 1 files unless Matthew reassigns them.

## Verification Policy

Follow `SOP.md`:

- Frontend changed:
  - `cd frontend && npm run lint`
  - `cd frontend && npx tsc --noEmit`
- Backend changed:
  - `cd backend && npx tsc --noEmit`
- Prisma schema changed:
  - run `cd backend && npx prisma generate`
  - apply the database change only after confirming with Matthew/owner if the dev DB needs live runtime verification

No production builds unless explicitly requested.

## Resolved Product Decisions

- Personal POVs should not have ratings/recommendations in this pass. Ratings and recommendation choice belong only to business-linked POV reviews.
- One-way follow is enough for the MVP "friends"/audience model. Mutual friendships remain a future product decision.
- Community means existing interests plus the follow graph for MVP. A first-class `Community` model is deferred.
- Business QR codes should deep-link to prefilled POV creation for this pass. A separate "profile QR" versus "review QR" setting is deferred.
- Required foundation analytics events before analytics can become premium/reportable:
  - `BUSINESS_VIEWED`
  - `PRODUCT_VIEWED`
  - `POV_VIEWED`
  - `ADD_TO_CART`
  - `CHECKOUT_STARTED`
  - `ORDER_PLACED`
  - `MESSAGE_STARTED`

## Deferred Product Decisions

- Whether BuzzMap needs mutual friendships in addition to one-way follows.
- Whether selected-friend POV visibility needs a first-class audience model beyond `FOLLOWERS`.
- Whether to add a real `Community` schema with community pages, membership, moderation, and content routing.
- Whether business settings should expose two QR assets: profile QR and review/POV QR.
- What analytics aggregation and dashboard UI should be exposed to business owners, and which parts should be premium-gated.
