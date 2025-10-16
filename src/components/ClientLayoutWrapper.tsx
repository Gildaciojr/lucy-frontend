"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Navigation from "./Navigation";
import Header from "./Header"; // ✅ Adicionado aqui
import { getCurrentUser } from "@/lib/auth";

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // 🔹 Rotas públicas (sem header / nav)
  const isPublic =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/register" ||
    pathname === "/reset-password";

  // 🔐 Autenticação automática
  useEffect(() => {
    if (!isPublic) {
      getCurrentUser()
        .then((user) => {
          if (!user) {
            router.push("/login");
          }
        })
        .finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, [isPublic, router]);

  // 🔴 Logout
  const handleLogout = () => {
    try {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_id");
      localStorage.removeItem("username");
    } catch {}
    router.push("/login");
  };

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Carregando...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* ✅ Mostra Header apenas no dashboard */}
      {!isPublic && <Header />}

      {/* Conteúdo principal */}
      <main className="flex-1 pb-20">{children}</main>

      {/* ✅ Navigation apenas no dashboard */}
      {!isPublic && <Navigation />}

      {/* ✅ Botão de logout fixo */}
      {!isPublic && (
        <button
          onClick={handleLogout}
          className="fixed top-4 right-4 p-2 bg-red-500 text-white font-bold rounded-full shadow-md hover:bg-red-600 transition-colors z-50"
        >
          Sair
        </button>
      )}
    </div>
  );
}














