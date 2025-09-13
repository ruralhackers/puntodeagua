import { Id } from 'core'
import type { CommunitySchema } from '../schemas/community.schema.ts'

export class Community {
  private constructor(
    public readonly id: Id,
    public readonly name: string,
    public readonly planId: Id,
    public readonly dailyWaterLimitLitersPerPerson: number
  ) {}

  static create(communitySchema: Omit<CommunitySchema, 'id'>) {
    return new Community(
      Id.generateUniqueId(),
      communitySchema.name,
      Id.create(communitySchema.planId),
      communitySchema.dailyWaterLimitLitersPerPerson
    )
  }

  static fromDto(dto: CommunitySchema): Community {
    return new Community(
      Id.create(dto.id),
      dto.name,
      Id.create(dto.planId),
      dto.dailyWaterLimitLitersPerPerson
    )
  }

  toDto() {
    return {
      id: this.id.toString(),
      name: this.name,
      planId: this.planId.toString(),
      dailyWaterLimitLitersPerPerson: this.dailyWaterLimitLitersPerPerson
    }
  }
}
