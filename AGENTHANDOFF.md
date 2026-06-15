# AGENTHANDOFF

This file is the working contract for multi-agent execution in this repo.

Current agents:
- `Matthew`: lead Codex agent in the current tab. Owns task assignment, integration review, and final verification.
- `Jarvis`: secondary Codex agent in a separate tab. Batch 2 customer social home and people-discovery slice is complete unless Matthew reassigns follow-up.

## Current Status

- Active remediation source: `docs/buzzmap test report 2.docx`.
- Active remediation plan: `docs/superpowers/plans/2026-06-15-test-report-2-remediation-scope.md`.
- Matthew active status: Test Report 2 Batches 1, 3, 4, and 5 complete and recorded in `CHANGELOG.md`.
- Jarvis active status: Batch 2 complete and recorded in `CHANGELOG.md` under `customer-social-home-and-people-discovery`.
- Matthew batch status: complete for the orders/cart contract slice recorded in `CHANGELOG.md`.
- Jarvis batch status: complete for the search/shelf/POV business tagging slice recorded in `CHANGELOG.md`.
- Matthew notification remediation status: complete for notification-source wiring and deep-link behavior recorded in `CHANGELOG.md`.
- Matthew POV detail/comment remediation status: complete and recorded in `CHANGELOG.md`.
- Matthew business messaging remediation status: complete and recorded in `CHANGELOG.md`.
- Matthew QR remediation status: complete and recorded in `CHANGELOG.md`.
- Test Report 2 Batches 1-5 are complete. No active Test Report 2 implementation split remains.
- `docs/superpowers/plans/2026-06-15-test-report-2-remediation-scope.md` now includes the resolved Batch 5 product decisions and implementation outcomes.

## Required Read Order

Before touching code, every agent must read:
- `SOP.md`
- `CHANGELOG.md`
- `docs/superpowers/plans/2026-06-15-test-report-2-remediation-scope.md`
- `docs/superpowers/plans/2026-06-09-test-report-remediation-scope.md`
- `AGENTHANDOFF.md`

## Operating Rules

- Follow `SOP.md` exactly.
- Do not run builds unless explicitly asked.
- Do not run git commands during implementation.
- Prefer root-cause contract fixes over UI-only patches.
- Keep write scopes narrow. Assume the other agent is actively editing their assigned files.
- If a task requires touching another agent's claimed file, stop and hand it back to Matthew for reassignment.

## Completed Test Report 2 Split: Batch 5

Matthew completed the community and analytics foundation slice recorded in `CHANGELOG.md` under `community-analytics-foundation`.

Implemented MVP decisions:
- "Community" means existing interests plus the follow graph for this pass; no new first-class `Community` model is created yet.
- POV visibility is introduced as a schema/API field with `PUBLIC` and `FOLLOWERS`; `SELECTED_USERS` remains deferred because there is no selected-friend relation yet.
- Analytics starts with write-only event capture for `BUSINESS_VIEWED`, `PRODUCT_VIEWED`, `POV_VIEWED`, `ADD_TO_CART`, `CHECKOUT_STARTED`, `ORDER_PLACED`, and `MESSAGE_STARTED`.
- No analytics dashboard/reporting UI is added in this pass; event capture creates the data foundation first.

Completed files included:
- `AGENTHANDOFF.md`
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
- `backend/src/modules/pov/services/povService.ts`
- `backend/src/modules/pov/controllers/povController.ts`
- `backend/src/shared/builders/FeedQueryBuilder.ts`
- `backend/src/modules/feed/models/index.ts`
- `backend/src/modules/feed/services/feedService.ts`
- `backend/src/modules/feed/controllers/feedController.ts`
- `frontend/src/lib/routes.ts`
- `frontend/src/lib/analytics.ts`
- `frontend/src/app/(customer)/pov/create/page.tsx`
- `frontend/src/app/(customer)/pov/[id]/page.tsx`
- `frontend/src/app/business/[id]/page.tsx`
- `frontend/src/app/(customer)/search/page.tsx`
- `frontend/src/app/(customer)/cart/page.tsx`
- `frontend/src/app/(customer)/messages/page.tsx`
- `frontend/src/app/business/messages/page.tsx`
- `CHANGELOG.md`

No active Batch 5 file ownership remains. Future work should start a fresh split for analytics reporting UI, first-class communities, mutual friends, or dual business QR types.

## Completed Test Report 2 Split: Batch 4

Matthew completed the public profile restructure slice recorded in `CHANGELOG.md` under `profile-content-first-restructure`.

Completed files included:
- `AGENTHANDOFF.md`
- `frontend/src/lib/routes.ts`
- `frontend/src/app/user/[id]/page.tsx`
- `frontend/src/app/business/[id]/page.tsx`
- `CHANGELOG.md`

