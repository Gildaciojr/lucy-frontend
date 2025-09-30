"use client";

import { apiFetch } from "@/lib/api";

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin" | "superadmin";
}

export interface LoginResponse {
  access_token: string;
  user: UserProfile;
}

export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
  const res = await apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  // salva no localStorage
  localStorage.setItem("auth_token", res.access_token);
  localStorage.setItem("user_id", String(res.user.id));
  localStorage.setItem("username", res.user.username);
  localStorage.setItem("email", res.user.email);

  return res;
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const me = await apiFetch<UserProfile>("/users/me");
    return me;
  } catch {
    return null;
  }
}

export function logout(): void {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user_id");
  localStorage.removeItem("username");
  localStorage.removeItem("email");
}


