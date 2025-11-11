"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Navigation from "./Navigation";
import Header from "./Header";
import { getCurrentUser } from "@/lib/auth";

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // ✅ Rotas públicas (sem Header/Nav e sem necessidade de login)
  const PUBLIC_ROUTES = [
    "/login",
    "/signup",
    "/register",
    "/forgot-password",
    "/reset-password", // legacy
    "/plan-inactive",
  ];

  // ✅ Detectar também rotas dinâmicas tipo /reset-password/[token]
  const isPublic =
    PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith("/reset-password/");

  // 🔐 Autenticação automática + verificação de plano ativo
  useEffect(() => {
    if (!isPublic) {
      getCurrentUser()
        .then((user) => {
          if (!user) {
            router.push("/login");
            return;
          }
          const isPaid = user.plan === "Pro" || user.plan === "Premium";
          const notExpired =
            !user.plan_expires_at ||
            new Date(user.plan_expires_at).getTime() > Date.now();
          const isActive = isPaid && notExpired;
          if (!isActive) {
            router.push("/plan-inactive");
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
      localStorage.removeItem("plan");
      localStorage.removeItem("email");
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
      {/* ✅ Mostra Header apenas para usuários logados */}
      {!isPublic && <Header />}

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
















