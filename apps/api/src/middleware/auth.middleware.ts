import jwt from '@elysiajs/jwt'
import { Elysia } from 'elysia'

interface JwtPayload {
  userId: string
  email: string
  roles: string[]
  communityId: string | null
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export const authMiddleware = new Elysia({ name: 'auth/jwt' })
  .use(jwt({ name: 'jwt', secret: JWT_SECRET }))
  .resolve(
    {
      as: 'scoped'
    },
    async ({ headers, jwt, set, body }) => {
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
          user: jwtPayload,
          body: body ? JSON.parse(body) : undefined
        }
      } catch (error) {
        set.status = 401
        console.log('Error occurred while verifying token:', error)
        throw new Error('Invalid or expired token')
      }
    }
  )
