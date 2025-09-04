import { idSchema } from 'core'
import { z } from 'zod'

export const userRoleSchema = z.enum(['SUPER_ADMIN', 'MANAGER', 'USER', 'COMMUNITY_ADMIN'])

export const userSchema = z.object({
  id: idSchema,
  name: z.string().nullable().optional(),
  email: z.string().email(),
  emailVerified: z.date().nullable().optional(),
  image: z.string().nullable().optional(),
  password: z.string().optional(),
  roles: z.array(userRoleSchema).default(['USER']),
  communityId: idSchema.nullable().optional()
})

export type UserSchema = z.infer<typeof userSchema>
export type UserRoleSchema = z.infer<typeof userRoleSchema>
