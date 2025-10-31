import { Email, Id } from '@pda/common/domain'
import { Community } from '@pda/community'
import { UserRole } from '../value-objects/user-role'
import type { UserClientDto, UserDto } from './user.dto'

export class User {
  private constructor(
    public readonly id: Id,
    public readonly email: Email,
    public roles: UserRole[],
    public createdAt: Date,
    public updatedAt: Date,
    public community?: Community | null,
    public passwordHash?: string | null,
    public name?: string | null,
    public emailVerified?: Date | null
  ) {}

  static fromDto(dto: UserDto) {
    return new User(
      Id.fromString(dto.id),
      Email.fromString(dto.email || ''),
      dto.roles.map((role) => UserRole.fromString(role)),
      new Date(dto.createdAt),
      new Date(dto.updatedAt),
      dto.community ? Community.fromDto(dto.community) : undefined,
      dto.passwordHash ?? null,
      dto.name,
      dto.emailVerified
    )
  }

  toDto(): UserDto {
    return {
      id: this.id.toString(),
      email: this.email.toString(),
      passwordHash: this.passwordHash || null,
      name: this.name,
      roles: this.roles.map((role) => role.toString()),
      community: this.community ? this.community.toDto() : null,
      emailVerified: this.emailVerified || null,
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
      community: this.community ? this.community.toDto() : null
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
    if (data.name) {
      this.name = data.name
    }
    if (data.passwordHash) {
      this.passwordHash = data.passwordHash
    }
    if (data.emailVerified) {
      this.emailVerified = data.emailVerified
    }
  }
}
