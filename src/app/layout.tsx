import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayoutWrapper from "../components/ClientLayoutWrapper";
import Header from "../components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lucy - Seu Painel de Controle",
  description: "Dashboard de organização e gestão pessoal.",
  icons: {
    icon: "/images/logo-lucy-icon.png", // ✅ favicon Lucy
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // ✅ O Header será controlado via ClientLayoutWrapper (login excluído lá)
  return (
    <html lang="pt">
      <body className={inter.className}>
        <ClientLayoutWrapper>
          <Header /> {/* volta a aparecer no dashboard */}
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}

















