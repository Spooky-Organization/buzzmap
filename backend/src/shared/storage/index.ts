import { S3Client } from '@aws-sdk/client-s3';
import { config } from '../../config/index.js';

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
