interface LoginRequest {
	email: string;
	password: string;
}

interface LoginResponse {
	token: string;
	user: {
		id: string;
		name: string | null;
		email: string;
		roles: string[];
	};
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
	const response = await fetch("http://localhost:4000/api/auth/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(credentials),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Error de autenticación");
	}

	return response.json();
}

export function getStoredToken(): string | null {
	if (typeof window !== "undefined") {
		return localStorage.getItem("auth_token");
	}
	return null;
}

export function storeToken(token: string): void {
	if (typeof window !== "undefined") {
		localStorage.setItem("auth_token", token);
	}
}

export function removeToken(): void {
	if (typeof window !== "undefined") {
		localStorage.removeItem("auth_token");
	}
}