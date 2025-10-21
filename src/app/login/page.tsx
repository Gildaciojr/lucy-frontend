"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaSpinner, FaSignInAlt, FaLock } from "react-icons/fa";
import Image from "next/image";
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      localStorage.setItem("auth_token", data.access_token);
      localStorage.setItem("user_id", String(data.user.id));
      localStorage.setItem("username", data.user.username);
      router.push("/");
    } catch (err: unknown) {
      console.error("Erro no login:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido no login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-fuchsia-500 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* ✅ Logo Lucy centralizada */}
        <div className="flex justify-center mb-4">
          <Image
            src="/images/logo-lucy.png"
            alt="Logo Lucy"
            width={140}
            height={50}
            className="object-contain"
            priority
          />
        </div>

        {/* ✅ Textos de boas-vindas */}
        <h1 className="text-2xl font-bold text-gray-900">Bem-vindo de volta</h1>
        <p className="text-gray-600 text-sm mb-6">Entre com seu e-mail e senha</p>

        {/* 🔽 Formulário de login - mantido igual */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Usuário ou E-mail"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-fuchsia-500"
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-fuchsia-500"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-fuchsia-500 hover:bg-fuchsia-500 text-white font-semibold rounded-lg flex items-center justify-center space-x-2 transition"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaSignInAlt />}
            <span>{loading ? "Entrando..." : "Entrar"}</span>
          </button>
        </form>

        {/* 🔽 Mensagens e links */}
        {error && <p className="text-center text-red-500 mt-4">{error}</p>}

        <div className="mt-6 text-sm text-gray-700">
          <p>
            Não tem conta?{" "}
            <Link href="/signup" className="text-fuchsia-500 hover:underline">
              Cadastre-se
            </Link>
          </p>

          <p className="mt-2">
            Esqueceu sua senha?{" "}
            <Link href="/reset-password" className="text-fuchsia-500 hover:underline">
              Clique aqui
            </Link>
          </p>

          <p className="mt-6 text-xs text-gray-500 flex items-center justify-center gap-2">
            <FaLock className="text-yellow-500" />
            <span>Seus dados estão totalmente seguros e protegidos.</span>
          </p>
        </div>
      </div>
    </div>
  );
}





























