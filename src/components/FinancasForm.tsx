"use client";

import React, { useState } from "react";
import { FaPlus, FaSpinner } from "react-icons/fa";
import { useTranslations } from "next-intl";

export default function FinancasForm({ onSave }: { onSave: () => void }) {
  const t = useTranslations("financas.form");
  const [formState, setFormState] = useState({
    categoria: "",
    valor: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"success" | "error" | null>(null);

  const categorias = [
    t("categorias.alimentacao"),
    t("categorias.mercado"),
    t("categorias.moradia"),
    t("categorias.transporte"),
    t("categorias.saude"),
    t("categorias.educacao"),
    t("categorias.lazer"),
    t("categorias.viagem"),
    t("categorias.cuidados"),
    t("categorias.vestuario"),
    t("categorias.pets"),
    t("categorias.doacoes"),
    t("categorias.presentes"),
    t("categorias.assinaturas"),
    t("categorias.familia"),
    t("categorias.trabalho"),
    t("categorias.impostos"),
    t("categorias.investimentos"),
    t("categorias.recebimentos"),
    t("categorias.outros"),
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddFinanca = async (e: React.FormEvent) => {
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
        `${process.env.NEXT_PUBLIC_API_URL}/financas`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formState,
            userId: parseInt(userId, 10),
          }),
        }
      );
      if (!response.ok) {
        throw new Error(t("error.add"));
      }
      setStatus("success");
      setFormState({ categoria: "", valor: "" });
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
      <form onSubmit={handleAddFinanca} className="space-y-4">
        <select
          name="categoria"
          value={formState.categoria}
          onChange={handleInputChange}
          required
          className="w-full p-2 rounded-lg border border-gray-300"
        >
          <option value="">{t("selectCategory")}</option>
          {categorias.map((categoria, index) => (
            <option key={index} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>
        <input
          type="number"
          name="valor"
          value={formState.valor}
          onChange={handleInputChange}
          placeholder={t("placeholder.valor")}
          required
          className="w-full p-2 rounded-lg border border-gray-300"
        />
        <button
          type="submit"
          className="w-full p-3 bg-green-500 text-white font-bold rounded-xl flex items-center justify-center space-x-2"
          disabled={loading}
        >
          {loading ? <FaSpinner className="animate-spin" /> : <FaPlus />}
          <span>{t("add")}</span>
        </button>
        {status === "success" && (
          <p className="text-green-500">{t("success")}</p>
        )}
        {status === "error" && (
          <p className="text-red-500">{t("error.general")}</p>
        )}
      </form>
    </div>
  );
}



