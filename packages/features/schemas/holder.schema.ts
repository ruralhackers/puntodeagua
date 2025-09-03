import { idSchema } from "core";
import { z } from "zod";

export type HolderSchema = z.infer<typeof holderSchema>;

export const holderSchema = z.object({
	id: idSchema,
	name: z.string(),
});
