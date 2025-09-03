import { idSchema } from "core";
import { z } from "zod";

export type IssueSchema = z.infer<typeof issueSchema>;

export const issueSchema = z.object({
	id: idSchema,
	name: z.string(),
});
