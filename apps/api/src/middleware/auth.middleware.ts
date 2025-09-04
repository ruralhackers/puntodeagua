import jwt from '@elysiajs/jwt'
import { Elysia } from 'elysia'

interface JwtPayload {
  userId: string
  email: string
  roles: string[]
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export const authMiddleware = (app: Elysia) =>
  app.use(jwt({ name: 'jwt', secret: JWT_SECRET })).onBeforeHandle(({ headers, jwt, set }) => {
    // Skip authentication in development if DISABLE_AUTH is set
    console.log(process.env.NODE_ENV)
    if (process.env.DISABLE_AUTH === 'true' || process.env.NODE_ENV === 'development') {
      return
    }

    const authHeader = headers.authorization
    if (!authHeader) {
      set.status = 401
      return { error: 'Authorization header required' }
    }

    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      set.status = 401
      return { error: 'Bearer token required' }
    }

    try {
      const payload = jwt.verify(token)
      if (!payload) {
        set.status = 401
        return { error: 'Invalid token' }
      }

      const jwtPayload = payload as JwtPayload
      if (!jwtPayload.userId || !jwtPayload.email) {
        set.status = 401
        return { error: 'Invalid token payload' }
      }
    } catch (error) {
      set.status = 401
      return { error: 'Invalid or expired token' }
    }
  })
