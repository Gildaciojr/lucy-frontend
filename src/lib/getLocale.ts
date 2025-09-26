"use server";

import { headers, cookies } from "next/headers";

export async function getLocale(): Promise<string> {
  try {
    const hdrs = headers() as unknown as Headers;
    const cookieStore = cookies() as unknown as {
      get(name: string): { value: string } | undefined;
    };

    // 🌍 força espanhol se o host começar com es.
    const host = hdrs.get("host") || "";
    if (host.startsWith("es.")) {
      return "es";
    }

    // prioridade: header -> cookie -> fallback
    return (
      hdrs.get("x-locale") ||
      cookieStore.get("NEXT_LOCALE")?.value ||
      "pt"
    );
  } catch (err) {
    console.error("[getLocale] erro no SSR, fallback para 'pt':", err);
    return "pt";
  }
}






