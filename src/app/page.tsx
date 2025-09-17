"use client";

import React, { useState, useEffect } from "react";
import MonthSummary from "../components/MonthSummary";
import { FaSpinner } from "react-icons/fa";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

interface Financa {
  id: number;
  categoria: string;
  valor: string;
  data: string;
  userId: number;
}

interface Compromisso {
  id: number;
  titulo: string;
  data: string;
  concluido: boolean;
  userId: number;
}

interface Conteudo {
  id: number;
  ideia: string;
  favorito: boolean;
  agendado: boolean;
  createdAt: string;
  userId: number;
}

interface Gamificacao {
  id: number;
  badge: string;
  dataConquista: string;
  userId: number;
}

interface ChartItem {
  name: string;
  uso: number;
}

interface SummaryData {
  financas: string;
  proximoCompromisso: string;
  ultimaIdeia: string;
  chartData: ChartItem[];
}

export default function HomePage() {
  const [data, setData] = useState<SummaryData>({
    financas: "R$ 0,00",
    proximoCompromisso: "Nenhum",
    ultimaIdeia: "Nenhuma",
    chartData: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const userId = localStorage.getItem("user_id");
        const [
          financasResponse,
          compromissosResponse,
          conteudoResponse,
          gamificacaoResponse,
        ] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/financas?userId=${userId}`),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/compromissos?userId=${userId}`,
          ),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/conteudo?userId=${userId}`),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/gamificacao?userId=${userId}`,
          ),
        ]);
        if (
          !financasResponse.ok ||
          !compromissosResponse.ok ||
          !conteudoResponse.ok ||
          !gamificacaoResponse.ok
        ) {
          throw new Error("Erro ao buscar dados do resumo.");
        }

        const financasData: Financa[] = await financasResponse.json();
        const compromissosData: Compromisso[] =
          await compromissosResponse.json();
        const conteudoData: Conteudo[] = await conteudoResponse.json();
        const gamificacaoData: Gamificacao[] = await gamificacaoResponse.json();

        const totalGastos = financasData.reduce(
          (sum, item) => sum + parseFloat(item.valor),
          0,
        );

        const proximoCompromisso =
          compromissosData.length > 0
            ? compromissosData.sort(
                (a, b) =>
                  new Date(a.data).getTime() - new Date(b.data).getTime(),
              )[0].titulo
            : "Nenhum agendado";

        const ultimaIdeia =
          conteudoData.length > 0
            ? conteudoData.sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              )[0].ideia
            : "Nenhuma ideia";

        const chartData: ChartItem[] = [
          { name: "Finanças", uso: financasData.length },
          { name: "Agenda", uso: compromissosData.length },
          { name: "Conteúdo", uso: conteudoData.length },
          { name: "Gamificação", uso: gamificacaoData.length },
        ];

        setData({
          financas: `R$ ${totalGastos.toFixed(2).replace(".", ",")}`,
          proximoCompromisso,
          ultimaIdeia,
          chartData,
        });
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Erro desconhecido ao buscar resumo.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading)
    return (
      <div className="text-center p-6 flex items-center justify-center space-x-2">
        <FaSpinner className="animate-spin" />
        <span>Carregando resumo...</span>
      </div>
    );

  if (error)
    return <div className="text-center p-6 text-red-500">Erro: {error}</div>;

  return (
    <div className="flex flex-col min-h-screen p-4 bg-gray-100">
      <header className="py-4 text-center">
        <div className="p-4 bg-purple-200 rounded-xl shadow-md">
          <h1 className="text-3xl font-bold text-gray-800">Lucy</h1>
          <p className="text-gray-500">Seu painel de controle pessoal</p>
        </div>
      </header>
      <main className="flex-1 p-6 flex flex-col items-center">
        <div className="w-full max-w-6xl space-y-8">
          <MonthSummary data={data} />
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Seu resumo de atividades
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="uso"
                  stroke="#ae43c6"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
