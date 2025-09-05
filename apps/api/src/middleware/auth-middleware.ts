import jwt from '@elysiajs/jwt'
import type { Elysia } from 'elysia'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

interface JwtPayload {
  userId: string
  email: string
  roles: string[]
  communityId: string | null
}

export const authMiddleware = <T extends string>(app: Elysia<T>) =>
  app
    .use(jwt({ name: 'jwt', secret: JWT_SECRET }))
    .derive({ as: 'scoped' }, async ({ headers, jwt, set }) => {
      const authHeader = headers.authorization
      if (!authHeader) {
        set.status = 401
        throw new Error('Authorization header required')
      }

      const token = authHeader.replace('Bearer ', '')
      if (!token) {
        set.status = 401
        throw new Error('Bearer token required')
      }

      try {
        const payload = await jwt.verify(token)
        if (!payload) {
          set.status = 401
          throw new Error('Invalid token')
        }

        const jwtPayload = payload as unknown as JwtPayload
        if (!jwtPayload.userId || !jwtPayload.email) {
          set.status = 401
          throw new Error('Invalid token payload')
        }

        return {
          user: jwtPayload as JwtPayload
        }
      } catch (error) {
        set.status = 401
        throw new Error('Invalid or expired token')
      }
    })
