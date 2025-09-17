"use client";

import React, { useState } from "react";
import { FaUser, FaLock, FaSignInAlt, FaSpinner } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface LoginResponse {
  accessToken: string;
  id: string;
}

export default function LoginPage() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        },
      );

      if (!response.ok) throw new Error("Usuário ou senha incorretos.");

      const data: LoginResponse = await response.json();
      localStorage.setItem("auth_token", data.accessToken);
      localStorage.setItem("user_id", data.id);

      router.push("/");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao fazer login.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-purple-200 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="p-4 bg-purple-200 rounded-xl shadow-md">
            <h1 className="text-3xl font-bold">Lucy</h1>
            <p className="text-black">Acesse seu painel pessoal</p>
          </div>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
            <input
              type="text"
              placeholder="Nome de usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 pl-12 rounded-xl bg-gray-100 border border-gray-300"
              disabled={loading}
            />
          </div>
          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 pl-12 rounded-xl bg-gray-100 border border-gray-300"
              disabled={loading}
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full p-4 bg-green-400 text-white font-bold rounded-xl shadow-md flex items-center justify-center space-x-2"
            disabled={loading}
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaSignInAlt />}
            <span>Entrar</span>
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          Ainda não tem uma conta?{" "}
          <Link
            href="/signup"
            className="text-purple-600 font-bold hover:underline"
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
