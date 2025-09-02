import { z } from "zod";
import { IdSchema } from "core";

export const PlanSchema = z.object({
	id: IdSchema,
	name: z.string(),
});
