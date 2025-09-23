// frontend/src/lib/api.ts
export const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || `Erro ${res.status}`);
  }

  return res.json();
}

