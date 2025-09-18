import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Interceptor para adicionar o token JWT
api.interceptors.request.use((config) => {
  if (!config.headers) {
    config.headers = {}; // ✅ garante que não é undefined
  }

  const token = localStorage.getItem("auth_token");
  if (token) {
    (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  return config;
});

export default api;



