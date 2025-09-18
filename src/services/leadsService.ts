export interface Lead {
  id: number;
  display_name: string;
  phone_e164: string;
  plan: string;
  plan_started_at: string | null;
  plan_expires_at: string | null;
  status: string;
}

export async function fetchLeads(): Promise<Lead[]> {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token ?? ""}`,
    },
  });

  if (!res.ok) {
    throw new Error("Erro ao buscar leads");
  }

  return res.json();
}