import { Elysia } from "elysia";
import { JwtUtils } from "core";

export const jwtMiddleware = new Elysia()
	.derive(async ({ headers, set }) => {
		const authHeader = headers.authorization;
		
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			set.status = 401;
			throw new Error("Token de acceso requerido");
		}

		const token = authHeader.substring(7);
		const payload = JwtUtils.verifyToken(token);

		if (!payload) {
			set.status = 401;
			throw new Error("Token inválido");
		}

		return {
			user: {
				userId: payload.userId,
			},
		};
	})
	.as("plugin");