export interface WaterMeterReadingDto {
  id: string
  waterMeterId: string
  reading: string
  normalizedReading: string
  readingDate: Date
  notes?: string
}
