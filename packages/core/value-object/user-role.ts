export enum UserRoleType {
  SUPER_ADMIN = 'SUPER_ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
  COMMUNITY_ADMIN = 'COMMUNITY_ADMIN'
}

export class UserRole {
  static readonly SUPER_ADMIN = new UserRole(UserRoleType.SUPER_ADMIN)
  static readonly COMMUNITY_ADMIN = new UserRole(UserRoleType.COMMUNITY_ADMIN)
  static readonly MANAGER = new UserRole(UserRoleType.MANAGER)
  static readonly USER = new UserRole(UserRoleType.USER)

  private constructor(private readonly value: UserRoleType) {}

  static create(role: string): UserRole {
    switch (role.toUpperCase()) {
      case UserRoleType.SUPER_ADMIN:
        return UserRole.SUPER_ADMIN
      case UserRoleType.MANAGER:
        return UserRole.MANAGER
      case UserRoleType.USER:
        return UserRole.USER
      case UserRoleType.COMMUNITY_ADMIN:
        return UserRole.COMMUNITY_ADMIN
      default:
        throw new Error(`Invalid user role: ${role}`)
    }
  }

  static fromArray(roles: string[]): UserRole[] {
    return roles.map((role) => UserRole.create(role))
  }

  toString(): string {
    return this.value
  }

  equals(other: UserRole): boolean {
    return this.value === other.value
  }

  // Permission checks
  canManageCommunities(): boolean {
    return this.value === UserRoleType.SUPER_ADMIN
  }

  canManageUsers(): boolean {
    return this.value === UserRoleType.SUPER_ADMIN || this.value === UserRoleType.MANAGER
  }

  canManageWaterInfrastructure(): boolean {
    return this.value === UserRoleType.SUPER_ADMIN || this.value === UserRoleType.MANAGER
  }

  canCreateReadings(): boolean {
    return true // All roles can create readings
  }

  canViewAllCommunities(): boolean {
    return this.value === UserRoleType.SUPER_ADMIN
  }

  canViewCommunityData(): boolean {
    return true // All roles can view their community data
  }

  isSuperAdmin(): boolean {
    return this.value === UserRoleType.SUPER_ADMIN
  }

  isManager(): boolean {
    return this.value === UserRoleType.MANAGER
  }

  isUser(): boolean {
    return this.value === UserRoleType.USER
  }

  isCommunityAdmin(): boolean {
    return this.value === UserRoleType.COMMUNITY_ADMIN
  }
}
