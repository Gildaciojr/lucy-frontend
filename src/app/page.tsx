"use client";

import React, { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import MonthSummary from "../components/MonthSummary";
import { FaSpinner, FaWhatsapp } from "react-icons/fa";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { apiFetch } from "@/lib/api";

interface Financa {
  id: number;
  categoria: string;
  valor: string;
  data: string;
  tipo?: "receita" | "despesa";
}
interface Compromisso {
  id: number;
  titulo: string;
  data: string;
  concluido: boolean;
}
interface Conteudo {
  id: number;
  ideia: string;
  favorito: boolean;
  agendado: boolean;
  createdAt: string;
}
interface Gamificacao {
  id: number;
  badge: string;
  dataConquista: string;
}
interface ChartItem {
  name: string;
  uso: number;
  [key: string]: string | number;
}
interface SummaryData {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  proximoCompromisso: string;
  ultimaIdeia: string;
  chartData: ChartItem[];
  financasRecentes: Financa[];
}

const COLORS = ["#6d28d9", "#22c55e", "#facc15", "#ef4444"];

export default function HomePage() {
  const [data, setData] = useState<SummaryData>({
    totalReceitas: 0,
    totalDespesas: 0,
    saldo: 0,
    proximoCompromisso: "Nenhum",
    ultimaIdeia: "Nenhuma",
    chartData: [],
    financasRecentes: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) throw new Error("Usuário não autenticado.");
        const headers = { Authorization: `Bearer ${token}` };

        const financasData = await apiFetch<Financa[]>("/financas", { headers });
        const compromissosData = await apiFetch<Compromisso[]>("/compromissos", { headers });
        const conteudoData = await apiFetch<Conteudo[]>("/conteudo", { headers });
        const gamificacaoData = await apiFetch<Gamificacao[]>("/gamificacao", { headers });

        let totalReceitas = 0;
        let totalDespesas = 0;

        financasData.forEach((f) => {
          const valor = parseFloat(f.valor);
          if (!Number.isNaN(valor)) {
            if (f.tipo === "despesa" || valor < 0) {
              totalDespesas += Math.abs(valor);
            } else {
              totalReceitas += valor;
            }
          }
        });

        const saldo = totalReceitas - totalDespesas;
        const proximoCompromisso =
          compromissosData.length > 0
            ? compromissosData.slice().sort((a, b) =>
                new Date(a.data).getTime() - new Date(b.data).getTime()
              )[0].titulo
            : "Nenhum agendado";
        const ultimaIdeia =
          conteudoData.length > 0
            ? conteudoData.slice().sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
          financasRecentes: financasData.slice(-5).reverse(),
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro desconhecido ao buscar resumo.");
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

  if (error) return <div className="text-center p-4 text-red-500">Erro: {error}</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 relative">
      {/* 🔹 Header já está no layout.tsx → removido aqui */}

      <main className="flex-1 p-6 flex flex-col mb-20">
        <div className="w-full space-y-8">
          <MonthSummary data={data} />

          {/* Cards de resumo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white shadow rounded-xl p-4 text-center">
              <h4 className="text-sm text-gray-500">Receitas</h4>
              <p className="text-xl font-bold text-green-600">
                R$ {data.totalReceitas.toFixed(2)}
              </p>
            </div>
            <div className="bg-white shadow rounded-xl p-4 text-center">
              <h4 className="text-sm text-gray-500">Despesas</h4>
              <p className="text-xl font-bold text-red-600">
                R$ {data.totalDespesas.toFixed(2)}
              </p>
            </div>
            <div className="bg-white shadow rounded-xl p-4 text-center">
              <h4 className="text-sm text-gray-500">Saldo</h4>
              <p
                className={`text-xl font-bold ${
                  data.saldo >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                R$ {data.saldo.toFixed(2)}
              </p>
            </div>
            <div className="bg-white shadow rounded-xl p-4 text-center">
              <h4 className="text-sm text-gray-500">Próximo Compromisso</h4>
              <p className="text-sm font-semibold text-gray-700">
                {data.proximoCompromisso}
              </p>
            </div>
            <div className="bg-white shadow rounded-xl p-4 text-center">
              <h4 className="text-sm text-gray-500">Última Ideia</h4>
              <p className="text-sm font-semibold text-gray-700">
                {data.ultimaIdeia}
              </p>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Resumo de atividades
              </h3>
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
                    stroke="#6d28d9"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Distribuição por módulo
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.chartData}
                    dataKey="uso"
                    nameKey="name"
                    outerRadius={100}
                    label
                  >
                    {data.chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Últimas movimentações */}
          <div className="bg-white rounded-xl shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Últimas movimentações financeiras
            </h3>
            {data.financasRecentes.length === 0 ? (
              <p className="text-gray-500">Nenhum registro encontrado.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Categoria</th>
                      <th className="px-4 py-2 text-left">Valor</th>
                      <th className="px-4 py-2 text-left">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.financasRecentes.map((f) => (
                      <tr key={f.id}>
                        <td className="px-4 py-2">{f.categoria}</td>
                        <td
                          className={`px-4 py-2 ${
                            parseFloat(f.valor) >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          R$ {parseFloat(f.valor).toFixed(2)}
                        </td>
                        <td className="px-4 py-2">
                          {new Date(f.data).toLocaleDateString("pt-BR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      <Navigation />

      {/* Botão flutuante WhatsApp */}
      <a
        href="https://wa.me/message/JQ6SLHBNNAAHG1"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-6 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-colors z-50"
      >
        <FaWhatsapp className="w-7 h-7" />
      </a>
    </div>
  );
}



















