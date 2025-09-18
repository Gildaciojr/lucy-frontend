
"use client";

import { useEffect, useRef, useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
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
    const userId = localStorage.getItem("user_id");
    if (!userId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((u: User) => setUser(u))
      .catch(() => {});
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 rounded-full bg-white/10 hover:bg-white/20 px-3 py-2"
      >
        <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <span className="text-white font-medium">{user?.name || "Usuário"}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg ring-1 ring-black/5 p-2">
          <button
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100"
            onClick={() => {
              setOpen(false);
              const ev = new CustomEvent("open-profile-modal");
              window.dispatchEvent(ev);
            }}
          >
            Meu perfil
          </button>
          <button
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100"
            onClick={() => {
              setOpen(false);
              const ev = new CustomEvent("open-password-modal");
              window.dispatchEvent(ev);
            }}
          >
            Alterar senha
          </button>
          <button
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-red-600"
            onClick={() => {
              localStorage.removeItem("auth_token");
              localStorage.removeItem("user_id");
              window.location.href = "/login";
            }}
          >
            Sair
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
      const userId = localStorage.getItem("user_id");
      if (!userId) return;
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`)
        .then(r => r.json())
        .then(u => {
          setName(u.name || "");
          setPhone(u.phone || "");
        });
    };
    window.addEventListener("open-profile-modal", onOpen as EventListener);
    return () => window.removeEventListener("open-profile-modal", onOpen as EventListener);
  }, []);

  const save = async () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;
    setSaving(true);
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      if (!r.ok) throw new Error();
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
      <div className="w-full max-w-md bg-white rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">Meu perfil</h3>
        <div className="space-y-3">
          <input
            className="w-full rounded-lg border p-3"
            placeholder="Nome completo"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input
            className="w-full rounded-lg border p-3"
            placeholder="Telefone"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button className="px-4 py-2 rounded-lg bg-gray-100" onClick={() => setOpen(false)}>Cancelar</button>
          <button
            className="px-4 py-2 rounded-lg bg-purple-600 text-white disabled:opacity-50"
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
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("open-password-modal", onOpen as EventListener);
    return () => window.removeEventListener("open-password-modal", onOpen as EventListener);
  }, []);

  const save = async () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;
    setSaving(true);
    try {
      // ajuste conforme o backend (abaixo proponho PATCH /users/:id/password)
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!r.ok) throw new Error();
      setOpen(false);
      setCurrentPassword("");
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
      <div className="w-full max-w-md bg-white rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">Alterar senha</h3>
        <div className="space-y-3">
          <input
            className="w-full rounded-lg border p-3"
            placeholder="Senha atual"
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
          />
          <input
            className="w-full rounded-lg border p-3"
            placeholder="Nova senha"
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button className="px-4 py-2 rounded-lg bg-gray-100" onClick={() => setOpen(false)}>Cancelar</button>
          <button
            className="px-4 py-2 rounded-lg bg-purple-600 text-white disabled:opacity-50"
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
