import { z } from "zod";
import { idSchema } from "../types/id.schema.ts";

export const userSchema = z.object({
	id: idSchema,
	name: z.string().nullable(),
	email: z.string().email(),
	password: z.string(),
	roles: z.array(z.string()),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export type User = z.infer<typeof userSchema>;

export const userPublicSchema = userSchema.omit({ password: true });
export type UserPublic = z.infer<typeof userPublicSchema>;