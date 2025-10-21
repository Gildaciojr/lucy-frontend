"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  Ref,
  useRef,
} from "react";
import Link from "next/link";
import Navigation from "../components/Navigation";
import {
  FaSpinner,
  FaWhatsapp,
  FaTrophy,
  FaCalendarAlt,
  FaCheckCircle,
  FaArrowDown,
  FaMoneyBillWave,
  FaBalanceScale,
} from "react-icons/fa";
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
import ReactDatePicker, { registerLocale } from "react-datepicker";
import { ptBR as dfnsPtBR } from "date-fns/locale";
import Calendar from "react-calendar";
import "react-datepicker/dist/react-datepicker.css";
import "react-calendar/dist/Calendar.css";

registerLocale("pt-BR", dfnsPtBR);

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

const pad2 = (n: number) => String(n).padStart(2, "0");
const formatShortPtBR = (d: Date) =>
  d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const endOfCurrentMonth = () =>
  new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

const DatePill = forwardRef(
  (
    {
      label,
      value,
      onClick,
      title,
    }: { label?: string; value: string; onClick?: () => void; title?: string },
    ref: Ref<HTMLButtonElement>
  ) => (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      title={title}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium shadow-sm transition-colors"
    >
      <FaCalendarAlt className="text-indigo-600" />
      {label && <span>{label}</span>}
      <span>{value}</span>
    </button>
  )
);
DatePill.displayName = "DatePill";

