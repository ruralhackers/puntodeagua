import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

export type LoginDto = z.infer<typeof loginSchema>

export const authResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string().nullable().optional(),
    roles: z.array(z.enum(['SUPER_ADMIN', 'MANAGER', 'USER', 'COMMUNITY_ADMIN'])),
    communityId: z.string().nullable().optional()
  })
})

export type AuthResponseDto = z.infer<typeof authResponseSchema>
