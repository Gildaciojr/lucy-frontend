"use client";

import React, { useState } from "react";
import { FaSignInAlt, FaSpinner } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function SignupPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (formState.password !== formState.confirmPassword) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch<{ access_token: string; user: { id: number; username: string } }>(
        "/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            name: formState.name,
            email: formState.email,
            username: formState.username,
            password: formState.password,
            phone: formState.phone,
            address: formState.address,
          }),
        }
      );

      // já loga após cadastro
      localStorage.setItem("auth_token", data.access_token);
      localStorage.setItem("user_id", String(data.user.id));

      setSuccess("Cadastro realizado com sucesso! Redirecionando...");
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Erro desconhecido ao cadastrar usuário.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-purple-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="p-4 bg-purple-200 rounded-xl shadow-md cursor-pointer text-black">
            <h1 className="text-3xl font-bold">Lucy</h1>
            <p className="text-bg-black-200">Crie sua conta</p>
          </div>
        </div>
        <form onSubmit={handleSignup} className="space-y-4">
          <input type="text" placeholder="Nome completo" name="name" value={formState.name} onChange={handleInputChange} required className="w-full p-4 rounded-xl bg-gray-100 border" disabled={loading} />
          <input type="email" placeholder="E-mail" name="email" value={formState.email} onChange={handleInputChange} required className="w-full p-4 rounded-xl bg-gray-100 border" disabled={loading} />
          <input type="text" placeholder="Nome de usuário" name="username" value={formState.username} onChange={handleInputChange} required className="w-full p-4 rounded-xl bg-gray-100 border" disabled={loading} />
          <input type="password" placeholder="Senha" name="password" value={formState.password} onChange={handleInputChange} required className="w-full p-4 rounded-xl bg-gray-100 border" disabled={loading} />
          <input type="password" placeholder="Confirmar Senha" name="confirmPassword" value={formState.confirmPassword} onChange={handleInputChange} required className="w-full p-4 rounded-xl bg-gray-100 border" disabled={loading} />
          <input type="text" placeholder="Telefone" name="phone" value={formState.phone} onChange={handleInputChange} className="w-full p-4 rounded-xl bg-gray-100 border" disabled={loading} />
          <input type="text" placeholder="Endereço Completo" name="address" value={formState.address} onChange={handleInputChange} className="w-full p-4 rounded-xl bg-gray-100 border" disabled={loading} />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && <p className="text-green-500 text-sm text-center">{success}</p>}

          <button type="submit" className="w-full p-4 bg-green-400 text-white font-bold rounded-xl shadow-md flex items-center justify-center space-x-2" disabled={loading}>
            {loading ? <FaSpinner className="animate-spin text-white" /> : <FaSignInAlt />}
            <span>Cadastrar</span>
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          Já tem uma conta?{" "}
          <a href="/login" className="text-lucy-purple font-bold hover:underline">
            Entrar
          </a>
        </p>
      </div>
    </div>
  );
}







