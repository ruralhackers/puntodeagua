"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";

export default function LoginPage() {
	const router = useRouter();
	const { login, isLoading } = useAuth();
	const [error, setError] = useState<string>("");

	const handleLogin = async (email: string, password: string) => {
		try {
			setError("");
			await login(email, password);
			router.push("/"); // Redirect to dashboard after successful login
		} catch (err) {
			setError(err instanceof Error ? err.message : "Error de autenticación");
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4">
			<div className="max-w-md mx-auto w-full">
				<div className="text-center mb-8">
					<Link href="/" className="font-bold text-2xl text-gray-900">
						Gestión Aguas
					</Link>
					<p className="mt-2 text-gray-600">
						Sistema de gestión de puntos de agua
					</p>
				</div>

				<LoginForm 
					onLogin={handleLogin} 
					isLoading={isLoading} 
					error={error}
				/>

				<div className="mt-4 text-center text-sm text-gray-500">
					<p>Usuario de prueba: admin@puntodeagua.com</p>
					<p>Contraseña: admin123</p>
				</div>
			</div>
		</div>
	);
}