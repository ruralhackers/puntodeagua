import { idSchema } from 'core'
import { z } from 'zod'

export const userRoleSchema = z.enum(['SUPER_ADMIN', 'MANAGER', 'COMMUNITY_ADMIN'])

export type ClientUserDto = z.infer<typeof clientUserSchema>

export const clientUserSchema = z.object({
  id: idSchema,
  email: z.string().email(),
  name: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  roles: z.array(userRoleSchema).default(['COMMUNITY_ADMIN']),
  communityId: idSchema.nullable().optional()
})

export const userSchema = clientUserSchema.extend({
  password: z.string().min(6).max(100),
  emailVerified: z.date().nullable().optional()
})

export type UserDto = z.infer<typeof userSchema>
export type UserRoleSchema = z.infer<typeof userRoleSchema>
