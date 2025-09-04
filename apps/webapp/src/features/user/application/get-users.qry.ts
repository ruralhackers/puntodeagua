import type { Query } from 'core'
import type {
  GetUsersResponseDto,
  UserRepository
} from '../infrastructure/user.api-rest-repository'

export class GetUsersQry implements Query<GetUsersResponseDto, void> {
  static readonly ID = 'GetUsersQry'

  constructor(private readonly userRepository: UserRepository) {}

  async handle(): Promise<GetUsersResponseDto> {
    return this.userRepository.getUsers()
  }
}
