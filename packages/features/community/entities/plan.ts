import { Id } from 'core'
import type { PlanDto } from './plan.dto'

export class Plan {
  private constructor(
    public readonly id: Id,
    public name: string
  ) {}

  static create(planSchema: Omit<PlanDto, 'id'>) {
    return new Plan(Id.generateUniqueId(), planSchema.name)
  }

  static fromDto(dto: PlanDto): Plan {
    return new Plan(Id.create(dto.id), dto.name)
  }

  toDto() {
    return {
      id: this.id.toString(),
      name: this.name
    }
  }
}
