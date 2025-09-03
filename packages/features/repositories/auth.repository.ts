import type { LoginRequest, LoginResponse } from "core";

export interface AuthRepository {
	findByEmailAndPassword(credentials: LoginRequest): Promise<LoginResponse>;
}