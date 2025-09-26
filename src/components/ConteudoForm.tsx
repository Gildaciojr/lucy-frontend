"use client";

import React, { useState } from "react";
import { FaPlus, FaSpinner } from "react-icons/fa";
import { useTranslations } from "next-intl";

export default function ConteudoForm({ onSave }: { onSave: () => void }) {
  const t = useTranslations("conteudo.form");
  const [formState, setFormState] = useState({
    ideia: "",
    favorito: false,
    agendado: false,
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"success" | "error" | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormState((prev) => ({ ...prev, [name]: checked }));
  };

  const handleAddConteudo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const token = localStorage.getItem("auth_token");
      const userId = localStorage.getItem("user_id");

      if (!token || !userId) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/conteudo`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...formState, userId: parseInt(userId, 10) }),
        }
      );
      if (!response.ok) {
        throw new Error(t("error.add"));
      }
      setStatus("success");
      setFormState({ ideia: "", favorito: false, agendado: false });
      onSave();
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {t("title")}
      </h3>
      <form onSubmit={handleAddConteudo} className="space-y-4">
        <textarea
          name="ideia"
          value={formState.ideia}
          onChange={handleInputChange}
          placeholder={t("placeholder")}
          required
          rows={3}
          className="w-full p-2 rounded-lg border border-gray-300"
        />
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="favorito"
              checked={formState.favorito}
              onChange={handleCheckboxChange}
              className="form-checkbox h-5 w-5 text-yellow-500 rounded"
            />
            <span className="text-gray-700">{t("favorite")}</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="agendado"
              checked={formState.agendado}
              onChange={handleCheckboxChange}
              className="form-checkbox h-5 w-5 text-blue-500 rounded"
            />
            <span className="text-gray-700">{t("schedule")}</span>
          </label>
        </div>
        <button
          type="submit"
          className="w-full p-3 bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center space-x-2"
          disabled={loading}
        >
          {loading ? <FaSpinner className="animate-spin" /> : <FaPlus />}
          <span>{t("add")}</span>
        </button>
        {status === "success" && (
          <p className="text-green-500">{t("success")}</p>
        )}
        {status === "error" && (
          <p className="text-red-500">{t("error.add")}</p>
        )}
      </form>
    </div>
  );
}


