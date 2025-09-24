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

    // 🔒 Rotas protegidas → verificar token
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/login");
      return;
    }

    // valida com backend
    apiFetch("/auth/me")
      .then(() => {
        setIsAuthenticated(true);
        setIsReady(true);
      })
      .catch(() => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_id");
        router.push("/login");
      });
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_id");
    router.push("/login");
  };

  // enquanto decide → loading
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

  // Telas públicas
  if (pathname === "/login" || pathname === "/signup") {
    return <>{children}</>;
  }

  // Telas protegidas
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




