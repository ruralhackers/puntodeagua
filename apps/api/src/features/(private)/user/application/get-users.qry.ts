import type { Query } from 'core'
import type { UserRepository } from 'features'

export interface GetUsersFiltersDto {
  requestingUserId: string
  requestingUserRoles: string[]
  requestingUserCommunityId?: string | null
}

export interface UserDto {
  id: string
  email: string
  name: string | null
  roles: string[]
  communityId: string | null
  emailVerified: Date | null
  image: string | null
}

export interface GetUsersResponseDto {
  users: UserDto[]
  statistics: {
    total: number
    active: number
    administrators: number
    operators: number
  }
}

export class GetUsersQry implements Query<GetUsersResponseDto, GetUsersFiltersDto> {
  static readonly ID = 'GetUsersQry'

  constructor(private readonly userRepository: UserRepository) {}

  async handle(filters: GetUsersFiltersDto): Promise<GetUsersResponseDto> {
    const { requestingUserRoles, requestingUserCommunityId } = filters

    // Determine which users to fetch based on role
    const isSuperAdmin = requestingUserRoles.includes('SUPER_ADMIN')
    const isCommunityAdmin = requestingUserRoles.includes('COMMUNITY_ADMIN')

    let users: UserDto[]

    if (isSuperAdmin) {
      // SUPER_ADMIN can see all users
      users = await this.userRepository.findAll()
    } else if (isCommunityAdmin && requestingUserCommunityId) {
      // COMMUNITY_ADMIN can only see users from their community
      users = await this.userRepository.findByCommunity(requestingUserCommunityId)
    } else {
      // No permission or missing community
      users = []
    }

    // Calculate statistics
    const statistics = {
      total: users.length,
      active: users.filter((u) => u.emailVerified !== null).length, // Consider verified users as active
      administrators: users.filter(
        (u) => u.roles.includes('SUPER_ADMIN') || u.roles.includes('COMMUNITY_ADMIN')
      ).length,
      operators: users.filter((u) => u.roles.includes('MANAGER')).length
    }

    return {
      users,
      statistics
    }
  }
}
