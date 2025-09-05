import { idSchema } from 'core'
import { z } from 'zod'

export type IssueSchema = z.infer<typeof issueSchema>

export const issueSchema = z
  .object({
    id: idSchema,
    title: z.string(),
    description: z.string().optional(),
    reporterName: z.string(),
    status: z.string(),
    startAt: z.iso.datetime(),
    endAt: z.union([z.iso.datetime(), z.literal('')]).optional(),
    waterZoneId: idSchema
  })
  .refine(
    (data) => {
      console.log({ data })
      if (data.status === 'closed') {
        return data.endAt !== ''
      }
      return true
    },
    {
      message: 'Fecha de resolución es requerida cuando el estado es cerrado',
      path: ['endAt']
    }
  )
