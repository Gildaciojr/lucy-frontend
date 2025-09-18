"use client";

import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaSpinner, FaDownload, FaWhatsapp, FaEnvelope } from "react-icons/fa";

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
    const userId = localStorage.getItem("user_id");

    if (!userId || !token) return;

    const fetchData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/financas?userId=${userId}`
        );
        const data = await res.json();
        setFinancas(data);

        const userRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const userData = await userRes.json();
        setUserName(userData.name || "Usuário");
      } catch (err) {
        console.error("Erro ao buscar dados do relatório", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const gerarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(108, 43, 217); // Roxo
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
      styles: {
        fontSize: 10,
        halign: "center",
        valign: "middle",
      },
      headStyles: {
        fillColor: [108, 43, 217],
        textColor: 255,
        halign: "center",
      },
      alternateRowStyles: {
        fillColor: [245, 240, 255],
      },
    });

    return doc;
  };

  const handleDownload = () => {
    const doc = gerarPDF();
    doc.save(`relatorio-financeiro-${userName}.pdf`);
  };

  const handleSendEmail = () => {
    const assunto = encodeURIComponent("Relatório Financeiro");
    const corpo = encodeURIComponent(
      `Olá, segue em anexo meu relatório financeiro - ${userName}.`
    );
    window.location.href = `mailto:?subject=${assunto}&body=${corpo}`;
  };

  const handleSendWhatsApp = () => {
    const texto = encodeURIComponent(
      `Segue meu relatório financeiro - ${userName}`
    );
    window.open(`https://wa.me/?text=${texto}`, "_blank");
  };

  if (loading)
    return (
      <div className="p-6 text-center flex items-center justify-center space-x-2">
        <FaSpinner className="animate-spin" />
        <span>Gerando relatório...</span>
      </div>
    );

  if (!financas.length)
    return (
      <div className="p-6 text-center text-gray-500">
        Nenhuma movimentação financeira encontrada.
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-purple-700">
        Relatório de Finanças
      </h1>

      <div className="space-x-3">
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-purple-600 text-white rounded shadow hover:bg-purple-700 inline-flex items-center gap-2"
        >
          <FaDownload /> Baixar PDF
        </button>

        <button
          onClick={handleSendEmail}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 inline-flex items-center gap-2"
        >
          <FaEnvelope /> Enviar por E-mail
        </button>

        <button
          onClick={handleSendWhatsApp}
          className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 inline-flex items-center gap-2"
        >
          <FaWhatsapp /> Enviar por WhatsApp
        </button>
      </div>
    </div>
  );
}