Completed outcomes:
- Public user profiles now lead with identity, counts, follow/message actions, and content tabs for POVs and posts.
- The frontend route registry now exposes the existing `GET /api/v1/posts/user/:userId` contract.
- Public business profiles no longer show the owner QR card; review capture remains available through the `Leave POV` CTA and the owner settings QR tools.
- Jarvis-owned customer dashboard/messages files were not edited by Matthew in this batch.

## Completed Test Report 2 Split: Batch 2

Jarvis completed the customer social home and people-discovery/messaging UX slice recorded in `CHANGELOG.md` under `customer-social-home-and-people-discovery`.

Completed files included:
- `frontend/src/app/(customer)/dashboard/page.tsx`
- `frontend/src/app/(customer)/messages/page.tsx`

## Completed Test Report 2 Split: Batch 3

Matthew completed the business posting and public business content slice recorded in `CHANGELOG.md` under `business-posting-and-profile-content`.

Completed files included:
- `backend/src/modules/posts/services/postService.ts`
- `frontend/src/lib/routes.ts`
- `frontend/src/app/business/[id]/page.tsx`
- `frontend/src/app/business/dashboard/page.tsx`

## Completed Test Report 2 Split: Batch 1

Matthew completed the cross-cutting POV and QR contract slice recorded in `CHANGELOG.md` under `test-report-2-pov-and-review-qr-foundation`.

Completed files included:
- `backend/prisma/schema.prisma`
- `backend/src/modules/pov/validators/index.ts`
- `backend/src/modules/pov/models/index.ts`
- `backend/src/modules/pov/services/povService.ts`
- `backend/src/modules/pov/controllers/povController.ts`
- `backend/src/modules/feed/models/index.ts`
- `backend/src/modules/feed/services/feedService.ts`
- `backend/src/shared/builders/FeedQueryBuilder.ts`
- `backend/src/modules/business/services/businessService.ts`
- `backend/src/modules/messaging/services/messagingService.ts`
- `backend/src/modules/recommendations/services/recommendationService.ts`
- `backend/src/modules/admin/models/index.ts`
- `backend/src/modules/admin/services/adminService.ts`
- `frontend/src/app/(customer)/pov/create/page.tsx`
- `frontend/src/components/feed/pov-card.tsx`
- `frontend/src/app/(customer)/pov/[id]/page.tsx`
- `frontend/src/app/user/[id]/page.tsx`
- `frontend/src/app/business/settings/page.tsx`

## Completed Remediation Split

### Matthew Ownership

Matthew owns the full orders/cart remediation slice so only one agent touches the order contract.

Files in Matthew's write scope:
- `frontend/src/app/(customer)/cart/page.tsx`
- `frontend/src/app/(customer)/orders/page.tsx`
- `frontend/src/app/business/orders/page.tsx`
- `backend/src/modules/orders/models/index.ts`
- `backend/src/modules/orders/services/orderService.ts`
- `backend/src/modules/orders/controllers/orderController.ts`
- `backend/src/modules/orders/validators/index.ts` if required
- `CHANGELOG.md` after Matthew lands a coherent batch

Target outcomes:
- Cart loads the correct response shape.
- Cart totals and currency display correctly.
- Customer orders load the correct response shape.
- Business orders load the correct response shape.
- Any required backend order response fields are added once, cleanly, in the shared contract.

### Jarvis Ownership

Jarvis owns the search/shelf/POV business tagging remediation slice so only one agent touches the search and product contracts.

Files in Jarvis's write scope:
- `frontend/src/app/(customer)/search/page.tsx`
- `frontend/src/app/(customer)/pov/create/page.tsx`
- `frontend/src/app/business/shelf/page.tsx`
- `backend/src/modules/search/models/index.ts`
- `backend/src/modules/search/services/searchService.ts`
- `backend/src/modules/search/controllers/searchController.ts` if required
- `backend/src/modules/products/models/index.ts` if required
- `backend/src/modules/products/services/productService.ts` if required
- `backend/src/modules/products/controllers/productController.ts` if required

Target outcomes:
- Business search renders correctly and can find businesses like Wanjiru's.
- Search result shapes match frontend expectations without double-unwrapping bugs.
- POV creation can search and select a business instead of exposing a dead input.
- Business shelf loads the correct response shape.
- Business shelf create/edit flow includes the required product fields and saves successfully.

## File Claim Protocol

- Matthew owns integration decisions.
- Jarvis must not edit files in Matthew's write scope.
- Matthew must not edit files in Jarvis's write scope unless Jarvis is blocked or the task is reassigned.
- Shared infra files outside the declared scopes require explicit reassignment by Matthew before editing.

## Verification Checklist

An assigned task is not complete until the agent has verified all applicable items below and reported the exact result.

