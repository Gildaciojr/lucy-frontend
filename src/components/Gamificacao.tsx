"use client";

import React, { useState, useEffect } from "react";
import { FaStar, FaTrophy, FaSpinner, FaMedal } from "react-icons/fa";
import { motion } from "framer-motion";

interface Achievement {
  code: string;
  name: string;
  bonusPoints: number;
  unlockedAt: string;
}

interface Summary {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  unlockedCount: number;
  message?: string;
  achievements: Achievement[];
}

export default function Gamificacao() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/gamificacao`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar dados da gamificação");
      }

      const data: Summary = await response.json();
      setSummary(data);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    // recarrega a cada 30s
    const interval = setInterval(fetchSummary, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <div className="text-center p-6 flex items-center justify-center space-x-2">
        <FaSpinner className="animate-spin text-lucy" />
        <span>Carregando gamificação...</span>
      </div>
    );

  if (error)
    return <div className="text-center text-red-500 p-6">Erro: {error}</div>;

  if (!summary)
    return (
      <div className="text-center text-gray-500 p-6">
        Nenhum dado de gamificação disponível.
      </div>
    );

  const { totalPoints, currentStreak, longestStreak, unlockedCount, message } =
    summary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl shadow-md bg-gradient-to-br from-lucy to-lucy text-white"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FaTrophy /> Gamificação
        </h2>
        <p className="text-lg font-semibold">
          <FaStar className="inline text-yellow-300 mr-1" />
          {totalPoints} pts
        </p>
      </div>

      <p className="text-sm opacity-90 mb-4">{message}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        <div className="bg-white/10 p-3 rounded-lg">
          <p className="text-sm opacity-80">Pontuação</p>
          <p className="text-xl font-bold">{totalPoints}</p>
        </div>
        <div className="bg-white/10 p-3 rounded-lg">
          <p className="text-sm opacity-80">Conquistas</p>
          <p className="text-xl font-bold">{unlockedCount}</p>
        </div>
        <div className="bg-white/10 p-3 rounded-lg">
          <p className="text-sm opacity-80">Streak atual</p>
          <p className="text-xl font-bold">{currentStreak} dias</p>
        </div>
        <div className="bg-white/10 p-3 rounded-lg">
          <p className="text-sm opacity-80">Maior streak</p>
          <p className="text-xl font-bold">{longestStreak}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {summary.achievements && summary.achievements.length > 0 ? (
          summary.achievements.map((a) => (
            <div
              key={a.code}
              className="flex items-center bg-white/20 px-3 py-1 rounded-full text-sm"
            >
              <FaMedal className="text-yellow-300 mr-2" />
              {a.name}
            </div>
          ))
        ) : (
          <p className="text-sm text-white/80">
            Nenhuma conquista desbloqueada ainda.
          </p>
        )}
      </div>
    </motion.div>
  );
}





