import type { Deletable, FindableAll, FindableById, Savable } from "core"
import type { Plan } from "../entities/plan"

export interface PlanRepository extends Savable<Plan>, Deletable<Plan>, FindableById<Plan>, FindableAll<Plan> {
}