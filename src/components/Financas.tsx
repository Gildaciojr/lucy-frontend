"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  FaMoneyBillWave,
  FaArrowDown,
  FaBalanceScale,
  FaSpinner,
  FaFilter,
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendarAlt,
} from "react-icons/fa";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import FinancasForm from "./FinancasForm";
import MonthSummary from "./MonthSummary";

type Tipo = "receita" | "despesa";
type Origem = "dashboard" | "whatsapp";

interface Financa {
  id: number;
  categoria: string;
  valor: number | string;
  data: string;
  tipo: Tipo;
  userId: number;
  origem?: Origem;
}

interface Compromisso {
  id: number;
  titulo: string;
  data: string;
  concluido: boolean;
}

interface Ideia {
  id: number;
  ideia: string;
  criadoEm: string;
}

interface FinanceCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
  onClick?: () => void;
  isActive?: boolean;
  clickable?: boolean;
}

const FinanceCard: React.FC<FinanceCardProps> = ({
  icon,
  title,
  value,
  color,
  onClick,
  isActive = false,
  clickable = false,
}) => {
  return (
    <div
      className={`flex items-center space-x-4 p-4 bg-white rounded-xl shadow-md ${
        clickable
          ? "cursor-pointer hover:scale-[1.02] transition-transform"
          : ""
      } ${isActive ? "ring-2 ring-blue-500" : ""}`}
      onClick={onClick}
    >
      <div className={`p-3 rounded-full text-white ${color}`}>{icon}</div>
      <div>
        <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

export default function Financas() {
  const [financas, setFinancas] = useState<Financa[]>([]);
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [ideias, setIdeias] = useState<Ideia[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFinancas, setLoadingFinancas] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tipoFiltro, setTipoFiltro] = useState<"all" | Tipo>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [categoria, setCategoria] = useState<string>("");
  const [origem, setOrigem] = useState<string>("");

  const fetchFinancas = useCallback(async () => {
    try {
      setLoadingFinancas(true);
      const token = localStorage.getItem("auth_token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const qs = new URLSearchParams();
      if (from) qs.set("from", from);
      if (to) qs.set("to", to);
      if (tipoFiltro !== "all") qs.set("tipo", tipoFiltro);
      if (categoria) qs.set("categoria", categoria);
      if (origem) qs.set("origem", origem);

      const url = `${process.env.NEXT_PUBLIC_API_URL}/financas${
        qs.toString() ? `?${qs.toString()}` : ""
      }`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Erro ao buscar finanças.");
      const data: Financa[] = await response.json();
      setFinancas(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setLoadingFinancas(false);
    }
  }, [from, to, tipoFiltro, categoria, origem]);

  const fetchCompromissos = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/compromissos`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) return;
      const data: Compromisso[] = await response.json();
      setCompromissos(data);
    } catch {}
  };

  const fetchIdeias = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/conteudo`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) return;
      const data: Ideia[] = await response.json();
      setIdeias(data);
    } catch {}
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchFinancas(), fetchCompromissos(), fetchIdeias()]);
      setLoading(false);
    };
    loadAll();
  }, [fetchFinancas]);

  const filtrados: Financa[] = useMemo(() => financas, [financas]);

  const receitas = filtrados.filter((f) => f.tipo === "receita");
  const despesas = filtrados.filter((f) => f.tipo === "despesa");
  const totalReceitas = receitas.reduce(
    (sum, f) => sum + Number(f.valor || 0),
    0
  );
  const totalDespesas = despesas.reduce(
    (sum, f) => sum + Number(f.valor || 0),
    0
  );
  const saldo = totalReceitas - totalDespesas;

  const futuro = compromissos
    .filter((c) => new Date(c.data) > new Date() && !c.concluido)
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  const proximoCompromisso = futuro.length
    ? `${futuro[0].titulo} (${new Date(futuro[0].data).toLocaleDateString("pt-BR")})`
    : "Nenhum";

  const ultimaIdeia =
    ideias.length > 0
      ? ideias.sort(
          (a, b) =>
            new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
        )[0].ideia
      : "Nenhuma";

  const resumo = {
    totalReceitas,
    totalDespesas,
    saldo,
    proximoCompromisso,
    ultimaIdeia,
  };

  const COLORS = [
    "#6d28d9",
    "#22c55e",
    "#facc15",
    "#ef4444",
    "#3b82f6",
    "#9333ea",
  ];

  const aggregatedData = useMemo(() => {
    return filtrados.reduce(
      (acc, item) => {
        const key = `${item.categoria} (${item.tipo})`;
        const valor = Number(item.valor || 0);
        const found = acc.find((d) => d.name === key);
        if (found) found.value += valor;
        else acc.push({ name: key, value: valor });
        return acc;
      },
      [] as { name: string; value: number }[]
    );
  }, [filtrados]);

  const monthlyChartData = useMemo(() => {
    const m = filtrados.reduce(
      (acc, item) => {
        const month = new Date(item.data).toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
        if (!acc[month]) acc[month] = { receitas: 0, despesas: 0 };
        if (item.tipo === "receita")
          acc[month].receitas += Number(item.valor || 0);
        else acc[month].despesas += Number(item.valor || 0);
        return acc;
      },
      {} as Record<string, { receitas: number; despesas: number }>
    );
    return Object.keys(m).map((key) => ({
      name: key,
      receitas: m[key].receitas,
      despesas: m[key].despesas,
    }));
  }, [filtrados]);

  if (loading)
    return (
      <div className="flex justify-center items-center p-6 text-purple-600 space-x-2">
        <FaSpinner className="animate-spin" /> <span>Carregando dados...</span>
      </div>
    );

  if (error)
    return (
      <div className="text-center p-6 text-red-500 font-semibold">
        Erro: {error}
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Controle Financeiro
      </h2>

      {/* Resumo do mês */}
      <MonthSummary data={resumo} />

      {/* 🔥 Filtros rápidos */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <FaFilter /> Filtros rápidos
        </h3>

        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
          {(["today", "week", "month"] as const).map((mode) => {
            const icons: Record<string, React.ReactNode> = {
              today: <FaCalendarDay />,
              week: <FaCalendarWeek />,
              month: <FaCalendarAlt />,
            };

            const labels: Record<string, string> = {
              today: "Hoje",
              week: "Semana",
              month: "Mês",
            };

            const handleClick = (tipo: "receita" | "despesa" | "all") => {
              const now = new Date();
              let fromDate = "";
              let toDate = "";

              if (mode === "today") {
                fromDate = toDate = now.toISOString().slice(0, 10);
              } else if (mode === "week") {
                const weekAgo = new Date();
                weekAgo.setDate(now.getDate() - 7);
                fromDate = weekAgo.toISOString().slice(0, 10);
                toDate = now.toISOString().slice(0, 10);
              } else if (mode === "month") {
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                fromDate = firstDay.toISOString().slice(0, 10);
                toDate = now.toISOString().slice(0, 10);
              }

              setFrom(fromDate);
              setTo(toDate);
              setTipoFiltro(tipo === "all" ? "all" : tipo);
              void fetchFinancas();
            };

            return (
              <div key={mode} className="relative group">
                <button className="flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold px-4 py-2 rounded-lg shadow transition">
                  {icons[mode]}
                  {labels[mode]}
                </button>

                {/* Menu flutuante */}
                <div className="absolute hidden group-hover:flex flex-col mt-2 bg-white border border-purple-100 rounded-lg shadow-md z-10 w-36">
                  <button
                    onClick={() => handleClick("receita")}
                    className="px-4 py-2 hover:bg-purple-50 text-left"
                  >
                    Receitas
                  </button>
                  <button
                    onClick={() => handleClick("despesa")}
                    className="px-4 py-2 hover:bg-purple-50 text-left"
                  >
                    Despesas
                  </button>
                  <button
                    onClick={() => handleClick("all")}
                    className="px-4 py-2 hover:bg-purple-50 text-left"
                  >
                    Tudo
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <FinanceCard
          icon={<FaMoneyBillWave />}
          title="Total Receitas"
          value={`R$ ${totalReceitas.toFixed(2).replace(".", ",")}`}
          color="bg-green-500"
        />
        <FinanceCard
          icon={<FaArrowDown />}
          title="Total Despesas"
          value={`R$ ${totalDespesas.toFixed(2).replace(".", ",")}`}
          color="bg-red-500"
        />
        <FinanceCard
          icon={<FaBalanceScale />}
          title="Saldo"
          value={`R$ ${saldo.toFixed(2).replace(".", ",")}`}
          color={saldo >= 0 ? "bg-blue-500" : "bg-orange-500"}
        />
      </div>

      <FinancasForm onSave={fetchFinancas} />

      {/* 📊 Distribuição por Categoria */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 overflow-hidden">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
          Distribuição por Categoria
        </h3>
        {loadingFinancas ? (
          <div className="flex items-center gap-2 text-gray-600">
            <FaSpinner className="animate-spin" /> Carregando…
          </div>
        ) : aggregatedData.length === 0 ? (
          <p className="text-gray-500">Nenhum dado disponível.</p>
        ) : (
          <div className="flex justify-center items-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={aggregatedData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  labelLine={false}
 label={(props) => {
  const name = props.name ?? "Categoria";
  const percent = typeof props.percent === "number" ? props.percent : 0;
  return `${name} (${(percent * 100).toFixed(0)}%)`;
}}


                >
                  {aggregatedData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 📈 Evolução Mensal */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Evolução Mensal
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyChartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="receitas" fill="#4CAF50" name="Receitas" />
            <Bar dataKey="despesas" fill="#F44336" name="Despesas" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Lançamentos Filtrados
        </h3>
        {loadingFinancas ? (
          <div className="flex items-center gap-2 text-gray-600">
            <FaSpinner className="animate-spin" /> Carregando…
          </div>
        ) : filtrados.length === 0 ? (
          <div className="text-gray-600">Nenhum lançamento encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">
                    Data
                  </th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">
                    Categoria
                  </th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">
                    Tipo
                  </th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">
                    Origem
                  </th>
                  <th className="text-right px-4 py-3 text-gray-600 font-semibold">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtrados
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(b.data).getTime() - new Date(a.data).getTime()
                  )
                  .map((i) => {
                    const valorNum = Number(i.valor || 0);
                    return (
                      <tr key={`${i.id}-${i.data}`} className="border-t">
                        <td className="px-4 py-3">
                          {new Date(i.data).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-4 py-3">{i.categoria || "-"}</td>
                        <td className="px-4 py-3 capitalize">
                          {i.tipo === "receita" ? (
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded">
                              Receita
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-1 bg-red-100 text-red-700 rounded">
                              Despesa
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 capitalize">
                          {i.origem === "whatsapp" ? (
                            <span className="inline-block px-2 py-1 bg-emerald-50 text-emerald-700 rounded">
                              WhatsApp
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-1 bg-slate-100 text-slate-700 rounded">
                              Dashboard
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          R${" "}
                          {Number.isNaN(valorNum)
                            ? "-"
                            : valorNum.toFixed(2).replace(".", ",")}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

