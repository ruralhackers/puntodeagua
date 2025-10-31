import type { Deletable, FindableById, Id, Savable } from '@pda/common/domain'
import type { WaterMeterReadingImage } from '../entities/water-meter-reading-image'

export interface WaterMeterReadingImageRepository
  extends Savable<WaterMeterReadingImage>,
    FindableById<WaterMeterReadingImage>,
    Deletable<WaterMeterReadingImage> {
  findByWaterMeterReadingId(waterMeterReadingId: Id): Promise<WaterMeterReadingImage | undefined>
}
