"use client";

import React, { useState, useEffect } from "react";
import {
  FaChartPie,
  FaMoneyBillWave,
  FaArrowUp,
  FaArrowDown,
  FaBalanceScale,
  FaSpinner,
  FaChevronLeft,
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

interface Financa {
  id: number;
  categoria: string;
  valor: string;
  data: string;
  tipo: "receita" | "despesa";
  userId: number;
}

interface FinanceCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
  onClick: () => void;
  isActive: boolean;
}

const FinanceCard: React.FC<FinanceCardProps> = ({
  icon,
  title,
  value,
  color,
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewDetails, setViewDetails] = useState<
    null | "all" | "maiorReceita" | "maiorDespesa"
  >(null);

  const fetchFinancas = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/financas`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Erro ao buscar finanças.");
      const data: Financa[] = await response.json();
      setFinancas(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancas();
  }, []);

  if (loading) {
    return (
      <div className="text-center p-6 flex items-center justify-center space-x-2">
        <FaSpinner className="animate-spin" />
        <span>Carregando finanças...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-6 text-red-500">{error}</div>;
  }

  // 🔹 Separar receitas e despesas
  const receitas = financas.filter((f) => f.tipo === "receita");
  const despesas = financas.filter((f) => f.tipo === "despesa");

  const totalReceitas = receitas.reduce(
    (sum, f) => sum + parseFloat(f.valor),
    0
  );
  const totalDespesas = despesas.reduce(
    (sum, f) => sum + parseFloat(f.valor),
    0
  );
  const saldo = totalReceitas - totalDespesas;

  const maiorReceita =
    receitas.length > 0
      ? Math.max(...receitas.map((f) => parseFloat(f.valor)))
      : 0;

  const maiorDespesa =
    despesas.length > 0
      ? Math.max(...despesas.map((f) => parseFloat(f.valor)))
      : 0;

  // 🔹 Gráfico Pizza (categorias)
  const aggregatedData = financas.reduce(
    (acc, item) => {
      const existing = acc.find(
        (d) => d.name === `${item.categoria} (${item.tipo})`
      );
      const valor = parseFloat(item.valor);
      if (existing) {
        existing.value += valor;
      } else {
        acc.push({ name: `${item.categoria} (${item.tipo})`, value: valor });
      }
      return acc;
    },
    [] as { name: string; value: number }[]
  );

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#AF19FF",
    "#FF5733",
  ];

  // 🔹 Gráfico Barras (mensal)
  const monthlyData = financas.reduce(
    (acc, item) => {
      const month = new Date(item.data).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      if (!acc[month]) {
        acc[month] = { receitas: 0, despesas: 0 };
      }
      if (item.tipo === "receita") {
        acc[month].receitas += parseFloat(item.valor);
      } else {
        acc[month].despesas += parseFloat(item.valor);
      }
      return acc;
    },
    {} as Record<string, { receitas: number; despesas: number }>
  );

  const monthlyChartData = Object.keys(monthlyData).map((key) => ({
    name: key,
    receitas: monthlyData[key].receitas,
    despesas: monthlyData[key].despesas,
  }));

  // 🔹 Renderização de detalhes
  const renderDetails = () => {
    let title = "";
    let list: Financa[] = [];

    if (viewDetails === "all") {
      title = "Todos os Registros";
      list = financas;
    } else if (viewDetails === "maiorReceita") {
      title = "Maior Receita";
      list = receitas.filter((f) => parseFloat(f.valor) === maiorReceita);
    } else if (viewDetails === "maiorDespesa") {
      title = "Maior Despesa";
      list = despesas.filter((f) => parseFloat(f.valor) === maiorDespesa);
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
              <p className="font-semibold text-gray-700">
                Categoria: {item.categoria}
              </p>
              <p className="text-sm text-gray-500">
                Tipo: {item.tipo === "receita" ? "Receita" : "Despesa"}
              </p>
              <p className="text-sm text-gray-500">
                Valor: R$ {parseFloat(item.valor).toFixed(2).replace(".", ",")}
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Controle Financeiro
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <FinanceCard
          icon={<FaMoneyBillWave />}
          title="Total Receitas"
          value={`R$ ${totalReceitas.toFixed(2).replace(".", ",")}`}
          color="bg-green-500"
          onClick={() => setViewDetails("all")}
          isActive={viewDetails === "all"}
        />
        <FinanceCard
          icon={<FaArrowDown />}
          title="Total Despesas"
          value={`R$ ${totalDespesas.toFixed(2).replace(".", ",")}`}
          color="bg-red-500"
          onClick={() => setViewDetails("all")}
          isActive={viewDetails === "all"}
        />
        <FinanceCard
          icon={<FaBalanceScale />}
          title="Saldo"
          value={`R$ ${saldo.toFixed(2).replace(".", ",")}`}
          color={saldo >= 0 ? "bg-blue-500" : "bg-orange-500"}
          onClick={() => setViewDetails("all")}
          isActive={viewDetails === "all"}
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
          title="Registros"
          value={financas.length.toString()}
          color="bg-gray-600"
          onClick={() => setViewDetails("all")}
          isActive={viewDetails === "all"}
        />
      </div>

      <div className="mt-8">
        <FinancasForm onSave={fetchFinancas} />
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Distribuição por Categoria
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={aggregatedData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {aggregatedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

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
    </div>
  );
}





