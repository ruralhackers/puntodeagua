import { idSchema } from '@pda/common/domain'
import { z } from 'zod'

// Complete User DTO schema aligned with Prisma User model
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  passwordHash: z.string().optional(),
  name: z.string().optional(),
  emailVerified: z.date().optional(),
  roles: z.array(z.string()).default([]),
  communityId: idSchema.optional(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const userClientSchema = userSchema.omit({
  passwordHash: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true
})

export type UserClientDto = z.infer<typeof userClientSchema>
export type UserDto = z.infer<typeof userSchema>
