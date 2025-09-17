'use client';

import React from 'react';
import { FaMoneyBillWave, FaCalendarAlt, FaLightbulb } from 'react-icons/fa';

interface SummaryData {
  financas: string;
  proximoCompromisso: string;
  ultimaIdeia: string;
  chartData: { name: string; uso: number }[];
}

export default function MonthSummary({ data }: { data: SummaryData }) {
  return (
    <div className="flex gap-4">
      <div className="flex-1 p-4 bg-white rounded-xl shadow-md flex items-center space-x-3">
        <FaMoneyBillWave className="text-green-500 text-2xl" />
        <div>
          <h3 className="text-sm font-semibold text-gray-500">Finanças</h3>
          <p className="text-xl font-bold text-gray-800">{data.financas}</p>
        </div>
      </div>
      <div className="flex-1 p-4 bg-white rounded-xl shadow-md flex items-center space-x-3">
        <FaCalendarAlt className="text-blue-500 text-2xl" />
        <div>
          <h3 className="text-sm font-semibold text-gray-500">Próximo Compromisso</h3>
          <p className="text-xl font-bold text-gray-800">{data.proximoCompromisso}</p>
        </div>
      </div>
      <div className="flex-1 p-4 bg-white rounded-xl shadow-md flex items-center space-x-3">
        <FaLightbulb className="text-yellow-500 text-2xl" />
        <div>
          <h3 className="text-sm font-semibold text-gray-500">Última Ideia</h3>
          <p className="text-xl font-bold text-gray-800">{data.ultimaIdeia}</p>
        </div>
      </div>
    </div>
  );
}

