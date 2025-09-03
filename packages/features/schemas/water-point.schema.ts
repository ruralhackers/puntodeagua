import { idSchema } from "core";
import { z } from "zod";
import { locationSchema } from "./location.schema.ts";

export type WaterPointSchema = z.infer<typeof waterPointSchema>;

export const waterPointSchema = z.object({
	id: idSchema,
	location: locationSchema,
	description: z.string().optional(),
	communityId: idSchema,
});
