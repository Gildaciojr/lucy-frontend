"use client";

import React, { useState } from "react";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Falha no login");

      localStorage.setItem("auth_token", data.access_token);
      localStorage.setItem("user_id", data.user.id);

      window.location.href = "/";
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao tentar fazer login."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 to-purple-600 p-4">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8">
        <h1 className="text-4xl font-extrabold text-center text-purple-700 mb-6">
          lucy
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="username"
            placeholder="Usuário ou e-mail"
            value={form.username}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <input
            type="password"
            name="password"
            placeholder="Senha"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          />

          {error && (
            <p className="text-sm text-center text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="flex flex-col items-center mt-6 space-y-2 text-sm">
          <a
            href="/reset-password"
            className="text-gray-600 hover:underline"
          >
            Esqueceu sua senha?
          </a>
          <a
            href="/signup"
            className="text-purple-600 hover:underline font-medium"
          >
            Cadastre-se
          </a>
        </div>
      </div>
    </div>
  );
}









