"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayoutWrapper from "../components/ClientLayoutWrapper";
import ProfileMenu from "../components/ProfileMenu";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lucy - Seu Painel de Controle",
  description: "Dashboard de organização e gestão pessoal.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPublic = pathname === "/login" || pathname === "/signup";

  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {/* Só mostra o menu se NÃO estiver em rotas públicas */}
        {!isPublic && (
          <header className="flex justify-end px-6 py-4 bg-purple-600 shadow">
            <ProfileMenu />
          </header>
        )}

        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}


