"use client";

/**
 * 🔧 Normaliza a URL base
 */
function normalize(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * Verifica se o valor é um objeto
 */
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/**
 * Extrai mensagem de erro
 */
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

const RAW_BASE = process.env.NEXT_PUBLIC_API_URL || "";
export const API_BASE = normalize(RAW_BASE || "https://api.mylucy.app");

/**
 * Função principal de fetch da Lucy com retry inteligente
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retries = 2
): Promise<T> {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token && !headers.Authorization) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      mode: "cors",
      credentials: "include",
    });

    const text = await response.text();
    let payload: unknown = {};
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = text;
      }
    }

    if (!response.ok) {
      // Retry automático em erros temporários
      if (
        retries > 0 &&
        [429, 500, 502, 503, 504].includes(response.status)
      ) {
        const delay = 500 * (3 - retries); // 500ms, 1000ms...
        await new Promise((r) => setTimeout(r, delay));
        return apiFetch(path, options, retries - 1);
      }

      throw new Error(getErrorMessage(payload, response));
    }

    return payload as T;
  } catch (error) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 700));
      return apiFetch(path, options, retries - 1);
    }
    throw error;
  }
}

/* ===========================================================
   🔹 API Registros Financeiros (mantida)
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








