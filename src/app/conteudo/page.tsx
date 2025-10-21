"use client";

import Conteudo from "@/components/Conteudo";
import { useState } from "react";
import { FaCamera, FaTimes } from "react-icons/fa";
import { apiFetch } from "@/lib/api";

export default function ConteudoPage() {
  const [imagens, setImagens] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const token = localStorage.getItem("auth_token");
      const result = await apiFetch<{ url: string }>("/conteudo/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      setImagens((prev) => [result.url, ...prev]);
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar imagem. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-lucy rounded-2xl shadow-md border border-lucy-dark p-5 flex flex-col items-center justify-center mx-6 mt-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          Lucy Creator
        </h1>
        <p className="text-white/80 mt-2 text-center text-sm">
          Gerencie suas ideias, conteúdos e imagens 💜
        </p>
      </div>

      {/* Main */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Card original de ideias */}
          <Conteudo />

          {/* 🟣 Novo Card de Upload de Imagens */}
          <div className="bg-white rounded-2xl shadow-md border border-lucy/30 p-5 sm:p-6">
            <h3 className="text-lg font-semibold text-lucy mb-4 flex items-center gap-2">
              <FaCamera className="text-lucy" />
              Envie suas imagens 📸
            </h3>

            <div className="flex justify-center mb-4">
              <label className="cursor-pointer bg-lucy hover:bg-lucy-dark text-white font-semibold px-5 py-2 rounded-lg shadow-md transition-colors">
                {uploading ? "Enviando..." : "📤 Enviar imagem"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </label>
            </div>

            {imagens.length === 0 ? (
              <p className="text-center text-gray-500 text-sm">
                Nenhuma imagem enviada ainda.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {imagens.map((url, i) => (
                  <div
                    key={i}
                    className="relative group overflow-hidden rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
                  >
                    <img
                      src={url}
                      alt={`Imagem ${i + 1}`}
                      className="w-full h-40 object-cover cursor-pointer group-hover:scale-105 transition-transform"
                      onClick={() => setPreview(url)}
                    />
                  </div>
                ))}
              </div>
            )}

            {preview && (
              <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                <div className="relative max-w-3xl w-full">
                  <button
                    onClick={() => setPreview(null)}
                    className="absolute top-3 right-3 bg-white/90 rounded-full p-2 hover:bg-white shadow"
                  >
                    <FaTimes className="text-lucy" />
                  </button>
                  <img
                    src={preview}
                    alt="Visualização"
                    className="w-full max-h-[80vh] object-contain rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-8">
        <div className="max-w-6xl mx-auto px-6 py-4 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} Lucy — Gestão de Ideias
        </div>
      </footer>
    </div>
  );
}
