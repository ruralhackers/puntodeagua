import { z } from 'zod'

export const fileUploadResultSchema = z.object({
  url: z.string().url(),
  externalKey: z.string().min(1),
  metadata: z.object({
    fileName: z.string().min(1),
    fileSize: z.number().positive(),
    mimeType: z.string().min(1),
    originalName: z.string().min(1)
  })
})

export type FileUploadResultDto = z.infer<typeof fileUploadResultSchema>
