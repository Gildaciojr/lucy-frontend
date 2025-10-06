"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { FaTrophy, FaPlus, FaSpinner, FaFlagCheckered } from "react-icons/fa";

interface Achievement {
  code: string;
  name: string;
  bonusPoints: number;
  unlockedAt: string;
}
interface ActionLog {
  id: number;
  type: string;
  points: number;
  createdAt: string;
  meta?: Record<string, unknown> | null;

}
interface Summary {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  unlockedCount: number;
  message?: string;
  achievements: Achievement[];
  recent: ActionLog[];
}
interface Goal {
  id: number;
  title: string;
  targetCommits?: number | null;
  targetSavings?: number | null;
  targetCustom?: string | null;
  achieved: boolean;
  createdAt: string;
}

export default function GamificacaoPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [targetCommits, setTargetCommits] = useState<string>("");
  const [targetSavings, setTargetSavings] = useState<string>("");
  const [targetCustom, setTargetCustom] = useState("");

  const loadAll = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("Sem token");
      const headers = { Authorization: `Bearer ${token}` };

      const [s, g] = await Promise.all([
        apiFetch<Summary>("/gamificacao", { headers }),
        apiFetch<Goal[]>("/gamificacao/goals", { headers }),
      ]);
      setSummary(s);
      setGoals(g);
    } catch (e) {
      // noop
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
  }, []);

  const createGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    await apiFetch("/gamificacao/goals", {
      method: "POST",
      headers,
      body: JSON.stringify({
        title,
        targetCommits: targetCommits ? Number(targetCommits) : null,
        targetSavings: targetSavings ? Number(targetSavings) : null,
        targetCustom: targetCustom || null,
      }),
    });
    setTitle("");
    setTargetCommits("");
    setTargetSavings("");
    setTargetCustom("");
    await loadAll();
  };

  const toggleAchieved = async (id: number, achieved: boolean) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    await apiFetch(`/gamificacao/goals/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ achieved: !achieved }),
    });
    await loadAll();
  };

  if (loading)
    return (
      <div className="p-6 flex items-center gap-2">
        <FaSpinner className="animate-spin" /> Carregando…
      </div>
    );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow p-5 border">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 text-3xl">
            <FaTrophy />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-purple-700">Gamificação</h1>
            <p className="text-gray-600">
              Pontos: <b>{summary?.totalPoints ?? 0}</b> • Streak:{" "}
              <b>{summary?.currentStreak ?? 0}d</b> (máx {summary?.longestStreak ?? 0}) •
              Conquistas: <b>{summary?.unlockedCount ?? 0}</b>
            </p>
            {summary?.message && <p className="mt-1 text-gray-700">{summary.message}</p>}
          </div>
        </div>
      </div>

      {/* Metas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-5 border">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FaFlagCheckered /> Definir uma meta
          </h2>
          <form onSubmit={createGoal} className="space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Título da meta (ex.: Economizar R$ 500)"
              className="w-full border rounded-lg px-3 py-2"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="number"
                value={targetCommits}
                onChange={(e) => setTargetCommits(e.target.value)}
                placeholder="Compromissos (ex.: 10)"
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="number"
                step="0.01"
                value={targetSavings}
                onChange={(e) => setTargetSavings(e.target.value)}
                placeholder="Economia (R$)"
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                value={targetCustom}
                onChange={(e) => setTargetCustom(e.target.value)}
                placeholder="Outro objetivo (texto)"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700"
            >
              <FaPlus /> Salvar meta
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow p-5 border">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Minhas metas</h2>
          {goals.length === 0 ? (
            <p className="text-gray-600">Nenhuma meta definida.</p>
          ) : (
            <ul className="space-y-3">
              {goals.map((g) => (
                <li
                  key={g.id}
                  className="border rounded-lg p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold">{g.title}</p>
                    <p className="text-xs text-gray-600">
                      {g.targetCommits ? `Compromissos: ${g.targetCommits} • ` : ""}
                      {g.targetSavings ? `Economia: R$ ${g.targetSavings} • ` : ""}
                      {g.targetCustom ? `Outro: ${g.targetCustom}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleAchieved(g.id, g.achieved)}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                      g.achieved
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {g.achieved ? "Concluída" : "Marcar concluída"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Conquistas */}
      <div className="bg-white rounded-xl shadow p-5 border">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Conquistas</h2>
        {summary?.achievements?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {summary.achievements.map((a) => (
              <div key={a.code} className="border rounded-lg p-3">
                <p className="font-semibold">{a.name}</p>
                <p className="text-xs text-gray-600">
                  Bônus: +{a.bonusPoints} • {new Date(a.unlockedAt).toLocaleString("pt-BR")}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Nenhuma conquista ainda.</p>
        )}
      </div>

      {/* Últimas ações */}
      <div className="bg-white rounded-xl shadow p-5 border">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Últimas ações</h2>
        {summary?.recent?.length ? (
          <ul className="space-y-2">
            {summary.recent.map((r) => (
              <li key={r.id} className="text-sm text-gray-700">
                +{r.points} • {r.type} • {new Date(r.createdAt).toLocaleString("pt-BR")}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">Sem ações recentes.</p>
        )}
      </div>
    </div>
  );
}



