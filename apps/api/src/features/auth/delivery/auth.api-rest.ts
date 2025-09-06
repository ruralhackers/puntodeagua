import jwt from '@elysiajs/jwt'
import { Elysia } from 'elysia'
import type { UserRepository } from 'features'
import { apiContainer } from '../../../api.container'
import { loginSchema } from '../application/auth.schema'
import { AuthenticateUserCmd } from '../application/authenticate-user.cmd'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export const authApiRest = new Elysia()
  .use(
    jwt({
      name: 'jwt',
      secret: JWT_SECRET
    })
  )
  .post('/auth/login', async ({ body, jwt, set }) => {
    try {
      const loginDto = loginSchema.parse(body)
      // Create a JWT sign function and inject it
      const jwtSign = async (payload: { userId: string; email: string; roles: string[] }) => {
        return await jwt.sign(payload)
      }

      // Resolve command and inject jwt function
      const authenticateCmd = apiContainer.get<AuthenticateUserCmd>(AuthenticateUserCmd.ID)
      const { userRepository } = authenticateCmd as unknown as { userRepository: UserRepository }
      const cmdWithJwt = new AuthenticateUserCmd(userRepository, jwtSign)

      const result = await cmdWithJwt.handle(loginDto)
      return result
    } catch (error) {
      set.status = 401
      return { error: error instanceof Error ? error.message : 'Authentication failed' }
    }
  })
