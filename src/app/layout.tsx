import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayoutWrapper from "../components/ClientLayoutWrapper";
import ProfileMenu from "../components/ProfileMenu";

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
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {/* 🟣 Barra superior com o menu do usuário logado */}
        <header className="flex justify-end px-6 py-4 bg-purple-600 shadow">
          <ProfileMenu />
        </header>

        {/* Conteúdo principal */}
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}



