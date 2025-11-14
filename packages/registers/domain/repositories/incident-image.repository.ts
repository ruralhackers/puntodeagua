import type { Id } from '@pda/common/domain'
import type { EntityFileRepository } from '@pda/storage'
import type { IncidentImage } from '../entities/incident-image'

/**
 * Repository for managing incident images.
 * Incidents can have multiple images (1:many relationship).
 */
export interface IncidentImageRepository extends EntityFileRepository<IncidentImage> {
  /**
   * Find all images for a specific incident
   * Returns array since incidents can have multiple images
   */
  findByIncidentId(incidentId: Id): Promise<IncidentImage[]>

  /**
   * Delete all images for a specific incident
   * Useful when deleting an incident
   */
  deleteAllByIncidentId(incidentId: Id): Promise<void>
}
