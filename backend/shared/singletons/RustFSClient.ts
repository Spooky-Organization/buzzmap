import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const RUSTFS_ENDPOINT = process.env["RUSTFS_ENDPOINT"] || "http://localhost:9000";
const RUSTFS_ACCESS_KEY = process.env["RUSTFS_ACCESS_KEY"] || "minioadmin";
const RUSTFS_SECRET_KEY = process.env["RUSTFS_SECRET_KEY"] || "minioadmin";
const RUSTFS_BUCKET = process.env["RUSTFS_BUCKET"] || "buzzmap-media";
const RUSTFS_REGION = process.env["RUSTFS_REGION"] || "us-east-1";

export class RustFSClient {
  private static instance: RustFSClient;
  private client: S3Client;
  private bucket: string;

  private constructor() {
    this.client = new S3Client({
      endpoint: RUSTFS_ENDPOINT,
      region: RUSTFS_REGION,
      credentials: {
        accessKeyId: RUSTFS_ACCESS_KEY,
        secretAccessKey: RUSTFS_SECRET_KEY,
      },
      forcePathStyle: true,
    });
    this.bucket = RUSTFS_BUCKET;
  }

  public static getInstance(): RustFSClient {
    if (!RustFSClient.instance) {
      RustFSClient.instance = new RustFSClient();
    }
    return RustFSClient.instance;
  }

  private generateKey(filename: string, folder: string): string {
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    return `${folder}/${timestamp}-${sanitizedFilename}`;
  }

  public async upload(
    file: Buffer,
    filename: string,
    contentType: string,
    folder: string = "uploads"
  ): Promise<string> {
    const key = this.generateKey(filename, folder);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file,
      ContentType: contentType,
    });

    await this.client.send(command);
    console.log(`[${new Date().toISOString()}] RustFSClient: Uploaded ${key}`);
    return key;
  }

  public async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
    console.log(`[${new Date().toISOString()}] RustFSClient: Deleted ${key}`);
  }

  public async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const signedUrl = await getSignedUrl(this.client, command, { expiresIn });
    return signedUrl;
  }

  public async getSignedUploadUrl(
    filename: string,
    contentType: string,
    folder: string = "uploads",
    expiresIn: number = 3600
  ): Promise<{ uploadUrl: string; key: string }> {
    const key = this.generateKey(filename, folder);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn });
    return { uploadUrl, key };
  }

  public async exists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.client.send(command);
      return true;
    } catch {
      return false;
    }
  }

  public getPublicUrl(key: string): string {
    return `${RUSTFS_ENDPOINT}/${this.bucket}/${key}`;
  }
}

export const rustfsClient = RustFSClient.getInstance();