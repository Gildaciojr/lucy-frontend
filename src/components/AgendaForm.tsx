"use client";

import React, { useState } from "react";
import { FaPlus, FaSpinner } from "react-icons/fa";

export default function AgendaForm({ onSave }: { onSave: () => void }) {
  const [formState, setFormState] = useState({
    titulo: "",
    data: "",
    concluido: false,
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"success" | "error" | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCompromisso = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const token = localStorage.getItem("auth_token");
      const userId = localStorage.getItem("user_id");

      if (!token || !userId) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/compromissos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...formState, userId: parseInt(userId, 10) }),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao adicionar compromisso.");
      }
      setStatus("success");
      setFormState({ titulo: "", data: "", concluido: false });
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
        Lançar Novo Compromisso
      </h3>
      <form onSubmit={handleAddCompromisso} className="space-y-4">
        <input
          type="text"
          name="titulo"
          value={formState.titulo}
          onChange={handleInputChange}
          placeholder="Título do compromisso"
          required
          className="w-full p-2 rounded-lg border border-gray-300"
        />
        <input
          type="datetime-local"
          name="data"
          value={formState.data}
          onChange={handleInputChange}
          required
          className="w-full p-2 rounded-lg border border-gray-300"
        />
        <button
          type="submit"
          className="w-full p-3 bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center space-x-2"
          disabled={loading}
        >
          {loading ? <FaSpinner className="animate-spin" /> : <FaPlus />}
          <span>Adicionar</span>
        </button>
        {status === "success" && (
          <p className="text-green-500">Compromisso adicionado com sucesso!</p>
        )}
        {status === "error" && (
          <p className="text-red-500">
            Erro ao adicionar compromisso. Tente novamente.
          </p>
        )}
      </form>
    </div>
  );
}


