"use client";

import React, { useState, useEffect } from "react";
import {
  FaHeart,
  FaCalendarCheck,
  FaSpinner,
  FaChevronLeft,
} from "react-icons/fa";
import ConteudoForm from "./ConteudoForm";

interface Conteudo {
  id: number;
  ideia: string;
  favorito: boolean;
  agendado: boolean;
  createdAt: string;
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
      <div className="p-3 rounded-full bg-yellow-500 text-white text-xl">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

export default function Conteudo() {
  const [conteudos, setConteudos] = useState<Conteudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewDetails, setViewDetails] = useState<
    null | "favoritos" | "agendados"
  >(null);

  const fetchConteudos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const userId = localStorage.getItem("user_id");
      if (!token || !userId) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/conteudo?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar ideias.");
      }
      const data: Conteudo[] = await response.json();
      setConteudos(data);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConteudos();
  }, []);

  if (loading) {
    return (
      <div className="text-center p-6 flex items-center justify-center space-x-2">
        <FaSpinner className="animate-spin" />
        <span>Carregando ideias...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-6 text-red-500">{error}</div>;
  }

  const renderDetails = () => {
    let title = "";
    let list: Conteudo[] = [];

    if (viewDetails === "favoritos") {
      title = "Ideias Favoritas";
      list = conteudos.filter((c) => c.favorito);
    } else if (viewDetails === "agendados") {
      title = "Postagens Agendadas";
      list = conteudos.filter((c) => c.agendado);
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
              <p className="font-semibold text-gray-700">{item.ideia}</p>
              <p className="text-sm text-gray-500">
                Criado em: {new Date(item.createdAt).toLocaleDateString("pt-BR")}
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

  const ideiasFavoritas = conteudos.filter((c) => c.favorito).length;
  const postsAgendados = conteudos.filter((c) => c.agendado).length;
  const ideiasRecentes = [...conteudos]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 3);

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Gestão de Conteúdo
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card
          icon={<FaHeart />}
          title="Favoritas"
          value={ideiasFavoritas.toString()}
          onClick={() => setViewDetails("favoritos")}
          isActive={viewDetails === "favoritos"}
        />
        <Card
          icon={<FaCalendarCheck />}
          title="Agendadas"
          value={postsAgendados.toString()}
          onClick={() => setViewDetails("agendados")}
          isActive={viewDetails === "agendados"}
        />
      </div>

      <div className="mt-8">
        <ConteudoForm onSave={fetchConteudos} />
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Ideias Recentes
        </h3>
        {ideiasRecentes.length > 0 ? (
          <ul className="space-y-2">
            {ideiasRecentes.map((ideia) => (
              <li
                key={ideia.id}
                className="p-3 bg-gray-100 rounded-lg text-gray-700"
              >
                {ideia.ideia}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Nenhuma ideia recente.</p>
        )}
      </div>
    </div>
  );
}


