// frontend/src/lib/api.ts

// Garante que a variável do .env é usada corretamente
const raw = (process.env.NEXT_PUBLIC_API_URL || "").trim().replace(/\/+$/, "");

// Se já terminar com /api, mantém. Se não, adiciona /api no final.
export const API_BASE = raw.endsWith("/api") ? raw : `${raw}/api`;
