import type { Id } from '@pda/common/domain'

/**
 * Generic interface for repositories that store files/images for entities.
 * Each domain (water-account, registers, etc.) should implement this interface
 * for their specific file entity types.
 *
 * @template T - The file entity type (e.g., WaterMeterImage, IncidentImage)
 */
export interface EntityFileRepository<T> {
  /**
   * Find a file by its ID
   */
  findById(id: Id): Promise<T | undefined>

  /**
   * Find all files associated with an entity
   * Returns array to support both 1:1 and 1:many relationships
   */
  findByEntityId(entityId: Id): Promise<T[]>

  /**
   * Save a file entity
   */
  save(file: T): Promise<void>

  /**
   * Delete a file by its ID
   */
  delete(id: Id): Promise<void>
}
