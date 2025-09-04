import { z } from 'zod'

export type IdSchema = z.infer<typeof idSchema>

export const idSchema = z.cuid()
