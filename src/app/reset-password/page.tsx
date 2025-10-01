"use client";

import React, { useState } from "react";

export default function ResetPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, newPassword }),
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

        <form onSubmit={handleResetPassword} className="space-y-4">
          <input
            type="text"
            placeholder="Digite seu e-mail ou usuário"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="password"
            placeholder="Nova senha"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full p-3 border rounded-lg"
          />
          <button
            type="submit"
            className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg"
          >
            Alterar senha
          </button>
        </form>

        {message && <p className="text-center text-sm mt-4 text-gray-700">{message}</p>}
      </div>
    </div>
  );
}


