"use client";

import React, { useState, useEffect } from "react";
import {
  FaChartPie,
  FaMoneyBillWave,
  FaArrowUp,
  FaArrowDown,
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
import { useTranslations } from "next-intl";

interface Financa {
  id: number;
  categoria: string;
  valor: string;
  data: string;
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
  const t = useTranslations("financas");

  const [financas, setFinancas] = useState<Financa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewDetails, setViewDetails] = useState<
    null | "all" | "maior" | "menor"
  >(null);

  const fetchFinancas = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const userId = localStorage.getItem("user_id");
      if (!token || !userId) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/financas?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(t("error.fetch"));
      }
      const data: Financa[] = await response.json();
      setFinancas(data);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(t("error.unknown"));
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
        <span>{t("loading")}</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-6 text-red-500">{error}</div>;
  }

  const valoresNumericos = financas.map((item) => parseFloat(item.valor));

  const totalGastos = valoresNumericos.reduce((sum, item) => sum + item, 0);
  const maiorGasto =
    valoresNumericos.length > 0 ? Math.max(...valoresNumericos) : 0;
  const menorGasto =
    valoresNumericos.length > 0 ? Math.min(...valoresNumericos) : 0;

  const aggregatedData = financas.reduce(
    (acc, item) => {
      const existing = acc.find((d) => d.name === item.categoria);
      const valor = parseFloat(item.valor);
      if (existing) {
        existing.value += valor;
      } else {
        acc.push({ name: item.categoria, value: valor });
      }
      return acc;
    },
    [] as { name: string; value: number }[]
  );

  const COLORS = [
    "#FF8042",
    "#00C49F",
    "#FFBB28",
    "#0088FE",
    "#AF19FF",
    "#FF5733",
  ];

  const monthlyData = financas.reduce(
    (acc, item) => {
      const month = new Date(item.data).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += parseFloat(item.valor);
      return acc;
    },
    {} as Record<string, number>
  );

  const monthlyChartData = Object.keys(monthlyData).map((key) => ({
    name: key,
    gastos: monthlyData[key],
  }));

  const sortedMonths = Object.keys(monthlyData).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );
  const currentMonth = sortedMonths[sortedMonths.length - 1];
  const previousMonth = sortedMonths[sortedMonths.length - 2];

  const alertMessage = () => {
    if (
      previousMonth &&
      monthlyData[currentMonth] > monthlyData[previousMonth]
    ) {
      const diff =
        ((monthlyData[currentMonth] - monthlyData[previousMonth]) /
          monthlyData[previousMonth]) *
        100;
      return t("alert.more", { diff: diff.toFixed(2) });
    }
    return null;
  };

  const renderDetails = () => {
    let title = "";
    let list: Financa[] = [];

    if (viewDetails === "all") {
      title = t("details.all");
      list = financas;
    } else if (viewDetails === "maior") {
      title = t("details.highest");
      list = financas.filter((f) => parseFloat(f.valor) === maiorGasto);
    } else if (viewDetails === "menor") {
      title = t("details.lowest");
      list = financas.filter((f) => parseFloat(f.valor) === menorGasto);
    }

    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <button
          onClick={() => setViewDetails(null)}
          className="flex items-center space-x-2 text-blue-500 hover:text-blue-700 font-bold mb-4"
        >
          <FaChevronLeft />
          <span>{t("back")}</span>
        </button>
        <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
        <ul className="space-y-4">
          {list.map((item) => (
            <li key={item.id} className="p-4 bg-gray-100 rounded-lg">
              <p className="font-semibold text-gray-700">
                {t("fields.category")}: {item.categoria}
              </p>
              <p className="text-sm text-gray-500">
                {t("fields.value")}: R${" "}
                {parseFloat(item.valor).toFixed(2).replace(".", ",")}
              </p>
              <p className="text-sm text-gray-500">
                {t("fields.date")}:{" "}
                {new Date(item.data).toLocaleDateString()}
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
        {t("title")}
      </h2>

      {alertMessage() && (
        <div
          className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-lg"
          role="alert"
        >
          <p className="font-bold">{t("alert.title")}</p>
          <p>{alertMessage()}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <FinanceCard
          icon={<FaMoneyBillWave />}
          title={t("cards.total")}
          value={`R$ ${totalGastos.toFixed(2).replace(".", ",")}`}
          color="bg-red-500"
          onClick={() => setViewDetails("all")}
          isActive={viewDetails === "all"}
        />
        <FinanceCard
          icon={<FaArrowUp />}
          title={t("cards.highest")}
          value={`R$ ${maiorGasto.toFixed(2).replace(".", ",")}`}
          color="bg-orange-500"
          onClick={() => setViewDetails("maior")}
          isActive={viewDetails === "maior"}
        />
        <FinanceCard
          icon={<FaArrowDown />}
          title={t("cards.lowest")}
          value={`R$ ${menorGasto.toFixed(2).replace(".", ",")}`}
          color="bg-green-500"
          onClick={() => setViewDetails("menor")}
          isActive={viewDetails === "menor"}
        />
        <FinanceCard
          icon={<FaChartPie />}
          title={t("cards.items")}
          value={financas.length.toString()}
          color="bg-blue-500"
          onClick={() => setViewDetails("all")}
          isActive={viewDetails === "all"}
        />
      </div>

      <div className="mt-8">
        <FinancasForm onSave={fetchFinancas} />
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {t("charts.categories")}
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
          {t("charts.monthly")}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyChartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="gastos" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


