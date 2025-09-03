export class AuthTokenService {
	static getStoredToken(): string | null {
		if (typeof window !== "undefined") {
			return localStorage.getItem("auth_token");
		}
		return null;
	}

	static storeToken(token: string): void {
		if (typeof window !== "undefined") {
			localStorage.setItem("auth_token", token);
		}
	}

	static removeToken(): void {
		if (typeof window !== "undefined") {
			localStorage.removeItem("auth_token");
		}
	}
}