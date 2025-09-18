"use client";

import React, { useEffect, useState } from "react";
import Logo from "./Logo";

interface User {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  username?: string;
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", password: "" });
  const [message, setMessage] = useState("");

  // ✅ Busca o usuário logado ao montar
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar usuário");
        return res.json();
      })
      .then((data: User) => {
        setUser(data);
        setForm({
          name: data.name || "",
          phone: data.phone || "",
          password: "",
        });
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  // ✅ Atualiza dados do próprio usuário logado
  const handleUpdate = async (field: "name" | "phone" | "password") => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    const body: Record<string, string> = {};
    body[field] = form[field];

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const updated = await res.json();
      setUser(updated);
      setMessage("Dados atualizados com sucesso!");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("Erro ao atualizar. Tente novamente.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_id");
    window.location.href = "/login";
  };

  return (
    <header className="w-full flex items-center justify-between px-6 py-4 bg-white shadow-md relative">
      <Logo />
      {user && (
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600 transition"
          >
            {user.name || user.username || "Usuário"}
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg border p-4 space-y-3 z-50">
              <div>
                <label className="block text-xs text-gray-500">Nome</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-2 border rounded"
                />
                <button
                  onClick={() => handleUpdate("name")}
                  className="mt-1 text-xs text-blue-600 hover:underline"
                >
                  Atualizar Nome
                </button>
              </div>
              <div>
                <label className="block text-xs text-gray-500">Telefone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full p-2 border rounded"
                />
                <button
                  onClick={() => handleUpdate("phone")}
                  className="mt-1 text-xs text-blue-600 hover:underline"
                >
                  Atualizar Telefone
                </button>
              </div>
              <div>
                <label className="block text-xs text-gray-500">Nova Senha</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
                <button
                  onClick={() => handleUpdate("password")}
                  className="mt-1 text-xs text-blue-600 hover:underline"
                >
                  Alterar Senha
                </button>
              </div>
              <button
                onClick={handleLogout}
                className="w-full py-2 mt-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Sair
              </button>
              {message && <p className="text-xs text-green-600">{message}</p>}
            </div>
          )}
        </div>
      )}
    </header>
  );
}






