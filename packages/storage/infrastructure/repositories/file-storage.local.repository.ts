import { access, mkdir, unlink, writeFile } from 'node:fs/promises'
import { dirname, resolve, sep } from 'node:path'
import { FileDeleteError, FileUploadError } from '../../domain/errors/file-storage-errors'
import type { FileStorageRepository } from '../../domain/repositories/file-storage.repository'
import type { FileMetadata } from '../../domain/value-objects/file-metadata'
import { FileUploadResult } from '../../domain/value-objects/file-upload-result'

/**
 * Stores files on the local filesystem under `rootDir`, using the same key
 * layout as the R2 repository (`entityType/entityId/fileName`). A web server
 * (e.g. nginx) is expected to serve `rootDir` at `publicUrl`.
 */
export class LocalFileStorageRepository implements FileStorageRepository {
  private readonly rootDir: string
  private readonly publicUrl: string

  constructor(config: { rootDir: string; publicUrl: string }) {
    this.rootDir = resolve(config.rootDir)
    this.publicUrl = config.publicUrl.replace(/\/+$/, '')
  }

  async upload(
    file: Buffer,
    metadata: FileMetadata,
    entityId: string,
    entityType: string
  ): Promise<FileUploadResult> {
    try {
      const externalKey = `${entityType}/${entityId}/${metadata.fileName}`
      const path = this.pathFor(externalKey)
      await mkdir(dirname(path), { recursive: true })
      await writeFile(path, file)
      return FileUploadResult.create({
        url: `${this.publicUrl}/${externalKey}`,
        externalKey,
        metadata
      })
    } catch (error) {
      throw new FileUploadError(
        `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async delete(externalKey: string): Promise<void> {
    try {
      await unlink(this.pathFor(externalKey))
    } catch (error) {
      if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') return
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
      await access(this.pathFor(externalKey))
      return true
    } catch {
      return false
    }
  }

  private pathFor(externalKey: string): string {
    const path = resolve(this.rootDir, externalKey)
    if (!path.startsWith(this.rootDir + sep)) {
      throw new Error(`Invalid storage key: ${externalKey}`)
    }
    return path
  }
}
