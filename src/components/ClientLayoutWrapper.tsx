// frontend/src/components/ClientLayoutWrapper.tsx
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
    "/reset-password",
  ];

  // ✅ Detectar também rotas dinâmicas tipo /reset-password/[token]
  const isPublic =
    PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith("/reset-password/");

  // 🔐 Autenticação automática
  useEffect(() => {
    if (!isPublic) {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.push("/login");
        return;
      }

      getCurrentUser()
        .then((user) => {
          if (!user) {
            router.push("/login");
            return;
          }

          // ✅ Só redireciona se o plano for "Free" (expirado ou cancelado)
          if (user.plan === "Free") {
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
      localStorage.removeItem("email");
    } catch {}
    router.push("/login");
  };

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-screen text-lucy font-medium">
        Carregando Lucy 💜...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* ✅ Header só para usuários logados */}
      {!isPublic && <Header />}

      <main className="flex-1 pb-20">{children}</main>

      {/* ✅ Navigation apenas para páginas internas */}
      {!isPublic && <Navigation />}

      {/* ✅ Botão de logout fixo e estilizado Lucy */}
      {!isPublic && (
        <button
          onClick={handleLogout}
          className="fixed top-4 right-4 p-2 bg-lucy text-white font-bold rounded-full shadow-lg hover:bg-lucy/80 transition-colors z-50"
        >
          Sair
        </button>
      )}
    </div>
  );
}

