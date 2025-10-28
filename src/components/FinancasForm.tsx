// frontend/src/components/FinancasForm.tsx
"use client";

import React, { useState } from "react";
import { FaPlus, FaSpinner } from "react-icons/fa";
import { apiFetch } from "@/lib/api"; // ✅

export default function FinancasForm({ onSave }: { onSave: () => void }) {
  const [formState, setFormState] = useState({
    categoria: "",
    valor: "",
    tipo: "despesa",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"success" | "error" | null>(null);

  const categorias = [
    "Alimentação",
    "Mercado",
    "Moradia",
    "Transporte",
    "Saúde",
    "Educação",
    "Lazer",
    "Viagem",
    "Cuidados Pessoais",
    "Vestuário",
    "Pets",
    "Doações",
    "Presentes",
    "Assinaturas",
    "Família",
    "Trabalho",
    "Impostos",
    "Investimentos",
    "Outros",
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddFinanca = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      await apiFetch("/financas", {
        method: "POST",
        body: JSON.stringify({
          categoria: formState.categoria,
          valor: parseFloat(formState.valor),
          tipo: formState.tipo,
          data: new Date().toISOString(),
        }),
      }); // ✅

      setStatus("success");
      setFormState({ categoria: "", valor: "", tipo: "despesa" });
      onSave();
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Nova Finança</h3>
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
          placeholder="Digite o valor"
          required
          className="w-full p-2 rounded-lg border border-gray-300"
        />

        <select
          name="tipo"
          value={formState.tipo}
          onChange={handleInputChange}
          className="w-full p-2 rounded-lg border border-gray-300"
        >
          <option value="receita">Receita</option>
          <option value="despesa">Despesa</option>
        </select>

        <button
          type="submit"
          className="w-full p-3 bg-green-500 text-white font-bold rounded-xl flex items-center justify-center space-x-2"
          disabled={loading}
        >
          {loading ? <FaSpinner className="animate-spin" /> : <FaPlus />}
          <span>Adicionar</span>
        </button>

        {status === "success" && (
          <p className="text-green-500">Finança adicionada com sucesso!</p>
        )}
        {status === "error" && (
          <p className="text-red-500">Erro ao adicionar finança.</p>
        )}
      </form>
    </div>
  );
}








