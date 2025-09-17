"use client";

import Conteudo from "../../components/Conteudo";

export default function ConteudoPage() {
  return (
    <div className="flex flex-col min-h-screen p-4 bg-gray-100">
      <header className="py-4 text-center">
        <div className="p-4 bg-purple-100 rounded-xl shadow-md transition-colors duration-200 hover:bg-purple-200 cursor-pointer">
          <h1 className="text-3xl font-bold text-lucy-purple">Lucy</h1>
          <p className="text-gray-500">Seu Painel de Controle Criativo</p>
        </div>
      </header>
      <main className="flex-1 p-6 flex flex-col items-center">
        <div className="w-full max-w-6xl">
          <Conteudo />
        </div>
      </main>
    </div>
  );
}
