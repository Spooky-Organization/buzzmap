import { getSignedUrl } from './upload.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Shared formatting + limits for POV gallery media (images + videos).
 *
 * `formatMedia` is the single place that turns stored `POVMedia` rows into the
 * API response shape with *signed* URLs. Both the POV service and the feed
 * service route through it so URL signing stays consistent across surfaces.
 */

// ─── Gallery limits ─────────────────────────────────────────────────────────

export const MAX_VIDEOS = 2;
export const MAX_IMAGES = 8;
export const MAX_MEDIA_ITEMS = MAX_VIDEOS + MAX_IMAGES; // 10
export const MAX_VIDEO_BYTES = 200 * 1024 * 1024; // 200 MB
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

// ─── File validation ─────────────────────────────────────────────────────────

const MB = 1024 * 1024;

/** Map an upload MIME type to a stored POVMedia type. */
export function mediaTypeFromMime(mimetype: string): 'IMAGE' | 'VIDEO' {
  return mimetype.startsWith('video/') ? 'VIDEO' : 'IMAGE';
}

/**
 * Enforce the POV gallery rules against the uploaded files:
 * if media is present, enforce ≤ MAX_VIDEOS videos, ≤ MAX_IMAGES images, and
 * per-type size limits. Text-only POVs may pass an empty file list.
 */
export function validatePOVMediaFiles(files: Express.Multer.File[]): void {
  if (!files || files.length === 0) {
    return;
  }
  if (files.length > MAX_MEDIA_ITEMS) {
    throw new AppError(
      400,
      `A POV can have at most ${MAX_MEDIA_ITEMS} media items.`
    );
  }

  let videos = 0;
  let images = 0;

  for (const file of files) {
    if (mediaTypeFromMime(file.mimetype) === 'VIDEO') {
      videos += 1;
      if (file.size > MAX_VIDEO_BYTES) {
        throw new AppError(
          400,
          `Each video must be ${MAX_VIDEO_BYTES / MB} MB or smaller.`
        );
      }
    } else {
      images += 1;
      if (file.size > MAX_IMAGE_BYTES) {
        throw new AppError(
          400,
          `Each image must be ${MAX_IMAGE_BYTES / MB} MB or smaller.`
        );
      }
    }
  }

  if (videos > MAX_VIDEOS) {
    throw new AppError(400, `A POV can have at most ${MAX_VIDEOS} videos.`);
  }
  if (images > MAX_IMAGES) {
    throw new AppError(400, `A POV can have at most ${MAX_IMAGES} images.`);
  }
}

// ─── Formatting ─────────────────────────────────────────────────────────────

export interface RawPOVMedia {
  id: string;
  url: string; // storage key
  type: 'IMAGE' | 'VIDEO';
  thumbnailUrl: string | null;
  position: number;
}

export interface FormattedPOVMedia {
  id: string;
  url: string; // signed URL
  type: 'image' | 'video';
  thumbnailUrl: string | null;
  position: number;
}

/**
 * Already-absolute URLs (e.g. seed/CDN links) are returned as-is; storage keys
 * are turned into time-limited signed URLs.
 */
async function resolveUrl(value: string): Promise<string> {
  if (/^https?:\/\//i.test(value)) return value;
  return getSignedUrl(value);
}

/**
 * Resolve stored media rows into ordered, signed-URL media items.
 */
export async function formatMedia(
  media: RawPOVMedia[]
): Promise<FormattedPOVMedia[]> {
  const ordered = [...media].sort((a, b) => a.position - b.position);

  return Promise.all(
    ordered.map(async (m) => ({
      id: m.id,
      url: await resolveUrl(m.url),
      type: m.type === 'VIDEO' ? ('video' as const) : ('image' as const),
      thumbnailUrl: m.thumbnailUrl ? await resolveUrl(m.thumbnailUrl) : null,
      position: m.position,
    }))
  );
}
