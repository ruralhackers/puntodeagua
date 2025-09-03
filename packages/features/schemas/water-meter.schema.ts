import { idSchema, measurementUnitSchema } from "core";
import { z } from "zod";
import { UrlSchema } from "./url.schema.ts";

export type WaterMeterSchema = z.infer<typeof waterMeterSchema>;

export const waterMeterSchema = z.object({
	id: idSchema,
	holderId: idSchema,
	waterPointId: idSchema,
	measurementUnit: measurementUnitSchema,
	serialNumber: z.string().max(100).optional(),
	images: z.array(UrlSchema).optional(),
});
