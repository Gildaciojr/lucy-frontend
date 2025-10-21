"use client";

import React, { useEffect, useState, useMemo } from "react";
import { apiFetch } from "@/lib/api";
import {
  FaStar,
  FaSpinner,
  FaMedal,
  FaFire,
  FaChartLine,
  FaCalendarCheck,
  FaClipboardList,
  FaMoneyBillWave,
  FaLightbulb,
  FaLock,
  FaListOl,
  FaCheckCircle,
  FaRocket,
  FaCheck,
} from "react-icons/fa";
import { motion } from "framer-motion";

interface Achievement {
  code: string;
  name: string;
  bonusPoints: number;
  unlockedAt: string;
}

type ActionType =
  | "DAILY_FIRST_ACCESS"
  | "FINANCE_CREATED"
  | "AGENDA_CREATED"
  | "AGENDA_COMPLETED"
  | "AGENDA_AGENT"
  | "CONTENT_CREATED"
  | "CONTENT_FAVORITED"
  | "STREAK_3"
  | "STREAK_7";

interface ActionLog {
  id: number;
  action: ActionType;
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

const ACTION_LABEL: Record<ActionType, string> = {
  DAILY_FIRST_ACCESS: "Primeiro acesso do dia",
  FINANCE_CREATED: "Registro financeiro criado",
  AGENDA_CREATED: "Compromisso criado",
  AGENDA_COMPLETED: "Compromisso concluído",
  AGENDA_AGENT: "Atividade do agente da agenda",
  CONTENT_CREATED: "Conteúdo criado",
  CONTENT_FAVORITED: "Conteúdo favoritado",
  STREAK_3: "Streak de 3 dias",
  STREAK_7: "Streak de 7 dias",
};

export default function GamificacaoPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [animatedPoints, setAnimatedPoints] = useState(0);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [title, setTitle] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [targetCommits, setTargetCommits] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [targetSavings, setTargetSavings] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // contador animado
  useEffect(() => {
    if (!summary) return;
    const total = summary.totalPoints ?? 0;
    const duration = 1200;
    const step = (timestamp: number, startTime: number) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setAnimatedPoints(Math.floor(progress * total));
      if (progress < 1) requestAnimationFrame((now) => step(now, startTime));
    };
    requestAnimationFrame((now) => step(now, now));
  }, [summary]);

  const availableAchievements = [
    {
      name: "Primeiros Passos",
      color: "bg-green-500",
      icon: <span className="text-white font-bold text-sm">1</span>,
      points: 50,
    },
    {
      name: "Organizado(a)",
      color: "bg-yellow-400",
      icon: <FaListOl className="text-white" />,
      points: 150,
    },
    {
      name: "Pontual",
      color: "bg-blue-500",
      icon: <FaCheckCircle className="text-white" />,
      points: 200,
    },
    {
      name: "Controlado(a)",
      color: "bg-orange-400",
      icon: <FaRocket className="text-white" />,
      points: 200,
    },
    {
      name: "Criador(a)",
      color: "bg-purple-500",
      icon: <FaLightbulb className="text-white" />,
      points: 250,
    },
    {
      name: "Lendário(a)",
      color: "bg-yellow-500",
      icon: <FaMedal className="text-yellow-300" />,
      points: 0,
    },
  ];

  const pointActions = [
    {
      name: "Primeiro acesso do dia",
      points: 10,
      icon: <FaFire className="text-orange-500" />,
    },
    {
      name: "Criar compromisso na agenda",
      points: 20,
      icon: <FaClipboardList className="text-blue-500" />,
    },
    {
      name: "Concluir compromisso",
      points: 30,
      icon: <FaCalendarCheck className="text-green-600" />,
    },
    {
      name: "Registrar despesa ou receita",
      points: 20,
      icon: <FaMoneyBillWave className="text-emerald-600" />,
    },
    {
      name: "Criar conteúdo",
      points: 40,
      icon: <FaLightbulb className="text-yellow-400" />,
    },
    {
      name: "03 dias seguidos de uso",
      points: 50,
      icon: <FaMedal className="text-purple-400" />,
    },
    {
      name: "07 dias seguidos de uso",
      points: 100,
      icon: <FaStar className="text-yellow-500" />,
    },
  ];

  const unlockedNames = useMemo(
    () => (summary?.achievements ?? []).map((a) => a.name),
    [summary?.achievements]
  );

  const progressPercent = useMemo(() => {
    const total = summary?.totalPoints ?? 0;
    return Math.min(100, (total / 10000) * 100); // ✅ meta 10.000 pts
  }, [summary?.totalPoints]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-60 text-purple-400 font-semibold">
        <FaSpinner className="animate-spin text-2xl mr-2" />
        Carregando sua gamificação…
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-purple-100 to-purple-100 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header com estrela e contador */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow p-6 border border-purple-100 flex items-center gap-4"
        >
          <div className="p-4 rounded-full bg-yellow-100 text-yellow-600 text-4xl">
            <FaStar />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-purple-400">
              Pontuação Total
            </h1>
            <motion.p
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-4xl font-extrabold text-purple-400"
            >
              {animatedPoints}
            </motion.p>
            <p className="text-gray-600">
              Streak atual: <b>{summary?.currentStreak ?? 0} dias</b> • Máx:{" "}
              <b>{summary?.longestStreak ?? 0}</b> • Conquistas:{" "}
              <b>{summary?.unlockedCount ?? 0}</b>
            </p>
          </div>
        </motion.div>

        {/* Barra de progresso */}
        <div className="bg-white p-5 rounded-2xl shadow border border-purple-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <FaMedal className="text-yellow-500" /> Progresso
          </h2>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="h-4 bg-gradient-to-r from-purple-500 to-fuchsia-500"
              transition={{ duration: 1 }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {Math.round(progressPercent)}%
          </p>
        </div>

        {/* Conquistas */}
        <div className="bg-white rounded-2xl shadow p-6 border border-purple-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FaMedal className="text-purple-400" /> Conquistas
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {availableAchievements.map((ach) => {
              const unlocked = unlockedNames.includes(ach.name);
              return (
                <motion.div
                  key={ach.name}
                  whileHover={{ scale: 1.05 }}
                  className={`p-3 rounded-xl flex flex-col items-center justify-center text-center shadow-sm border transition ${
                    unlocked
                      ? "bg-purple-50 border-purple-300"
                      : "bg-gray-50 border-gray-200 opacity-80"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${ach.color}`}
                  >
                    {ach.icon}
                  </div>
                  <h3 className="font-semibold mt-2 text-gray-800 text-xs">
                    {ach.name}
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1">
                    +{ach.points} pts
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Como conseguir pontos */}
        <div className="bg-white rounded-2xl shadow p-6 border border-purple-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FaRocket className="text-fuchsia-500" /> Como conseguir pontos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {pointActions.map((action) => (
              <motion.div
                key={action.name}
                whileHover={{ scale: 1.03 }}
                className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 border border-purple-200 flex items-center gap-3 shadow-sm"
              >
                <div className="text-xl">{action.icon}</div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">
                    {action.name}
                  </h4>
                  <p className="text-xs text-gray-500">+{action.points} pts</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Últimas ações */}
        <div className="bg-white rounded-2xl shadow p-6 border border-purple-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FaChartLine className="text-purple-500" /> Últimas ações
          </h2>
          {summary?.recent?.length ? (
            <ul className="space-y-2 text-sm text-gray-700">
              {summary.recent.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap md:flex-nowrap gap-2 justify-between bg-gray-50 rounded-lg px-3 py-2 hover:bg-purple-50 transition"
                >
                  <span className="font-semibold text-purple-500">
                    {ACTION_LABEL[r.action] ?? r.action}
                  </span>
                  <span className="text-emerald-600 font-semibold">
                    +{r.points} pts
                  </span>
                  <span className="text-gray-600">
                    {new Date(r.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <FaCheck /> Concluído com sucesso
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
