"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaSpinner, FaSignInAlt } from "react-icons/fa";
import { apiFetch } from "@/lib/api";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // 🔑 Se já tem token válido, redireciona (com timeout de 3s)
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    apiFetch<{ id: number; username: string; role: string }>("/auth/me", {
      signal: controller.signal,
    })
      .then(() => router.replace("/"))
      .catch(() => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_id");
      })
      .finally(() => clearTimeout(timeout));
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await apiFetch<{
        access_token: string;
        user: { id: number; username: string };
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });

      localStorage.setItem("auth_token", res.access_token);
      localStorage.setItem("user_id", res.user.id.toString());
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Erro desconhecido no login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-400 to-purple-600 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-purple-700 mb-6">
          Entrar
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="username"
            placeholder="Usuário ou e-mail"
            value={form.username}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="password"
            name="password"
            placeholder="Senha"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg"
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
          <a href="/signup" className="text-purple-600 hover:underline">
            Cadastre-se
          </a>
        </p>
      </div>
    </div>
  );
}






















