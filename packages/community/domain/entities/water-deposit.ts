import { Id } from '@pda/common/domain'
import type { WaterDepositDto } from './water-deposit.dto'

export class WaterDeposit {
  private constructor(
    public readonly id: Id,
    public name: string,
    public location: string,
    public readonly communityId: Id,
    public notes?: string
  ) {}

  static create(dto: Omit<WaterDepositDto, 'id'>) {
    return new WaterDeposit(
      Id.generateUniqueId(),
      dto.name,
      dto.location,
      Id.fromString(dto.communityId),
      dto.notes
    )
  }

  static fromDto(dto: WaterDepositDto) {
    return new WaterDeposit(
      Id.fromString(dto.id),
      dto.name,
      dto.location,
      Id.fromString(dto.communityId),
      dto.notes
    )
  }

  toDto(): WaterDepositDto {
    return {
      id: this.id.toString(),
      name: this.name,
      location: this.location,
      notes: this.notes,
      communityId: this.communityId.toString()
    }
  }
}
