"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaSpinner, FaSignInAlt, FaLock } from "react-icons/fa";
import { apiFetch } from "@/lib/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!username || !password) {
      setError("Por favor, preencha usuário e senha.");
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch<{ access_token: string; user: { id: number; username: string } }>(
        "/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // ✅ garante que o backend leia o corpo corretamente
          },
          body: JSON.stringify({ username, password }),
        }
      );

      // Salva dados no localStorage
      localStorage.setItem("auth_token", data.access_token);
      localStorage.setItem("user_id", String(data.user.id));
      localStorage.setItem("username", data.user.username);

      // Redireciona para a Home
      router.push("/");
    } catch (err: unknown) {
      console.error("Erro no login:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido no login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-400 to-purple-600 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-purple-700 mb-6">lucy</h1>
        <p className="text-center text-gray-500 mb-6">Entre na sua conta</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Usuário ou E-mail"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-3 border rounded-lg"
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border rounded-lg"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center justify-center space-x-2"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaSignInAlt />}
            <span>{loading ? "Entrando..." : "Entrar"}</span>
          </button>
        </form>

        {error && <p className="text-center text-red-500 mt-4">{error}</p>}

        <p className="mt-6 text-center text-sm">
          Não tem conta?{" "}
          <Link href="/signup" className="text-purple-600 hover:underline">
            Cadastre-se
          </Link>
        </p>

        <p className="mt-2 text-center text-sm">
          Esqueceu sua senha?{" "}
          <Link href="/reset-password" className="text-purple-600 hover:underline">
            Clique aqui
          </Link>
        </p>

        <footer className="mt-8 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
          <FaLock className="text-yellow-500" />
          <span>Seus dados estão totalmente seguros e protegidos.</span>
        </footer>
      </div>
    </div>
  );
}



























