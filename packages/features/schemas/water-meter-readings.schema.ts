import { z } from "zod";
import { IdSchema } from "core";
import { decimalSchema, locationSchema } from "./location.schema.ts";

export const WaterMeterReadingsSchema = z.object({
	id: IdSchema,
	waterMeterId: locationSchema.optional(),
	// TODO: Handle decimals
	value: decimalSchema,
});
