import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "Teatro ERP - Sistema de Gestão Escolar",
  description:
    "Sistema completo de gestão para escolas de teatro. Gerencie alunos, professores, turmas, matrículas, finanças e muito mais.",
  keywords: [
    "teatro",
    "escola",
    "gestão",
    "ERP",
    "alunos",
    "professores",
    "matrículas",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
