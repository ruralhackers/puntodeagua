import { z } from 'zod'

/**
 * Schema for file upload input from client
 * Used in tRPC endpoints and other file upload operations
 */
export const fileUploadInputSchema = z.object({
  file: z.instanceof(Uint8Array),
  metadata: z.object({
    fileSize: z.number().positive(),
    mimeType: z.string().min(1),
    originalName: z.string().min(1)
  })
})

export type FileUploadInputDto = z.infer<typeof fileUploadInputSchema>

