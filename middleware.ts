import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const hostname = req.headers.get("host") || "";

  // 🌍 padrão português
  let locale = "pt";

  // Se o domínio começar com "es." → força espanhol
  if (hostname.startsWith("es.")) {
    locale = "es";
  }

  // ✅ Injeta o header `x-locale` para ser lido no layout/getLocale
  const res = NextResponse.next({
    request: {
      headers: new Headers(req.headers),
    },
  });
  res.headers.set("x-locale", locale);

  // ✅ cookie como fallback
  res.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    httpOnly: false,
  });

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};


