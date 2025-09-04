import type { Deletable, FindableAll, FindableById, Savable } from 'core'
import type { WaterMeterReading } from '../entities/water-meter-reading'

export interface WaterMeterReadingRepository
  extends Savable<WaterMeterReading>,
    Deletable<WaterMeterReading>,
    FindableById<WaterMeterReading>,
    FindableAll<WaterMeterReading> {}
