import multer from 'multer';
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as awsGetSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../../config/index.js';
import { getStorage } from './index.js';
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

function matchesFileSignature(file: Express.Multer.File): boolean {
  const { mimetype, buffer } = file;

  if (!buffer || buffer.length < 12) {
    return false;
  }

  switch (mimetype) {
    case 'image/jpeg':
      return hasPrefix(buffer, [0xff, 0xd8, 0xff]);
    case 'image/png':
      return hasPrefix(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case 'image/webp':
      return (
        buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
        buffer.subarray(8, 12).toString('ascii') === 'WEBP'
      );
    case 'video/mp4':
      return buffer.subarray(4, 8).toString('ascii') === 'ftyp';
    case 'video/webm':
      return hasPrefix(buffer, [0x1a, 0x45, 0xdf, 0xa3]);
    default:
      return false;
  }
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

function assertTrustedFile(file: Express.Multer.File): void {
  if (!matchesFileSignature(file)) {
    throw new AppError(
      415,
      `Uploaded file content does not match declared MIME type: ${file.mimetype}`
    );
  }
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
  assertTrustedFile(file);

  const ext = file.originalname.split('.').pop() ?? 'bin';
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const client = getStorage();
  await client.send(
    new PutObjectCommand({
      Bucket: config.storage.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentLength: file.size,
    })
  );

  return key;
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
  const client = getStorage();
  const command = new GetObjectCommand({
    Bucket: config.storage.bucketName,
    Key: key,
  });
  return awsGetSignedUrl(client, command, { expiresIn: expiresInSeconds });
}
