// frontend/src/components/Agenda.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  FaCheckCircle,
  FaClipboardList,
  FaSpinner,
  FaChevronLeft,
  FaUndo,
} from "react-icons/fa";
import AgendaForm from "./AgendaForm";
import AgendaCalendar from "./AgendaCalendar";
import { apiFetch } from "@/lib/api"; // ✅

interface CompromissoItem {
  id: number;
  titulo: string;
  data: string;
  concluido: boolean;
  origem: "dashboard" | "whatsapp";
}

interface CardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  onClick: () => void;
  isActive: boolean;
}

const Card: React.FC<CardProps> = ({
  icon,
  title,
  value,
  onClick,
  isActive,
}) => {
  return (
    <div
      className={`flex items-center space-x-4 p-4 bg-white rounded-xl shadow-md cursor-pointer transition-transform transform hover:scale-105 ${
        isActive ? "ring-2 ring-blue-500" : ""
      }`}
      onClick={onClick}
    >
      <div className="p-3 rounded-full bg-blue-500 text-white text-xl">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

export default function Agenda() {
  const [compromissos, setCompromissos] = useState<CompromissoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewDetails, setViewDetails] = useState<
    null | "concluidos" | "pendentes"
  >(null);

  const fetchCompromissos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        window.location.href = "/login";
        return;
      }
      const data = await apiFetch<CompromissoItem[]>("/compromissos"); // ✅
      setCompromissos(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  };

  const handleConcluir = async (id: number) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    await apiFetch(`/compromissos/${id}/concluir`, { method: "PUT" }); // ✅
    // invalida/refresh
    fetchCompromissos();
  };

  const handleReabrir = async (id: number) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    await apiFetch(`/compromissos/${id}/reabrir`, { method: "PUT" }); // ✅
    fetchCompromissos();
  };

  useEffect(() => {
    fetchCompromissos();
  }, []);

  if (loading) {
    return (
      <div className="text-center p-6 flex items-center justify-center space-x-2">
        <FaSpinner className="animate-spin" />
        <span>Carregando compromissos...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-6 text-red-500">Erro: {error}</div>;
  }

  const compromissosConcluidos = compromissos.filter((c) => c.concluido).length;
  const compromissosPendentes = compromissos.filter((c) => !c.concluido).length;
  const totalCompromissos = compromissosConcluidos + compromissosPendentes;
  const taxaConclusao =
    totalCompromissos > 0
      ? ((compromissosConcluidos / totalCompromissos) * 100).toFixed(0)
      : "0";

  const renderDetails = () => {
    let title = "";
    let list: CompromissoItem[] = [];

    if (viewDetails === "concluidos") {
      title = "Compromissos Concluídos";
      list = compromissos.filter((c) => c.concluido);
    } else if (viewDetails === "pendentes") {
      title = "Compromissos Pendentes";
      list = compromissos.filter((c) => !c.concluido);
    }

    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <button
          onClick={() => setViewDetails(null)}
          className="flex items-center space-x-2 text-blue-500 hover:text-blue-700 font-bold mb-4"
        >
          <FaChevronLeft />
          <span>Voltar</span>
        </button>
        <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
        <ul className="space-y-4">
          {list.map((item) => {
            const isDashboard = item.origem === "dashboard";
            return (
              <li
                key={`${item.origem}-${item.id}`}
                className="p-4 bg-gray-100 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-gray-700">{item.titulo}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(item.data).toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="flex gap-2">
                  {isDashboard && item.concluido && (
                    <button
                      onClick={() => handleReabrir(item.id)}
                      className="px-3 py-1 rounded bg-yellow-500 text-white text-sm flex items-center gap-1 hover:bg-yellow-600"
                    >
                      <FaUndo /> Reabrir
                    </button>
                  )}
                  {isDashboard && !item.concluido && (
                    <button
                      onClick={() => handleConcluir(item.id)}
                      className="px-3 py-1 rounded bg-green-600 text-white text-sm flex items-center gap-1 hover:bg-green-700"
                    >
                      <FaCheckCircle /> Concluir
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  if (viewDetails) return renderDetails();

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Agenda de Compromissos
      </h2>

      <AgendaCalendar
        events={compromissos.map((c) => ({
          id: c.id,
          title: c.titulo,
          start: new Date(c.data),
          end: new Date(c.data),
          description: c.origem === "whatsapp" ? "Criado via WhatsApp" : "Criado no Dashboard",
        }))}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card
          icon={<FaCheckCircle />}
          title="Concluídos"
          value={compromissosConcluidos.toString()}
          onClick={() => setViewDetails("concluidos")}
          isActive={viewDetails === "concluidos"}
        />
        <Card
          icon={<FaClipboardList />}
          title="Pendentes"
          value={compromissosPendentes.toString()}
          onClick={() => setViewDetails("pendentes")}
          isActive={viewDetails === "pendentes"}
        />
        <Card
          icon={<FaClipboardList />}
          title="Taxa de Conclusão"
          value={`${taxaConclusao}%`}
          onClick={() => {}}
          isActive={false}
        />
      </div>

      <div className="mt-8">
        <AgendaForm onSave={fetchCompromissos} />
      </div>
    </div>
  );
}

