"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  dateFnsLocalizer,
  Views,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/styles/agenda-calendar.css";

/* 🔹 Tipagem dos compromissos do backend */
interface CompromissoItem {
  id: number;
  titulo: string;
  data: string;
  concluido: boolean;
  origem: "dashboard" | "whatsapp";
}

/* 🔹 Tipo de evento usado no calendário */
interface CustomCalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  origem: "dashboard" | "whatsapp";
  concluido: boolean;
}

/* 📅 Localização (Português do Brasil) */
const locales = { "pt-BR": ptBR };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

export default function AgendaCalendar({ compromissos }: { compromissos: CompromissoItem[] }) {
  const [isMobile, setIsMobile] = useState(false);

  // ✅ Detecta se o usuário está no celular
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!compromissos?.length)
    return (
      <div className="text-center p-6 text-gray-500">
        Nenhum compromisso encontrado.
      </div>
    );

  // 🔄 Converte compromissos para eventos do calendário
  const events: CustomCalendarEvent[] = compromissos.map((item) => ({
    id: item.id,
    title: item.titulo,
    start: new Date(item.data),
    end: new Date(item.data),
    origem: item.origem,
    concluido: item.concluido,
  }));

  return (
    <div className="bg-white rounded-xl shadow-md p-3 md:p-6 mb-8">
      <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
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
          <span>WhatsApp (Lucy)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
          <span>Concluído</span>
        </div>
      </div>

      {/* 📱 Mobile: modo lista */}
      {isMobile ? (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all bg-gradient-to-r from-indigo-50 to-purple-50"
            >
              <div>
                <p className="font-semibold text-gray-800 text-sm">
                  {event.title}
                </p>
                <p className="text-xs text-gray-500">
                  {format(event.start, "dd/MM/yyyy, EEEE", { locale: ptBR })}
                </p>
              </div>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${
                  event.origem === "whatsapp"
                    ? "bg-purple-500"
                    : event.concluido
                    ? "bg-green-500"
                    : "bg-blue-500"
                }`}
              >
                {event.origem === "whatsapp"
                  ? "Lucy"
                  : event.concluido
                  ? "Feito"
                  : "Pendente"}
              </span>
            </div>
          ))}
        </div>
      ) : (
        // 💻 Desktop: calendário completo
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
            eventPropGetter={(event: CustomCalendarEvent) => {
              let background = "";
              if (event.origem === "whatsapp") {
                background = "linear-gradient(to right, #8b5cf6, #7e22ce)";
              } else if (event.concluido) {
                background = "linear-gradient(to right, #22c55e, #16a34a)";
              } else {
                background = "linear-gradient(to right, #3b82f6, #2563eb)";
              }

              return {
                style: {
                  background,
                  borderRadius: "8px",
                  color: "white",
                  border: "none",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                },
                className:
                  "hover:shadow-lg hover:scale-[1.03] cursor-pointer transition-transform",
              };
            }}
          />
        </div>
      )}
    </div>
  );
}



