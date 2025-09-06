import type { WaterMeterReadingDto } from './water-meter-reading.dto'
import type { WaterPointDto } from './water-point.dto'

export interface WaterMeterDto {
  id: string
  name: string
  holderId: string
  waterPoint: WaterPointDto
  waterZoneId: string
  waterZoneName?: string
  measurementUnit: string
  images: string[]
  lastReadingValue?: string
  lastReadingDate?: Date
  waterMeterReadings?: WaterMeterReadingDto[]
}
