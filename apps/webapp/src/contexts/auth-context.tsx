"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { login, getStoredToken, storeToken, removeToken } from "@/lib/auth";

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
		const token = getStoredToken();
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
			const response = await login({ email, password });
			storeToken(response.token);
			setUser(response.user);
		} catch (error) {
			throw error; // Re-throw to let the component handle the error
		} finally {
			setIsLoading(false);
		}
	};

	const handleLogout = () => {
		removeToken();
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