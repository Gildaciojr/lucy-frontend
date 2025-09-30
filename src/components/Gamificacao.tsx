"use client";

import React, { useState, useEffect } from "react";
import { FaStar, FaTrophy, FaSpinner, FaChevronLeft } from "react-icons/fa";

interface Gamificacao {
  id: number;
  badge: string;
  dataConquista: string;
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
      className={`flex items-center space-x-4 p-4 bg-white rounded-xl shadow-md cursor-pointer transition-transform transform hover:scale-105 ${
        isActive ? "ring-2 ring-blue-500" : ""
      }`}
      onClick={onClick}
    >
      <div className="p-3 rounded-full bg-purple-500 text-white text-xl">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

export default function Gamificacao() {
  const [gamificacoes, setGamificacoes] = useState<Gamificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewDetails, setViewDetails] = useState<null | "all">(null);

  const fetchGamificacoes = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      // 🔹 agora o backend pega userId do token
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/gamificacao`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar gamificação.");
      }
      const data: Gamificacao[] = await response.json();
      setGamificacoes(data);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGamificacoes();
  }, []);

  if (loading) {
    return (
      <div className="text-center p-6 flex items-center justify-center space-x-2">
        <FaSpinner className="animate-spin" />
        <span>Carregando conquistas...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-6 text-red-500">Erro: {error}</div>;
  }

  const renderDetails = () => (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <button
        onClick={() => setViewDetails(null)}
        className="flex items-center space-x-2 text-blue-500 hover:text-blue-700 font-bold mb-4"
      >
        <FaChevronLeft />
        <span>Voltar</span>
      </button>
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Detalhes das Conquistas
      </h3>
      <ul className="space-y-4">
        {gamificacoes.length > 0 ? (
          gamificacoes.map((badge) => (
            <li key={badge.id} className="p-4 bg-gray-100 rounded-lg">
              <p className="font-semibold text-gray-700">{badge.badge}</p>
              <p className="text-sm text-gray-500">
                Data: {new Date(badge.dataConquista).toLocaleDateString("pt-BR")}
              </p>
            </li>
          ))
        ) : (
          <p className="text-gray-500">Nenhuma conquista encontrada.</p>
        )}
      </ul>
    </div>
  );

  if (viewDetails) {
    return renderDetails();
  }

  const scoreAtual = gamificacoes.length * 10;

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Gamificação</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card
          icon={<FaTrophy />}
          title="Pontuação"
          value={scoreAtual.toString()}
          onClick={() => {}}
          isActive={false}
        />
        <Card
          icon={<FaStar />}
          title="Conquistas"
          value={gamificacoes.length.toString()}
          onClick={() => setViewDetails("all")}
          isActive={viewDetails === "all"}
        />
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Minhas Conquistas
        </h3>
        {gamificacoes.length > 0 ? (
          <ul className="space-y-2">
            {gamificacoes.map((badge) => (
              <li
                key={badge.id}
                className="p-3 bg-gray-100 rounded-lg text-gray-700"
              >
                <span className="font-semibold">{badge.badge}</span> -{" "}
                {new Date(badge.dataConquista).toLocaleDateString("pt-BR")}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Nenhuma conquista disponível.</p>
        )}
      </div>
    </div>
  );
}




