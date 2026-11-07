import type { FileStorageRepository } from '../domain/repositories/file-storage.repository'
import { LocalFileStorageRepository } from './repositories/file-storage.local.repository'
import { R2FileStorageRepository } from './repositories/file-storage.r2.repository'

/**
 * Picks the file storage backend from the environment.
 * - STORAGE_DRIVER=local → files on disk at STORAGE_LOCAL_DIR
 * - anything else (default) → Cloudflare R2
 * Both use CLOUDFLARE_R2_PUBLIC_URL as the public base URL, so stored URLs
 * (https://images.puntodeagua.com/...) stay valid across backends.
 */
export function createFileStorageRepository(
  env: NodeJS.ProcessEnv = process.env
): FileStorageRepository {
  const publicUrl = env.CLOUDFLARE_R2_PUBLIC_URL || ''

  if (env.STORAGE_DRIVER === 'local') {
    if (!env.STORAGE_LOCAL_DIR) {
      throw new Error('STORAGE_LOCAL_DIR is required when STORAGE_DRIVER=local')
    }
    return new LocalFileStorageRepository({ rootDir: env.STORAGE_LOCAL_DIR, publicUrl })
  }

  return new R2FileStorageRepository({
    accountId: env.CLOUDFLARE_ACCOUNT_ID || '',
    accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
    bucketName: env.CLOUDFLARE_R2_BUCKET_NAME || '',
    publicUrl
  })
}
