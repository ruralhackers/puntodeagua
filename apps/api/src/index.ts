import cors from '@elysiajs/cors'
import jwt from '@elysiajs/jwt'
import swagger from '@elysiajs/swagger'
import { Elysia } from 'elysia'
// import { UseCaseService } from 'core'
import type { UserRepository } from 'features'
import { apiContainer } from './api.container'
import { analysisApiRest } from './features/analysis/delivery/analysis.api-rest'
import { loginSchema } from './features/auth/application/auth.schema'
import { AuthenticateUserCmd } from './features/auth/application/authenticate-user.cmd'
import { authApiRest } from './features/auth/delivery/auth.api-rest'
import { issueApiRest } from './features/issue/delivery/issue.api-rest'
import { maintenanceApiRest } from './features/maintenance/delivery/maintenance.api-rest'
import { providersApiRest } from './features/providers/delivery/providers.api-rest'
import { userApiRest } from './features/user/delivery/user.api-rest'
import { waterMeterApiRest } from './features/water-meter/delivery/water-meter.api-rest'
import { waterMeterReadingApiRest } from './features/water-meter-reading/delivery/water-meter-reading.api-rest'
import { waterPointApiRest } from './features/water-point/delivery/water-point.api-rest'
import { waterZonesApiRest } from './features/water-zone/delivery/water-zone.api-rest'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000
const WEBAPP_ORIGIN = process.env.WEBAPP_ORIGIN || 'http://localhost:3000'

export const app = new Elysia({ prefix: '/api' })
  .use(swagger())
  .use(
    cors({
      origin: [WEBAPP_ORIGIN],
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
  .use(waterZonesApiRest)
  .use(maintenanceApiRest)
  .use(providersApiRest)
  .use(analysisApiRest)
  .use(waterMeterApiRest)
  .use(issueApiRest)
  .use(waterMeterReadingApiRest)
  .use(userApiRest)
  .post('/auth/login', async ({ body, jwt, set }) => {
    try {
      const loginDto = loginSchema.parse(body)
      const authenticateCmd = apiContainer.get<AuthenticateUserCmd>(AuthenticateUserCmd.ID)

      // Create a JWT sign function and inject it
      const jwtSign = async (payload: {
        userId: string
        email: string
        roles: string[]
        communityId: string | null
      }) => {
        return await jwt.sign(payload)
      }

      // Create new instance with jwt function
      const cmdWithJwt = new AuthenticateUserCmd(
        (authenticateCmd as unknown as { userRepository: UserRepository }).userRepository,
        jwtSign
      )

      const result = await cmdWithJwt.handle(loginDto)
      return result
    } catch (error) {
      set.status = 401
      return { error: error instanceof Error ? error.message : 'Authentication failed' }
    }
  })
  .use(authApiRest)
  .listen(PORT)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
