"use client";

import React, { useState, useEffect } from "react";
import {
  FaCheckCircle,
  FaClipboardList,
  FaSpinner,
  FaChevronLeft,
} from "react-icons/fa";
import AgendaForm from "./AgendaForm";

interface Compromisso {
  id: number;
  titulo: string;
  data: string;
  concluido: boolean;
  userId: number;
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
      className={`flex items-center space-x-4 p-4 bg-white rounded-xl shadow-md cursor-pointer transition-transform transform hover:scale-105 ${isActive ? "ring-2 ring-blue-500" : ""}`}
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
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewDetails, setViewDetails] = useState<
    null | "concluidos" | "pendentes"
  >(null);

  const fetchCompromissos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const userId = localStorage.getItem("user_id");
      if (!token || !userId) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/compromissos?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Erro ao buscar dados de compromissos.");
      }
      const data: Compromisso[] = await response.json();
      setCompromissos(data);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Erro desconhecido ao buscar compromissos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompromissos();
  }, []);

  if (loading) {
    return (
      <div className="text-center p-6 flex items-center justify-center space-x-2">
        <FaSpinner className="animate-spin" />
        <span>Carregando agenda...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-6 text-red-500">Erro: {error}</div>;
  }

  const compromissosConcluidos = compromissos.filter((c) => c.concluido).length;
  const compromissosPendentes = compromissos.filter((c) => !c.concluido).length;
  const totalCompromissos = compromissosConcluidos + compromissosPendentes;
  const taxaConclusaoSemanal =
    totalCompromissos > 0
      ? ((compromissosConcluidos / totalCompromissos) * 100).toFixed(0)
      : "0";

  const renderDetails = () => {
    let title = "";
    let list: Compromisso[] = [];

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
          {list.map((item) => (
            <li key={item.id} className="p-4 bg-gray-100 rounded-lg">
              <p className="font-semibold text-gray-700">{item.titulo}</p>
              <p className="text-sm text-gray-500">
                Data: {new Date(item.data).toLocaleString("pt-BR")}
              </p>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  if (viewDetails) {
    return renderDetails();
  }

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Agenda e Tarefas
      </h2>

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
          value={`${taxaConclusaoSemanal}%`}
          onClick={() => {}}
          isActive={false}
        />
      </div>

      <div className="mt-8">
        <AgendaForm onSave={fetchCompromissos} />
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Próximos Compromissos
        </h3>
        {compromissos.length > 0 ? (
          <ul className="space-y-2">
            {compromissos.map((compromisso) => (
              <li
                key={compromisso.id}
                className="p-3 bg-gray-100 rounded-lg text-gray-700 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold">{compromisso.titulo}</p>
                  <p className="text-gray-500 text-sm">
                    {new Date(compromisso.data).toLocaleString("pt-BR")}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold ${compromisso.concluido ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
                >
                  {compromisso.concluido ? "Concluído" : "Pendente"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Nenhum compromisso futuro agendado.</p>
        )}
      </div>
    </div>
  );
}

