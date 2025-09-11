import { Email, Uuid } from '@ph/common/domain'
import type { UserDto } from './user.dto'

export class User {
  private constructor(
    public readonly id: Uuid,
    public readonly email: Email,
    public username: string,
    public credits: number,
    public admin: boolean,
    public moderator: boolean,
    public verified: boolean,
    public banned: boolean,
    public nsfw: boolean,
    public profileViewCount: number,
    public promptCount: number,
    public favCount: number,
    public searchCount: number,
    public streakDays: number,
    public updatedAt: Date,
    public readonly createdAt: Date,
    public emailVerified?: Date | null,
    public lockedAt?: Date | null,
    public streakStart?: Date | null,
    public streakEnd?: Date | null
  ) {}

  static fromDto(dto: UserDto) {
    return new User(
      Uuid.fromString(dto.id),
      Email.fromString(dto.email),
      dto.username,
      dto.credits,
      dto.admin,
      dto.moderator,
      dto.verified,
      dto.banned,
      dto.nsfw,
      dto.profileViewCount,
      dto.promptCount,
      dto.favCount,
      dto.searchCount,
      dto.streakDays,
      new Date(dto.createdAt),
      new Date(dto.updatedAt),
      dto.emailVerified ? new Date(dto.emailVerified) : null,
      dto.lockedAt ? new Date(dto.lockedAt) : null,
      dto.streakStart ? new Date(dto.streakStart) : null,
      dto.streakEnd ? new Date(dto.streakEnd) : null
    )
  }

  toDto(): UserDto {
    return {
      id: this.id.toString(),
      email: this.email.toString(),
      username: this.username,
      credits: this.credits,
      admin: this.admin,
      moderator: this.moderator,
      verified: this.verified,
      banned: this.banned,
      nsfw: this.nsfw,
      profileViewCount: this.profileViewCount,
      promptCount: this.promptCount,
      favCount: this.favCount,
      searchCount: this.searchCount,
      streakDays: this.streakDays,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      emailVerified: this.emailVerified ?? null,
      lockedAt: this.lockedAt ?? null,
      streakStart: this.streakStart ?? null,
      streakEnd: this.streakEnd ?? null
    }
  }

  equals(other: User): boolean {
    return this.id.equals(other.id)
  }

  update(data: Partial<UserDto>) {
    if (data.username !== undefined) this.username = data.username
    if (data.credits !== undefined) this.credits = data.credits
    if (data.admin !== undefined) this.admin = data.admin
    if (data.moderator !== undefined) this.moderator = data.moderator
    if (data.verified !== undefined) this.verified = data.verified
    if (data.banned !== undefined) this.banned = data.banned
    if (data.nsfw !== undefined) this.nsfw = data.nsfw
    if (data.profileViewCount !== undefined) this.profileViewCount = data.profileViewCount
    if (data.promptCount !== undefined) this.promptCount = data.promptCount
    if (data.favCount !== undefined) this.favCount = data.favCount
    if (data.searchCount !== undefined) this.searchCount = data.searchCount
    if (data.streakDays !== undefined) this.streakDays = data.streakDays
    this.updatedAt = new Date()
  }
}
