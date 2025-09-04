import { z } from 'zod'

export const decimalSchema = z.string().min(1).max(10)

export type DecimalSchema = z.infer<typeof decimalSchema>
