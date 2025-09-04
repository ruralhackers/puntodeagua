import jwt from '@elysiajs/jwt'
import { Elysia } from 'elysia'

interface JwtPayload {
  userId: string
  email: string
  roles: string[]
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export const authMiddleware = new Elysia({ name: 'auth' })
  .use(
    jwt({
      name: 'jwt',
      secret: JWT_SECRET
    })
  )
  .derive(async ({ headers, jwt, set }) => {
    // Skip authentication in development if DISABLE_AUTH is set
    if (process.env.DISABLE_AUTH === 'true' || process.env.NODE_ENV === 'development') {
      return {
        user: null // No user context when auth is disabled
      }
    }

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
      const payload = (await jwt.verify(token)) as JwtPayload

      if (!payload) {
        set.status = 401
        throw new Error('Invalid token')
      }

      return {
        user: {
          userId: payload.userId,
          email: payload.email,
          roles: payload.roles
        }
      }
    } catch (error) {
      set.status = 401
      throw new Error('Invalid or expired token')
    }
  })
