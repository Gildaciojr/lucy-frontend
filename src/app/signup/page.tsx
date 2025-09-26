"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaSpinner, FaUserPlus, FaLock } from "react-icons/fa";
import { apiFetch } from "@/lib/api";
import { useTranslations } from "next-intl";

export default function SignupPage() {
  const t = useTranslations("signup");
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });

      router.push("/login");
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(t("error.unknown"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-400 to-purple-600 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-purple-700 mb-6">
          {t("title")}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" placeholder={t("name")} value={form.name} onChange={handleChange} required className="w-full p-3 border rounded-lg" />
          <input name="username" placeholder={t("username")} value={form.username} onChange={handleChange} required className="w-full p-3 border rounded-lg" />
          <input type="email" name="email" placeholder={t("email")} value={form.email} onChange={handleChange} required className="w-full p-3 border rounded-lg" />
          <input type="password" name="password" placeholder={t("password")} value={form.password} onChange={handleChange} required className="w-full p-3 border rounded-lg" />
          <input name="phone" placeholder={t("phone")} value={form.phone} onChange={handleChange} className="w-full p-3 border rounded-lg" />

          <button type="submit" disabled={loading} className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center justify-center space-x-2">
            {loading ? <FaSpinner className="animate-spin" /> : <FaUserPlus />}
            <span>{loading ? t("loading") : t("submit")}</span>
          </button>
        </form>

        {error && <p className="text-center text-red-500 mt-4">{error}</p>}

        <p className="mt-6 text-center text-sm">
          {t("hasAccount")}{" "}
          <a href="/login" className="text-purple-600 hover:underline">
            {t("login")}
          </a>
        </p>

        <footer className="mt-8 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
          <FaLock className="text-purple-600" />
          <span>{t("secure")}</span>
        </footer>
      </div>
    </div>
  );
}















