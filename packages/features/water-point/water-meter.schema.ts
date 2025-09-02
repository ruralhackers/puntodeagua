import { z } from "zod";
import { IdSchema } from "core";
import { UrlSchema } from "./url.schema.ts";

export const WaterMeterSchema = z.object({
	id: IdSchema,
	holderId: IdSchema,
	waterPointId: IdSchema,
	images: z.array(UrlSchema).optional(),
});
