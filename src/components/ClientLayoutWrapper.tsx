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

  // ✅ Detectar rotas dinâmicas (ex: /reset-password/[token])
  const isPublic =
    PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith("/reset-password/");

  // 🔐 Autenticação e verificação de plano
  useEffect(() => {
    // Ignora páginas públicas
    if (isPublic) {
      setReady(true);
      return;
    }

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

        // ✅ Admins e Superadmins sempre têm acesso total
        if (user.role === "admin" || user.role === "superadmin") {
          setReady(true);
          return;
        }

        // ✅ Usuários comuns precisam ter plano ativo
        const plan = user.plan?.toLowerCase?.() ?? "free";
        const isPaid =
          plan.includes("pro") ||
          plan.includes("premium") ||
          plan.includes("mensal") ||
          plan.includes("anual");

        // 🚫 Se for Free ou plano expirado → redireciona
        if (!isPaid || plan === "free") {
          router.push("/plan-inactive");
          return;
        }

        setReady(true);
      })
      .catch(() => {
        router.push("/login");
      });
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

  // 💬 Estado de carregamento
  if (!ready) {
    return (
      <div className="flex items-center justify-center h-screen text-lucy font-medium bg-gray-50">
        Carregando Lucy 💜...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* ✅ Header apenas para usuários logados */}
      {!isPublic && <Header />}

      <main className="flex-1 pb-20">{children}</main>

      {/* ✅ Navigation apenas para páginas internas */}
      {!isPublic && <Navigation />}

      {/* ✅ Botão de logout fixo e elegante */}
      {!isPublic && (
        <button
          onClick={handleLogout}
          className="fixed top-4 right-4 p-3 bg-lucy text-white font-bold rounded-full shadow-lg hover:bg-lucy/80 transition-colors z-50 text-sm sm:text-base"
        >
          Sair
        </button>
      )}
    </div>
  );
}



