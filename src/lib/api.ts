"use client";

/** Remove barras finais duplicadas */
function normalize(url: string): string {
  return url.replace(/\/+$/, "");
}

/** Type guard para objetos simples */
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/** Extrai mensagem de erro de payloads variados */
function getErrorMessage(payload: unknown, res: Response): string {
  if (typeof payload === "string" && payload.trim()) return payload;

  if (isRecord(payload)) {
    const candidate =
      (payload["message"] as unknown) ??
      (payload["error"] as unknown) ??
      (payload["msg"] as unknown);

    if (typeof candidate === "string" && candidate.trim()) return candidate;
  }

  return `Erro ${res.status}`;
}

// Lê NEXT_PUBLIC_API_URL e NÃO adiciona /api
const RAW_BASE = process.env.NEXT_PUBLIC_API_URL || "";
export const API_BASE = normalize(RAW_BASE || "https://api.mylucy.app");

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  // Cabeçalhos base
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  // Injeta Bearer automaticamente no client
  if (
    typeof window !== "undefined" &&
    !Object.prototype.hasOwnProperty.call(headers, "Authorization")
  ) {
    const token = localStorage.getItem("auth_token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  const text = await res.text();

  // Tenta parsear JSON; se falhar, mantém string
  let payload: unknown = {};
  if (text) {
    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      payload = text;
    }
  }

  if (!res.ok) {
    throw new Error(getErrorMessage(payload, res));
  }

  return payload as T;
}

/* ===========================================================
   🔹 API Registros Financeiros
   =========================================================== */

export async function getRegistrosFinanceiros() {
  return apiFetch("/registros-financeiros");
}

export async function createRegistroFinanceiro(data: {
  responsavel: string;
  categoria: string;
  tipo: "gasto" | "receita";
  valor: number;
  descricao?: string;
  data_hora?: string;
}) {
  return apiFetch("/registros-financeiros", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateRegistroFinanceiro(
  id: number,
  data: Partial<{
    responsavel: string;
    categoria: string;
    tipo: "gasto" | "receita";
    valor: number;
    descricao?: string;
    data_hora?: string;
  }>
) {
  return apiFetch(`/registros-financeiros/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteRegistroFinanceiro(id: number) {
  return apiFetch(`/registros-financeiros/${id}`, { method: "DELETE" });
}






