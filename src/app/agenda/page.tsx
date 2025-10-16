"use client";

import React, { useState } from "react";
import Agenda from "../../components/Agenda";
import { FaGoogle, FaSyncAlt } from "react-icons/fa";
import { apiFetch } from "@/lib/api";

export default function AgendaPage() {
  const [loadingConnect, setLoadingConnect] = useState(false);
  const [loadingSync, setLoadingSync] = useState(false);

  // 🚀 Redireciona o usuário para o fluxo OAuth no backend
  const connectGoogleCalendar = async () => {
    try {
      setLoadingConnect(true);
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/google-calendar/auth`;
    } catch (err) {
      console.error("Erro ao conectar com Google Calendar:", err);
      alert("Falha ao conectar com o Google Calendar.");
      setLoadingConnect(false);
    }
  };

  // 🔄 Chama o endpoint para sincronizar eventos do Google Calendar com o banco da Lucy
  const syncGoogleCalendar = async () => {
    try {
      setLoadingSync(true);
      const token = localStorage.getItem("auth_token");
      if (!token) {
        alert("Você precisa estar logado para sincronizar.");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      const result = await apiFetch<{ imported: number }>(
        "/google-calendar/sync",
        {
          method: "POST",
          headers,
        },
      );

      alert(`✅ Sincronização concluída: ${result.imported} novos eventos importados.`);
    } catch (err) {
      console.error("Erro ao sincronizar Google Calendar:", err);
      alert("Erro ao sincronizar eventos com o Google Calendar.");
    } finally {
      setLoadingSync(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-4 bg-gray-100">
      <header className="py-4 text-center">
        <div className="p-4 bg-purple-100 rounded-xl shadow-md transition-colors duration-200 hover:bg-purple-200 cursor-pointer">
          <h1 className="text-3xl font-bold text-purple-500">Lucy Agenda</h1>
          <p className="text-black">Gerencie sua agenda e compromissos</p>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col items-center space-y-6">
        <div className="w-full max-w-6xl">
          {/* 🔗 Integração com Google Calendar */}
          <div className="flex flex-col md:flex-row items-center justify-between bg-white p-4 rounded-xl shadow border mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Integração com Google Calendar
              </h2>
              <p className="text-gray-600 text-sm">
                Conecte sua conta Google para importar seus compromissos diretamente na Lucy.
              </p>
            </div>

            <div className="flex gap-3 mt-3 md:mt-0">
              <button
                onClick={connectGoogleCalendar}
                disabled={loadingConnect}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition ${
                  loadingConnect
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                <FaGoogle />
                {loadingConnect ? "Conectando..." : "Conectar Google"}
              </button>

              <button
                onClick={syncGoogleCalendar}
                disabled={loadingSync}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition ${
                  loadingSync
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                <FaSyncAlt />
                {loadingSync ? "Sincronizando..." : "Sincronizar"}
              </button>
            </div>
          </div>

          {/* 📅 Componente da Agenda atual */}
          <Agenda />
        </div>
      </main>
    </div>
  );
}



