import { z } from "zod";
import { IdSchema } from "core";
import { locationSchema } from "./location.schema.ts";

export type WaterPointSchema = z.infer<typeof waterPointSchema>;

export const waterPointSchema = z.object({
	id: IdSchema,
	location: locationSchema,
	description: z.string().optional(),
	communityId: IdSchema,
});
