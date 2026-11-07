import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { FileMetadata } from '../domain/value-objects/file-metadata'
import { LocalFileStorageRepository } from '../infrastructure/repositories/file-storage.local.repository'

const PUBLIC_URL = 'https://images.example.com'

describe('LocalFileStorageRepository', () => {
  let rootDir: string
  let repo: LocalFileStorageRepository

  beforeEach(async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'pda-storage-'))
    repo = new LocalFileStorageRepository({ rootDir, publicUrl: PUBLIC_URL })
  })

  afterEach(async () => {
    await rm(rootDir, { recursive: true, force: true })
  })

  const metadata = FileMetadata.create({
    fileName: 'photo.jpg',
    fileSize: 3,
    mimeType: 'image/jpeg',
    originalName: 'Foto contador.jpg'
  })

  it('writes the file under entityType/entityId and returns the public URL', async () => {
    const result = await repo.upload(Buffer.from('abc'), metadata, 'e1', 'water-meter-readings')

    expect(result.externalKey).toBe('water-meter-readings/e1/photo.jpg')
    expect(result.url).toBe(`${PUBLIC_URL}/water-meter-readings/e1/photo.jpg`)
    const written = await readFile(join(rootDir, 'water-meter-readings/e1/photo.jpg'), 'utf8')
    expect(written).toBe('abc')
  })

  it('reports existence and deletes files', async () => {
    const { externalKey } = await repo.upload(Buffer.from('abc'), metadata, 'e1', 'incidents')

    expect(await repo.exists(externalKey)).toBe(true)
    await repo.delete(externalKey)
    expect(await repo.exists(externalKey)).toBe(false)
  })

  it('getUrl builds the public URL from the key', async () => {
    expect(await repo.getUrl('a/b/c.png')).toBe(`${PUBLIC_URL}/a/b/c.png`)
  })

  it('rejects keys that escape the root directory', async () => {
    const evil = FileMetadata.create({ ...metadata.toDto(), fileName: '../../../x.jpg' })

    await expect(repo.upload(Buffer.from('x'), evil, 'e1', 'incidents')).rejects.toThrow()
    await expect(repo.delete('../outside.txt')).rejects.toThrow()
  })
})
