import { IdSchema } from "core";
import { z } from "zod";

export type PlanSchema = z.infer<typeof planSchema>;

export const planSchema = z.object({
	id: IdSchema,
	name: z.string(),
});
