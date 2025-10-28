// frontend/src/components/AgendaForm.tsx
"use client";

import React, { useState } from "react";
import { FaPlus, FaSpinner, FaCheckCircle } from "react-icons/fa";
import { apiFetch } from "@/lib/api"; // ✅

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
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddCompromisso = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const dataSelecionada = new Date(formState.data);
      if (dataSelecionada < new Date() && !formState.concluido) {
        alert("Compromissos com data no passado devem ser marcados como concluídos.");
        setLoading(false);
        return;
      }

      await apiFetch("/compromissos", {
        method: "POST",
        body: JSON.stringify(formState),
      }); // ✅

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
        Novo Compromisso
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

        <label className="flex items-center space-x-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="concluido"
            checked={formState.concluido}
            onChange={handleInputChange}
            className="w-4 h-4"
          />
          <span>Já está concluído?</span>
        </label>

        <button
          type="submit"
          className="w-full p-3 bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center space-x-2"
          disabled={loading}
        >
          {loading ? <FaSpinner className="animate-spin" /> : <FaPlus />}
          <span>Adicionar Compromisso</span>
        </button>

        {status === "success" && (
          <p className="flex items-center gap-1 text-green-600 font-medium mt-2">
            <FaCheckCircle /> Compromisso adicionado com sucesso!
          </p>
        )}
        {status === "error" && (
          <p className="text-red-500 font-medium mt-2">
            Erro ao adicionar compromisso. Tente novamente.
          </p>
        )}
      </form>
    </div>
  );
}








