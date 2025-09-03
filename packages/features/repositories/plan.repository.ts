import type { Id } from "core"
import type { Plan } from "../entities/plan"

export interface PlanRepository {
  findById(id: Id): Promise<Plan | null>
  findAll(): Promise<Plan[]>
  delete(id: Id): Promise<void>
}