// frontend/src/services/api.ts
import axios from 'axios';

type Role = 'user' | 'admin' | 'superadmin';

interface RuntimeEnvWindow extends Window {
  NEXT_PUBLIC_API_URL?: string;
  __ENV?: { NEXT_PUBLIC_API_URL?: string };
}

const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const DEFAULT_API = 'https://api.mylucy.app';

function getRuntimeApiUrl(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const w = window as unknown as RuntimeEnvWindow;
  const v1 = w.NEXT_PUBLIC_API_URL;
  const v2 = w.__ENV?.NEXT_PUBLIC_API_URL;
  return typeof v1 === 'string' ? v1 : typeof v2 === 'string' ? v2 : undefined;
}

function pickBaseUrl(): string {
  if (envUrl && /^https?:\/\//i.test(envUrl)) return envUrl;
  const atRuntime = getRuntimeApiUrl();
  if (atRuntime && /^https?:\/\//i.test(atRuntime)) return atRuntime;
  return DEFAULT_API;
}

function normalize(url: string): string {
  return url.replace(/\/+$/, '');
}

export const API_BASE = normalize(pickBaseUrl());

if (typeof window !== 'undefined') {
  console.info('[dashboard] API_BASE =', API_BASE);
}

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export function setAuthToken(token?: string) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export type LoginResponse = {
  access_token: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: Role;
    [k: string]: unknown;
  };
};

export async function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', {
    username,
    password,
  });
  return data;
}

export async function getProfile() {
  const { data } = await api.get('/users/me');
  return data;
}







