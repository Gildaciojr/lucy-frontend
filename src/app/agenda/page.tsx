"use client";

import React, { useEffect, useState } from "react";
import Agenda from "../../components/Agenda";
import { FaGoogle, FaSyncAlt, FaCalendarAlt, FaCheckCircle } from "react-icons/fa";
import { apiFetch } from "@/lib/api";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

interface Compromisso {
  id: number;
  titulo: string;
  data: string;
  concluido: boolean;
}

export default function AgendaPage() {
  const [loadingConnect, setLoadingConnect] = useState(false);
  const [loadingSync, setLoadingSync] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // 🔹 Novos estados para o calendário mobile
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [loadingCompromissos, setLoadingCompromissos] = useState(true);
  const [errorCompromissos, setErrorCompromissos] = useState<string | null>(null);

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
        { method: "POST", headers }
      );
      alert(`✅ ${result.imported} novos eventos importados.`);
      // Recarrega compromissos após sync
      await fetchCompromissos();
    } catch (err) {
      console.error("Erro ao sincronizar:", err);
      alert("Erro ao sincronizar com o Google Calendar.");
    } finally {
      setLoadingSync(false);
    }
  };

  const fetchCompromissos = async () => {
    try {
      setLoadingCompromissos(true);
      const token = localStorage.getItem("auth_token");
      if (!token) {
        window.location.href = "/login";
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      const data = await apiFetch<Compromisso[]>("/compromissos", { headers });
      setCompromissos(data);
    } catch (err: unknown) {
      setErrorCompromissos(
        err instanceof Error ? err.message : "Erro ao carregar compromissos."
      );
    } finally {
      setLoadingCompromissos(false);
    }
  };

  useEffect(() => {
    fetchCompromissos();
  }, []);

  const compromissosDoDia = compromissos.filter(
    (c) => new Date(c.data).toDateString() === selectedDate.toDateString()
  );

  return (
    <div className="flex flex-col min-h-screen p-4 bg-gray-100">
      <header className="py-4 text-center">
        <div className="p-3 sm:p-4 bg-lucy rounded-xl shadow-md hover:bg-lucy transition">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Lucy Agenda</h1>
          <p className="text-gray-100 text-sm sm:text-base">
            Gerencie sua agenda e compromissos
          </p>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 flex flex-col items-center space-y-6">
        <div className="w-full max-w-6xl">
          {/* 🔗 Integração Google */}
          <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-3 sm:p-4 rounded-xl shadow border mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                Integração com Google Calendar
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm">
                Conecte e sincronize seus compromissos automaticamente.
              </p>
            </div>

            <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-0">
              <button
                onClick={connectGoogleCalendar}
                disabled={loadingConnect}
                className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold text-white ${
                  loadingConnect ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"
                }`}
              >
                <FaGoogle />
                {loadingConnect ? "Conectando..." : "Conectar"}
              </button>

              <button
                onClick={syncGoogleCalendar}
                disabled={loadingSync}
                className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold text-white ${
                  loadingSync ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                <FaSyncAlt />
                {loadingSync ? "Sincronizando..." : "Sincronizar"}
              </button>
            </div>
          </div>

          {/* 🟣 Versão MOBILE: calendário + marcação + lista do dia */}
          <div className="block sm:hidden">
            <div className="bg-white rounded-2xl shadow-md border border-purple-100 p-5">
              <h3 className="text-lg font-semibold text-lucy mb-3 flex items-center gap-2">
                <FaCalendarAlt className="text-lucy" />
                Sua Agenda
              </h3>

              {loadingCompromissos ? (
                <p className="text-sm text-gray-500">Carregando compromissos…</p>
              ) : errorCompromissos ? (
                <p className="text-sm text-red-600">Erro: {errorCompromissos}</p>
              ) : (
                <>
                  <Calendar
                    onChange={(value) => setSelectedDate(value as Date)}
                    value={selectedDate}
                    locale="pt-BR"
                    className="w-full rounded-xl border-0 text-sm"
                    tileClassName={({ date }) => {
                      const hasEvent = compromissos.some(
                        (c) =>
                          new Date(c.data).toDateString() === date.toDateString()
                      );
                      return hasEvent
                        ? "bg-purple-100 text-purple-700 font-semibold rounded-md"
                        : undefined;
                    }}
                  />

                  <div className="mt-4 bg-purple-50 p-4 rounded-xl text-lucy">
                    <h4 className="font-semibold mb-2 text-center">
                      {selectedDate.toLocaleDateString("pt-BR", {
                        weekday: "long",
                        day: "2-digit",
                        month: "long",
                      })}
                    </h4>

                    {compromissosDoDia.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center">
                        Nenhum compromisso neste dia.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {compromissosDoDia.map((c) => (
                          <li
                            key={c.id}
                            className={`flex items-center justify-between bg-white px-3 py-2 rounded-lg shadow-sm border ${
                              c.concluido
                                ? "border-green-200 text-green-700"
                                : "border-purple-200 text-lucy"
                            }`}
                          >
                            <span className="truncate">{c.titulo}</span>
                            {c.concluido ? (
                              <span className="text-xs text-green-600 font-semibold">
                                <FaCheckCircle className="inline mr-1" />
                                Concluído
                              </span>
                            ) : (
                              <span className="text-xs text-lucy font-semibold">
                                Pendente
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 🖥️ Desktop permanece com o componente completo */}
          <div className="hidden sm:block">
            <Agenda />
          </div>
        </div>
      </main>
    </div>
  );
}




