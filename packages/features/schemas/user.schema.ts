import { idSchema } from 'core'
import { z } from 'zod'

export const userRoleSchema = z.enum(['SUPER_ADMIN', 'MANAGER', 'COMMUNITY_ADMIN'])

export const userSchema = z.object({
  id: idSchema,
  email: z.string().email(),
  name: z.string().nullable().optional(),
  emailVerified: z.date().nullable().optional(),
  image: z.string().nullable().optional(),
  roles: z.array(userRoleSchema).default(['COMMUNITY_ADMIN']),
  communityId: idSchema.nullable().optional()
})

export type UserSchema = z.infer<typeof userSchema>
export type UserRoleSchema = z.infer<typeof userRoleSchema>
