import type { Query } from 'core'
import type {
  GetUsersResponseDto,
  UserRepository
} from '../infrastructure/user.api-rest-repository'

export interface GetUsersParams {
  token?: string
}

export class GetUsersQry implements Query<GetUsersResponseDto, GetUsersParams> {
  static readonly ID = 'GetUsersQry'

  constructor(private readonly userRepository: UserRepository) {}

  async handle(params?: GetUsersParams): Promise<GetUsersResponseDto> {
    return this.userRepository.getUsers(params?.token)
  }
}
