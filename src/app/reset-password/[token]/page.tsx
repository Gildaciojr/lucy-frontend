"use client";

import React, { useState } from "react";

interface ResetPasswordPageProps {
  params: { token: string };
}

export default function ResetPasswordTokenPage({ params }: ResetPasswordPageProps) {
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: params.token,
          newPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Erro ao redefinir senha.");

      setMessage("✅ Senha redefinida com sucesso! Você já pode fazer login.");
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Erro desconhecido ao redefinir senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lucy to-lucy p-4">
      <div className="bg-white shadow-lg rounded-xl w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center text-lucy mb-6">Lucy 💜</h1>
        <p className="text-center text-gray-500 mb-6">Redefinir senha</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Digite sua nova senha"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full p-3 border rounded-lg"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-lucy hover:bg-lucy-dark text-white rounded-lg transition"
          >
            {loading ? "Redefinindo..." : "Redefinir senha"}
          </button>
        </form>

        {message && (
          <p className={`text-center text-sm mt-4 ${message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

