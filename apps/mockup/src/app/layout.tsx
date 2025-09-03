import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TabBar } from "@/components/ui/navigation/tab-bar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gestión Comunal de Aguas",
  description: "Aplicación para la gestión comunal de aguas en Galicia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <div className="flex-1 pb-16 md:pb-0">
            {children}
          </div>
          <TabBar />
        </div>
      </body>
    </html>
  );
}
