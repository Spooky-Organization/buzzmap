import { S3Client, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3';
import { config } from '../../config/index.js';
import { logger } from '../utils/logger.js';

let s3Client: S3Client | null = null;

export function getStorage(): S3Client {
  if (!s3Client) throw new Error('Storage client not initialized. Call initStorage() first.');
  return s3Client;
}

export function initStorage(): S3Client {
  if (s3Client) return s3Client;
  s3Client = new S3Client({
    endpoint: `${config.storage.useSsl ? 'https' : 'http'}://${config.storage.endpoint}:${config.storage.port}`,
    region: 'us-east-1', // Required by AWS SDK but not used by MinIO/RustFS
    credentials: {
      accessKeyId: config.storage.accessKey,
      secretAccessKey: config.storage.secretKey,
    },
    forcePathStyle: true, // Required for MinIO/RustFS compatibility
  });
  return s3Client;
}

/**
 * Ensure the configured bucket exists, creating it if missing. Idempotent and
 * safe to call on every startup — guards against a fresh storage volume (a
 * `NoSuchBucket` on the first upload otherwise surfaces as an opaque 500).
 */
export async function ensureBucket(): Promise<void> {
  const client = getStorage();
  const Bucket = config.storage.bucketName;

  try {
    await client.send(new HeadBucketCommand({ Bucket }));
    return;
  } catch {
    // Bucket missing (or not yet reachable) — attempt creation below.
  }

  try {
    await client.send(new CreateBucketCommand({ Bucket }));
    logger.info({ bucket: Bucket }, 'Storage bucket created');
  } catch (err) {
    // A concurrent creator may have won the race; treat "already owned" as success.
    const name = (err as { name?: string }).name;
    if (name === 'BucketAlreadyOwnedByYou' || name === 'BucketAlreadyExists') {
      return;
    }
    throw err;
  }
}
