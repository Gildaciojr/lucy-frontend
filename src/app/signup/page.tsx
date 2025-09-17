"use client";

import React, { useState } from "react";
import { FaSignInAlt, FaSpinner } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    cep: "",
    state: "",
    country: "",
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formState.name,
          email: formState.email,
          username: formState.username,
          password: formState.password,
          phone: formState.phone,
          address: formState.address,
          cep: formState.cep,
          state: formState.state,
          country: formState.country,
          plan: "Lucy Free",
        }),
      });

      if (!response.ok) {
        throw new Error(
          "Erro ao cadastrar usuário. Tente novamente com outro e-mail.",
        );
      }

      setSuccess(
        "Cadastro realizado com sucesso! Você será redirecionado em 3 segundos.",
      );

      setTimeout(() => {
        router.push("/login");
      }, 3000);
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
          <input
            type="text"
            placeholder="Nome completo"
            name="name"
            value={formState.name}
            onChange={handleInputChange}
            className="w-full p-4 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-lucy-purple"
            disabled={loading}
            required
          />
          <input
            type="email"
            placeholder="E-mail"
            name="email"
            value={formState.email}
            onChange={handleInputChange}
            className="w-full p-4 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-lucy-purple"
            disabled={loading}
            required
          />
          <input
            type="text"
            placeholder="Nome de usuário"
            name="username"
            value={formState.username}
            onChange={handleInputChange}
            className="w-full p-4 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-lucy-purple"
            disabled={loading}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            name="password"
            value={formState.password}
            onChange={handleInputChange}
            className="w-full p-4 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-lucy-purple"
            disabled={loading}
            required
          />
          <input
            type="password"
            placeholder="Confirmar Senha"
            name="confirmPassword"
            value={formState.confirmPassword}
            onChange={handleInputChange}
            className="w-full p-4 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-lucy-purple"
            disabled={loading}
            required
          />
          <input
            type="text"
            placeholder="Telefone"
            name="phone"
            value={formState.phone}
            onChange={handleInputChange}
            className="w-full p-4 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-lucy-purple"
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Endereço Completo"
            name="address"
            value={formState.address}
            onChange={handleInputChange}
            className="w-full p-4 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-lucy-purple"
            disabled={loading}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="CEP"
              name="cep"
              value={formState.cep}
              onChange={handleInputChange}
              className="w-full p-4 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-lucy-purple"
              disabled={loading}
            />
            <input
              type="text"
              placeholder="Estado"
              name="state"
              value={formState.state}
              onChange={handleInputChange}
              className="w-full p-4 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-lucy-purple"
              disabled={loading}
            />
            <input
              type="text"
              placeholder="País"
              name="country"
              value={formState.country}
              onChange={handleInputChange}
              className="w-full p-4 rounded-xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-lucy-purple"
              disabled={loading}
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && (
            <p className="text-green-500 text-sm text-center">{success}</p>
          )}
          <button
            type="submit"
            className="w-full p-4 bg-green-400 text-white font-bold rounded-xl shadow-md hover:bg-lucy-purple-dark transition-colors flex items-center justify-center space-x-2"
            disabled={loading}
          >
            {loading ? (
              <FaSpinner className="animate-spin text-white" />
            ) : (
              <FaSignInAlt />
            )}
            <span>Cadastrar</span>
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className="text-lucy-purple font-bold hover:underline"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
