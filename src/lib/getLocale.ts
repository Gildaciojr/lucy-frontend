// frontend/src/lib/getLocale.ts
"use server";

import { headers, cookies } from "next/headers";

export function getLocale(): string {
  // força tipagem correta
  const hdrs: Headers = headers() as unknown as Headers;
  const cookieStore = cookies() as unknown as import("next/dist/server/web/spec-extension/adapters/request-cookies").ReadonlyRequestCookies;

  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;

  // Detecta idioma pelo domínio (host)
  const host = hdrs.get("host") ?? "";
  if (host.startsWith("es.")) {
    return "es";
  }

  // prioridade: header -> cookie -> fallback
  return hdrs.get("x-locale") ?? cookieLocale ?? "pt";
}




