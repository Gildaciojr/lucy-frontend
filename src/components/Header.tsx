"use client";

import React, { useEffect, useState } from "react";
import Logo from "./Logo";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";

interface User {
  id: number;
  name: string;
  username?: string;
  email?: string;
  phone?: string;
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", password: "" });
  const [message, setMessage] = useState("");

  const strongPassword = (s: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(s);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar usuário.");
        return res.json();
      })
      .then((data: User) => {
        setUser(data);
        setForm({ name: data.name || "", phone: data.phone || "", password: "" });
      })
      .catch(() => setUser(null));
  }, []);

  const handleUpdate = async (field: "name" | "phone" | "password") => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    if (field === "password" && !strongPassword(form.password)) {
      setMessage("❌ A senha precisa ter maiúscula, minúscula, número e caractere especial (mín. 8).");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

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
      setMessage("✅ Atualizado com sucesso!");
    } else {
      setMessage("❌ Erro ao atualizar.");
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    window.location.href = "/login";
  };

  return (
    <header className="w-full flex items-center justify-between px-6 py-4 bg-purple-400 shadow-md relative">
      <Logo />

      {user && (
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-400 text-white rounded-lg shadow hover:bg-purple-400 transition"
          >
            <FaUserCircle className="text-lg" />
            <span className="hidden sm:inline">{user.name || user.username || "Usuário"}</span>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-72 bg-white shadow-xl rounded-xl border p-4 space-y-4 z-50">
              <div>
                <label className="block text-xs text-gray-500">Nome</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
                <button onClick={() => handleUpdate("name")} className="mt-1 text-xs text-purple-400 hover:underline">
                  Atualizar Nome
                </button>
              </div>

              <div>
                <label className="block text-xs text-gray-500">Telefone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
                <button onClick={() => handleUpdate("phone")} className="mt-1 text-xs text-purple-400 hover:underline">
                  Atualizar Telefone
                </button>
              </div>

              <div>
                <label className="block text-xs text-gray-500">Senha</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
                <p className="text-xs text-gray-500">
                  A senha deve conter maiúscula, minúscula, número e caractere especial.
                </p>
                <button onClick={() => handleUpdate("password")} className="mt-1 text-xs text-purple-400 hover:underline">
                  Atualizar Senha
                </button>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 mt-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                <FaSignOutAlt />
                <span>Sair</span>
              </button>

              {message && (
                <p
                  className={`text-xs font-medium ${
                    message.startsWith("✅") ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {message}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}














