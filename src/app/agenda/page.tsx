"use client";

import React, { useState } from "react";
import { useMediaQuery } from "react-responsive";
import Calendar, { CalendarProps } from "react-calendar";
import Agenda from "../../components/Agenda";
import { FaGoogle, FaSyncAlt, FaCalendarAlt } from "react-icons/fa";
import { apiFetch } from "@/lib/api";
import "react-calendar/dist/Calendar.css";

// ✅ Tipagem local para o valor do calendário
type CalendarValue = Date | [Date, Date] | null;

export default function AgendaPage() {
  const [loadingConnect, setLoadingConnect] = useState(false);
  const [loadingSync, setLoadingSync] = useState(false);
  const [selectedDate, setSelectedDate] = useState<CalendarValue>(new Date());

  const isMobile = useMediaQuery({ maxWidth: 768 });

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

  // 🔄 Sincroniza eventos do Google Calendar com o banco da Lucy
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
        }
      );

      alert(
        `✅ Sincronização concluída: ${result.imported} novos eventos importados.`
      );
    } catch (err) {
      console.error("Erro ao sincronizar Google Calendar:", err);
      alert("Erro ao sincronizar eventos com o Google Calendar.");
    } finally {
      setLoadingSync(false);
    }
  };

  // ✅ Corrige a tipagem do onChange do calendário
  const handleDateChange: CalendarProps["onChange"] = (value) => {
    if (value instanceof Date) setSelectedDate(value);
    else if (Array.isArray(value)) setSelectedDate(value[0]);
    else setSelectedDate(null);
  };

  return (
    <div className="flex flex-col min-h-screen p-4 bg-gray-100">
      {/* 🟣 Header */}
      <header className="py-4 text-center">
        <div className="p-3 sm:p-4 bg-purple-500 rounded-xl shadow-md hover:bg-purple-400 transition-colors cursor-pointer">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Lucy Agenda
          </h1>
          <p className="text-gray-100 text-sm sm:text-base">
            Gerencie sua agenda e compromissos
          </p>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 flex flex-col items-center space-y-6">
        <div className="w-full max-w-6xl space-y-6">
          {/* 🔗 Integração com Google Calendar */}
          <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-3 sm:p-4 rounded-xl shadow border mb-4">
            <div className="flex items-center gap-3">
              <FaGoogle className="text-red-500 text-xl sm:text-2xl" />
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                  Integração com Google Calendar
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Conecte e sincronize seus eventos facilmente.
                </p>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-0">
              <button
                onClick={connectGoogleCalendar}
                disabled={loadingConnect}
                className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold text-white transition ${
                  loadingConnect
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                <FaGoogle />
                <span className="text-sm sm:text-base">
                  {loadingConnect ? "Conectando..." : "Conectar"}
                </span>
              </button>

              <button
                onClick={syncGoogleCalendar}
                disabled={loadingSync}
                className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold text-white transition ${
                  loadingSync
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                <FaSyncAlt />
                <span className="text-sm sm:text-base">
                  {loadingSync ? "Sincronizando..." : "Sincronizar"}
                </span>
              </button>
            </div>
          </div>

          {/* 📅 Calendário Responsivo */}
          {isMobile ? (
            // 📱 Versão Mobile (igual da Home)
            <div className="bg-white rounded-xl shadow-md p-4 w-full">
              <h3 className="text-base font-semibold text-purple-700 mb-3 flex items-center gap-2">
                <FaCalendarAlt className="text-purple-600" /> Calendário
              </h3>
              <div className="rounded-lg overflow-hidden shadow-inner">
                <Calendar
                  onChange={handleDateChange}
                  value={selectedDate}
                  locale="pt-BR"
                  next2Label={null}
                  prev2Label={null}
                  className="w-full text-sm"
                  tileClassName={({ date, view }) =>
                    view === "month" && date.getDay() === 0
                      ? "text-red-500"
                      : undefined
                  }
                />
              </div>
            </div>
          ) : (
            // 💻 Versão Desktop (mantém a Agenda completa)
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-purple-700">
                <FaCalendarAlt className="text-purple-600" /> Agenda Completa
              </h2>
              <Agenda />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
