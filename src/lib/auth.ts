"use client";

import { apiFetch } from "@/lib/api";

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin" | "superadmin";
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const data = await apiFetch<{ access_token: string; user: UserProfile }>("/auth/me");
    return data.user;
  } catch (err) {
    console.error("Erro ao buscar perfil:", err);
    return null;
  }
}
