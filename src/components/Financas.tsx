"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  FaChartPie,
  FaMoneyBillWave,
  FaArrowUp,
  FaArrowDown,
  FaBalanceScale,
  FaSpinner,
  FaChevronLeft,
  FaFilter,
  FaTimes,
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
  valor: number | string; // backend geralmente já manda number, mas protegemos
  data: string; // ISO
  tipo: Tipo;
  userId: number;
  origem?: Origem; // opcional no front antigo
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
        clickable ? "cursor-pointer hover:scale-[1.02] transition-transform" : ""
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

  // 🎯 novo: filtro por tipo via clique nos cards
  const [tipoFiltro, setTipoFiltro] = useState<"all" | Tipo>("all");
  // 🎯 novo: filtros de período (enviados ao backend como querystring)
  const [from, setFrom] = useState<string>(""); // yyyy-mm-dd
  const [to, setTo] = useState<string>(""); // yyyy-mm-dd

  // view de detalhes antiga — mantida para “Maior Receita/Despesa”
  const [viewDetails, setViewDetails] = useState<null | "all" | "maiorReceita" | "maiorDespesa">(null);

  // ======= BUSCAS =======

  const fetchFinancas = async () => {
    try {
      setLoadingFinancas(true);
      const token = localStorage.getItem("auth_token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const qs: string[] = [];
      if (from) qs.push(`from=${encodeURIComponent(from)}`);
      if (to) qs.push(`to=${encodeURIComponent(to)}`);
      const query = qs.length ? `?${qs.join("&")}` : "";

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/financas${query}`, {
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
  };

  const fetchCompromissos = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/compromissos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      const data: Compromisso[] = await response.json();
      setCompromissos(data);
    } catch {}
  };

  const fetchIdeias = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/conteudo`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
  }, []);

  // ======= DERIVADOS / CÁLCULOS =======

  // aplica filtro de tipo (client-side)
  const filtrados: Financa[] = useMemo(() => {
    if (tipoFiltro === "all") return financas;
    return financas.filter((f) => f.tipo === tipoFiltro);
  }, [financas, tipoFiltro]);

  // totais (sempre com base no conjunto exibido — respeita tipoFiltro)
  const receitas = filtrados.filter((f) => f.tipo === "receita");
  const despesas = filtrados.filter((f) => f.tipo === "despesa");

  const totalReceitas = receitas.reduce((sum, f) => sum + Number(f.valor || 0), 0);
  const totalDespesas = despesas.reduce((sum, f) => sum + Number(f.valor || 0), 0);
  const saldo = totalReceitas - totalDespesas;

  const maiorReceita = receitas.length ? Math.max(...receitas.map((f) => Number(f.valor || 0))) : 0;
  const maiorDespesa = despesas.length ? Math.max(...despesas.map((f) => Number(f.valor || 0))) : 0;

  const futuro = compromissos
    .filter((c) => new Date(c.data) > new Date() && !c.concluido)
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  const proximoCompromisso = futuro.length
    ? `${futuro[0].titulo} (${new Date(futuro[0].data).toLocaleDateString("pt-BR")})`
    : "Nenhum";

  const ultimaIdeia =
    ideias.length > 0
      ? ideias.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())[0].ideia
      : "Nenhuma";

  const resumo = {
    totalReceitas,
    totalDespesas,
    saldo,
    proximoCompromisso,
    ultimaIdeia,
  };

  // Pizza por categoria (respeita tipoFiltro)
  const aggregatedData = useMemo(() => {
    return filtrados.reduce((acc, item) => {
      const key = `${item.categoria} (${item.tipo})`;
      const valor = Number(item.valor || 0);
      const found = acc.find((d) => d.name === key);
      if (found) found.value += valor;
      else acc.push({ name: key, value: valor });
      return acc;
    }, [] as { name: string; value: number }[]);
  }, [filtrados]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF5733"];

  // Barras por mês (respeita tipoFiltro)
  const monthlyChartData = useMemo(() => {
    const m = filtrados.reduce((acc, item) => {
      const month = new Date(item.data).toLocaleString("default", { month: "short", year: "numeric" });
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
  }, [filtrados]);

  // ======= UI AUX =======

  const toggleFiltroTipo = (t: Tipo) => {
    setTipoFiltro((prev) => (prev === t ? "all" : t));
  };

  const aplicarPeriodo = async () => {
    await fetchFinancas(); // usa from/to do estado
  };

  const limparFiltros = async () => {
    setFrom("");
    setTo("");
    setTipoFiltro("all");
    await fetchFinancas(); // recarrega sem período
  };

  // ======= RENDER =======

  if (loading) {
    return (
      <div className="text-center p-6 flex items-center justify-center space-x-2">
        <FaSpinner className="animate-spin" />
        <span>Carregando dados...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-6 text-red-500">{error}</div>;
  }

  // detalhes antigos (maior receita/despesa)
  const renderDetails = () => {
    let title = "";
    let list: Financa[] = [];

    if (viewDetails === "all") {
      title = "Todos os Registros (após filtros)";
      list = filtrados;
    } else if (viewDetails === "maiorReceita") {
      title = "Maior Receita";
      list = receitas.filter((f) => Number(f.valor || 0) === maiorReceita);
    } else if (viewDetails === "maiorDespesa") {
      title = "Maior Despesa";
      list = despesas.filter((f) => Number(f.valor || 0) === maiorDespesa);
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
              <p className="font-semibold text-gray-700">Categoria: {item.categoria}</p>
              <p className="text-sm text-gray-500">Tipo: {item.tipo === "receita" ? "Receita" : "Despesa"}</p>
              <p className="text-sm text-gray-500">
                Valor: R$ {Number(item.valor || 0).toFixed(2).replace(".", ",")}
              </p>
              <p className="text-sm text-gray-500">
                Data: {new Date(item.data).toLocaleDateString("pt-BR")}
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Controle Financeiro</h2>

      {/* Resumo do Mês (agora já respeita tipoFiltro nos totais) */}
      <div className="mb-8">
        <MonthSummary data={{ totalReceitas, totalDespesas, saldo, proximoCompromisso, ultimaIdeia }} />
      </div>

      {/* 🔎 Filtros */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl shadow p-4">
          <label className="block text-xs text-gray-600 mb-1">Data inicial</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full p-2 rounded-lg border border-gray-300"
          />
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <label className="block text-xs text-gray-600 mb-1">Data final</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full p-2 rounded-lg border border-gray-300"
          />
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex items-end">
          <button
            onClick={aplicarPeriodo}
            className="w-full p-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <FaFilter /> Aplicar período
          </button>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex items-end md:col-span-2">
          <button
            onClick={limparFiltros}
            className="w-full p-3 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
          >
            <FaTimes /> Limpar filtros
          </button>
        </div>
      </div>

      {/* Cards (Receitas/Despesas agora são clicáveis para filtrar) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <FinanceCard
          icon={<FaMoneyBillWave />}
          title="Total Receitas"
          value={`R$ ${totalReceitas.toFixed(2).replace(".", ",")}`}
          color="bg-green-500"
          clickable
          isActive={tipoFiltro === "receita"}
          onClick={() => toggleFiltroTipo("receita")}
        />
        <FinanceCard
          icon={<FaArrowDown />}
          title="Total Despesas"
          value={`R$ ${totalDespesas.toFixed(2).replace(".", ",")}`}
          color="bg-red-500"
          clickable
          isActive={tipoFiltro === "despesa"}
          onClick={() => toggleFiltroTipo("despesa")}
        />
        <FinanceCard
          icon={<FaBalanceScale />}
          title="Saldo"
          value={`R$ ${saldo.toFixed(2).replace(".", ",")}`}
          color={saldo >= 0 ? "bg-blue-500" : "bg-orange-500"}
        />
        <FinanceCard
          icon={<FaArrowUp />}
          title="Maior Receita"
          value={`R$ ${maiorReceita.toFixed(2).replace(".", ",")}`}
          color="bg-teal-500"
          onClick={() => setViewDetails("maiorReceita")}
          isActive={viewDetails === "maiorReceita"}
        />
        <FinanceCard
          icon={<FaArrowDown />}
          title="Maior Despesa"
          value={`R$ ${maiorDespesa.toFixed(2).replace(".", ",")}`}
          color="bg-purple-500"
          onClick={() => setViewDetails("maiorDespesa")}
          isActive={viewDetails === "maiorDespesa"}
        />
        <FinanceCard
          icon={<FaChartPie />}
          title="Registros (após filtros)"
          value={filtrados.length.toString()}
          color="bg-gray-600"
          onClick={() => setViewDetails("all")}
          isActive={viewDetails === "all"}
          clickable
        />
      </div>

      {/* Formulário para lançamento manual */}
      <div className="mt-8">
        <FinancasForm onSave={fetchFinancas} />
      </div>

      {/* Gráfico de Pizza (respeita tipoFiltro) */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribuição por Categoria</h3>
        {loadingFinancas ? (
          <div className="flex items-center gap-2 text-gray-600">
            <FaSpinner className="animate-spin" /> Carregando…
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={aggregatedData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value">
                {aggregatedData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Gráfico de Barras (respeita tipoFiltro) */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Evolução Mensal</h3>
        {loadingFinancas ? (
          <div className="flex items-center gap-2 text-gray-600">
            <FaSpinner className="animate-spin" /> Carregando…
          </div>
        ) : (
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
        )}
      </div>

      {/* Lista dos lançamentos filtrados */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Lançamentos</h3>
          <div className="text-sm text-gray-600">
            {tipoFiltro === "all" ? "Exibindo receitas e despesas" : `Exibindo apenas ${tipoFiltro}`}
            {from || to ? ` — período ${from || "início"} a ${to || "hoje"}` : ""}
          </div>
        </div>

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
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Data</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Categoria</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Tipo</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Origem</th>
                  <th className="text-right px-4 py-3 text-gray-600 font-semibold">Valor</th>
                </tr>
              </thead>
              <tbody>
                {filtrados
                  .slice()
                  .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                  .map((i) => {
                    const valorNum = Number(i.valor || 0);
                    return (
                      <tr key={`${i.id}-${i.data}`} className="border-t">
                        <td className="px-4 py-3">
                          {new Date(i.data).toLocaleString("pt-BR")}
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
                        <td className="px-4 py-3">
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
                          R$ {Number.isNaN(valorNum) ? "-" : valorNum.toFixed(2).replace(".", ",")}
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








