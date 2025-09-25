"use client";

import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { FaUserCircle, FaLock, FaSignOutAlt, FaUser } from "react-icons/fa";

interface User {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const pathname = window.location.pathname;
    const isPublic = pathname === "/login" || pathname === "/signup";

    if (!token && !isPublic) {
      window.location.href = "/login";
      return;
    }

    if (token) {
      apiFetch<User>("/users/me")
        .then((u) => setUser(u))
        .catch(() => {});
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    window.location.href = "/login";
  };

  return (
    <div className="relative" ref={ref}>
      {/* Botão do usuário */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 px-3 py-2 transition"
      >
        <div className="h-9 w-9 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold shadow-md">
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <span className="hidden sm:block text-white font-medium">
          {user?.name || "Usuário"}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-lg ring-1 ring-black/5 p-2 z-50">
          <button
            className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100"
            onClick={() => {
              setOpen(false);
              window.dispatchEvent(new CustomEvent("open-profile-modal"));
            }}
          >
            <FaUser className="text-purple-600" /> Meu perfil
          </button>
          <button
            className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100"
            onClick={() => {
              setOpen(false);
              window.dispatchEvent(new CustomEvent("open-password-modal"));
            }}
          >
            <FaLock className="text-gray-600" /> Alterar senha
          </button>
          <hr className="my-2" />
          <button
            className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-600"
            onClick={logout}
          >
            <FaSignOutAlt /> Sair
          </button>
        </div>
      )}

      <ProfileModal />
      <PasswordModal />
    </div>
  );
}

/** Modal para editar nome/telefone */
function ProfileModal() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const onOpen = () => {
      setOpen(true);
      apiFetch<User>("/users/me")
        .then((u) => {
          setName(u.name || "");
          setPhone(u.phone || "");
        })
        .catch(() => {});
    };
    window.addEventListener("open-profile-modal", onOpen as EventListener);
    return () =>
      window.removeEventListener("open-profile-modal", onOpen as EventListener);
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await apiFetch("/users/me", {
        method: "PUT",
        body: JSON.stringify({ name, phone }),
      });
      setOpen(false);
    } catch {
      alert("Erro ao salvar perfil.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Meu perfil</h3>
        <div className="space-y-3">
          <input
            className="w-full rounded-lg border p-3"
            placeholder="Nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="w-full rounded-lg border p-3"
            placeholder="Telefone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition disabled:opacity-50"
            onClick={save}
            disabled={saving}
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Modal para alterar senha */
function PasswordModal() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("open-password-modal", onOpen as EventListener);
    return () =>
      window.removeEventListener("open-password-modal", onOpen as EventListener);
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await apiFetch("/users/me", {
        method: "PUT",
        body: JSON.stringify({ password: newPassword }),
      });
      setOpen(false);
      setNewPassword("");
    } catch {
      alert("Erro ao alterar a senha.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Alterar senha</h3>
        <input
          className="w-full rounded-lg border p-3"
          placeholder="Nova senha"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <div className="mt-6 flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition disabled:opacity-50"
            onClick={save}
            disabled={saving || !newPassword}
          >
            {saving ? "Salvando..." : "Alterar"}
          </button>
        </div>
      </div>
    </div>
  );
}





