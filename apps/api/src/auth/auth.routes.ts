import { Elysia, t } from "elysia";
import { LoginCommand, loginSchema, loginResponseSchema } from "core";
import { PrismaUserRepository } from "database";
import { jwtMiddleware } from "./jwt.middleware";

const userRepository = new PrismaUserRepository();
const loginCommand = new LoginCommand(userRepository);

export const authRoutes = new Elysia()
	.post(
		"/auth/login",
		async ({ body, set }) => {
			try {
				const validatedData = loginSchema.parse(body);
				const result = await loginCommand.execute(validatedData);
				return result;
			} catch (error) {
				set.status = 401;
				return { 
					error: error instanceof Error ? error.message : "Error de autenticación" 
				};
			}
		},
		{
			body: t.Object({
				email: t.String(),
				password: t.String(),
			}),
			response: {
				200: t.Object({
					token: t.String(),
					user: t.Object({
						id: t.String(),
						name: t.Union([t.String(), t.Null()]),
						email: t.String(),
						roles: t.Array(t.String()),
					}),
				}),
				401: t.Object({
					error: t.String(),
				}),
			},
		},
	)
	.use(jwtMiddleware)