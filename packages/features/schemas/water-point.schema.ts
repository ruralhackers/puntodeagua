import { idSchema } from "core";
import { locationSchema } from "core/types/location.schema.ts";
import { z } from "zod";

export type WaterPointSchema = z.infer<typeof waterPointSchema>;

export const waterPointSchema = z.object({
	id: idSchema,
	location: locationSchema,
	description: z.string().optional(),
	communityId: idSchema,
});
