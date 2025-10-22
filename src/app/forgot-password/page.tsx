"use client";

import React, { useState } from "react";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMsg("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier }),
        }
      );

      // intencionalmente não diferenciamos usuário existente ou não (segurança)
      if (!res.ok) throw new Error("Não foi possível processar a solicitação.");
      setStatus("done");
      setMsg("Se o e-mail/usuário existir, enviaremos um link de redefinição.");
    } catch (err) {
      setStatus("error");
      setMsg("Não foi possível processar a solicitação agora.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lucy to-lucy p-4">
      <div className="bg-white shadow-lg rounded-xl w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center text-lucy mb-2">Lucy</h1>
        <p className="text-center text-gray-500 mb-6">Recuperar senha</p>

        {status !== "done" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Digite seu e-mail ou usuário"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="w-full p-3 border rounded-lg"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-3 bg-lucy hover:bg-purple-500 text-white rounded-lg"
            >
              {status === "loading"
                ? "Enviando..."
                : "Enviar link de redefinição"}
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
          <a href="/login" className="text-lucy hover:underline">
            Voltar ao login
          </a>
        </div>
      </div>
    </div>
  );
}
