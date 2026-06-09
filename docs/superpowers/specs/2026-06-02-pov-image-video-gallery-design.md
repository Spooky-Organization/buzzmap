# POV Mixed Image + Video Galleries — Design

**Date:** 2026-06-02
**Status:** Approved (design)
**Author:** Matthew-kabiu (with Claude)

## Summary

Today a POV (Point of View) post requires exactly one video. This change lets a
POV hold a **gallery of mixed media** — images and videos together — so the feed
shows a mix across all user roles and every page that renders POVs.

Gallery rules (confirmed):

- At least **1** media item required.
- At most **2 videos**.
- At most **8 images**.
- Up to 10 items total, mixed freely, displayed in upload order.
- Videos ≤ 200 MB; images ≤ 10 MB.

There is **no existing POV data**, so the schema is restructured cleanly with no
row migration.

## Goals

- Customers can attach images and/or videos to a POV (within the limits above).
- The feed and every POV surface render galleries with a mix of media types.
- Applies across all roles automatically (creation stays CUSTOMER-only; feed and
  cards are shared).

## Non-Goals

- Video thumbnail generation (none exists today; out of scope).
- Editing media on an existing POV (create + delete only, as today).
- Changing like/comment/rating behavior.

## Data Model (Prisma)

`backend/prisma/schema.prisma`

Add enum and related table:

```prisma
enum POVMediaType {
  IMAGE
  VIDEO
}

model POVMedia {
  id           String       @id @default(uuid())
  povId        String
  url          String        // storage key (not a signed URL)
  type         POVMediaType
  thumbnailUrl String?
  position     Int           // 0-based order within the gallery
  createdAt    DateTime     @default(now())

  pov POV @relation(fields: [povId], references: [id], onDelete: Cascade)

  @@index([povId, position])
}
```

On `POV`: **remove** `videoUrl` and `thumbnailUrl`; **add** `media POVMedia[]`.
All other fields (`starRating`, `recommends`, `likesCount`, `commentsCount`,
`comments`, `likes`, indexes) are unchanged.

No data migration required (no existing POVs). Schema change applied via Prisma
migrate / db push.

## Backend — Upload & Validation

`backend/src/modules/pov/routes.ts`

- Replace `upload.single('video')` with `upload.array('media', 10)`.

`backend/src/shared/storage/upload.ts`

- No change to `assertTrustedFile` — it already validates jpeg/png/webp/mp4/webm
  signatures.
- Multer's global `fileSize` limit stays at the largest allowed size (video).
  Per-type size limits are enforced in code (multer cannot vary limit by type).

`backend/src/modules/pov/validators/index.ts` and service

- Per-type / count rules enforced server-side in the service (or a dedicated
  validator), throwing `AppError(400/415)` on violation:
  - `media.length >= 1`
  - videos ≤ 2, images ≤ 8
  - video file ≤ 200 MB, image file ≤ 10 MB
- Constants for the limits (e.g. `MAX_VIDEOS = 2`, `MAX_IMAGES = 8`,
  `MAX_VIDEO_BYTES`, `MAX_IMAGE_BYTES`) defined in one place.

`backend/src/modules/pov/controllers/povController.ts`

- Read `req.files` (array) instead of `req.file`; 400 if empty.
- Keep coercion of `starRating` (Number) and `recommends` (boolean) from
  multipart strings.

`backend/src/modules/pov/services/povService.ts`

- `createPOV` accepts `Express.Multer.File[]`. For each file: derive type from
  MIME, upload to storage, record `{ url: key, type, position }` (position = the
  index in the received array). Create the POV with nested `media` create.
- `deletePOV`: delete every media object from storage (loop over `pov.media`),
  then delete the POV (cascade removes `POVMedia` rows).

## Backend — Response Shape & Folded-in Fixes

Response type changes (`backend/src/modules/pov/models/index.ts` and
`backend/src/modules/feed/models/index.ts`): drop `videoUrl` and `thumbnailUrl`,
add:

```ts
interface POVMediaItem {
  id: string;
  url: string;            // signed URL
  type: 'image' | 'video';
  thumbnailUrl: string | null;
  position: number;
}
// on POVResponse / FeedPOV:
media: POVMediaItem[];
```

**Shared `formatMedia()` helper.** Add one helper that takes the raw media rows
and returns `POVMediaItem[]` with **signed URLs**. Used by both:

- `povService.formatPOV` (and `POV_SELECT` gains `media: { ... }`).
- `feedService` (and `FeedQueryBuilder.build()` `include`s the `media` relation
  ordered by `position`).

**Latent bug fixed by this:** the feed service currently returns *raw storage
keys* as `videoUrl` while the POV module signs them. Routing both through
`formatMedia()` makes URL signing consistent.

`feedService.getPersonalizedFeed` / `getTrending` map rows through
`formatMedia()` (becomes async map, as `povService` already does).

## Frontend — Create POV page

`frontend/src/app/(customer)/pov/create/page.tsx`

- File input: `accept="image/*,video/*"`, `multiple`.
- State holds an ordered list of selected media (file + object-URL preview +
  derived type), replacing the single `videoFile`/`videoPreview`.
- A media tray renders each item (image thumb or `<video>` preview), each with a
  remove control; order in the tray is the gallery order.
- Client-side enforcement with toasts mirroring server rules: ≤ 2 videos,
  ≤ 8 images, ≥ 1 item, video ≤ 200 MB, image ≤ 10 MB.
- Submit appends each file as `media` (in order) to `FormData`.
- **Fix field names:** send `starRating` and `recommends` (currently sends
  `rating`/`recommended`, which the backend ignores).
- Hero copy updated from "Video-first" to reflect photos + video.

## Frontend — Feed / POV card

`frontend/src/components/feed/pov-card.tsx`

- `POVCardData`: drop `videoUrl`/`thumbnailUrl`, add `media: POVMediaItem[]`.
- Replace the single video/image block with a **gallery/carousel**: render each
  item by `type` (video → `<video controls playsInline>`, image → `<img>`),
  with arrows + dot indicators when more than one item. Lightweight, no new
  dependency.

`frontend/src/components/feed/pov-feed.tsx` — `FeedPage.data` type follows the
updated `POVCardData`; no logic change.

Other consumers: grep the frontend for `videoUrl` / `thumbnailUrl` on POV data
(e.g. `/pov/[id]` detail page, business/user profile POV lists) and update them
to consume `media[]`. Because they reuse `POVCard`, most are covered
automatically.

## Roles & Surfaces

- POV creation stays CUSTOMER-only (`authorize('CUSTOMER')`).
- Feed and POV cards are shared, so ADMIN, BUSINESS_OWNER, and CUSTOMER views all
  render mixed-media galleries with no per-role work.
- Surfaces covered via `POVCard` / `formatPOV`: customer feed, trending feed,
  business profile POVs (`getByBusiness`), user profile POVs (`getByUser`,
  `getMyPOVs`), POV detail.

## Testing

- Backend: create POV with (a) single image, (b) single video, (c) mix; reject
  > 2 videos, > 8 images, 0 items, oversized files, wrong MIME. Verify delete
  removes all media from storage. Verify feed/profile responses return signed
  `media[]`.
- Frontend: tray add/remove/limit enforcement; submission payload ordering;
  gallery renders mixed types with carousel controls.

## Open Decisions (resolved)

- Image max size: **10 MB**.
- Carousel: **lightweight arrows + dots**, no new dependency (pending final OK).
