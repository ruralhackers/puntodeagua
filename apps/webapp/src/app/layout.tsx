import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Punto de Agua - Gestión Inteligente del Agua en Comunidades del Noroeste de España",
	description: "Transformamos la gestión del agua en las comunidades del noroeste de España. Tecnología avanzada para un recurso vital, garantizando eficiencia, sostenibilidad y transparencia en cada gota.",
	keywords: [
		"gestión del agua",
		"comunidades de agua",
		"noroeste de España",
		"Galicia",
		"Asturias", 
		"Cantabria",
		"León",
		"tecnología del agua",
		"monitoreo del agua",
		"eficiencia hídrica",
		"aldeas gallegas",
		"Anceu",
		"Ponte Caldelas",
		"digitalización del agua",
		"gestión comunitaria del agua"
	],
	authors: [{ name: "Punto de Agua" }],
	creator: "Punto de Agua",
	publisher: "Punto de Agua",
	robots: "index, follow",
	openGraph: {
		type: "website",
		locale: "es_ES",
		url: "https://puntodeagua.es",
		siteName: "Punto de Agua",
		title: "Punto de Agua - Gestión Inteligente del Agua",
		description: "Transformamos la gestión del agua en las comunidades del noroeste de España con tecnología avanzada.",
		images: [
			{
				url: "/og-image.jpg",
				width: 1200,
				height: 630,
				alt: "Punto de Agua - Gestión Inteligente del Agua",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Punto de Agua - Gestión Inteligente del Agua",
		description: "Transformamos la gestión del agua en las comunidades del noroeste de España",
		images: ["/og-image.jpg"],
	},
	alternates: {
		canonical: "https://puntodeagua.es",
	},
	metadataBase: new URL("https://puntodeagua.es"),
	verification: {
		google: "tu-google-verification-code",
	},
	category: "Tecnología del Agua",
	classification: "Software de Gestión Hídrica",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="es">
			<head>
				<link rel="icon" href="/favicon.ico" />
				<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
				<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
				<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
				<link rel="manifest" href="/site.webmanifest" />
				<meta name="theme-color" content="#2563eb" />
				<meta name="msapplication-TileColor" content="#2563eb" />
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{children}
			</body>
		</html>
	);
}
