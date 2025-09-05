import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type {
  StorageConfig,
  StorageMetadata,
  StorageService,
  UploadOptions,
  UploadResult
} from 'core'

export interface CloudflareR2Config extends StorageConfig {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  region?: string
}

export class CloudflareR2Adapter implements StorageService {
  private readonly s3Client: S3Client
  private readonly bucketName: string
  private readonly publicUrl: string

  constructor(config: CloudflareR2Config) {
    this.bucketName = config.bucketName
    this.publicUrl = config.publicUrl

    this.s3Client = new S3Client({
      region: config.region || 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey
      }
    })
  }

  async upload(file: Buffer, options: UploadOptions): Promise<UploadResult> {
    const key = this.generateKey(options)

    const metadata: StorageMetadata = {
      originalName: options.originalName,
      entityType: options.entityType,
      entityId: options.entityId,
      uploadedBy: options.uploadedBy,
      uploadedAt: new Date().toISOString()
    }

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file,
      ContentType: options.mimeType,
      ContentLength: options.size,
      Metadata: metadata as Record<string, string>
    })

    await this.s3Client.send(command)

    return {
      filename: options.filename,
      url: this.getPublicUrl(key),
      bucket: this.bucketName,
      key
    }
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key
    })

    await this.s3Client.send(command)
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new HeadObjectCommand({
      Bucket: this.bucketName,
      Key: key
    })

    return getSignedUrl(this.s3Client, command, { expiresIn })
  }

  getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`
  }

  async exists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key
      })

      await this.s3Client.send(command)
      return true
    } catch (error) {
      return false
    }
  }

  private generateKey(options: UploadOptions): string {
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 15)

    return `${options.entityType}/${options.entityId}/${timestamp}-${randomSuffix}-${options.filename}`
  }
}
