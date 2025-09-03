import { z } from "zod";

export const loginSchema = z.object({
	email: z.string().email("Email inválido"),
	password: z.string().min(1, "Contraseña requerida"),
});

export type LoginRequest = z.infer<typeof loginSchema>;

export const loginResponseSchema = z.object({
	token: z.string(),
	user: z.object({
		id: z.string(),
		name: z.string().nullable(),
		email: z.string().email(),
		roles: z.array(z.string()),
	}),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;