import cors from '@elysiajs/cors'
import jwt from '@elysiajs/jwt'
import swagger from '@elysiajs/swagger'
import { UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { apiContainer } from './api.container'
import { analysisApiRest } from './features/analysis/delivery/analysis.api-rest'
import { loginSchema } from './features/auth/application/auth.schema'
import { AuthenticateUserCmd } from './features/auth/application/authenticate-user.cmd'
import { waterMeterApiRest } from './features/water-meter/delivery/water-meter.api-rest'
import { waterPointApiRest } from './features/water-point/delivery/water-point.api-rest'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export const app = new Elysia({ prefix: '/api' })
  .use(swagger())
  .use(
    cors({
      origin: [/^http:\/\/localhost:3000$/],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  )
  .use(
    jwt({
      name: 'jwt',
      secret: JWT_SECRET
    })
  )
  .use(waterPointApiRest)
  .use(analysisApiRest)
  .use(waterMeterApiRest)
  .post('/auth/login', async ({ body, jwt, set }) => {
    try {
      const loginDto = loginSchema.parse(body)
      const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)
      const authenticateCmd = apiContainer.get<AuthenticateUserCmd>(AuthenticateUserCmd.ID)

      // Create a JWT sign function and inject it
      const jwtSign = async (payload: { userId: string; email: string; roles: string[] }) => {
        return await jwt.sign(payload)
      }

      // Create new instance with jwt function
      const cmdWithJwt = new AuthenticateUserCmd((authenticateCmd as any).userRepository, jwtSign)

      const result = await cmdWithJwt.handle(loginDto)
      return result
    } catch (error) {
      set.status = 401
      return { error: error instanceof Error ? error.message : 'Authentication failed' }
    }
  })
  .listen(4000)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
