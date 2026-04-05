import multer from 'multer';
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as awsGetSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../../config/index.js';
import { getStorage } from './index.js';
import { AppError } from '../middleware/errorHandler.js';

// ─── Multer configuration ─────────────────────────────────────────────────────

const maxFileSizeBytes = parseInt(config.maxFileSize, 10);

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
