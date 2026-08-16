import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "#/config/env";
import crypto from "node:crypto";

class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    this.client = new S3Client({
      endpoint: env.SPACES_ENDPOINT,
      region: env.SPACES_REGION,
      credentials: {
        accessKeyId: env.SPACES_ACCESS_KEY,
        secretAccessKey: env.SPACES_SECRET_KEY,
      },
      forcePathStyle: true,
    });
    this.bucket = env.SPACES_BUCKET;
  }

  /**
   * Upload a file to private bucket
   */
  async uploadFile(
    buffer: Buffer,
    key: string,
    contentType: string,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ServerSideEncryption: "AES256",
    });

    await this.client.send(command);
    return key;
  }

  /**
   * Generate a short-lived signed URL for private file access
   */
  async getSignedUrl(
    key: string,
    expirySeconds: number = 3600,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn: expirySeconds });
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
  }

  /**
   * Generate a unique storage key
   */
  generateKey(folder: string, filename: string): string {
    const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const random = crypto.randomBytes(8).toString("hex");
    const timestamp = Date.now();
    return `${folder}/${timestamp}-${random}-${sanitized}`;
  }
}

export const storageService = new StorageService();
