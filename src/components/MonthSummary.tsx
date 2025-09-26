"use client";

import React from "react";
import { useTranslations } from "next-intl";

interface MonthSummaryProps {
  data: {
    totalReceitas: number;
    totalDespesas: number;
    saldo: number;
    proximoCompromisso: string;
    ultimaIdeia: string;
  };
}

export default function MonthSummary({ data }: MonthSummaryProps) {
  const t = useTranslations("monthSummary");

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold text-purple-700 mb-6">
        {t("title")}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-green-50 rounded-lg shadow-sm text-center">
          <p className="text-sm text-gray-600">{t("income")}</p>
          <p className="text-2xl font-bold text-green-600">
            R$ {data.totalReceitas.toFixed(2)}
          </p>
        </div>

        <div className="p-4 bg-red-50 rounded-lg shadow-sm text-center">
          <p className="text-sm text-gray-600">{t("expenses")}</p>
          <p className="text-2xl font-bold text-red-600">
            R$ {data.totalDespesas.toFixed(2)}
          </p>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg shadow-sm text-center">
          <p className="text-sm text-gray-600">{t("balance")}</p>
          <p
            className={`text-2xl font-bold ${
              data.saldo >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            R$ {data.saldo.toFixed(2)}
          </p>
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg shadow-sm text-center">
          <p className="text-sm text-gray-600">{t("nextCommitment")}</p>
          <p className="text-base font-semibold text-gray-800">
            {data.proximoCompromisso}
          </p>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg shadow-sm text-center">
          <p className="text-sm text-gray-600">{t("lastIdea")}</p>
          <p className="text-base font-semibold text-gray-800">
            {data.ultimaIdeia}
          </p>
        </div>
      </div>
    </div>
  );
}






