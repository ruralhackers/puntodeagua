import type { Deletable, FindableAll, FindableById, Savable } from 'core'
import type { WaterMeter } from '../entities/water-meter'

export interface WaterMeterRepository
  extends Savable<WaterMeter>,
    Deletable<WaterMeter>,
    FindableById<WaterMeter>,
    FindableAll<WaterMeter> {}
