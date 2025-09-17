"use client";

import React, { useState } from "react";
import { FaPlus, FaSpinner } from "react-icons/fa";

export default function FinancasForm({ onSave }: { onSave: () => void }) {
  const [formState, setFormState] = useState({
    categoria: "",
    valor: "",
    userId: 1,
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"success" | "error" | null>(null);

  const categorias = [
    "Alimentação",
    "Mercado",
    "Moradia (Casa + Utilidades)",
    "Transporte",
    "Saúde",
    "Educação",
    "Lazer & Entretenimento",
    "Viagem",
    "Cuidados Pessoais",
    "Vestuário",
    "Pets",
    "Doações",
    "Presentes 🎁",
    "Assinaturas Digitais 💻",
    "Família/Filhos 👨‍👩‍👧",
    "Trabalho/Negócio 💼",
    "Impostos",
    "Investimentos",
    "Recebimentos - Salário, Vendas.",
    "Outros",
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddFinanca = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        throw new Error("Usuário não logado.");
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/financas`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formState, userId: parseInt(userId, 10) }),
        },
      );
      if (!response.ok) {
        throw new Error("Erro ao adicionar transação financeira.");
      }
      setStatus("success");
      setFormState({ categoria: "", valor: "", userId: 1 });
      onSave();
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Lançar Nova Transação
      </h3>
      <form onSubmit={handleAddFinanca} className="space-y-4">
        <select
          name="categoria"
          value={formState.categoria}
          onChange={handleInputChange}
          required
          className="w-full p-2 rounded-lg border border-gray-300"
        >
          <option value="">Selecione uma categoria</option>
          {categorias.map((categoria, index) => (
            <option key={index} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>
        <input
          type="number"
          name="valor"
          value={formState.valor}
          onChange={handleInputChange}
          placeholder="Valor (ex: 150.75)"
          required
          className="w-full p-2 rounded-lg border border-gray-300"
        />
        <button
          type="submit"
          className="w-full p-3 bg-green-500 text-white font-bold rounded-xl flex items-center justify-center space-x-2"
          disabled={loading}
        >
          {loading ? <FaSpinner className="animate-spin" /> : <FaPlus />}
          <span>Adicionar</span>
        </button>
        {status === "success" && (
          <p className="text-green-500">Transação adicionada com sucesso!</p>
        )}
        {status === "error" && (
          <p className="text-red-500">
            Erro ao adicionar transação. Tente novamente.
          </p>
        )}
      </form>
    </div>
  );
}

