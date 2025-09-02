import { z } from "zod";
import { IdSchema } from "core";
import { LocationSchema } from "./location-schema.ts";

export const WaterPointSchema = z.object({
	id: IdSchema,
	location: LocationSchema.optional(),
	description: z.string().optional(),
	communityId: IdSchema,
});
