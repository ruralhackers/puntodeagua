import type { Command } from 'core'
import type { AuthRepository } from 'features/repositories/auth.repository'
import type { AuthResponseDto, LoginDto } from '../schemas/auth.schema'

export class LoginCmd implements Command<LoginDto, AuthResponseDto> {
  static readonly ID = 'LoginCmd'

  constructor(private readonly authRepository: AuthRepository) {}

  async handle(data: LoginDto): Promise<AuthResponseDto> {
    return await this.authRepository.login(data)
  }
}
