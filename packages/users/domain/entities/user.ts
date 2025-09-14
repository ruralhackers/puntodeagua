import { Email, Id } from '@pda/common/domain'
import { UserRole } from '../value-objects/user-role'
import type { UserDto } from './user.dto'

export class User {
  private constructor(
    public readonly id: Id,
    public readonly email: Email,
    public roles: UserRole[],
    public communityId: Id,
    public createdAt: Date,
    public updatedAt: Date,
    public passwordHash?: string,
    public name?: string | undefined,
    public emailVerified?: Date | undefined
  ) {}

  static fromDto(dto: UserDto) {
    return new User(
      Id.fromString(dto.id),
      Email.fromString(dto.email),
      dto.roles.map((role) => UserRole.fromString(role)),
      Id.fromString(dto.communityId),
      new Date(dto.createdAt),
      new Date(dto.updatedAt),
      dto.passwordHash,
      dto.name,
      dto.emailVerified
    )
  }

  toDto(): UserDto {
    return {
      id: this.id.toString(),
      email: this.email.toString(),
      passwordHash: this.passwordHash,
      name: this.name,
      roles: this.roles.map((role) => role.toString()),
      communityId: this.communityId.toString(),
      emailVerified: this.emailVerified,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }

  equals(other: User): boolean {
    return this.id.equals(other.id)
  }

  hasRole(role: UserRole): boolean {
    return this.roles.some((userRole) => userRole.equals(role))
  }

  addRole(role: UserRole): void {
    if (!this.hasRole(role)) {
      this.roles.push(role)
    }
  }

  removeRole(role: UserRole): void {
    this.roles = this.roles.filter((userRole) => !userRole.equals(role))
  }
}
