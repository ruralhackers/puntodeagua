import { Id } from "core";
import type { PlanSchema } from "../schemas/plan.schema.ts";

export class Plan {
	private constructor(
		public readonly id: Id,
		public name: string,
	) {}

  static create(planSchema: PlanSchema) {
    return new Plan(
      Id.create(planSchema.id),
      planSchema.name,
    );
  }

  toDto() {
    return {
      id: this.id.toString(),
      name: this.name,
    };
  }
}
