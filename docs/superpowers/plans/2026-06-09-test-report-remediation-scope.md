# BuzzMap Test Report Remediation Scope

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the `docs/buzzmap test report.docx` punch list into an execution-ready remediation sequence grouped by subsystem and implementation risk.

**Architecture:** The report mixes shipped features, frontend/backend contract bugs, UX polish requests, and net-new feature asks. Treat them as separate slices so contract fixes land first, then functional commerce/messaging work, then larger product additions such as contact sync, QR codes, and business profile redesign.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4, NextAuth v5, Express 5, Prisma 7, Postgres, Socket.IO

---

## Source

- `docs/buzzmap test report.docx`

## Audit Summary

### Already Implemented

- Customer notifications page exists:
  - `frontend/src/app/(customer)/notifications/page.tsx`
- Customer feed route exists:
  - `frontend/src/app/(customer)/feed/page.tsx`
- Customer POV creation route exists and submits multipart media:
  - `frontend/src/app/(customer)/pov/create/page.tsx`
  - `backend/src/modules/pov/routes.ts`
- Customer cart and checkout flow exist:
  - `frontend/src/app/(customer)/cart/page.tsx`
  - `backend/src/modules/orders/controllers/orderController.ts`
  - `backend/src/modules/orders/services/orderService.ts`
- Customer search route exists:
  - `frontend/src/app/(customer)/search/page.tsx`
  - `backend/src/modules/search/controllers/searchController.ts`
  - `backend/src/modules/search/services/searchService.ts`
- Business orders page exists:
  - `frontend/src/app/business/orders/page.tsx`
- Business product shelf exists:
  - `frontend/src/app/business/shelf/page.tsx`
  - `backend/src/modules/products/controllers/productController.ts`
  - `backend/src/modules/products/services/productService.ts`
- Business post creation route exists:
  - `frontend/src/app/business/posts/create/page.tsx`
- Public business profile route exists:
  - `frontend/src/app/business/[id]/page.tsx`

### Implemented But Likely Broken Or Incomplete

- Unified search is present, but the frontend expects `business.name` while backend returns `businessName`, which can break business rendering and discovery:
  - `frontend/src/app/(customer)/search/page.tsx`
  - `backend/src/modules/search/services/searchService.ts`
- Cart page reads `res.data.items`, but the axios client already unwraps the backend envelope. Backend returns a list, not `{ items }`, so cart data is likely misread:
  - `frontend/src/lib/api.ts`
  - `frontend/src/app/(customer)/cart/page.tsx`
  - `backend/src/modules/orders/controllers/orderController.ts`
- Business orders page reads `res.data.orders`, but backend returns paginated `data`, not `{ orders }`:
  - `frontend/src/app/business/orders/page.tsx`
  - `backend/src/modules/orders/controllers/orderController.ts`
- Business shelf page reads `res.data.data ?? []`, which is likely wrong after axios envelope unwrapping and paginated responses:
  - `frontend/src/app/business/shelf/page.tsx`
  - `frontend/src/lib/api.ts`
- Business public page currently emphasizes products/gallery/contact, not a POV-first TikTok/Instagram-like profile:
  - `frontend/src/app/business/[id]/page.tsx`
- POV feed card exposes comment counts and a comment link, but there is no corresponding POV detail/comment route implemented in the frontend:
  - `frontend/src/components/feed/pov-card.tsx`
- POV create page has an optional business search input, but no actual business lookup or selection result list is wired to it:
  - `frontend/src/app/(customer)/pov/create/page.tsx`
- Notifications support structured `data` on the backend, but the frontend notifications page does not use that payload for deep links:
  - `backend/src/modules/notifications/services/notificationService.ts`
  - `frontend/src/components/notifications/notifications-page-content.tsx`

### Missing / Net-New Features

- “Delete text explaining the features in the website”:
  - likely landing-page content update in `frontend/src/app/page.tsx`
- “Auto collapse sidebar when navigating from side tab”:
  - not implemented in current sidebar navigation
  - `frontend/src/components/shared/app-sidebar.tsx`
  - `frontend/src/components/ui/sidebar.tsx`
- “Feed button missing”:
  - desktop customer sidebar has `Feed`; needs reproduction context, likely mobile or another nav surface
- “No image function on customer POV. No text or comment function either.”:
  - image/video upload exists in POV create
  - comment UI is missing
  - text-only POV support needs product decision because backend route currently requires media
- “Can we get messages to recommend people you can start texting, maybe from your contacts”:
  - entirely net new
  - requires permission model, contact import/sync design, matching logic, and privacy review
- “Notifications unread/message tap-through and order confirmed tap-through”:
  - net new deep-link behavior on top of existing notifications
- “Control bulk clean up - make functional or delete”:
  - button exists and backend `markAllRead` exists; needs verification and possibly cleanup
- “See POVs and reviews from customers, make content” in business workspace:
  - likely needs dedicated business-facing POV/reviews panel
- “Create QR codes for their business and or community”:
  - net new
- “Message and receive messages from customers”:
  - messaging exists globally, but business-directed conversation entrypoints/recommendations may be incomplete
