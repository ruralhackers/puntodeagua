import { z } from "zod";

export const LocationSchema = z.object({
	latitude: z.number(),
	longitude: z.number(),
	street: z.string().optional(),
});
