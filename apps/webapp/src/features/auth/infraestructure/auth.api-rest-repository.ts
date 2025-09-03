import type { HttpClient, LoginRequest, LoginResponse } from "core";
import type { AuthRepository } from "features";


export class AuthApiRestRepository implements AuthRepository {
	constructor(private readonly httpClient: HttpClient) {}

	async findByEmailAndPassword(credentials: LoginRequest): Promise<LoginResponse> {
		const response = await this.httpClient.post<LoginResponse>("auth/login", credentials);

		return response.data;
	}
}
