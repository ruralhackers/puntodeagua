import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import {
  FileDeleteError,
  FileNotFoundError,
  FileUploadError
} from '../../domain/errors/file-storage-errors'
import type { FileStorageRepository } from '../../domain/repositories/file-storage.repository'
import type { FileMetadata } from '../../domain/value-objects/file-metadata'
import { FileUploadResult } from '../../domain/value-objects/file-upload-result'

export class R2FileStorageRepository implements FileStorageRepository {
  private readonly s3Client: S3Client
  private readonly bucketName: string
  private readonly publicUrl: string

  constructor(config: {
    accountId: string
    accessKeyId: string
    secretAccessKey: string
    bucketName: string
    publicUrl: string
  }) {
    this.bucketName = config.bucketName
    this.publicUrl = config.publicUrl

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey
      }
    })
  }

  async upload(
    file: Buffer,
    metadata: FileMetadata,
    entityId: string,
    entityType: string
  ): Promise<FileUploadResult> {
    try {
      const fileName = metadata.fileName
      const externalKey = `${entityType}/${entityId}/${fileName}`

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: externalKey,
        Body: file,
        ContentType: metadata.mimeType,
        Metadata: {
          originalName: Buffer.from(metadata.originalName, 'utf8').toString('base64'),
          fileSize: metadata.fileSize.toString(),
          uploadedAt: new Date().toISOString()
        }
      })

      await this.s3Client.send(command)

      const url = `${this.publicUrl}/${externalKey}`

      const fileUploadResult = FileUploadResult.create({
        url,
        externalKey,
        metadata
      })

      return fileUploadResult
    } catch (error) {
      throw new FileUploadError(
        `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async delete(externalKey: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: externalKey
      })

      await this.s3Client.send(command)
    } catch (error) {
      throw new FileDeleteError(
        `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async getUrl(externalKey: string): Promise<string> {
    return `${this.publicUrl}/${externalKey}`
  }

  async exists(externalKey: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: externalKey
      })

      await this.s3Client.send(command)
      return true
    } catch (error) {
      if (error instanceof Error && error.name === 'NotFound') {
        return false
      }
      throw new FileNotFoundError(externalKey)
    }
  }
}

