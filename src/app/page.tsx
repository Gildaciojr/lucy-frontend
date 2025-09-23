"use client";

import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
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
import { apiFetch } from "@/lib/api";
import { FaWhatsapp } from "react-icons/fa";

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
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  proximoCompromisso: string;
  ultimaIdeia: string;
  chartData: ChartItem[];
}

export default function HomePage() {
  const [data, setData] = useState<SummaryData>({
    totalReceitas: 0,
    totalDespesas: 0,
    saldo: 0,
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
        const token = localStorage.getItem("auth_token");

        if (!userId || !token) {
          throw new Error("Usuário não autenticado.");
        }

        const headers = { Authorization: `Bearer ${token}` };

        const financasData = (await apiFetch<Financa[]>(
          `/financas?userId=${userId}`,
          { headers }
        )) as Financa[];

        const compromissosData = (await apiFetch<Compromisso[]>(
          `/compromissos?userId=${userId}`,
          { headers }
        )) as Compromisso[];

        const conteudoData = (await apiFetch<Conteudo[]>(
          `/conteudo?userId=${userId}`,
          { headers }
        )) as Conteudo[];

        const gamificacaoData = (await apiFetch<Gamificacao[]>(
          `/gamificacao?userId=${userId}`,
          { headers }
        )) as Gamificacao[];

        let totalReceitas = 0;
        let totalDespesas = 0;

        financasData.forEach((f) => {
          const valor = parseFloat(f.valor);
          if (!Number.isNaN(valor)) {
            if (valor >= 0) totalReceitas += valor;
            else totalDespesas += Math.abs(valor);
          }
        });

        const saldo = totalReceitas - totalDespesas;

        const proximoCompromisso =
          compromissosData.length > 0
            ? compromissosData
                .slice()
                .sort(
                  (a, b) =>
                    new Date(a.data).getTime() - new Date(b.data).getTime()
                )[0].titulo
            : "Nenhum agendado";

        const ultimaIdeia =
          conteudoData.length > 0
            ? conteudoData
                .slice()
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )[0].ideia
            : "Nenhuma ideia";

        const chartData: ChartItem[] = [
          { name: "Finanças", uso: financasData.length },
          { name: "Agenda", uso: compromissosData.length },
          { name: "Conteúdo", uso: conteudoData.length },
          { name: "Gamificação", uso: gamificacaoData.length },
        ];

        setData({
          totalReceitas,
          totalDespesas,
          saldo,
          proximoCompromisso,
          ultimaIdeia,
          chartData,
        });
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Erro desconhecido ao buscar resumo."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading)
    return (
      <div className="text-center p-4 flex items-center justify-center space-x-2">
        <FaSpinner className="animate-spin" />
        <span>Carregando resumo...</span>
      </div>
    );

  if (error)
    return <div className="text-center p-4 text-red-500">Erro: {error}</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 relative">
      <Header />

      <main className="flex-1 p-6 flex flex-col items-center mb-20">
        <div className="w-full max-w-6xl space-y-8">
          <MonthSummary data={data} />

          <div className="flex gap-4 overflow-x-auto snap-x sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible">
            <div className="bg-white rounded-xl shadow-md p-4 min-w-[280px] sm:min-w-0 snap-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Seu resumo de atividades
              </h3>
              <div className="w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height={250}>
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
          </div>
        </div>
      </main>

      <Navigation />

      {/* 🔗 Botão flutuante do WhatsApp */}
      <a
        href="https://wa.me/message/JQ6SLHBNNAAHG1"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-colors"
      >
        <FaWhatsapp className="w-7 h-7" />
      </a>
    </div>
  );
}














