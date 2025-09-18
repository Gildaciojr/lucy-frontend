"use client";

import React, { useEffect, useState } from "react";
import { fetchLeads, Lead } from "../services/leadsService";
import { FaSpinner } from "react-icons/fa";

export default function LeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState<"csv" | "pdf" | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchLeads()
      .then(setLeads)
      .catch(() => setError("Erro ao carregar leads"))
      .finally(() => setLoading(false));
  }, []);

  const downloadFile = async (type: "csv" | "pdf") => {
    try {
      setDownloading(type);
      const token = localStorage.getItem("auth_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/leads/export.${type}`,
        {
          headers: {
            Authorization: `Bearer ${token ?? ""}`,
          },
        }
      );

      if (!res.ok) throw new Error("Erro ao gerar relatório.");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads.${type}`;
      a.click();
      window.URL.revokeObjectURL(url);

      setMessage(`Relatório ${type.toUpperCase()} baixado com sucesso!`);
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("Não foi possível baixar o relatório.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setDownloading(null);
    }
  };

  if (loading) return <p>Carregando leads...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h1 className="text-xl font-bold">Leads</h1>

        <div className="flex gap-2">
          <button
            onClick={() => downloadFile("csv")}
            className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 flex items-center gap-2 disabled:opacity-50"
            disabled={!!downloading}
          >
            {downloading === "csv" && (
              <FaSpinner className="animate-spin" />
            )}
            Exportar CSV
          </button>
          <button
            onClick={() => downloadFile("pdf")}
            className="px-4 py-2 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 flex items-center gap-2 disabled:opacity-50"
            disabled={!!downloading}
          >
            {downloading === "pdf" && (
              <FaSpinner className="animate-spin" />
            )}
            Exportar PDF
          </button>
        </div>
      </div>

      {message && (
        <p className="mb-4 text-center text-sm text-green-600">{message}</p>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Nome</th>
              <th className="p-2 border">Telefone</th>
              <th className="p-2 border">Plano</th>
              <th className="p-2 border">Início</th>
              <th className="p-2 border">Expira</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td className="p-2 border">{lead.display_name}</td>
                <td className="p-2 border">{lead.phone_e164}</td>
                <td className="p-2 border">{lead.plan}</td>
                <td className="p-2 border">{lead.plan_started_at ?? "-"}</td>
                <td className="p-2 border">{lead.plan_expires_at ?? "-"}</td>
                <td className="p-2 border">{lead.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

