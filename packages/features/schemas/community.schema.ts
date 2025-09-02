import { IdSchema } from "core";
import { z } from "zod";

export type CommunitySchema = z.infer<typeof communitySchema>;

export const communitySchema = z.object({
	id: IdSchema,
	name: z.string(),
	planId: IdSchema,
});
