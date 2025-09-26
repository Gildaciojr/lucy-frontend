import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayoutWrapper from "../components/ClientLayoutWrapper";
import ProfileMenu from "../components/ProfileMenu";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lucy - Seu Painel de Controle",
  description: "Dashboard de organização e gestão pessoal.",
};

// Carrega traduções de acordo com o locale
async function getMessages(locale: string) {
  try {
    const safeLocale = locale === "es" ? "es" : "pt";
    const mod = await import(`../messages/${safeLocale}.json`);
    return mod.default;
  } catch {
    notFound();
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ Corrigido: use await para evitar o erro de Promise<...>
  const hdrs = await headers();
  const locale = hdrs.get("x-locale") ?? "pt";

  const messages = await getMessages(locale);

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {/* 🟣 Barra superior com o menu do usuário logado */}
          <header className="flex justify-end px-6 py-4 bg-purple-600 shadow">
            <ProfileMenu />
          </header>

          {/* Conteúdo principal */}
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}









