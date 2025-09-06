import type { FileDto } from './file.dto'

export interface WaterMeterReadingDto {
  id: string
  waterMeterId: string
  reading: string
  normalizedReading: string
  readingDate: Date
  notes?: string
  files: FileDto[]
  consumption?: number
  excessConsumption?: boolean
}
