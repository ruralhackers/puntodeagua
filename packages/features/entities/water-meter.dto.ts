export interface WaterMeterDto {
  id: string
  name: string
  holderId: string
  waterPointId: string
  waterZoneId: string
  waterZoneName?: string
  measurementUnit: string
  images: string[]
  lastReadingValue?: string
  lastReadingDate?: Date
}
