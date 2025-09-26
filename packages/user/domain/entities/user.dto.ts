import { communityClientSchema, communitySchema } from '@pda/community/domain'
import { z } from 'zod'

// Complete User DTO schema aligned with Prisma User model

export const userClientSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().nullable(),
  name: z.string().optional().nullable(),
  roles: z.array(z.string()).default([]),
  community: communityClientSchema.nullable()
})

export const userSchema = userClientSchema.extend({
  passwordHash: z.string().nullable(),
  emailVerified: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  community: communitySchema.nullable()
})

export type UserClientDto = z.infer<typeof userClientSchema>
export type UserDto = z.infer<typeof userSchema>
