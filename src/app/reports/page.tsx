"use client";

import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaSpinner, FaDownload, FaWhatsapp, FaEnvelope, FaMoneyBillWave } from "react-icons/fa";

interface Financa {
  id: number;
  categoria: string;
  valor: string;
  data: string;
}

export default function ReportsPage() {
  const [financas, setFinancas] = useState<Financa[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("Usuário");

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/financas`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setFinancas(data);

        const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userRes.json();
        setUserName(userData.name || "Usuário");
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const gerarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(108, 43, 217);
    doc.text(`Relatório Financeiro - ${userName}`, 14, 20);

    const body = financas.map((f) => [
      f.categoria,
      `R$ ${parseFloat(f.valor).toFixed(2).replace(".", ",")}`,
      new Date(f.data).toLocaleDateString("pt-BR"),
    ]);

    autoTable(doc, {
      head: [["Categoria", "Valor", "Data"]],
      body,
      startY: 30,
      styles: { fontSize: 10, halign: "center", valign: "middle" },
      headStyles: { fillColor: [108, 43, 217], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 240, 255] },
    });

    return doc;
  };

  const handleDownload = () => {
    const doc = gerarPDF();
    doc.save(`relatorio-financeiro-${userName}.pdf`);
  };

  const handleSendEmail = () => {
    const assunto = encodeURIComponent("Relatório Financeiro");
    const corpo = encodeURIComponent(`Segue em anexo o relatório financeiro do usuário ${userName}.`);
    window.location.href = `mailto:?subject=${assunto}&body=${corpo}`;
  };

  const handleSendWhatsApp = () => {
    const texto = encodeURIComponent(`Relatório financeiro de ${userName}`);
    window.open(`https://wa.me/?text=${texto}`, "_blank");
  };

  if (loading)
    return (
      <div className="p-6 text-center flex items-center justify-center space-x-2">
        <FaSpinner className="animate-spin" />
        <span>Carregando relatório...</span>
      </div>
    );

  if (!financas.length)
    return <div className="p-6 text-center text-gray-500">Nenhuma movimentação encontrada.</div>;

  return (
    <div className="p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-purple-700 flex items-center justify-center gap-3">
          <FaMoneyBillWave className="text-green-600" />
          Relatórios
        </h1>
        <p className="text-gray-500 mt-2">Exporte e compartilhe suas finanças com segurança.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button onClick={handleDownload} className="flex flex-col items-center justify-center gap-3 p-6 bg-purple-600 text-white rounded-xl shadow-lg hover:bg-purple-700 transition">
          <FaDownload className="text-4xl" />
          <span className="text-lg font-semibold">Baixar PDF</span>
          <p className="text-sm text-purple-200">Salve no seu dispositivo</p>
        </button>

        <button onClick={handleSendEmail} className="flex flex-col items-center justify-center gap-3 p-6 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition">
          <FaEnvelope className="text-4xl" />
          <span className="text-lg font-semibold">Enviar por E-mail</span>
          <p className="text-sm text-blue-200">Compartilhe com um clique</p>
        </button>

        <button onClick={handleSendWhatsApp} className="flex flex-col items-center justify-center gap-3 p-6 bg-green-600 text-white rounded-xl shadow-lg hover:bg-green-700 transition">
          <FaWhatsapp className="text-4xl" />
          <span className="text-lg font-semibold">Enviar por WhatsApp</span>
          <p className="text-sm text-green-200">Compartilhe rapidamente</p>
        </button>
      </div>
    </div>
  );
}








