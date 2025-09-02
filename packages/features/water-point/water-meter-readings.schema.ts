import { z } from "zod";
import { IdSchema } from "core";
import { LocationSchema } from "./location-schema.ts";

export const WaterMeterReadingsSchema = z.object({
	id: IdSchema,
	waterMeterId: LocationSchema.optional(),
	// TODO: Handle decimals
	value: z.string(),
});
