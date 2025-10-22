"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const PUBLIC_PREFIXES = ['/reset-password/'];
const PUBLIC_ROUTES = new Set([
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
]);

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // liberar público
    if (PUBLIC_ROUTES.has(pathname) || PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) {
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      router.replace('/login');
    }
  }, [pathname, router]);

  return <>{children}</>;
}
