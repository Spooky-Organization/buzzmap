import multer from 'multer';
import {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl as awsGetSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../../config/index.js';
import { getStorage, getPublicStorage } from './index.js';
import { AppError } from '../middleware/errorHandler.js';

// ─── Multer configuration ─────────────────────────────────────────────────────

/**
 * Parse a human-readable size (e.g. "200mb", "512kb", "1024") into bytes.
 * A bare number is treated as bytes. Defaults to 200 MB if unparseable.
 */
function parseFileSize(value: string): number {
  const match = /^(\d+(?:\.\d+)?)\s*(gb|mb|kb|b)?$/i.exec(value.trim());
  if (!match) return 200 * 1024 * 1024;
  const amount = parseFloat(match[1]);
  const unit = (match[2] ?? 'b').toLowerCase();
  const multiplier =
    unit === 'gb'
      ? 1024 ** 3
      : unit === 'mb'
        ? 1024 ** 2
        : unit === 'kb'
          ? 1024
          : 1;
  return Math.floor(amount * multiplier);
}

const maxFileSizeBytes = parseFileSize(config.maxFileSize);

function hasPrefix(buffer: Buffer, prefix: number[]): boolean {
  return prefix.every((byte, index) => buffer[index] === byte);
}

/**
 * Detect the *real* media type from a file's magic bytes, independent of the
 * client-declared `Content-Type`. Browsers frequently mislabel files (a PNG or
 * HEIC screenshot saved/renamed as `.jpg`, etc.), so the declared MIME is not
 * trustworthy — the content bytes are. Returns the canonical MIME + extension,
 * or `null` when the content is not a recognized media type.
 */
type DetectedFile = { mime: string; ext: string };

function detectFileType(buffer: Buffer): DetectedFile | null {
  if (!buffer || buffer.length < 12) {
    return null;
  }

  if (hasPrefix(buffer, [0xff, 0xd8, 0xff])) {
    return { mime: 'image/jpeg', ext: 'jpg' };
  }
  if (hasPrefix(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { mime: 'image/png', ext: 'png' };
  }
  if (
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { mime: 'image/webp', ext: 'webp' };
  }
  if (hasPrefix(buffer, [0x1a, 0x45, 0xdf, 0xa3])) {
    return { mime: 'video/webm', ext: 'webm' };
  }
  // ISO-BMFF `ftyp` box → MP4, but the same box also fronts HEIC/HEIF images;
  // exclude those brands so an image is never misclassified as a video.
  if (buffer.subarray(4, 8).toString('ascii') === 'ftyp') {
    const brand = buffer.subarray(8, 12).toString('ascii');
    if (!['heic', 'heix', 'heif', 'hevc', 'mif1', 'msf1'].includes(brand)) {
      return { mime: 'video/mp4', ext: 'mp4' };
    }
  }
  return null;
}

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxFileSizeBytes },
  fileFilter(_req, file, cb) {
    const mimeType = file.mimetype;
    if (config.allowedFileTypes.includes(mimeType)) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          415,
          `Unsupported file type: ${mimeType}. Allowed types: ${config.allowedFileTypes.join(', ')}`
        )
      );
    }
  },
});

/**
 * Validate a file by its real content and return its canonical type. Trusts the
 * sniffed bytes over the client-declared MIME (which is often wrong) and rejects
 * anything whose true content is not an allowed media type.
 */
function assertTrustedFile(file: Express.Multer.File): DetectedFile {
  const detected = detectFileType(file.buffer);
  if (!detected || !config.allowedFileTypes.includes(detected.mime)) {
    throw new AppError(
      415,
      `Unsupported file content. Allowed types: ${config.allowedFileTypes.join(', ')}`
    );
  }
  return detected;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

/**
 * Upload a Buffer to RustFS / S3-compatible storage.
 * @param file   The uploaded file from multer (Express.Multer.File)
 * @param folder Destination folder prefix inside the bucket (e.g. "povs")
 * @returns The storage key (path) of the uploaded object
 */
export async function uploadToStorage(
  file: Express.Multer.File,
  folder: string
): Promise<string> {
  const detected = assertTrustedFile(file);
  // Correct the declared MIME to the detected type so the stored object,
  // Content-Type, and any downstream `mediaTypeFromMime(file.mimetype)` callers
  // all agree on the file's real type rather than the client's (wrong) label.
  file.mimetype = detected.mime;

  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${detected.ext}`;

  const client = getStorage();
  await client.send(
    new PutObjectCommand({
      Bucket: config.storage.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: detected.mime,
      ContentLength: file.size,
    })
  );

  return key;
}

/**
 * Upload a raw Buffer under an explicit key, bypassing multer/content sniffing.
 * For non-request code paths (e.g. the DB seed) where the key is deterministic
 * and the content type is already known.
 */
export async function uploadBufferToStorage(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  const client = getStorage();
  await client.send(
    new PutObjectCommand({
      Bucket: config.storage.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
      ContentLength: body.length,
    })
  );
  return key;
}

/**
 * Whether an object exists in storage. Used by idempotent code paths (e.g. the
 * seed) that must re-create objects after a storage reset rather than trusting
 * a stale DB reference.
 */
export async function storageObjectExists(key: string): Promise<boolean> {
  const client = getStorage();
  try {
    await client.send(
      new HeadObjectCommand({ Bucket: config.storage.bucketName, Key: key })
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Delete an object from storage by its key.
 */
export async function deleteFromStorage(key: string): Promise<void> {
  const client = getStorage();
  await client.send(
    new DeleteObjectCommand({
      Bucket: config.storage.bucketName,
      Key: key,
    })
  );
}

/**
 * Generate a pre-signed URL for reading a private file.
 * Expires in 1 hour by default.
 */
export async function getSignedUrl(
  key: string,
  expiresInSeconds = 3600
): Promise<string> {
  // Sign against the *public* endpoint so the host in the URL is one the
  // browser can resolve (the internal Docker hostname is not). The signature
  // covers the host header, so the host must be correct at signing time.
  const client = getPublicStorage();
  const command = new GetObjectCommand({
    Bucket: config.storage.bucketName,
    Key: key,
  });
  return awsGetSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

/**
 * Resolve a stored media reference into a browser-loadable URL. Absolute URLs
 * (seed / CDN / placeholder links already reachable as-is) pass through
 * untouched; bare storage keys get a time-limited pre-signed URL. Use this
 * everywhere media is formatted for a response so an external URL is never
 * mistakenly glued onto the bucket path and signed.
 */
export async function resolveStorageUrl(value: string): Promise<string> {
  if (/^https?:\/\//i.test(value)) return value;
  return getSignedUrl(value);
}
