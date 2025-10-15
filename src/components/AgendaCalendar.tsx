"use client";

import React from "react";
import {
  Calendar,
  dateFnsLocalizer,
  Views,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR"; // ✅ corrigido
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/styles/agenda-calendar.css"; // 🎨 tema Lucy

// 📅 Localização para o calendário
const locales = { "pt-BR": ptBR };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

// 🔹 Tipos dos compromissos vindos do backend
interface CompromissoItem {
  id: number;
  titulo: string;
  data: string;
  concluido: boolean;
  origem: "dashboard" | "whatsapp";
}

// 🔹 Tipo de evento para o calendário
interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  origem: string;
  concluido: boolean;
}

export default function AgendaCalendar({
  compromissos,
}: {
  compromissos: CompromissoItem[];
}) {
  // Se não houver compromissos
  if (!compromissos?.length)
    return (
      <div className="text-center p-6 text-gray-500">
        Nenhum compromisso encontrado.
      </div>
    );

  // Converte compromissos para eventos
  const events: CalendarEvent[] = compromissos.map((item) => ({
    id: item.id,
    title: item.titulo,
    start: new Date(item.data),
    end: new Date(item.data),
    origem: item.origem,
    concluido: item.concluido,
  }));

  return (
    <div className="bg-white rounded-xl shadow-md p-3 md:p-6 mb-8">
      <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">
        Calendário de Compromissos
      </h3>

      {/* 🟣 Legenda de cores */}
      <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
          <span>Dashboard</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-purple-500"></span>
          <span>WhatsApp (Agente Lucy)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
          <span>Concluído</span>
        </div>
      </div>

      {/* 📆 Calendário principal */}
      <div className="rounded-lg overflow-hidden border border-gray-200">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView={Views.MONTH}
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          popup
          messages={{
            month: "Mês",
            week: "Semana",
            day: "Dia",
            today: "Hoje",
            previous: "Anterior",
            next: "Próximo",
            noEventsInRange: "Sem compromissos neste período.",
          }}
          style={{ height: "70vh" }}
          eventPropGetter={(event: CalendarEvent) => {
            const color =
              event.origem === "dashboard"
                ? event.concluido
                  ? "#22c55e" // verde se concluído
                  : "#3b82f6" // azul se pendente
                : "#8b5cf6"; // roxo para agente Lucy
            return {
              style: {
                backgroundColor: color,
                borderRadius: "8px",
                color: "white",
                border: "none",
              },
            };
          }}
        />
      </div>
    </div>
  );
}


