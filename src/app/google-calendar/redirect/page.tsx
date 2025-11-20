"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function GoogleRedirectPage() {
  const params = useSearchParams();

  useEffect(() => {
    const code = params.get("code");
    const token = localStorage.getItem("auth_token");

    if (!code) {
      alert("Código de autorização não encontrado.");
      return;
    }

    if (!token) {
      window.location.href = "/login";
      return;
    }

    async function sendCode() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/google-calendar/redirect?code=${code}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          const text = await res.text();
          alert("Erro ao conectar com Google Calendar: " + text);
          return;
        }

        alert("✅ Sua conta Google Calendar foi conectada com sucesso!");
        window.location.href = "/agenda";
      } catch (err) {
        console.error(err);
        alert("Erro inesperado.");
      }
    }

    sendCode();
  }, [params]);

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <p className="text-lg">Conectando sua conta Google…</p>
    </div>
  );
}
