// frontend/src/app/plan-inactive/page.tsx
"use client";

import Link from "next/link";
import { FaLock, FaCrown, FaArrowLeft } from "react-icons/fa";

export default function PlanInactivePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 via-purple-100 to-white p-6 text-center">
      {/* Ícone principal */}
      <div className="bg-lucy text-white p-5 rounded-full shadow-lg mb-6">
        <FaLock className="w-10 h-10" />
      </div>

      {/* Título */}
      <h1 className="text-3xl font-bold text-lucy mb-3">
        Acesso indisponível 💜
      </h1>

      {/* Mensagem explicativa */}
      <p className="text-gray-600 max-w-md mb-8 leading-relaxed">
        O seu plano foi <strong>cancelado</strong> ou <strong>expirou</strong>.
        <br />
        Para continuar aproveitando todos os recursos da <strong>Lucy</strong>,
        é necessário renovar ou adquirir um novo plano.
      </p>

      {/* Botões de ação */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="https://mylucy.app"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-lucy text-white font-semibold hover:bg-lucy/90 transition-colors shadow-md"
        >
          <FaCrown className="text-amber-300" />
          Renovar Plano
        </Link>

        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
        >
          <FaArrowLeft />
          Voltar ao Login
        </Link>
      </div>

      {/* Rodapé sutil */}
      <footer className="mt-12 text-sm text-gray-400">
        Lucy Dashboard © {new Date().getFullYear()} — Todos os direitos reservados
      </footer>
    </div>
  );
}


