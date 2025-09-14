import { Id } from '@pda/common/domain'
import { type WaterLimitRule, WaterLimitRuleFactory } from '../value-objects/water-limit-rules'
import type { CommunityDto } from './community.dto'

export class Community {
  private constructor(
    public readonly id: Id,
    public readonly planId: Id,
    public name: string,
    public waterLimitRule: WaterLimitRule
  ) {}

  static create(communitySchema: Omit<CommunityDto, 'id'>) {
    return new Community(
      Id.generateUniqueId(),
      Id.fromString(communitySchema.planId),
      communitySchema.name,
      WaterLimitRuleFactory.fromDto(communitySchema.waterLimitRule)
    )
  }

  static fromDto(dto: CommunityDto): Community {
    return new Community(
      Id.fromString(dto.id),
      Id.fromString(dto.planId),
      dto.name,
      WaterLimitRuleFactory.fromDto(dto.waterLimitRule)
    )
  }

  toDto() {
    return {
      id: this.id.toString(),
      planId: this.planId.toString(),
      name: this.name,
      waterLimitRule: this.waterLimitRule.toDto()
    }
  }
}
