import { Email, Id } from '@pda/common/domain'
import { UserRole } from '../value-objects/user-role'
import type { UserClientDto, UserDto } from './user.dto'

export class User {
  private constructor(
    public readonly id: Id,
    public readonly email: Email,
    public roles: UserRole[],
    public createdAt: Date,
    public updatedAt: Date,
    public communityId?: Id,
    public passwordHash?: string,
    public name?: string | undefined,
    public emailVerified?: Date | undefined
  ) {}

  static fromDto(dto: UserDto) {
    return new User(
      Id.fromString(dto.id),
      Email.fromString(dto.email),
      dto.roles.map((role) => UserRole.fromString(role)),
      new Date(dto.createdAt),
      new Date(dto.updatedAt),
      dto.communityId ? Id.fromString(dto.communityId) : undefined,
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
      communityId: this.communityId?.toString(),
      emailVerified: this.emailVerified,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }

  toClientDto(): UserClientDto {
    return {
      id: this.id.toString(),
      email: this.email.toString(),
      name: this.name,
      roles: this.roles.map((role) => role.toString()),
      communityId: this.communityId?.toString()
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

  update(data: Partial<UserDto>): void {
    if (data.name !== undefined) {
      this.name = data.name
    }
    if (data.passwordHash !== undefined) {
      this.passwordHash = data.passwordHash
    }
    if (data.communityId !== undefined) {
      this.communityId = data.communityId ? Id.fromString(data.communityId) : undefined
    }
    if (data.emailVerified !== undefined) {
      this.emailVerified = data.emailVerified
    }
  }
}
