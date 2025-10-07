"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  FaTrophy,
  FaPlus,
  FaSpinner,
  FaFlagCheckered,
  FaMedal,
  FaStar,
  FaFire,
  FaChartLine,
  FaGift,
} from "react-icons/fa";
import { motion } from "framer-motion";

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
    } catch {
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
      <div className="flex justify-center items-center h-60 text-purple-700 font-semibold">
        <FaSpinner className="animate-spin text-2xl mr-2" />
        Carregando sua gamificação…
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-100 p-6">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow p-6 border border-purple-100 flex items-center gap-4"
        >
          <div className="p-4 rounded-full bg-yellow-100 text-yellow-600 text-4xl">
            <FaTrophy />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-purple-700">
              Gamificação Lucy
            </h1>
            <p className="text-gray-600">
              Pontos: <b>{summary?.totalPoints ?? 0}</b> • Streak atual:{" "}
              <b>{summary?.currentStreak ?? 0} dias</b> (máx:{" "}
              {summary?.longestStreak ?? 0}) • Conquistas:{" "}
              <b>{summary?.unlockedCount ?? 0}</b>
            </p>
            {summary?.message && (
              <p className="mt-2 text-sm text-gray-700">{summary.message}</p>
            )}
          </div>
        </motion.div>

        {/* Barra de progresso */}
        <div className="bg-white p-5 rounded-2xl shadow border border-purple-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <FaMedal className="text-yellow-500" /> Progresso Geral
          </h2>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${
                  ((summary?.unlockedCount ?? 0) /
                    (summary?.achievements.length || 1)) *
                  100
                }%`,
              }}
              className="h-4 bg-gradient-to-r from-purple-600 to-fuchsia-500"
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        {/* Metas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow p-5 border border-purple-100"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FaFlagCheckered className="text-purple-600" /> Definir nova meta
            </h2>
            <form onSubmit={createGoal} className="space-y-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Título da meta (ex.: Economizar R$ 500)"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="number"
                  value={targetCommits}
                  onChange={(e) => setTargetCommits(e.target.value)}
                  placeholder="Compromissos"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400"
                />
                <input
                  type="number"
                  step="0.01"
                  value={targetSavings}
                  onChange={(e) => setTargetSavings(e.target.value)}
                  placeholder="Economia (R$)"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400"
                />
                <input
                  value={targetCustom}
                  onChange={(e) => setTargetCustom(e.target.value)}
                  placeholder="Outro objetivo"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
              >
                <FaPlus /> Salvar meta
              </button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow p-5 border border-purple-100"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Minhas metas
            </h2>
            {goals.length === 0 ? (
              <p className="text-gray-600">Nenhuma meta definida.</p>
            ) : (
              <ul className="space-y-3">
                {goals.map((g) => (
                  <li
                    key={g.id}
                    className={`border rounded-lg p-3 flex items-center justify-between transition ${
                      g.achieved
                        ? "bg-purple-50 border-purple-300"
                        : "hover:bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{g.title}</p>
                      <p className="text-xs text-gray-600">
                        {g.targetCommits
                          ? `Compromissos: ${g.targetCommits} • `
                          : ""}
                        {g.targetSavings
                          ? `Economia: R$ ${g.targetSavings} • `
                          : ""}
                        {g.targetCustom ? `Outro: ${g.targetCustom}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleAchieved(g.id, g.achieved)}
                      className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                        g.achieved
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-700"
                      }`}
                    >
                      {g.achieved ? "Concluída" : "Marcar concluída"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </div>

        {/* Conquistas */}
        <div className="bg-white rounded-2xl shadow p-6 border border-purple-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FaGift className="text-fuchsia-500" /> Conquistas Desbloqueadas
          </h2>
          {summary?.achievements?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {summary.achievements.map((a, i) => (
                <motion.div
                  key={a.code}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="p-4 rounded-xl border shadow-sm bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white hover:shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl text-yellow-300">
                      {i % 3 === 0 ? <FaStar /> : i % 3 === 1 ? <FaFire /> : <FaChartLine />}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{a.name}</h3>
                      <p className="text-sm opacity-90">
                        +{a.bonusPoints} pontos •{" "}
                        {new Date(a.unlockedAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Nenhuma conquista ainda.</p>
          )}
        </div>

        {/* Últimas ações */}
        <div className="bg-white rounded-2xl shadow p-6 border border-purple-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FaChartLine className="text-purple-600" /> Últimas ações
          </h2>
          {summary?.recent?.length ? (
            <ul className="space-y-2 text-sm text-gray-700">
              {summary.recent.map((r) => (
                <li
                  key={r.id}
                  className="flex justify-between bg-gray-50 rounded-lg px-3 py-2 hover:bg-purple-50 transition"
                >
                  <span>+{r.points} pts</span>
                  <span>{r.type}</span>
                  <span>
                    {new Date(r.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">Sem ações recentes.</p>
          )}
        </div>
      </div>
    </div>
  );
}




