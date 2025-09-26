"use server";

import { headers, cookies } from "next/headers";

export async function getLocale(): Promise<string> {
  // força o cast porque TS acha que é Promise<ReadonlyHeaders>
  const hdrs = headers() as unknown as Headers;

  // idem para cookies()
  const cookieStore = cookies() as unknown as {
    get(name: string): { value: string } | undefined;
  };

  // Detecta idioma pelo domínio (host)
  const host = hdrs.get("host") || "";
  if (host.startsWith("es.")) {
    return "es";
  }

  // prioridade: header -> cookie -> fallback
  return hdrs.get("x-locale") || cookieStore.get("NEXT_LOCALE")?.value || "pt";
}





