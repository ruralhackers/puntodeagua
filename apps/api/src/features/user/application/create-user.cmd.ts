import bcrypt from 'bcrypt'
import type { Command } from 'core'
import type { UserRepository } from 'features'

export interface CreateUserDto {
  email: string
  name?: string | null
  password: string
  roles: string[]
  communityId?: string | null
  requestingUserRoles: string[]
  requestingUserCommunityId?: string | null
}

export interface CreateUserResponseDto {
  id: string
  email: string
  name: string | null
  roles: string[]
  communityId: string | null
}

export class CreateUserCmd implements Command<CreateUserDto, CreateUserResponseDto> {
  static readonly ID = 'CreateUserCmd'

  constructor(private readonly userRepository: UserRepository) {}

  async handle(dto: CreateUserDto): Promise<CreateUserResponseDto> {
    const {
      email,
      name,
      password,
      roles,
      communityId,
      requestingUserRoles,
      requestingUserCommunityId
    } = dto

    // Validate permissions
    const isSuperAdmin = requestingUserRoles.includes('SUPER_ADMIN')
    const isCommunityAdmin = requestingUserRoles.includes('COMMUNITY_ADMIN')

    if (!isSuperAdmin && !isCommunityAdmin) {
      throw new Error('Insufficient permissions to create users')
    }

    // Validate role assignment permissions
    if (!isSuperAdmin) {
      // COMMUNITY_ADMIN cannot assign SUPER_ADMIN role
      if (roles.includes('SUPER_ADMIN')) {
        throw new Error('Cannot assign SUPER_ADMIN role')
      }

      // COMMUNITY_ADMIN can only create users in their own community
      if (communityId !== requestingUserCommunityId) {
        throw new Error('Can only create users in your own community')
      }
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email)
    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const newUser = await this.userRepository.save({
      email,
      name,
      password: hashedPassword,
      roles,
      communityId,
      emailVerified: null,
      image: null
    })

    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      roles: newUser.roles,
      communityId: newUser.communityId
    }
  }
}
