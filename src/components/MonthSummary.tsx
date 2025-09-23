"use client";

import React, { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";

interface SummaryData {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
}

export default function MonthSummary() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const userId = localStorage.getItem("user_id");
      if (!token || !userId) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/financas/summary/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar resumo mensal.");
      }

      const data: SummaryData = await response.json();
      setSummary(data);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Erro desconhecido ao buscar resumo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-6 flex items-center justify-center space-x-2">
        <FaSpinner className="animate-spin" />
        <span>Carregando resumo...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-6 text-red-500">Erro: {error}</div>;
  }

  if (!summary) {
    return (
      <div className="text-center py-6 text-gray-500">
        Nenhum dado disponível para este mês.
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Resumo do Mês</h2>
      <div className="flex justify-between">
        <p className="text-green-600 font-semibold">
          Receitas: R$ {summary.totalReceitas.toFixed(2)}
        </p>
        <p className="text-red-600 font-semibold">
          Despesas: R$ {summary.totalDespesas.toFixed(2)}
        </p>
      </div>
      <div>
        <p
          className={`text-lg font-bold ${
            summary.saldo >= 0 ? "text-green-700" : "text-red-700"
          }`}
        >
          Saldo: R$ {summary.saldo.toFixed(2)}
        </p>
      </div>
    </div>
  );
}



