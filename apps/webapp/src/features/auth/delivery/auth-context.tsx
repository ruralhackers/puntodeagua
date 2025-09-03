"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { AuthTokenService } from "./auth.service";

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

interface User {
	id: string;
	name: string | null;
	email: string;
	roles: string[];
}

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	login: (email: string, password: string) => Promise<void>;
	logout: () => void;
	isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Check for stored token on mount
		const token = AuthTokenService.getStoredToken();
		if (token) {
			// In a real app, you'd validate the token with the server
			// For now, we'll assume it's valid if it exists
			setIsLoading(false);
		} else {
			setIsLoading(false);
		}
	}, []);

	const handleLogin = async (email: string, password: string) => {
		setIsLoading(true);
		try {
			const response = await fetch("http://localhost:4000/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Error de autenticación");
			}

			const data: LoginResponse = await response.json();
			AuthTokenService.storeToken(data.token);
			setUser(data.user);
		} catch (error) {
			throw error; // Re-throw to let the component handle the error
		} finally {
			setIsLoading(false);
		}
	};

	const handleLogout = () => {
		AuthTokenService.removeToken();
		setUser(null);
	};

	const value: AuthContextType = {
		user,
		isLoading,
		login: handleLogin,
		logout: handleLogout,
		isAuthenticated: !!user,
	};

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}