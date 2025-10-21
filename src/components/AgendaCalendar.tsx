"use client";

import React, { useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/styles/agenda-calendar.css";
import { FaPlus, FaCalendarAlt } from "react-icons/fa";

/** Tipagem do evento */
interface CustomCalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  description?: string;
}

/** Localização pt-BR */
const locales = {
  "pt-BR": ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Props {
  events: CustomCalendarEvent[];
  onAddEvent?: () => void;
}

/** Componente principal */
export default function AgendaCalendar({ events, onAddEvent }: Props) {
  const [view, setView] = useState<string>(Views.MONTH);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  /** Responsividade */
  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= 768;
  }, []);

  /** Estilo visual dos eventos */
  const eventStyleGetter = (
    event: CustomCalendarEvent,
    _start: Date,
    _end: Date,
    isSelected: boolean
  ) => {
    const baseColor = event.title.toLowerCase().includes("reunião")
      ? "#8b5cf6"
      : event.title.toLowerCase().includes("prazo")
      ? "#f59e0b"
      : "#22c55e";

    return {
      style: {
        backgroundColor: baseColor,
        borderRadius: "8px",
        opacity: isSelected ? 0.95 : 0.85,
        color: "#fff",
        border: "none",
        display: "block",
        padding: "4px 8px",
        fontSize: isMobile ? "0.7rem" : "0.85rem",
      },
    };
  };

  /** Destaque do dia atual */
  const dayPropGetter = (date: Date) => {
    const today = new Date();
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return {
        style: {
          backgroundColor: "rgba(109,40,217,0.07)",
          border: "1px solid rgba(109,40,217,0.3)",
        },
      };
    }
    return {};
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-md border border-gray-100 p-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FaCalendarAlt className="text-lucy" />
          Agenda
        </h2>
        {onAddEvent && (
          <button
            onClick={onAddEvent}
            className="flex items-center gap-2 px-3 py-2 bg-lucy hover:bg-lucy text-white text-sm font-semibold rounded-lg shadow transition"
          >
            <FaPlus className="text-sm" /> Novo evento
          </button>
        )}
      </div>

      {/* Calendário */}
      <div
        className={`
          w-full
          bg-white
          rounded-xl
          border border-purple-100
          overflow-hidden
          ${isMobile ? "h-[85vh] overflow-x-auto" : "h-[80vh]"}
        `}
      >
        <div className={`${isMobile ? "min-w-[750px]" : "w-full"} h-full`}>
          <Calendar
            localizer={localizer}
            events={events.map((event) => ({
              ...event,
              start: new Date(event.start),
              end: new Date(event.end),
            }))}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%", width: "100%" }}
            popup
            views={["month", "agenda"]}
            view={isMobile ? Views.MONTH : view}
            onView={(v: string) => setView(v)}
            date={selectedDate}
            onNavigate={(date: Date) => setSelectedDate(date)}
            messages={{
              month: "Mês",
              week: "Semana",
              day: "Dia",
              today: "Hoje",
              previous: "Anterior",
              next: "Próximo",
              agenda: "Agenda",
              showMore: (total: number) => `+${total} mais`,
            }}
            culture="pt-BR"
            eventPropGetter={eventStyleGetter}
            dayPropGetter={dayPropGetter}
            components={{
              event: ({ event }: { event: CustomCalendarEvent }) => (
                <div>
                  <strong>{event.title}</strong>
                  {event.description && (
                    <div className="text-[0.7rem] text-gray-100">
                      {event.description}
                    </div>
                  )}
                </div>
              ),
            }}
          />
        </div>
      </div>
    </div>
  );
}


