import {z} from "zod";
import {IdSchema} from "core";

export const CommunitySchema = z.object({
	id: IdSchema,
	name: z.string(),
	planId: IdSchema,
});
