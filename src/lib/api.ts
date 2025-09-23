// frontend/src/lib/api.ts
const raw = (process.env.NEXT_PUBLIC_API_URL || "").trim().replace(/\/+$/, "");
export const API_BASE = `${raw}/api`;

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    let msg = "Erro na API";
    try {
      const data = await res.json();
      msg = data.message || msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.json();
}
