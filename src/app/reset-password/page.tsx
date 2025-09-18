"use client";

import React, { useState } from "react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMessage(data.message || "Verifique seu e-mail.");
    } catch {
      setMessage("Erro ao enviar e-mail de recuperação.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await res.json();
      setMessage(data.message || "Senha alterada com sucesso.");
    } catch {
      setMessage("Erro ao alterar a senha.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 to-purple-600 p-4">
      <div className="bg-white shadow-lg rounded-xl w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center text-purple-700 mb-6">Lucy</h1>
        <p className="text-center text-gray-500 mb-6">Redefinir senha</p>

        <form onSubmit={handleRequestReset} className="space-y-4 mb-6">
          <input type="email" placeholder="Digite seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 border rounded-lg" />
          <button type="submit" className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg">
            Enviar link de redefinição
          </button>
        </form>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <input type="password" placeholder="Nova senha" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full p-3 border rounded-lg" />
          <button type="submit" className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg">
            Alterar senha
          </button>
        </form>

        {message && <p className="text-center text-sm mt-4 text-gray-700">{message}</p>}
      </div>
    </div>
  );
}


