"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormLabel, FormMessage } from "@/components/ui/form";

interface LoginFormProps {
	onLogin: (email: string, password: string) => Promise<void>;
	isLoading?: boolean;
	error?: string;
}

export function LoginForm({ onLogin, isLoading = false, error }: LoginFormProps) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [fieldErrors, setFieldErrors] = useState<{email?: string; password?: string}>({});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		// Reset errors
		setFieldErrors({});
		
		// Basic validation
		const errors: {email?: string; password?: string} = {};
		
		if (!email) {
			errors.email = "Email requerido";
		} else if (!/\S+@\S+\.\S+/.test(email)) {
			errors.email = "Email inválido";
		}
		
		if (!password) {
			errors.password = "Contraseña requerida";
		}
		
		if (Object.keys(errors).length > 0) {
			setFieldErrors(errors);
			return;
		}
		
		await onLogin(email, password);
	};

	return (
		<div className="bg-white rounded-lg border border-gray-200 p-6 shadow">
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-gray-900 mb-2">
					Iniciar Sesión
				</h2>
				<p className="text-sm text-gray-600">
					Ingresa tus credenciales para acceder
				</p>
			</div>

			<Form onSubmit={handleSubmit}>
				<FormField>
					<FormLabel htmlFor="email">Email</FormLabel>
					<Input
						id="email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="tu@email.com"
						disabled={isLoading}
					/>
					{fieldErrors.email && <FormMessage>{fieldErrors.email}</FormMessage>}
				</FormField>

				<FormField>
					<FormLabel htmlFor="password">Contraseña</FormLabel>
					<Input
						id="password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="••••••••"
						disabled={isLoading}
					/>
					{fieldErrors.password && <FormMessage>{fieldErrors.password}</FormMessage>}
				</FormField>

				{error && (
					<div className="p-3 bg-red-50 rounded-md">
						<FormMessage>{error}</FormMessage>
					</div>
				)}

				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
				</Button>
			</Form>
		</div>
	);
}