"use client";

import React, { useState } from "react";
import { FaGoogle } from "react-icons/fa";

export function GoogleCalendarButton() {
  const [loading, setLoading] = useState(false);

  const connectGoogleCalendar = async () => {
    try {
      setLoading(true);
      // Redireciona para o backend (ele cuida do fluxo OAuth)
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/google-calendar/auth`;
    } catch (err) {
      console.error("Erro ao iniciar conexão com Google Calendar:", err);
      alert("Falha ao conectar com Google Calendar.");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={connectGoogleCalendar}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition"
    >
      <FaGoogle />
      {loading ? "Conectando..." : "Conectar Google Calendar"}
    </button>
  );
}
