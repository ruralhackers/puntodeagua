import { idSchema } from 'core'
import { z } from 'zod'

export type HolderDto = z.infer<typeof holderSchema>

export const holderSchema = z.object({
  id: idSchema,
  name: z.string(),
  nationalId: z.string().min(8).max(12), // DNI (Documento Nacional de Identidad)
  cadastralReference: z.string().min(3).max(50), // referencia catastral
  description: z.string().optional()
})
