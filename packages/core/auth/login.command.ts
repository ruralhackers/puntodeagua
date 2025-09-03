import bcrypt from "bcrypt";
import type { Command } from "../use-cases/command.ts";
import type { LoginRequest, LoginResponse } from "./login.schema.ts";
import { JwtUtils } from "./jwt.utils.ts";

export interface UserRepository {
	findByEmail(email: string): Promise<{
		id: string;
		name: string | null;
		email: string;
		password: string;
		roles: string[];
	} | null>;
}

export class LoginCommand implements Command<LoginRequest, LoginResponse> {
	constructor(private userRepository: UserRepository) {}

	async execute(input: LoginRequest): Promise<LoginResponse> {
		const user = await this.userRepository.findByEmail(input.email);
		
		if (!user) {
			throw new Error("Credenciales inválidas");
		}

		const isPasswordValid = await bcrypt.compare(input.password, user.password);
		
		if (!isPasswordValid) {
			throw new Error("Credenciales inválidas");
		}

		const token = JwtUtils.generateToken({ userId: user.id });

		return {
			token,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				roles: user.roles,
			},
		};
	}
}