import type { HttpClient } from 'core'
import type { AuthRepository } from 'features/repositories/auth.repository'
import type { AuthResponseDto, LoginDto } from '../../auth/schemas/auth.schema'

export class AuthApiRestRepository implements AuthRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async login(data: { email: string; password: string }): Promise<{
    token: string
    user: { id: string; email: string; name: string | null; roles: string[] }
  }> {
    const response = await this.httpClient.post<AuthResponseDto, LoginDto>('auth/login', data)
    const { token, user } = response.data
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name ?? null,
        roles: user.roles
      }
    }
  }
}
