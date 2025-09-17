"use client";

import React, { useState } from "react";
import { FaChartLine, FaSpinner } from "react-icons/fa";

interface ReportCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({
  icon,
  title,
  description,
  onClick,
}) => {
  return (
    <div
      className="flex flex-col space-y-4 p-6 bg-white rounded-xl shadow-md cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        <div className="text-2xl text-gray-700">{icon}</div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      </div>
      <p className="text-gray-500">{description}</p>
    </div>
  );
};

export default function Reports() {
  const [reports] = useState([
    {
      id: 1,
      title: "Relatório Mensal",
      description:
        "Gere um relatório detalhado de suas atividades financeiras, agenda e conteúdo do último mês.",
      type: "monthly",
    },
    {
      id: 2,
      title: "Relatório Semanal",
      description:
        "Visualize um resumo rápido de sua produtividade e gastos da última semana.",
      type: "weekly",
    },
  ]);

  const [loading, setLoading] = useState(false);

  const handleExportReport = (reportType: string) => {
    setLoading(true);
    setTimeout(() => {
      alert(`Relatório ${reportType} gerado e exportado com sucesso!`);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-inner flex flex-col space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Relatórios</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report) => (
          <ReportCard
            key={report.id}
            icon={<FaChartLine />}
            title={report.title}
            description={report.description}
            onClick={() => handleExportReport(report.title)}
          />
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center space-x-2 mt-4">
          <FaSpinner className="animate-spin text-blue-500 text-2xl" />
          <span className="text-gray-700">
            Gerando e exportando relatório...
          </span>
        </div>
      )}
    </div>
  );
}
