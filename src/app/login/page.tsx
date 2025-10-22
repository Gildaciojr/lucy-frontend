"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaSpinner, FaSignInAlt, FaLock, FaEnvelope } from "react-icons/fa";
import Image from "next/image";
import { apiFetch } from "@/lib/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Estados do fluxo de recuperação de senha
  const [showForgot, setShowForgot] = useState(false);
  const [recoverEmail, setRecoverEmail] = useState("");
  const [recoverStatus, setRecoverStatus] = useState<
    "idle" | "sending" | "done" | "error"
  >("idle");
  const [recoverMsg, setRecoverMsg] = useState("");

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!username || !password) {
      setError("Por favor, preencha usuário e senha.");
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch<{
        access_token: string;
        user: { id: number; username: string };
      }>("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      localStorage.setItem("auth_token", data.access_token);
      localStorage.setItem("user_id", String(data.user.id));
      localStorage.setItem("username", data.user.username);
      router.push("/");
    } catch (err: unknown) {
      console.error("Erro no login:", err);
      setError(
        err instanceof Error ? err.message : "Erro desconhecido no login."
      );
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Enviar e-mail de recuperação
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoverStatus("sending");
    setRecoverMsg("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: recoverEmail }),
        }
      );

      if (!res.ok)
        throw new Error("Não foi possível enviar o link de recuperação.");

      setRecoverStatus("done");
      setRecoverMsg(
        "Se o e-mail existir, um link foi enviado para redefinir sua senha."
      );
    } catch (err) {
      setRecoverStatus("error");
      setRecoverMsg("Erro ao tentar enviar o e-mail de recuperação.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-lucy p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* ✅ Logo Lucy centralizada */}
        <div className="flex justify-center mb-4">
          <Image
            src="/images/logo-lucy.png"
            alt="Logo Lucy"
            width={140}
            height={50}
            className="object-contain"
            priority
          />
        </div>

        {/* ✅ Textos de boas-vindas */}
        <h1 className="text-2xl font-bold text-gray-900">Bem-vindo de volta</h1>
        <p className="text-gray-600 text-sm mb-6">
          Entre com seu e-mail e senha
        </p>

        {/* 🔽 Formulário de login - igual ao original */}
        {!showForgot && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Usuário ou E-mail"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:bg-white"
              disabled={loading}
            />

            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:bg-white"
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-lucy hover:bg-lucy text-white font-semibold rounded-lg flex items-center justify-center space-x-2 transition"
            >
              {loading ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaSignInAlt />
              )}
              <span>{loading ? "Entrando..." : "Entrar"}</span>
            </button>
          </form>
        )}

        {/* 🔽 Card de recuperação de senha */}
        {showForgot && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div className="flex flex-col items-center text-gray-700">
              <FaEnvelope className="text-lucy text-2xl mb-2" />
              <p>Digite o e-mail associado à sua conta</p>
            </div>

            <input
              type="email"
              placeholder="Seu e-mail"
              value={recoverEmail}
              onChange={(e) => setRecoverEmail(e.target.value)}
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:bg-white"
              disabled={recoverStatus === "sending"}
            />

            <button
              type="submit"
              disabled={recoverStatus === "sending"}
              className="w-full py-3 bg-lucy hover:bg-lucy-dark text-white font-semibold rounded-lg flex items-center justify-center space-x-2 transition"
            >
              {recoverStatus === "sending" ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <span>Enviar link de recuperação</span>
              )}
            </button>

            {recoverMsg && (
              <p
                className={`text-sm text-center ${
                  recoverStatus === "error" ? "text-red-500" : "text-green-600"
                }`}
              >
                {recoverMsg}
              </p>
            )}

            <button
              type="button"
              onClick={() => {
                setShowForgot(false);
                setRecoverStatus("idle");
                setRecoverMsg("");
              }}
              className="text-sm text-lucy hover:underline mt-2"
            >
              Voltar ao login
            </button>
          </form>
        )}

        {/* 🔽 Mensagens e links */}
        {!showForgot && (
          <>
            {error && <p className="text-center text-red-500 mt-4">{error}</p>}

            <div className="mt-6 text-sm text-gray-700">
              <p>
                Não tem conta?{" "}
                <Link
                  href="/signup"
                  className="text-lucy hover:underline"
                >
                  Cadastre-se
                </Link>
              </p>

              <p className="mt-2">
                Esqueceu sua senha?{" "}
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-lucy hover:underline"
                >
                  Clique aqui
                </button>
              </p>

              <p className="mt-6 text-xs text-gray-500 flex items-center justify-center gap-2">
                <FaLock className="text-yellow-500" />
                <span>Seus dados estão totalmente seguros e protegidos.</span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
