import { communitySchema } from '@pda/community/domain'
import { z } from 'zod'

export const userClientSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().nullable(),
  name: z.string().optional().nullable(),
  roles: z.array(z.string()).default([]),
  community: communitySchema.nullable()
})

export const userSchema = userClientSchema.extend({
  passwordHash: z.string().nullable(),
  emailVerified: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export type UserClientDto = z.infer<typeof userClientSchema>
export type UserDto = z.infer<typeof userSchema>
