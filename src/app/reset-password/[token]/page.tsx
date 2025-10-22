"use client";

import React, { useState } from "react";

export default function ResetPasswordTokenPage({
  params,
}: {
  params: { token: string };
}) {
  const token = params.token;
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<"idle"|"loading"|"done"|"error">("idle");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMsg("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message ?? "Falha ao redefinir a senha.");

      setStatus("done");
      setMsg("Senha alterada com sucesso! Você já pode fazer login.");
    } catch (err: unknown) {
      setStatus("error");
      setMsg(err instanceof Error ? err.message : "Não foi possível redefinir a senha.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lucy to-lucy p-4">
      <div className="bg-white shadow-lg rounded-xl w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center text-lucy mb-2">Lucy</h1>
        <p className="text-center text-gray-500 mb-6">Definir nova senha</p>

        {status !== "done" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Nova senha"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              required
              className="w-full p-3 border rounded-lg"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              {status === "loading" ? "Salvando..." : "Salvar nova senha"}
            </button>
          </form>
        ) : (
          <div className="p-4 rounded-lg bg-green-50 text-green-700 text-sm">
            {msg}
          </div>
        )}

        {status === "error" && (
          <p className="text-center text-sm mt-4 text-red-600">{msg}</p>
        )}

        <div className="text-center text-sm text-gray-500 mt-6">
          <a href="/login" className="text-lucy hover:underline">Ir para o login</a>
        </div>
      </div>
    </div>
  );
}
