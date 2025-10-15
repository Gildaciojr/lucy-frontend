"use client";

import React, { useState, useEffect } from "react";
import { FaLanguage, FaCommentAlt, FaCrown, FaSpinner } from "react-icons/fa";

interface User {
  id: number;
  plan?: string;
}

interface SettingsCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const SettingsCard: React.FC<SettingsCardProps> = ({
  icon,
  title,
  children,
}) => {
  return (
    <div className="flex flex-col space-y-4 p-6 bg-white rounded-xl shadow-md">
      <div className="flex items-center space-x-4">
        <div className="text-2xl text-gray-700">{icon}</div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  );
};

export default function Settings() {
  const [selectedLanguage, setSelectedLanguage] = useState("pt-BR");
  const [feedback, setFeedback] = useState("");
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<string | null>(null);
  const [planStatus, setPlanStatus] = useState({
    plan: "N/A",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserPlan = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      // 🔹 agora o backend pega userId do token
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar plano do usuário.");
      }
      const user: User = await response.json();

      setPlanStatus({
        plan: user.plan || "Free",
      });
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPlan();
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(e.target.value);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackRating === null) {
      setFeedbackStatus("Selecione uma nota antes de enviar.");
      setTimeout(() => setFeedbackStatus(null), 3000);
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/feedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating: feedbackRating,
            comment: feedback,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao enviar feedback.");
      }
      setFeedbackStatus("✅ Feedback enviado com sucesso!");
      setFeedback("");
      setFeedbackRating(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFeedbackStatus(err.message);
      } else {
        setFeedbackStatus("Erro inesperado ao enviar feedback.");
      }
    } finally {
      setTimeout(() => setFeedbackStatus(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-6 flex items-center justify-center space-x-2">
        <FaSpinner className="animate-spin" />
        <span>Carregando...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-6 text-red-500">Erro: {error}</div>;
  }

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-inner flex flex-col space-y-6">
      <SettingsCard icon={<FaLanguage />} title="Idioma">
        <select
          value={selectedLanguage}
          onChange={handleLanguageChange}
          className="p-3 bg-gray-100 rounded-lg text-gray-700 w-full"
        >
          <option value="pt-BR">Português</option>
          <option value="en-US">Inglês</option>
          <option value="es-ES">Espanhol</option>
        </select>
      </SettingsCard>

      <SettingsCard icon={<FaCommentAlt />} title="Feedback">
        <h4 className="text-lg font-semibold text-gray-700 mb-2">
          Como você avalia nossa plataforma?
        </h4>

        {/* Grade responsiva para mobile */}
        <div className="grid grid-cols-6 sm:grid-cols-11 gap-2">
          {[...Array(11).keys()].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => setFeedbackRating(rating)}
              className={`h-10 rounded-lg font-bold transition-colors duration-200 ${
                feedbackRating === rating
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {rating}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleFeedbackSubmit}
          className="flex flex-col space-y-4 mt-3"
        >
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Digite seu comentário..."
            rows={4}
            className="p-3 bg-gray-100 rounded-lg text-gray-700 w-full"
          />
          <button
            type="submit"
            className="p-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors"
          >
            Enviar Feedback
          </button>
        </form>
        {feedbackStatus && (
          <div className="p-3 bg-green-100 text-green-700 rounded-lg">
            {feedbackStatus}
          </div>
        )}
      </SettingsCard>

      <SettingsCard icon={<FaCrown />} title="Plano">
        <div className="flex items-center space-x-4">
          <h4 className="text-lg font-semibold text-gray-700">Plano Atual</h4>
          <p className="text-xl font-bold text-green-500">{planStatus.plan}</p>
        </div>
        <div className="flex flex-col space-y-2 mt-2">
          <a
            href="https://wa.me/5511999892575?text=Olá!%20Gostaria%20de%20atualizar%20meu%20plano."
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors text-center"
          >
            Precisa de ajuda? Fale conosco.
          </a>
        </div>
      </SettingsCard>
    </div>
  );
}







