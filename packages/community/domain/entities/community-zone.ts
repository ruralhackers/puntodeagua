import { Id } from '@pda/common/domain'
import type { CommunityZoneDto } from './community-zone.dto'

export class CommunityZone {
  private constructor(
    public readonly id: Id,
    public name: string,
    public communityId: Id,
    public notes: string
  ) {}

  static create(dto: Omit<CommunityZoneDto, 'id'>) {
    return new CommunityZone(
      Id.generateUniqueId(),
      dto.name,
      Id.fromString(dto.communityId),
      dto.notes
    )
  }

  static fromDto(dto: CommunityZoneDto) {
    return new CommunityZone(
      Id.fromString(dto.id),
      dto.name,
      Id.fromString(dto.communityId),
      dto.notes
    )
  }

  toDto(): CommunityZoneDto {
    return {
      id: this.id.toString(),
      name: this.name,
      communityId: this.communityId.toString(),
      notes: this.notes
    }
  }
}
