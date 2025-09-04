import { z } from 'zod'

// Schema para validar archivos de multer
export const multerFileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string(),
  size: z.number().positive('File size must be positive'),
  buffer: z.instanceof(Buffer),
  filename: z.string().optional()
})

// Schema para validar los datos del water meter reading
export const createWaterMeterReadingSchema = z.object({
  waterMeterId: z.string().min(1, 'Water meter ID is required'),
  reading: z.string().min(1, 'Reading value is required'),
  normalizedReading: z.string().min(1, 'Normalized reading is required'),
  readingDate: z.string().datetime('Invalid date format'),
  notes: z.string().optional(),
  uploadedBy: z.string().min(1, 'Uploader ID is required'),
  files: z.array(multerFileSchema).optional()
})

export type CreateWaterMeterReadingData = z.infer<typeof createWaterMeterReadingSchema>
export type MulterFile = z.infer<typeof multerFileSchema>
