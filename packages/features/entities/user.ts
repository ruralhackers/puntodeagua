import { Id, UserRole } from 'core'
import type { UserSchema } from '../schemas/user.schema'

export class User {
  private constructor(
    public readonly id: Id,
    public readonly email: string,
    public readonly name?: string | null,
    public readonly emailVerified?: Date | null,
    public readonly image?: string | null,
    public readonly roles: UserRole[] = [UserRole.COMMUNITY_ADMIN],
    public readonly communityId?: Id | null
  ) {}

  static create({ id, email, name, emailVerified, image, roles, communityId }: UserSchema) {
    return new User(
      Id.create(id),
      email,
      name,
      emailVerified,
      image,
      roles ? UserRole.fromArray(roles) : [UserRole.COMMUNITY_ADMIN],
      communityId ? Id.create(communityId) : null
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
