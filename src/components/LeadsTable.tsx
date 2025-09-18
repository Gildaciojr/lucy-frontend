"use client";

import React, { useEffect, useState } from "react";
import { fetchLeads, Lead } from "../services/leadsService";

export default function LeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLeads()
      .then(setLeads)
      .catch(() => setError("Erro ao carregar leads"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Carregando leads...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Leads</h1>
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