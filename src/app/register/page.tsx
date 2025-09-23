"use client";

import React, { useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setMessage("✅ Conta ativada com sucesso! Agora você já pode fazer login.");
        setForm({ name: "", username: "", email: "", phone: "", password: "" });
      } else {
        const data = await res.json();
        setMessage(data.message || "Erro ao criar conta.");
      }
    } catch {
      setMessage("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 to-purple-600 p-4">
      <div className="bg-white shadow-lg rounded-xl w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center text-purple-700 mb-6">Lucy</h1>
        <p className="text-center text-gray-500 mb-6">Ative sua conta</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" placeholder="Nome completo" value={form.name} onChange={handleChange} required className="w-full p-3 border rounded-lg" />
          <input name="username" placeholder="Nome de usuário" value={form.username} onChange={handleChange} required className="w-full p-3 border rounded-lg" />
          <input type="email" name="email" placeholder="E-mail" value={form.email} onChange={handleChange} required className="w-full p-3 border rounded-lg" />
          <input name="phone" placeholder="Telefone" value={form.phone} onChange={handleChange} className="w-full p-3 border rounded-lg" />
          <input type="password" name="password" placeholder="Senha" value={form.password} onChange={handleChange} required className="w-full p-3 border rounded-lg" />

          <button type="submit" disabled={loading} className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg">
            {loading ? "Criando conta..." : "Cadastrar"}
          </button>
        </form>

        {message && <p className="text-center text-sm mt-4 text-gray-700">{message}</p>}

        <p className="mt-6 text-center text-sm">
          Já tem conta?{" "}
          <a href="/login" className="text-purple-600 hover:underline">
            Entrar
          </a>
        </p>
      </div>
    </div>
  );
}





