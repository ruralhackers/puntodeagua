import type { Id } from '@pda/common/domain'
import type { EntityFileRepository } from '@pda/storage'
import type { WaterMeterImage } from '../entities/water-meter-image'

/**
 * Repository for managing water meter images.
 * Water meters have a 1:1 relationship with images (one image per meter).
 */
export interface WaterMeterImageRepository extends EntityFileRepository<WaterMeterImage> {
  /**
   * Find the image for a specific water meter
   * Returns undefined if no image exists (1:1 relationship)
   */
  findByWaterMeterId(waterMeterId: Id): Promise<WaterMeterImage | undefined>
}
