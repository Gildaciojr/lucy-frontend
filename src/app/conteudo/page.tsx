"use client";

import Conteudo from "@/components/Conteudo";

export default function ConteudoPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-purple-400 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col items-center">
          <h1 className="text-3xl font-extrabold text-white">Lucy Creator</h1>
          <p className="text-black text-sm">
            Gerencie suas ideias e conteúdos de forma organizada
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-6xl mx-auto space-y-4">
          <Conteudo />
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



