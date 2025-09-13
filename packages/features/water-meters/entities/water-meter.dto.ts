import { idSchema, measurementUnitSchema } from 'core'
import { UrlSchema } from 'core/types/url.schema.ts'
import { z } from 'zod'
import { waterPointSchema } from '../../community/entities/water-point.dto'
import { waterZoneSchema } from '../../community/entities/water-zone.dto'
import { waterMeterReadingSchema } from './water-meter-reading.dto'

export type WaterMeterDto = z.infer<typeof waterMeterSchema>

export const waterMeterSchema = z.object({
  id: idSchema,
  name: z.string().min(1).max(100),
  holderId: idSchema,
  waterPoint: waterPointSchema,
  waterZone: waterZoneSchema,
  measurementUnit: measurementUnitSchema,
  serialNumber: z.string().max(100).optional(),
  images: z.array(UrlSchema).optional(),
  waterZoneName: z.string().optional(),
  lastReadingValue: z.string().optional(),
  lastReadingDate: z.date().optional(),
  waterMeterReadings: z.array(waterMeterReadingSchema).optional()
})

export type GetWaterMetersFiltersDto = z.infer<typeof getWaterMetersFiltersSchema>

export const getWaterMetersFiltersSchema = z.object({
  zoneId: z.string().optional(),
  name: z.string().optional(),
  communityId: z.string().optional()
})
