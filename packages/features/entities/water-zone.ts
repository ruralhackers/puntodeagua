import { Id } from 'core'
import type { WaterZoneSchema } from '../schemas/water-zone.schema.ts'

export class WaterZone {
  private constructor(
    public readonly id: Id,
    public readonly communityId: Id,
    public name: string
  ) {}

  static create(waterZoneSchema: Omit<WaterZoneSchema, 'id'>) {
    return new WaterZone(
      Id.generateUniqueId(),
      Id.create(waterZoneSchema.communityId),
      waterZoneSchema.name
    )
  }

  static fromDto(dto: WaterZoneSchema): WaterZone {
    return new WaterZone(Id.create(dto.id), Id.create(dto.communityId), dto.name)
  }

  toDto() {
    return {
      id: this.id.toString(),
      communityId: this.communityId.toString(),
      name: this.name
    }
  }
}
