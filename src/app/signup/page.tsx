"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaSpinner, FaUserPlus, FaLock } from "react-icons/fa";
import PasswordField from "@/components/PasswordField";
import { apiFetch } from "@/lib/api";

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      router.push("/login");
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Erro desconhecido no cadastro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-lucy to-lucy p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-purple-500 mb-6">
          Criar Conta
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Nome completo"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg"
          />
          <input
            name="username"
            placeholder="Usuário"
            value={form.username}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="email"
            name="email"
            placeholder="E-mail"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg"
          />

          {/* Campo de senha com feedback visual */}
          <PasswordField
            value={form.password}
            onChange={(val) => setForm((prev) => ({ ...prev, password: val }))}
            placeholder="Senha"
          />

          <input
            name="phone"
            placeholder="Telefone"
            value={form.phone}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg flex items-center justify-center space-x-2 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-lucy hover:bg-lucy-dark"
            } text-white transition`}
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaUserPlus />}
            <span>{loading ? "Criando..." : "Criar Conta"}</span>
          </button>
        </form>

        {error && <p className="text-center text-red-500 mt-4">{error}</p>}

        <p className="mt-6 text-center text-sm">
          Já tem conta?{" "}
          <a href="/login" className="text-lucy hover:underline">
            Entre aqui
          </a>
        </p>

        <footer className="mt-8 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
          <FaLock className="text-lucy" />
          <span>Seus dados estão totalmente seguros e protegidos.</span>
        </footer>
      </div>
    </div>
  );
}


















