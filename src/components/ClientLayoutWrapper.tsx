"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Navigation from "./Navigation";
import { getCurrentUser, logout } from "@/lib/auth";

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // Definir rotas públicas (sem login)
  const isPublic =
    pathname === "/login" || pathname === "/signup" || pathname === "/register";

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      if (!isPublic) {
        const user = await getCurrentUser();
        if (!user && !cancelled) {
          router.replace("/login");
          return;
        }
      }
      if (!cancelled) setReady(true);
    };

    checkAuth();
    return () => {
      cancelled = true;
    };
  }, [isPublic, router]);

  const handleLogout = () => {
    logout();
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
      <main className="flex-1 pb-20">{children}</main>

      {!isPublic && <Navigation />}

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












