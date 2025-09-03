import { Id } from "core";
import type { PlanSchema } from "../schemas/plan.schema.ts";

export class Plan {
	private constructor(
		private readonly id: Id,
		private readonly name: string,
	) {}

	static create(planSchema: PlanSchema) {
		return new Plan(Id.create(planSchema.id), planSchema.name);
	}
}
