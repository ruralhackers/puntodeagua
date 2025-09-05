import { Location } from 'core'
import { Id } from 'core/value-object/id.ts'
import type { WaterPointSchema } from '../schemas/water-point.schema.ts'

export class WaterPoint {
  private constructor(
    public readonly id: Id,
    public readonly communityId: Id,
    public readonly name: string,
    public location: Location,
    public readonly fixedPopulation: number,
    public readonly floatingPopulation: number,
    public description?: string
  ) {}

  static create({
    location,
    description,
    communityId,
    name,
    fixedPopulation,
    floatingPopulation
  }: Omit<WaterPointSchema, 'id'>) {
    return new WaterPoint(
      Id.generateUniqueId(),
      Id.create(communityId),
      name,
      Location.create(location),
      fixedPopulation,
      floatingPopulation,
      description || undefined
    )
  }

  static fromDto(dto: WaterPointSchema) {
    return new WaterPoint(
      Id.create(dto.id),
      Id.create(dto.communityId),
      dto.name,
      Location.create(dto.location),
      dto.fixedPopulation,
      dto.floatingPopulation,
      dto.description || undefined
    )
  }

  toDto() {
    return {
      id: this.id.toString(),
      location: this.location.toString(),
      communityId: this.communityId.toString(),
      name: this.name,
      description: this.description,
      fixedPopulation: this.fixedPopulation,
      floatingPopulation: this.floatingPopulation
    }
  }
}
