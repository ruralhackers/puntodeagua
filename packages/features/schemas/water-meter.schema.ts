import { idSchema, measurementUnitSchema } from 'core'
import { UrlSchema } from 'core/types/url.schema.ts'
import { z } from 'zod'
import { waterMeterReadingSchema } from './water-meter-reading.schema'
import { waterPointSchema } from './water-point.schema'

export type WaterMeterSchema = z.infer<typeof waterMeterSchema>

export const waterMeterSchema = z.object({
  id: idSchema,
  name: z.string().min(1).max(100),
  holderId: idSchema,
  waterPoint: waterPointSchema,
  waterZoneId: idSchema,
  measurementUnit: measurementUnitSchema,
  serialNumber: z.string().max(100).optional(),
  images: z.array(UrlSchema).optional(),
  waterZoneName: z.string().optional(),
  lastReadingValue: z.string().optional(),
  lastReadingDate: z.date().optional(),
  waterMeterReadings: z.array(waterMeterReadingSchema).optional()
})
