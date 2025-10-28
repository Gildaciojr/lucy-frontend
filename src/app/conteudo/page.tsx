"use client";

import Conteudo from "@/components/Conteudo";
import { useState, useEffect, useRef } from "react";
import { FaCamera, FaTimes, FaTrash, FaPaperPlane } from "react-icons/fa";
import Image from "next/image";

export default function ConteudoPage() {
  const [imagens, setImagens] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // 🔹 Estados da IA com chat
  const [showAI, setShowAI] = useState(false);
  const [input, setInput] = useState("");
  const [conversation, setConversation] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  // 🔹 Upload de imagens
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/conteudo/upload`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!response.ok) throw new Error(`Erro ao enviar: ${response.status}`);

      const result = await response.json();
      setImagens((prev) => [result.url, ...prev]);
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar imagem. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (url: string) => {
    const confirmDelete = confirm("Deseja realmente excluir esta imagem?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("auth_token");
      const parts = url.split("/");
      const idPart = parts[parts.length - 1]?.split("-")[0];
      if (!idPart) return;

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/conteudo/imagem/${idPart}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setImagens((prev) => prev.filter((img) => img !== url));
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir imagem.");
    }
  };

  // 🔹 Enviar mensagem para IA com histórico
  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input.trim();
    setInput("");
    setConversation((prev) => [
      ...prev,
      { role: "user", content: userMessage },
    ]);

    try {
      setLoadingAI(true);
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "Você é a Lucy 💜 — uma assistente pessoal de IA da plataforma MyLucy. Sua função é ajudar o usuário com finanças, agenda, conteúdos e motivação, de forma leve e clara. Quando o usuário disser 'Oi Lucy', responda: 'Oi 💜 Eu sou a Lucy, sua assistente pessoal de IA. Posso simplificar sua rotina — te ajudando a cuidar das finanças, organizar a agenda e criar conteúdos incríveis direto no WhatsApp. É só me chamar quando quiser uma ideia, um roteiro ou aquele empurrãozinho pra postar algo que engaja.'",
            },
            ...conversation.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: userMessage },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao gerar resposta.");
      setConversation((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err: unknown) {
      console.error(err);
      setConversation((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Erro ao processar a resposta da Lucy.",
        },
      ]);
    } finally {
      setLoadingAI(false);
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

      {/* 🔮 Card IA GPT */}
      <div className="max-w-6xl mx-auto mt-6 px-6">
        <div className="bg-white rounded-2xl shadow-md border border-lucy/30 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-xl font-semibold text-lucy">
              ✨ Converse com a Lucy
            </h3>
            <p className="text-sm text-gray-600">
              Tenha ideias criativas, dicas de conteúdo e muito mais com a Lucy.
            </p>
          </div>
          <button
            onClick={() => setShowAI(true)}
            className="bg-lucy hover:bg-lucy-dark text-white font-semibold px-5 py-2 rounded-lg shadow-md transition-colors"
          >
            Abrir Chat
          </button>
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Conteudo />

          {/* Galeria */}
          <div className="bg-white rounded-2xl shadow-md border border-lucy/30 p-5 sm:p-6">
            <h3 className="text-lg font-semibold text-lucy mb-4 flex items-center gap-2">
              <FaCamera className="text-lucy" />
              Galeria 📸
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
                    <Image
                      src={url}
                      alt={`Imagem ${i + 1}`}
                      width={600}
                      height={400}
                      unoptimized
                      className="w-full h-40 object-cover cursor-pointer group-hover:scale-105 transition-transform"
                      onClick={() => setPreview(url)}
                    />
                    <button
                      onClick={() => handleDelete(url)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaTrash />
                    </button>
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
                  <Image
                    src={preview}
                    alt="Visualização"
                    width={1600}
                    height={1000}
                    unoptimized
                    className="w-full max-h-[80vh] object-contain rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 💬 Modal Chat da Lucy */}
      {showAI && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl shadow-xl relative flex flex-col h-[80vh]">
            <button
              onClick={() => setShowAI(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>

            <h3 className="text-lg font-semibold mb-3 text-lucy text-center">
              💜 Chat com Lucy
            </h3>

            <div className="flex-1 overflow-y-auto border p-3 rounded-lg bg-gray-50 mb-3 space-y-3">
              {conversation.length === 0 && (
                <p className="text-center text-gray-500 text-sm">
                  Inicie uma conversa com a Lucy!
                </p>
              )}

              {conversation.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                      msg.role === "user"
                        ? "bg-lucy text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Digite sua mensagem..."
                className="flex-1 border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-lucy"
                disabled={loadingAI}
              />
              <button
                onClick={handleSend}
                disabled={loadingAI || !input.trim()}
                className="bg-lucy hover:bg-lucy-dark text-white p-3 rounded-lg transition disabled:bg-gray-400"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-white border-t mt-8">
        <div className="max-w-6xl mx-auto px-6 py-4 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} Lucy — Gestão de Ideias
        </div>
      </footer>
    </div>
  );
}
