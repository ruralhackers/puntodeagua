import { z } from 'zod'

// Complete User DTO schema aligned with Prisma User model
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  emailVerified: z.date().nullable().optional(),
  lockedAt: z.date().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  username: z.string(),
  credits: z.number().int(),
  admin: z.boolean(),
  moderator: z.boolean(),
  verified: z.boolean(),
  banned: z.boolean(),
  nsfw: z.boolean(),
  profileViewCount: z.number().int(),
  promptCount: z.number().int(),
  favCount: z.number().int(),
  searchCount: z.number().int(),
  streakDays: z.number().int(),
  streakStart: z.date().nullable().optional(),
  streakEnd: z.date().nullable().optional()
})

export type UserDto = z.infer<typeof userSchema>
