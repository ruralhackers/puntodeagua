import { Id, UserRole } from 'core'
import type { UserDto, UserRoleSchema } from './user.dto'

export class User {
  private constructor(
    public readonly id: Id,
    public readonly email: string,
    public password: string,
    public name?: string | null,
    public emailVerified?: Date | null,
    public image?: string | null,
    public roles: UserRole[] = [UserRole.COMMUNITY_ADMIN],
    public communityId?: Id | null
  ) {}

  static create(userDto: UserDto) {
    return new User(
      Id.generateUniqueId(),
      userDto.email,
      userDto.password,
      userDto.name,
      userDto.emailVerified,
      userDto.image,
      userDto.roles ? UserRole.fromArray(userDto.roles) : [UserRole.COMMUNITY_ADMIN],
      userDto.communityId ? Id.create(userDto.communityId) : null
    )
  }

  static fromDto(dto: UserDto): User {
    return new User(
      Id.create(dto.id),
      dto.email,
      dto.password,
      dto.name,
      dto.emailVerified ? new Date(dto.emailVerified) : null,
      dto.image,
      dto.roles ? UserRole.fromArray(dto.roles) : [UserRole.COMMUNITY_ADMIN],
      dto.communityId ? Id.create(dto.communityId) : null
    )
  }

  toDto() {
    return {
      id: this.id.toString(),
      email: this.email,
      name: this.name,
      emailVerified: this.emailVerified,
      image: this.image,
      roles: this.roles.map((role) => role.toString()),
      communityId: this.communityId?.toString() || null
    }
  }

  toClientDto() {
    return {
      id: this.id.toString(),
      email: this.email,
      name: this.name,
      image: this.image,
      roles: this.roles.map((role) => role.toString()) as UserRoleSchema[],
      communityId: this.communityId?.toString() || null
    }
  }

  // Convenience methods for role checking
  hasRole(role: UserRole): boolean {
    return this.roles.some((r) => r.equals(role))
  }

  isSuperAdmin(): boolean {
    return this.hasRole(UserRole.SUPER_ADMIN)
  }

  isManager(): boolean {
    return this.hasRole(UserRole.MANAGER)
  }

  isCommunityAdmin(): boolean {
    return this.hasRole(UserRole.COMMUNITY_ADMIN)
  }

  canManageCommunities(): boolean {
    return this.roles.some((role) => role.canManageCommunities())
  }

  canManageUsers(): boolean {
    return this.roles.some((role) => role.canManageUsers())
  }

  canManageWaterInfrastructure(): boolean {
    return this.roles.some((role) => role.canManageWaterInfrastructure())
  }

  belongsToCommunity(communityId: string): boolean {
    return this.communityId?.toString() === communityId
  }

  requiresCommunity(): boolean {
    return !this.isSuperAdmin()
  }
}
