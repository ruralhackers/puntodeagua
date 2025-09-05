import jwt from '@elysiajs/jwt'
import { Elysia } from 'elysia'

interface JwtPayload {
  userId: string
  email: string
  roles: string[]
  communityId: string | null
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export const authMiddleware = new Elysia({ name: 'auth/middleware' })
  .use(jwt({ name: 'jwt', secret: JWT_SECRET }))
  .derive(async ({ headers, jwt, set }) => {
    console.log('middleware')
    console.log({ headers, jwt })
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
      const payload = await jwt.verify(token)
      if (!payload) {
        set.status = 401
        return { error: 'Invalid token' }
      }

      const jwtPayload = payload as unknown as JwtPayload
      if (!jwtPayload.userId || !jwtPayload.email) {
        set.status = 401
        return { error: 'Invalid token payload' }
      }

      return {
        user: jwtPayload
      }
    } catch (error) {
      set.status = 401
      return { error: 'Invalid or expired token' }
    }
  })

function isExcludedEndpoint(path: string, method: string): boolean {
  if (method === 'OPTIONS') {
    return true
  }
  if (path === '/api/auth/login') {
    return true
  }
  if (path === '/api/summary') {
    return true
  }
  return false
}
