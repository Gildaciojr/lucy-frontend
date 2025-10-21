"use client";

import Financas from "../../components/Financas";

export default function FinancasPage() {
  return (
    <div className="flex flex-col min-h-screen p-4 bg-gray-100">
      <header className="py-4 text-center">
        <div className="p-4 bg-lucy rounded-xl shadow-md transition-colors duration-200 hover:bg-purple-200 cursor-pointer">
          <h1 className="text-3xl font-bold text-white">Lucy Finance</h1>
          <p className="text-white">Controle suas finanças pessoais</p>
        </div>
      </header>
      <main className="flex-1 p-6 flex flex-col items-center">
        <div className="w-full max-w-6xl">
          <Financas />
        </div>
      </main>
    </div>
  );
}


