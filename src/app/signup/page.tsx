"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaSpinner, FaUserPlus, FaLock } from "react-icons/fa";
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

  const strongPassword = (s: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(s);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!strongPassword(form.password)) {
      setLoading(false);
      setError(
        "A senha deve ter no mínimo 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial."
      );
      return;
    }

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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-400 to-purple-600 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-purple-700 mb-6">
          Criar Conta
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" placeholder="Nome" value={form.name} onChange={handleChange} required className="w-full p-3 border rounded-lg" />
          <input name="username" placeholder="Usuário" value={form.username} onChange={handleChange} required className="w-full p-3 border rounded-lg" />
          <input type="email" name="email" placeholder="E-mail" value={form.email} onChange={handleChange} required className="w-full p-3 border rounded-lg" />
          <input type="password" name="password" placeholder="Senha" value={form.password} onChange={handleChange} required className="w-full p-3 border rounded-lg" />
          <p className="text-xs text-gray-500">
            A senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial.
          </p>
          <input name="phone" placeholder="Telefone" value={form.phone} onChange={handleChange} className="w-full p-3 border rounded-lg" />

          <button type="submit" disabled={loading} className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center justify-center space-x-2">
            {loading ? <FaSpinner className="animate-spin" /> : <FaUserPlus />}
            <span>{loading ? "Criando..." : "Criar Conta"}</span>
          </button>
        </form>

        {error && <p className="text-center text-red-500 mt-4">{error}</p>}

        <p className="mt-6 text-center text-sm">
          Já tem conta?{" "}
          <a href="/login" className="text-purple-600 hover:underline">
            Entre aqui
          </a>
        </p>

        <footer className="mt-8 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
          <FaLock className="text-purple-600" />
          <span>Seus dados estão totalmente seguros e protegidos.</span>
        </footer>
      </div>
    </div>
  );
}















