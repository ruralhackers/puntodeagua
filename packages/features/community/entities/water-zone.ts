import { Id } from 'core'
import { Community } from './community.ts'
import type { WaterZoneDto } from './water-zone.dto.ts'

export class WaterZone {
  private constructor(
    public readonly id: Id,
    public readonly community: Community,
    public name: string
  ) {}

  static create(waterZoneSchema: Omit<WaterZoneDto, 'id'>) {
    return new WaterZone(
      Id.generateUniqueId(),
      Community.fromDto(waterZoneSchema.community),
      waterZoneSchema.name
    )
  }

  static fromDto(dto: WaterZoneDto): WaterZone {
    return new WaterZone(Id.create(dto.id), Community.fromDto(dto.community), dto.name)
  }

  toDto() {
    return {
      id: this.id.toString(),
      community: this.community.toDto(),
      name: this.name
    }
  }
}
