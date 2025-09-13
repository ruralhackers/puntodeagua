import bcrypt from 'bcrypt'
import type { Command } from 'core'
import type { UserRepository } from 'features'
import type { AuthResponseDto, LoginDto } from './auth.schema'

export class AuthenticateUserCmd implements Command<LoginDto, AuthResponseDto> {
  static readonly ID = 'AuthenticateUserCmd'

  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtSign: (payload: {
      userId: string
      email: string
      roles: string[]
      communityId: string | null
    }) => Promise<string>
  ) {}

  async handle(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findByEmail(loginDto.email)

    if (!user || !user.password) {
      throw new Error('Invalid credentials')
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password)

    if (!isPasswordValid) {
      throw new Error('Invalid credentials')
    }

    const payload = {
      userId: user.id.toString(),
      email: user.email,
      roles: user.roles.map((role) => role.toString()),
      communityId: user.communityId ? user.communityId.toString() : null
    }

    const token = await this.jwtSign(payload)

    return {
      token,
      user: payload
    }
  }
}
