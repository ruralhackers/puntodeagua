export class UserRole {
  private static readonly VALID_ROLES = ['ADMIN', 'COMMUNITY_ADMIN', 'MANAGER']

  private constructor(private readonly value: string) {}

  static fromString(role: string): UserRole {
    if (!UserRole.VALID_ROLES.includes(role)) {
      throw new Error(`Invalid role: ${role}`)
    }
    return new UserRole(role)
  }

  static communityAdmin(): UserRole {
    return new UserRole('COMMUNITY_ADMIN')
  }

  static manager(): UserRole {
    return new UserRole('MANAGER')
  }

  toString(): string {
    return this.value
  }

  equals(other: UserRole): boolean {
    return this.value === other.value
  }

  isAdmin(): boolean {
    return this.value === 'ADMIN'
  }

  isCommunityAdmin(): boolean {
    return this.value === 'COMMUNITY_ADMIN'
  }

  isManager(): boolean {
    return this.value === 'MANAGER'
  }

  canManage(): boolean {
    return this.isCommunityAdmin() || this.isManager()
  }
}
