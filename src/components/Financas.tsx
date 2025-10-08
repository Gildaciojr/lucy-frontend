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
  FaChevronDown,
  FaUndo,
} from "react-icons/fa";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
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

interface FinanceCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
}

const FinanceCard: React.FC<FinanceCardProps> = ({
  icon,
  title,
  value,
  color,
}) => (
  <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-md">
    <div className={`p-3 rounded-full text-white ${color}`}>{icon}</div>
    <div>
      <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
      <p className="text-xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const getDateRange = (mode: "today" | "week" | "month") => {
  const now = new Date();
  let from: string;
  let to: string;
  switch (mode) {
    case "today":
      from = to = now.toISOString().split("T")[0];
      break;
    case "week":
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      from = weekAgo.toISOString().split("T")[0];
      to = now.toISOString().split("T")[0];
      break;
    case "month":
      const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      from = startMonth.toISOString().split("T")[0];
      to = now.toISOString().split("T")[0];
      break;
  }
  return { from, to };
};

export default function Financas() {
  const [todasFinancas, setTodasFinancas] = useState<Financa[]>([]);
  const [financasFiltradas, setFinancasFiltradas] = useState<Financa[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFinancas, setLoadingFinancas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // controle do menu de filtro rápido (um aberto por vez)
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // calendário manual
  const [fromManual, setFromManual] = useState<string>("");
  const [toManual, setToManual] = useState<string>("");

  const fetchFinancas = useCallback(async () => {
    try {
      setLoadingFinancas(true);
      const token = localStorage.getItem("auth_token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/financas`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Erro ao buscar finanças.");
      const data: Financa[] = await response.json();
      setTodasFinancas(data);
      setFinancasFiltradas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setLoadingFinancas(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchFinancas().finally(() => setLoading(false));
  }, [fetchFinancas]);

  // ======== Filtros rápidos (Hoje, Semana, Mês) =========
  const handleFilterClick = (
    tipo: "receita" | "despesa" | "all",
    mode: "today" | "week" | "month"
  ) => {
    const { from, to } = getDateRange(mode);
    const fromDate = new Date(from);
    const toDate = new Date(to);

    const filtrados = todasFinancas.filter((f) => {
      const dataItem = new Date(f.data);
      const dentroDoPeriodo = dataItem >= fromDate && dataItem <= toDate;
      const tipoMatch = tipo === "all" ? true : f.tipo === tipo;
      return dentroDoPeriodo && tipoMatch;
    });

    setFinancasFiltradas(filtrados);
    setOpenMenu(null);
    setTimeout(() => {
      document
        .getElementById("lista-financas")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  // ======== Calendário manual =========
  const aplicarFiltroManual = () => {
    if (!fromManual && !toManual) return;
    const fromDate = fromManual ? new Date(fromManual) : new Date("1970-01-01");
    const toDate = toManual ? new Date(toManual) : new Date("2999-12-31");

    const filtrados = todasFinancas.filter((f) => {
      const dataItem = new Date(f.data);
      return dataItem >= fromDate && dataItem <= toDate;
    });

    setFinancasFiltradas(filtrados);
    setTimeout(() => {
      document
        .getElementById("lista-financas")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const limparFiltros = () => {
    setFinancasFiltradas(todasFinancas);
    setOpenMenu(null);
    setFromManual("");
    setToManual("");
    setTimeout(() => {
      document
        .getElementById("lista-financas")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  // Fecha o menu quando clicar fora — permitindo clique dentro do menu
  useEffect(() => {
    const closeMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".filter-button") && !target.closest(".filter-menu")) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  const receitas = todasFinancas.filter((f) => f.tipo === "receita");
  const despesas = todasFinancas.filter((f) => f.tipo === "despesa");

  const totalReceitas = receitas.reduce(
    (sum, f) => sum + Number(f.valor || 0),
    0
  );
  const totalDespesas = despesas.reduce(
    (sum, f) => sum + Number(f.valor || 0),
    0
  );
  const saldo = totalReceitas - totalDespesas;

  const COLORS = ["#6d28d9", "#22c55e", "#facc15", "#ef4444", "#3b82f6", "#9333ea"];

  const aggregatedData = useMemo(() => {
    return todasFinancas.reduce((acc, item) => {
      const key = `${item.categoria} (${item.tipo})`;
      const valor = Number(item.valor || 0);
      const found = acc.find((d) => d.name === key);
      if (found) found.value += valor;
      else acc.push({ name: key, value: valor });
      return acc;
    }, [] as { name: string; value: number }[]);
  }, [todasFinancas]);

  const monthlyChartData = useMemo(() => {
    const m = todasFinancas.reduce((acc, item) => {
      const month = new Date(item.data).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      if (!acc[month]) acc[month] = { receitas: 0, despesas: 0 };
      if (item.tipo === "receita") acc[month].receitas += Number(item.valor || 0);
      else acc[month].despesas += Number(item.valor || 0);
      return acc;
    }, {} as Record<string, { receitas: number; despesas: number }>);
    return Object.keys(m).map((key) => ({
      name: key,
      receitas: m[key].receitas,
      despesas: m[key].despesas,
    }));
  }, [todasFinancas]);

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

      <MonthSummary
        data={{
          totalReceitas,
          totalDespesas,
          saldo,
          proximoCompromisso: "",
          ultimaIdeia: "",
        }}
      />

      {/* 🔥 Filtros rápidos + Calendário manual */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <FaFilter /> Filtros rápidos
        </h3>

        <div className="flex flex-wrap gap-3 justify-center md:justify-between items-center">
          {/* Botões de Hoje / Semana / Mês */}
          <div className="flex flex-wrap gap-3">
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

              return (
                <div key={mode} className="relative">
                  <button
                    onClick={() => setOpenMenu(openMenu === mode ? null : mode)}
                    className="filter-button flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold px-4 py-2 rounded-lg shadow transition"
                    type="button"
                  >
                    {icons[mode]}
                    {labels[mode]}
                    <FaChevronDown
                      className={`transition-transform ${
                        openMenu === mode ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {openMenu === mode && (
                    <div
                      className="filter-menu absolute left-0 mt-2 bg-white border border-purple-100 rounded-lg shadow-md z-10 w-36"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleFilterClick("receita", mode)}
                        className="px-4 py-2 hover:bg-purple-50 text-left w-full"
                        type="button"
                      >
                        Receitas
                      </button>
                      <button
                        onClick={() => handleFilterClick("despesa", mode)}
                        className="px-4 py-2 hover:bg-purple-50 text-left w-full"
                        type="button"
                      >
                        Despesas
                      </button>
                      <button
                        onClick={() => handleFilterClick("all", mode)}
                        className="px-4 py-2 hover:bg-purple-50 text-left w-full"
                        type="button"
                      >
                        Tudo
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Calendário manual (pequeno) */}
          <div className="flex items-end gap-2">
            <div className="flex flex-col">
              <label className="text-xs text-gray-600">De</label>
              <input
                type="date"
                value={fromManual}
                onChange={(e) => setFromManual(e.target.value)}
                className="border rounded-lg px-3 py-2"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-600">Até</label>
              <input
                type="date"
                value={toManual}
                onChange={(e) => setToManual(e.target.value)}
                className="border rounded-lg px-3 py-2"
              />
            </div>
            <button
              onClick={aplicarFiltroManual}
              className="px-3 py-2 rounded-lg bg-blue-600 text-white font-semibold"
              type="button"
            >
              Aplicar
            </button>
            <button
              onClick={limparFiltros}
              className="px-3 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold"
              type="button"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* Form de inclusão de lançamentos (mantido) */}
      <FinancasForm onSave={fetchFinancas} />

      {/* 💰 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 mt-6">
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

      {/* Gráfico — centralizado, sem legendas embaixo (tooltip apenas) */}
      <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center">
        <h3 className="text-xl font-bold text-purple-700 mb-5 text-center tracking-wide">
          Distribuição por Categoria 💰
        </h3>
        <ResponsiveContainer width="90%" height={320}>
          <PieChart>
            <Pie
              data={aggregatedData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              dataKey="value"
              paddingAngle={3}
              isAnimationActive
              labelLine={false}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {aggregatedData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  style={{
                    transform: activeIndex === index ? "scale(1.08)" : "scale(1)",
                    transformOrigin: "center",
                    transition: "transform 0.25s ease-out, filter 0.25s",
                    filter:
                      activeIndex === index
                        ? "drop-shadow(0 0 6px rgba(109,40,217,0.6))"
                        : "none",
                  }}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, _, item) => [
                `R$ ${value.toFixed(2).replace(".", ",")}`,
                item?.payload?.name,
              ]}
              contentStyle={{
                backgroundColor: "white",
                borderRadius: "10px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Lista */}
      <div
        id="lista-financas"
        className="bg-white rounded-xl shadow-md p-6 mt-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Lançamentos Filtrados
          </h3>
          <button
            onClick={limparFiltros}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow transition"
            type="button"
          >
            <FaUndo /> Limpar Filtros
          </button>
        </div>

        {loadingFinancas ? (
          <div className="flex items-center gap-2 text-gray-600">
            <FaSpinner className="animate-spin" /> Carregando…
          </div>
        ) : financasFiltradas.length === 0 ? (
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
                {financasFiltradas
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
                          R{"$ "}
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







