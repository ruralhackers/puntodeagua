import { z } from "zod";

export type LocationSchema = z.infer<typeof locationSchema>;

export const decimalSchema = z.string();

export const locationSchema = z.object({
	latitude: decimalSchema,
	longitude: decimalSchema,
	street: z.string().optional(),
});