- “Analytics - delete. Premium feature.”:
  - product gating/removal task, not a bug fix
- “Link product shelf to orders so it is seamless”:
  - likely workflow/UX improvement rather than missing backend capability

## Recommended Execution Order

### Batch 1: Contract And Data-Flow Fixes

Focus:
- Search correctness
- Cart correctness
- Business orders correctness
- Product shelf correctness
- POV business tagging lookup

Why first:
- These are existing features that likely fail because frontend assumptions no longer match backend contracts.
- Highest leverage, lowest product ambiguity.

Primary files:
- `frontend/src/app/(customer)/search/page.tsx`
- `frontend/src/app/(customer)/cart/page.tsx`
- `frontend/src/app/business/orders/page.tsx`
- `frontend/src/app/business/shelf/page.tsx`
- `frontend/src/app/(customer)/pov/create/page.tsx`
- `frontend/src/lib/api.ts`

### Batch 2: Notifications And Messaging Navigation

Focus:
- notification deep links
- message notification open thread
- order notification open destination
- validate or remove “bulk clean up”

Why second:
- Depends on Batch 1-level trust in app data flow.
- Medium complexity, clear user value.

Primary files:
- `frontend/src/components/notifications/notifications-page-content.tsx`
- `frontend/src/lib/routes.ts`
- `backend/src/modules/notifications/services/notificationService.ts`
- messaging/order creation flows that generate notifications

### Batch 3: POV Interaction Completion

Focus:
- customer-facing POV detail page
- comment list + add comment UI
- optional text-only POV decision

Why third:
- Backend comment APIs exist, so the frontend gap is clear.
- Text-only POV should be explicitly approved because current backend validation assumes media-first POVs.

Primary files:
- `frontend/src/components/feed/pov-card.tsx`
- new POV detail route under `frontend/src/app`
- `backend/src/modules/pov/controllers/*` only if contract expansion is needed

### Batch 4: Business Experience Restructuring

Focus:
- remove or gate analytics as premium
- redesign public business profile to be POV-first
- surface customer POVs/reviews inside business workspace
- possibly link shelf and orders more tightly

Why fourth:
- This is broader product/UX work, not just bug fixing.

### Batch 5: Net-New Features Requiring Product Decisions

Focus:
- contact-based messaging recommendations
- QR code generation
- automatic sidebar collapse behavior across shells
- landing-page copy cleanup

Why last:
- These need explicit UX and/or privacy decisions and should not be mixed into core remediation.

## Recommended First Implementation Slice

Start with **Batch 1: Contract And Data-Flow Fixes**.

This batch directly addresses the report items most likely to be failing today because of incorrect frontend assumptions:

- search cannot find businesses
- cart/orders appear non-functional
- product shelf may not load/save correctly
- POV creation cannot tag businesses properly

## Parallel Agent Split

Use the root `AGENTHANDOFF.md` as the execution contract for this split.

### Matthew Assignment

Matthew owns the entire orders/cart slice so only one agent touches the shared order contract.

Scope:
- customer cart response-shape fix
- customer orders response-shape fix
- business orders response-shape fix
- any shared backend order response/model updates needed to support those pages

Primary files:
- `frontend/src/app/(customer)/cart/page.tsx`
- `frontend/src/app/(customer)/orders/page.tsx`
- `frontend/src/app/business/orders/page.tsx`
- `backend/src/modules/orders/models/index.ts`
- `backend/src/modules/orders/services/orderService.ts`
- `backend/src/modules/orders/controllers/orderController.ts`

### Jarvis Assignment

Jarvis owns the search/shelf/POV business lookup slice so only one agent touches the search and product contracts.

Scope:
- customer search contract fix
- business search rendering correctness
- POV business lookup wiring
- business shelf response-shape fix
- business shelf create/edit form completion for required fields

Primary files:
- `frontend/src/app/(customer)/search/page.tsx`
- `frontend/src/app/(customer)/pov/create/page.tsx`
- `frontend/src/app/business/shelf/page.tsx`
- `backend/src/modules/search/models/index.ts`
- `backend/src/modules/search/services/searchService.ts`
- `backend/src/modules/search/controllers/searchController.ts` if needed
- `backend/src/modules/products/models/index.ts` if needed
- `backend/src/modules/products/services/productService.ts` if needed
- `backend/src/modules/products/controllers/productController.ts` if needed

### Shared Coordination Rule

- Jarvis must follow both this plan and `AGENTHANDOFF.md`.
- Neither agent should edit the other agent's claimed files without reassignment.
- Matthew performs the final integration review after both slices are complete.

## Verification Policy For Future Execution

- Frontend:
  - `cd frontend && npm run lint`
  - `cd frontend && npx tsc --noEmit`
- Backend:
  - `cd backend && npx tsc --noEmit`

## Open Product Decisions Before Later Batches

- Should POV posts support text-only reviews, or remain media-required?
- For order notifications, should the tap target open `orders` or `cart`? The report says “cart,” but operationally a confirmed order usually belongs in order history.
- Should analytics be hidden only from navigation, or fully gated with premium upsell copy?
- For business profile redesign, should products remain a tab beneath a POV-first top section, or be demoted further?
