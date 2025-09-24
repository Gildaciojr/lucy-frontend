"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navigation from "./Navigation";
import { Inter } from "next/font/google";
import { apiFetch } from "@/lib/api";

const inter = Inter({ subsets: ["latin"] });

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 🔓 Rotas públicas → liberar imediatamente
    if (pathname === "/login" || pathname === "/signup") {
      setIsReady(true);
      return;
    }

    // 🔒 Rotas privadas → exige token
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setIsReady(true);
      setIsAuthenticated(false);
      return;
    }

    apiFetch("/auth/me")
      .then(() => {
        setIsAuthenticated(true);
        setIsReady(true);
      })
      .catch(() => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_id");
        setIsAuthenticated(false);
        setIsReady(true);
      });
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_id");
    router.push("/login");
  };

  if (!isReady) {
    return (
      <html lang="pt-BR">
        <body className={inter.className}>
          <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center p-6 bg-white rounded-xl shadow-md">
              Carregando...
            </div>
          </div>
        </body>
      </html>
    );
  }

  // 🔓 Login e cadastro → sempre renderiza
  if (pathname === "/login" || pathname === "/signup") {
    return <>{children}</>;
  }

  // 🔒 Se não autenticado → mostra aviso e botão para login
  if (!isAuthenticated) {
    return (
      <html lang="pt-BR">
        <body className={inter.className}>
          <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center p-6 bg-white rounded-xl shadow-md space-y-4">
              <p className="text-gray-700 font-semibold">
                Você precisa fazer login para acessar o painel.
              </p>
              <button
                onClick={() => router.push("/login")}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600"
              >
                Ir para Login
              </button>
            </div>
          </div>
        </body>
      </html>
    );
  }

  // 🔒 Telas protegidas
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pb-20">{children}</main>
      <Navigation />
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 p-2 bg-red-500 text-white font-bold rounded-full shadow-md hover:bg-red-600 transition-colors z-50"
      >
        Sair
      </button>
    </div>
  );
}





