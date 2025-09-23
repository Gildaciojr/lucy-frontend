// frontend/src/services/leadsService.ts
import { apiFetch } from "@/lib/api";

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
  // apiFetch já injeta o Authorization do localStorage, quando existir
  return apiFetch<Lead[]>("/leads");
}