- Read `SOP.md`, `CHANGELOG.md`, the remediation plan, and `AGENTHANDOFF.md`.
- Confirm the changed frontend code matches the real backend contract.
- Confirm the changed backend response shape matches the consuming frontend code.
- Run `cd frontend && npm run lint` if any frontend files were changed.
- Run `cd frontend && npx tsc --noEmit` if any frontend files were changed.
- Run `cd backend && npx tsc --noEmit` if any backend files were changed.
- Report whether any warnings are pre-existing versus newly introduced.
- List exact files changed.
- Summarize the root cause fixed, not just the visible symptom.
- Call out any residual risk or any issue that still needs Matthew’s integration pass.

## Completion Report Format

Jarvis should report back to Matthew in this format:

1. `Status`: complete, blocked, or needs reassignment
2. `Root cause fixed`: one short paragraph
3. `Files changed`: flat list
4. `Verification run`: exact commands and actual results
5. `Residual risks`: only if real

## Escalation Rules

Jarvis must stop and hand back to Matthew if:
- the task requires editing a Matthew-owned file
- the contract fix spans both assigned domains
- there is a product decision not resolved by the remediation plan
- verification results look contaminated by another agent's concurrent edits

## Current Priority

The completed order/search split and the completed notifications split below are retained as historical records.
For the remaining 2026-06-09 remediation work, follow the active continuation split below unless Matthew explicitly reassigns scope.

## Completed Split: Notifications Deep Links

### Matthew Ownership

Matthew owns backend notification-source wiring and payload design.

Files in Matthew's write scope:
- `backend/src/modules/orders/services/orderService.ts`
- `backend/src/modules/messaging/services/messagingService.ts`
- `backend/src/modules/notifications/models/index.ts` if required
- `backend/src/modules/notifications/services/notificationService.ts` if required
- `CHANGELOG.md` after Matthew lands the batch

Target outcomes:
- Message notifications are created when a user sends a message to another participant.
- Order notifications are created when order state changes require user attention.
- Notification payloads include enough structured `data` for frontend deep-link routing.

### Jarvis Ownership

Jarvis owns frontend notification interaction behavior only.

Files in Jarvis's write scope:
- `frontend/src/components/notifications/notifications-page-content.tsx`
- `frontend/src/hooks/use-notifications.ts` if required

Target outcomes:
- Message notifications tap through to the correct conversation thread.
- Order notifications tap through to the correct order destination.
- Notification items can mark as read as part of the interaction flow when appropriate.
- “Mark all read” stays functional; remove nothing unless it is truly broken and Matthew reassigns scope.

## Historical Split Notes

- The orders/cart and search/shelf/POV split documented above is historical for the completed first remediation pass on 2026-06-09.
- The notifications split was the completed follow-up ownership assignment for the same remediation run.
- Matthew absorbed the frontend notifications interaction follow-through during final integration, so no active Jarvis-owned notification files remain in flight.
- Any new implementation after the notifications slice should start with a fresh ownership assignment before either agent edits previously claimed files.

## Final Continuation Ownership

### Matthew Ownership

Matthew owns all remaining remediation, integration review, and follow-up implementation.

Files in Matthew's write scope:
- `frontend/src/lib/routes.ts`
- `frontend/src/app/business/messages/page.tsx`
- `frontend/src/app/business/messages/loading.tsx`
- `frontend/src/app/business/messages/[conversationId]/page.tsx`
- `frontend/src/app/business/messages/[conversationId]/loading.tsx`
- `frontend/src/app/business/layout.tsx`
- `frontend/src/proxy.ts`
- `frontend/src/components/messaging/conversation-list.tsx`
- `frontend/src/components/notifications/notifications-page-content.tsx`
- `backend/src/modules/messaging/models/index.ts`
- `backend/src/modules/messaging/services/messagingService.ts`
- `backend/src/modules/messaging/controllers/messagingController.ts`
- `backend/src/modules/messaging/routes.ts`
- `CHANGELOG.md` after Matthew lands the batch

Target outcomes:
- Integrate and review Jarvis-owned business-surface changes against completed messaging, notification, and layout work.
- Own any follow-up fixes that cross the messaging, routing, or notification contracts.
- Take the remaining unresolved report items that still need product judgment or cross-cutting integration, such as QR flow, deeper messaging recommendation work, or shelf-to-orders workflow linkage.

## Final Continuation Notes

- The previous Jarvis-owned landing, sidebar, analytics, and business-profile changes are now historical and should be treated as integrated repo state.
- There is no active parallel write split anymore for this remediation run.
- Any future multi-agent execution should start with a fresh ownership contract instead of reusing the completed split above.
- No pinned remediation items remain from the 2026-06-09 test-report execution tail; follow-up work now requires a fresh implementation call rather than continuing an open punch list.
