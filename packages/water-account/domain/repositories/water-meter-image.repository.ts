import type { Deletable, FindableById, Id, Savable } from '@pda/common/domain'
import type { WaterMeterImage } from '../entities/water-meter-image'

export interface WaterMeterImageRepository
  extends Savable<WaterMeterImage>,
    FindableById<WaterMeterImage>,
    Deletable<WaterMeterImage> {
  findByWaterMeterId(waterMeterId: Id): Promise<WaterMeterImage | undefined>
}
