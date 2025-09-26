import type { Deletable, FindableForTable, Id, Savable } from '@pda/common/domain'
import type { WaterMeterReading } from '../entities/water-meter-reading'

export interface WaterMeterReadingRepository
  extends Savable<WaterMeterReading>,
    Deletable<WaterMeterReading>,
    FindableForTable<WaterMeterReading> {
  findById(id: Id): Promise<WaterMeterReading | undefined>
  findLastReading(waterMeterId: Id): Promise<WaterMeterReading | undefined>
}