export default function HomePage() {
  const [tipoFilter, setTipoFilter] = useState<TipoFilter>("all");
  const [financasRaw, setFinancasRaw] = useState<FinanceItem[]>([]);
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [conteudo, setConteudo] = useState<Conteudo[]>([]);
  const [gamificacao, setGamificacao] = useState<GamificacaoSummary | null>(
    null
  );
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
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const initialLoadedRef = useRef(false);

  const parseValor = (v: number | string) =>
    Number.isNaN(Number(v)) ? 0 : Number(v);

  const buildFinancasUrl = useCallback(() => {
    const qs = new URLSearchParams();
    const normalizeDate = (d: Date, isEnd = false) => {
      const local = new Date(d);
      local.setHours(
        isEnd ? 23 : 0,
        isEnd ? 59 : 0,
        isEnd ? 59 : 0,
        isEnd ? 999 : 0
      );
      return local.toISOString().split("T")[0];
    };
    if (fromDate) qs.set("from", normalizeDate(fromDate));
    if (toDate) qs.set("to", normalizeDate(toDate, true));
    return `/financas${qs.toString() ? `?${qs.toString()}` : ""}`;
  }, [fromDate, toDate]);

  const filterByTipo = useCallback(
    (items: FinanceItem[]): FinanceItem[] =>
      tipoFilter === "all" ? items : items.filter((f) => f.tipo === tipoFilter),
    [tipoFilter]
  );

  const recomputeSummary = useCallback(
    (
      financasBase: FinanceItem[],
      compromissosData: Compromisso[],
      conteudoData: Conteudo[]
    ) => {
      const financas = filterByTipo(financasBase);
      const totalReceitas = financas
        .filter((f) => f.tipo === "receita")
        .reduce((sum, f) => sum + parseValor(f.valor), 0);
      const totalDespesas = financas
        .filter((f) => f.tipo === "despesa")
        .reduce((sum, f) => sum + parseValor(f.valor), 0);
      const saldo = totalReceitas - totalDespesas;

      const proximoCompromisso =
        compromissosData.length > 0
          ? compromissosData.sort(
              (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
            )[0].titulo
          : "Nenhum agendado";

      const ultimaIdeia =
        conteudoData.length > 0
          ? conteudoData.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )[0].ideia
          : "Nenhuma ideia";

      const chartData = [
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

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("Usuário não autenticado.");
      const headers = { Authorization: `Bearer ${token}` };
      const [financasData, compromissosData, conteudoData, gamificacaoData] =
        await Promise.all([
          apiFetch<FinanceItem[]>(buildFinancasUrl(), { headers }),
          apiFetch<Compromisso[]>("/compromissos", { headers }),
          apiFetch<Conteudo[]>("/conteudo", { headers }),
          apiFetch<GamificacaoSummary>("/gamificacao", { headers }),
        ]);

      setFinancasRaw(financasData);
      setCompromissos(compromissosData);
      setConteudo(conteudoData);
      setGamificacao(gamificacaoData);
      recomputeSummary(financasData, compromissosData, conteudoData);
      initialLoadedRef.current = true;
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  }, [buildFinancasUrl, recomputeSummary]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (initialLoadedRef.current) loadData();
  }, [fromDate, toDate, tipoFilter, loadData]);

  const compromissosDoDia = compromissos.filter(
    (c) => new Date(c.data).toDateString() === selectedDate.toDateString()
  );

  const toggleTipo = (t: Exclude<TipoFilter, "all">) =>
    setTipoFilter((prev) => (prev === t ? "all" : t));

  if (loading)
    return (
      <div className="text-center p-4 flex items-center justify-center space-x-2">
        <FaSpinner className="animate-spin" />
        <span>Carregando resumo...</span>
      </div>
    );

  const totalConquistas = gamificacao?.unlockedCount ?? 0;
  const legendaConquistas =
    totalConquistas === 0
      ? "Sem conquistas ainda"
      : `${totalConquistas} conquistas`;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 relative">
      <main className="flex-1 p-4 sm:p-6 flex flex-col mb-20 space-y-6">
        {/* 💰 Cards com gráficos pequenos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {[
            {
              label: "Receitas",
              value: summary.totalReceitas,
              color: "green",
              icon: <FaMoneyBillWave />,
              tipo: "receita",
            },
            {
              label: "Despesas",
              value: summary.totalDespesas,
              color: "red",
              icon: <FaArrowDown />,
              tipo: "despesa",
            },
            {
              label: "Saldo",
              value: summary.saldo,
              color: summary.saldo >= 0 ? "blue" : "orange",
              icon: <FaBalanceScale />,
            },
          ].map((c) => (
            <button
              key={c.label}
              onClick={() =>
                c.tipo && toggleTipo(c.tipo as Exclude<TipoFilter, "all">)
              }
              className={`group relative rounded-xl bg-white shadow-sm hover:shadow-md p-3 sm:p-4 transition-all ${
                tipoFilter === c.tipo ? `ring-2 ring-${c.color}-400` : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-full bg-${c.color}-100 text-${c.color}-600`}
                >
                  {c.icon}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-600">
                    {c.label}
                  </h4>
                  <p className={`text-lg font-bold text-${c.color}-700`}>
                    R$ {c.value.toFixed(2).replace(".", ",")}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* 🔹 Filtros de data */}
        <div className="bg-white rounded-xl shadow-md p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-base sm:text-lg font-semibold text-lucy flex items-center gap-2">
            <FaCalendarAlt className="text-lucy" />
            Filtro
          </h3>
          <div className="flex flex-wrap gap-3 items-center justify-center sm:justify-start">
            <ReactDatePicker
              selected={fromDate ?? new Date()}
              onChange={(date) => setFromDate(date ?? new Date())}
              selectsStart
              startDate={fromDate ?? new Date()}
              endDate={toDate ?? undefined}
              locale="pt-BR"
              dateFormat="dd/MM/yyyy"
              customInput={
                <DatePill value={formatShortPtBR(fromDate ?? new Date())} />
              }
            />
            <ReactDatePicker
              selected={toDate}
              onChange={(date) => setToDate(date)}
              selectsEnd
              startDate={fromDate ?? new Date()}
              endDate={toDate ?? undefined}
              minDate={fromDate ?? undefined}
              locale="pt-BR"
              dateFormat="dd/MM/yyyy"
              customInput={
                <DatePill
                  label="Até"
                  value={
                    toDate
                      ? formatShortPtBR(toDate)
                      : formatShortPtBR(endOfCurrentMonth())
                  }
                />
              }
            />
            <button
              onClick={() => {
                setFromDate(null);
                setToDate(null);
                setTipoFilter("all");
                loadData();
              }}
              className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
            >
              Limpar
            </button>
          </div>
        </div>

        {/* 🏆 Gamificação */}
        <Link
          href="/gamificacao"
          className="group block rounded-xl shadow-md p-5 text-white hover:shadow-lg transition-shadow bg-gradient-to-r from-lucy via-lucy to-amber-500"
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
          </div>
        </Link>

        {/* 📊 Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Resumo de Atividades
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={summary.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="uso" stroke="#6d28d9" />
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
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 📋 Últimas movimentações */}
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
                      <tr key={`${f.id}-${f.data}`}>
                        <td className="px-4 py-2">{f.categoria}</td>
                        <td
                          className={`px-4 py-2 ${
                            f.tipo === "despesa"
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          R$ {valorNum.toFixed(2).replace(".", ",")}
                        </td>
                        <td className="px-4 py-2">
                          {new Date(f.data).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-4 py-2 capitalize">
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

        {/* 🟣 CARD MODERNO “SUA AGENDA” */}
        <div className="bg-white rounded-2xl shadow-md border border-purple-100 p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-lucy mb-3 flex items-center gap-2">
            <FaCalendarAlt className="text-lucy" />
            Sua Agenda
          </h3>
          <div className="flex flex-col lg:flex-row gap-4 items-start">
            <div className="w-full flex justify-center">
              <div className="w-full max-w-sm sm:max-w-md bg-white border border-purple-100 rounded-xl p-2 sm:p-3 shadow-sm">
                <Calendar
                  onChange={(value) => setSelectedDate(value as Date)}
                  value={selectedDate}
                  locale="pt-BR"
                  className="w-full rounded-xl border-0 text-sm sm:text-base"
                  tileContent={({ date }) => {
                    const compromissosDoDia = compromissos.filter(
                      (c) =>
                        new Date(c.data).toDateString() === date.toDateString()
                    );
                    if (compromissosDoDia.length > 0) {
                      return (
                        <div className="flex justify-center mt-1">
                          <div className="w-2 h-2 rounded-full bg-lucy" />
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </div>
            </div>

            <div className="flex-1 w-full bg-purple-50 p-4 rounded-xl text-lucy">
              <h4 className="font-semibold mb-2 text-center sm:text-left">
                {selectedDate.toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                })}
              </h4>
              {compromissosDoDia.length === 0 ? (
                <p className="text-sm text-gray-500 text-center sm:text-left">
                  Nenhum compromisso neste dia.
                </p>
              ) : (
                <ul className="space-y-2">
                  {compromissosDoDia.map((c) => (
                    <li
                      key={c.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between bg-white px-3 py-2 rounded-lg shadow-sm border ${
                        c.concluido
                          ? "border-green-200 text-green-700"
                          : "border-purple-200 text-lucy"
                      }`}
                    >
                      <span className="truncate">{c.titulo}</span>
                      {c.concluido ? (
                        <span className="text-xs text-green-600 font-semibold mt-1 sm:mt-0">
                          <FaCheckCircle className="inline mr-1" />
                          Concluído
                        </span>
                      ) : (
                        <span className="text-xs text-lucy font-semibold mt-1 sm:mt-0">
                          Pendente
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>

      <Navigation />

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
