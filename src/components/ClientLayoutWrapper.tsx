"use client";

import { usePathname, useRouter } from "next/navigation";
import Navigation from "./Navigation";

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const isPublic = pathname === "/login" || pathname === "/signup";

  const handleLogout = () => {
    try {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_id");
    } catch {}
    router.push("/login");
  };

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








