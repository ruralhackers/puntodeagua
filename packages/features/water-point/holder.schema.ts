import { z } from "zod";
import { IdSchema } from "core";

export const HolderSchema = z.object({
	id: IdSchema,
	name: z.string(),
});
