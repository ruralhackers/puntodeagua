import type { UserRepository } from "core";
import { client } from "../client.ts";

export class PrismaUserRepository implements UserRepository {
	async findByEmail(email: string) {
		const user = await client.user.findUnique({
			where: { email },
		});

		if (!user) {
			return null;
		}

		return {
			id: user.id,
			name: user.name,
			email: user.email,
			password: user.password,
			roles: Array.isArray(user.roles) ? user.roles as string[] : [],
		};
	}
}