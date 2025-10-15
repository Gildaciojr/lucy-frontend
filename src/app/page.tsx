"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Navigation from "../components/Navigation";
import { FaSpinner, FaWhatsapp, FaTrophy } from "react-icons/fa";
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

/** Tipagens */
interface FinanceItem {
  id: number;
  categoria: string;
  valor: number | string;
  data: string;
  tipo: "receita" | "despesa";
  origem: "dashboard" | "whatsapp";
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
interface GamificacaoSummary {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  unlockedCount: number;
  message?: string;
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
  financasRecentes: FinanceItem[];
}
type TipoFilter = "all" | "receita" | "despesa";

const COLORS = ["#6d28d9", "#22c55e", "#facc15", "#ef4444"];

export default function HomePage() {
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [tipoFilter, setTipoFilter] = useState<TipoFilter>("all");
  const [financasRaw, setFinancasRaw] = useState<FinanceItem[]>([]);
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [conteudo, setConteudo] = useState<Conteudo[]>([]);
  const [gamificacao, setGamificacao] = useState<GamificacaoSummary | null>(null);
  const [summary, setSummary] = useState<SummaryData>({
    totalReceitas: 0,
    totalDespesas: 0,
    saldo: 0,
    proximoCompromisso: "Nenhum",
    ultimaIdeia: "Nenhuma",
    chartData: [],
    financasRecentes: [],
  });
  const [loading, setLoading] = useState(true);
  const [loadingFinancas, setLoadingFinancas] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseValor = (v: number | string) => (Number.isNaN(Number(v)) ? 0 : Number(v));

  const buildFinancasUrl = useCallback(() => {
    const qs = new URLSearchParams();
    if (from) qs.set("from", from);
    if (to) qs.set("to", to);
    return `/financas${qs.toString() ? `?${qs.toString()}` : ""}`;
  }, [from, to]);

  const filterByTipo = useCallback(
    (items: FinanceItem[]): FinanceItem[] =>
      tipoFilter === "all" ? items : items.filter((f) => f.tipo === tipoFilter),
    [tipoFilter]
  );

  const recomputeSummary = useCallback(
    (financasBase: FinanceItem[], compromissosData: Compromisso[], conteudoData: Conteudo[]) => {
      const financas = filterByTipo(financasBase);
      let totalReceitas = 0;
      let totalDespesas = 0;
      financas.forEach((f) => {
        const valorNum = parseValor(f.valor);
        if (f.tipo === "despesa") totalDespesas += Math.abs(valorNum);
        else totalReceitas += Math.abs(valorNum);
      });
      const saldo = totalReceitas - totalDespesas;
      const proximoCompromisso =
        compromissosData.length > 0
          ? compromissosData.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())[0].titulo
          : "Nenhum agendado";
      const ultimaIdeia =
        conteudoData.length > 0
          ? conteudoData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].ideia
          : "Nenhuma ideia";
      const chartData: ChartItem[] = [
        { name: "Finanças", uso: financas.length },
        { name: "Agenda", uso: compromissosData.length },
        { name: "Conteúdo", uso: conteudoData.length },
      ];
      const financasRecentes = financas
        .slice()
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
        .slice(0, 5);
      setSummary({
        totalReceitas,
        totalDespesas,
        saldo,
        proximoCompromisso,
        ultimaIdeia,
        chartData,
        financasRecentes,
      });
    },
    [filterByTipo]
  );

  const loadStaticModules = useCallback(async (headers: Record<string, string>) => {
    const [comp, cont, gam] = await Promise.all([
      apiFetch<Compromisso[]>("/compromissos", { headers }),
      apiFetch<Conteudo[]>("/conteudo", { headers }),
      apiFetch<GamificacaoSummary>("/gamificacao", { headers }),
    ]);
    setCompromissos(comp);
    setConteudo(cont);
    setGamificacao(gam);
    return { comp, cont, gam };
  }, []);

  const loadFinancas = useCallback(
    async (headers: Record<string, string>) => {
      setLoadingFinancas(true);
      try {
        const url = buildFinancasUrl();
        const financasData = await apiFetch<FinanceItem[]>(url, { headers });
        setFinancasRaw(financasData);
        return financasData;
      } finally {
        setLoadingFinancas(false);
      }
    },
    [buildFinancasUrl]
  );

  const initialLoad = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("Usuário não autenticado.");
      const headers = { Authorization: `Bearer ${token}` };
      const [{ comp, cont, gam }, financasData] = await Promise.all([
        loadStaticModules(headers),
        loadFinancas(headers),
      ]);
      setGamificacao(gam);
      recomputeSummary(financasData, comp, cont);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao carregar o resumo.");
    } finally {
      setLoading(false);
    }
  }, [loadStaticModules, loadFinancas, recomputeSummary]);

  useEffect(() => {
    initialLoad();
  }, [initialLoad]);

  useEffect(() => {
    recomputeSummary(financasRaw, compromissos, conteudo);
  }, [tipoFilter, financasRaw, compromissos, conteudo, recomputeSummary]);

  const onApplyPeriod = async () => {
    try {
      setError(null);
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("Usuário não autenticado.");
      const headers = { Authorization: `Bearer ${token}` };
      const financasData = await loadFinancas(headers);
      recomputeSummary(financasData, compromissos, conteudo);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao aplicar período.");
    }
  };

  const onClearFilters = () => {
    setFrom("");
    setTo("");
    setTipoFilter("all");
    initialLoad();
  };

  const toggleTipo = (t: Exclude<TipoFilter, "all">) =>
    setTipoFilter((prev) => (prev === t ? "all" : t));

  if (loading)
    return (
      <div className="text-center p-4 flex items-center justify-center space-x-2">
        <FaSpinner className="animate-spin" />
        <span>Carregando resumo...</span>
      </div>
    );

  if (error) return <div className="text-center p-4 text-red-500">Erro: {error}</div>;

  const totalConquistas = gamificacao?.unlockedCount ?? 0;
  const legendaConquistas =
    totalConquistas === 0
      ? "Sem conquistas ainda"
      : totalConquistas === 1
      ? "1 conquista"
      : `${totalConquistas} conquistas`;

  const dataHoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const dataFinalMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toLocaleDateString("pt-BR");

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 relative">
      <main className="flex-1 p-4 sm:p-6 flex flex-col mb-20 space-y-6">
        {/* Cards principais com animação */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {[
            {
              label: "Receitas",
              value: `R$ ${summary.totalReceitas.toFixed(2)}`,
              color: "green",
              active: tipoFilter === "receita",
              action: () => toggleTipo("receita"),
            },
            {
              label: "Despesas",
              value: `R$ ${summary.totalDespesas.toFixed(2)}`,
              color: "red",
              active: tipoFilter === "despesa",
              action: () => toggleTipo("despesa"),
            },
            {
              label: "Saldo",
              value: `R$ ${summary.saldo.toFixed(2)}`,
              color: summary.saldo >= 0 ? "blue" : "orange",
            },
            {
              label: "Próximo Compromisso",
              value: summary.proximoCompromisso,
              color: "purple",
            },
            {
              label: "Última Ideia",
              value: summary.ultimaIdeia,
              color: "pink",
            },
          ].map((card) => (
            <button
              key={card.label}
              onClick={card.action}
              className={`group relative rounded-xl bg-white shadow-md hover:shadow-lg transform transition-all duration-500 hover:-translate-y-1 hover:scale-[1.04] ${
                card.active ? `ring-2 ring-${card.color}-400` : ""
              }`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br from-${card.color}-100 via-white to-${card.color}-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl`}
              />
              <div className="relative z-10 p-3 sm:p-4 text-center">
                <h4 className="text-[0.7rem] sm:text-xs font-semibold text-gray-500">
                  {card.label}
                </h4>
                <p
                  className={`text-base sm:text-lg font-bold mt-1 text-${card.color}-600 group-hover:text-${card.color}-700 transition-colors duration-300`}
                >
                  {card.value}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Barra de filtros */}
        <div className="bg-white rounded-xl shadow-md p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="text-sm text-gray-700 font-medium">
              📅 {dataHoje}
            </div>
            <div className="text-sm text-gray-500">
              Até {dataFinalMes}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="text-xs text-gray-600">Início</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Fim</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={onApplyPeriod}
              disabled={loadingFinancas}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold disabled:opacity-50 hover:bg-indigo-700 transition-colors"
            >
              {loadingFinancas ? "Carregando..." : "Pesquisar"}
            </button>
            <button
              onClick={onClearFilters}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 text-sm font-semibold hover:bg-gray-300"
            >
              Limpar
            </button>
          </div>
        </div>

        {/* Card de Gamificação */}
        <Link
          href="/gamificacao"
          className="group block rounded-xl shadow-md p-5 text-white hover:shadow-lg transition-shadow bg-gradient-to-r from-purple-600 via-fuchsia-600 to-amber-500"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-white/10">
              <FaTrophy className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-bold">Gamificação</h3>
              <p className="text-xs sm:text-sm opacity-90">
                {legendaConquistas} • Toque para ver suas metas e conquistas
              </p>
            </div>
            <div className="text-xs sm:text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
              Ver página
            </div>
          </div>
        </Link>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Resumo de atividades
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={summary.chartData}>
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
              Áreas da Lucy que você mais aproveita 💜
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={summary.chartData}
                  dataKey="uso"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {summary.chartData.map((_, i) => (
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
          {summary.financasRecentes.length === 0 ? (
            <p className="text-gray-500">Nenhum registro encontrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Categoria</th>
                    <th className="px-4 py-2 text-left">Valor</th>
                    <th className="px-4 py-2 text-left">Data</th>
                    <th className="px-4 py-2 text-left">Origem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {summary.financasRecentes.map((f) => {
                    const valorNum = parseValor(f.valor);
                    return (
                      <tr key={`${f.origem}-${f.id}`}>
                        <td className="px-4 py-2">{f.categoria}</td>
                        <td
                          className={`px-4 py-2 ${
                            f.tipo === "despesa"
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          R$ {Number.isNaN(valorNum) ? "-" : valorNum.toFixed(2)}
                        </td>
                        <td className="px-4 py-2">
                          {new Date(f.data).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-4 py-2">
                          {f.origem === "whatsapp" ? "WhatsApp" : "Dashboard"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
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




























