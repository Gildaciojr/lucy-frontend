"use client";

import Link from "next/link";

export default function PlanInactivePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white p-6">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg border border-purple-100 p-8 text-center">
        <h1 className="text-2xl font-extrabold text-lucy mb-2">
          Seu plano está inativo
        </h1>
        <p className="text-gray-600">
          Identificamos que seu plano foi cancelado, expirou ou não está ativo.
          Para continuar usando o dashboard, ative ou adquira um plano.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login"
            className="px-5 py-3 rounded-xl bg-gray-100 text-gray-800 font-semibold hover:bg-gray-200 transition"
          >
            Entrar novamente
          </Link>
          <a
            href="https://wa.me/5511999892575?text=Olá!%20Preciso%20reativar%20meu%20plano%20Lucy."
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-xl bg-lucy text-white font-bold hover:opacity-90 transition"
          >
            Falar com o suporte
          </a>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Dica: se você reativou o pagamento agora, aguarde alguns minutos para
          a confirmação e tente novamente.
        </p>
      </div>
    </div>
  );
}

