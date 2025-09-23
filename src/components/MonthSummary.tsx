"use client";

import React from "react";

interface SummaryData {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
}

interface MonthSummaryProps {
  data: SummaryData;
}

export default function MonthSummary({ data }: MonthSummaryProps) {
  if (!data) {
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
          Receitas: R$ {data.totalReceitas.toFixed(2)}
        </p>
        <p className="text-red-600 font-semibold">
          Despesas: R$ {data.totalDespesas.toFixed(2)}
        </p>
      </div>
      <div>
        <p
          className={`text-lg font-bold ${
            data.saldo >= 0 ? "text-green-700" : "text-red-700"
          }`}
        >
          Saldo: R$ {data.saldo.toFixed(2)}
        </p>
      </div>
    </div>
  );
}




