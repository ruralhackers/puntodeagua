import { Id } from '@pda/common/domain'
import type { WaterPointDto } from './water-point.dto'

export class WaterPoint {
  private constructor(
    public readonly id: Id,
    public name: string,
    public location: string,
    public fixedPopulation: number,
    public floatingPopulation: number,
    public cadastralReference: string,
    public readonly communityZoneId: Id,
    public waterDepositIds: Id[],
    public notes?: string
  ) {}

  static create(dto: Omit<WaterPointDto, 'id'>) {
    return new WaterPoint(
      Id.generateUniqueId(),
      dto.name,
      dto.location,
      dto.fixedPopulation,
      dto.floatingPopulation,
      dto.cadastralReference,
      Id.fromString(dto.communityZoneId),
      (dto.waterDepositIds ?? []).map(Id.fromString),
      dto.notes
    )
  }

  static fromDto(dto: WaterPointDto) {
    return new WaterPoint(
      Id.fromString(dto.id),
      dto.name,
      dto.location,
      dto.fixedPopulation,
      dto.floatingPopulation,
      dto.cadastralReference,
      Id.fromString(dto.communityZoneId),
      (dto.waterDepositIds ?? []).map(Id.fromString),
      dto.notes
    )
  }

  toDto(): WaterPointDto {
    return {
      id: this.id.toString(),
      name: this.name,
      location: this.location,
      notes: this.notes,
      fixedPopulation: this.fixedPopulation,
      floatingPopulation: this.floatingPopulation,
      cadastralReference: this.cadastralReference,
      communityZoneId: this.communityZoneId.toString(),
      waterDepositIds: this.waterDepositIds.map((id) => id.toString())
    }
  }
}
