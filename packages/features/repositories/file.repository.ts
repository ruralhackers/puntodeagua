import type { Deletable, FindableAll, FindableById, Savable } from 'core'
import type { File } from '../entities/file'

export interface FileRepository
  extends Savable<File>,
    Deletable<File>,
    FindableById<File>,
    FindableAll<File> {
  findByEntity(entityType: string, entityId: string): Promise<File[]>
  deleteByEntity(entityType: string, entityId: string): Promise<void>
}
