"use client";

import React, { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) throw new Error("Usuário ou senha inválidos");

      const data = await res.json();

      // ⚡ Salva token e id do usuário
      localStorage.setItem("auth_token", data.access_token);
      localStorage.setItem("user_id", data.user.id.toString());

      // Redireciona para o dashboard
      window.location.href = "/";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-100">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-lg rounded-lg p-8 space-y-4 w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-center text-purple-600">
          Entrar no Lucy
        </h1>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <input
          type="text"
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full py-3 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}

