"use client";

import React, { useEffect, useState, useCallback } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FaSpinner,
  FaDownload,
  FaWhatsapp,
  FaEnvelope,
  FaMoneyBillWave,
} from "react-icons/fa";

interface Financa {
  id: number;
  categoria: string;
  valor: string;
  data: string;
  tipo?: "receita" | "despesa"; // ✅ Adicionado para resolver o erro
}

export default function ReportsPage() {
  const [financas, setFinancas] = useState<Financa[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("Usuário");
  const [mesSelecionado, setMesSelecionado] = useState<string>("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const userId =
    typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

  // ✅ useCallback evita warning do React
  const fetchFinancas = useCallback(
    async (mes?: string) => {
      if (!token) return;
      setLoading(true);

      let url = `${process.env.NEXT_PUBLIC_API_URL}/financas`;
      if (mes) {
        const [ano, mesNum] = mes.split("-");
        const from = `${ano}-${mesNum}-01`;
        const lastDay = new Date(Number(ano), Number(mesNum), 0).getDate();
        const to = `${ano}-${mesNum}-${lastDay}`;
        url += `?from=${from}&to=${to}`;
      }

      try {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setFinancas(data);

        if (userId) {
          const userRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const userData = await userRes.json();
          setUserName(userData.name || "Usuário");
        }
      } catch {
        console.error("Erro ao buscar dados financeiros");
      } finally {
        setLoading(false);
      }
    },
    [token, userId]
  );

  useEffect(() => {
    fetchFinancas();
  }, [fetchFinancas]);

  const buildPdf = () => {
    const doc = new jsPDF();

    // 💜 Cabeçalho Lucy Finance
    doc.setFillColor(245, 240, 255);
    doc.rect(0, 0, 210, 30, "F");
    doc.setTextColor(108, 43, 217);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Lucy Finance 💜", 14, 20);

    // 🟣 (Opcional) Logo Lucy
    try {
      const logo = "/assets/logo-lucy.png";
      doc.addImage(logo, "PNG", 160, 5, 35, 20);
    } catch {
      console.warn("Logo não encontrada (adicione em public/assets/logo-lucy.png)");
    }

    doc.setFontSize(12);
    doc.setTextColor(80);
    doc.text(`Relatório Financeiro de ${userName}`, 14, 32);

    if (mesSelecionado) {
      doc.text(
        `Período: ${new Date(mesSelecionado + "-01").toLocaleDateString(
          "pt-BR",
          { month: "long", year: "numeric" }
        )}`,
        14,
        38
      );
    }

    // Linha divisória
    doc.setDrawColor(108, 43, 217);
    doc.line(14, 42, 196, 42);

    // 🔢 Totais
    const totalReceitas = financas
      .filter((f) => f.tipo === "receita")
      .reduce((acc, f) => acc + parseFloat(f.valor), 0);

    const totalDespesas = financas
      .filter((f) => f.tipo === "despesa")
      .reduce((acc, f) => acc + parseFloat(f.valor), 0);

    const saldo = totalReceitas - totalDespesas;

    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(
      `Total de Receitas: R$ ${totalReceitas.toFixed(2).replace(".", ",")}`,
      14,
      50
    );
    doc.text(
      `Total de Despesas: R$ ${totalDespesas.toFixed(2).replace(".", ",")}`,
      14,
      56
    );
    doc.text(
      `Saldo: R$ ${saldo.toFixed(2).replace(".", ",")}`,
      14,
      62
    );

    // 📊 Tabela
    const body = financas.map((f) => [
      f.categoria,
      `R$ ${parseFloat(f.valor).toFixed(2).replace(".", ",")}`,
      new Date(f.data).toLocaleDateString("pt-BR"),
    ]);

    autoTable(doc, {
      head: [["Categoria", "Valor", "Data"]],
      body,
      startY: 70,
      styles: { fontSize: 10, halign: "center", valign: "middle" },
      headStyles: {
        fillColor: [108, 43, 217],
        textColor: 255,
        halign: "center",
      },
      alternateRowStyles: { fillColor: [245, 240, 255] },
    });

    // 🖋 Rodapé (sem any)
    const finalY =
      (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable
        ?.finalY ?? 270;
    doc.setFontSize(10);
    doc.setTextColor(130);
    doc.text("Relatório gerado automaticamente pela Lucy 💜", 14, finalY + 10);

    return doc;
  };

  const pdfFilename = (suffix = "") =>
    `relatorio-financeiro-${userName}${suffix}.pdf`;

  const getPdfBlob = () => buildPdf().output("blob");

  const downloadPdf = () => {
    const doc = buildPdf();
    doc.save(pdfFilename());
  };

  const trySharePdf = async (title: string, text: string) => {
    try {
      const blob = getPdfBlob();
      const file = new File([blob], pdfFilename(), { type: "application/pdf" });

      const navAny = navigator as Navigator & {
        canShare?: (data: ShareData) => boolean;
        share?: (data: ShareData) => Promise<void>;
      };

      if (navAny?.canShare?.({ files: [file] })) {
        await navAny.share({ files: [file], title, text });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleDownload = () => downloadPdf();

  const handleSendEmail = async () => {
    const shared = await trySharePdf(
      "Relatório Financeiro",
      `Relatório financeiro de ${userName}`
    );

    if (!shared) {
      downloadPdf();
      const assunto = encodeURIComponent("Relatório Financeiro");
      const corpo = encodeURIComponent(
        `Olá,\n\nO relatório financeiro de ${userName} foi baixado no seu dispositivo.\nAnexe o arquivo ${pdfFilename()} ao enviar este e-mail.\n\n`
      );
      window.location.href = `mailto:?subject=${assunto}&body=${corpo}`;
    }
  };

  const handleSendWhatsApp = async () => {
    const shared = await trySharePdf(
      "Relatório Financeiro",
      `Relatório financeiro de ${userName}`
    );

    if (!shared) {
      downloadPdf();
      const texto = encodeURIComponent(
        `Relatório financeiro de ${userName}.\nO PDF foi baixado no seu dispositivo. Anexe o arquivo ${pdfFilename()} na conversa.`
      );
      window.open(`https://wa.me/?text=${texto}`, "_blank");
    }
  };

  if (loading)
    return (
      <div className="p-6 text-center flex items-center justify-center space-x-2">
        <FaSpinner className="animate-spin" />
        <span>Carregando relatório...</span>
      </div>
    );

  if (!financas.length)
    return (
      <div className="p-6 text-center text-gray-500">
        Nenhuma movimentação encontrada.
      </div>
    );

  return (
    <div className="p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-purple-700 flex items-center justify-center gap-3">
          <FaMoneyBillWave className="text-green-600" />
          Relatórios
        </h1>
        <p className="text-gray-500 mt-2">
          Exporte e compartilhe suas finanças com segurança.
        </p>
      </div>

      {/* 🔹 Filtro de Mês */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 bg-white p-4 rounded-xl shadow">
        <label className="text-gray-700 font-semibold">Selecione o mês:</label>
        <input
          type="month"
          value={mesSelecionado}
          onChange={(e) => {
            setMesSelecionado(e.target.value);
            fetchFinancas(e.target.value);
          }}
          className="border border-gray-300 rounded-lg px-3 py-2"
        />
      </div>

      {/* 🔹 Botões */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={handleDownload}
          className="flex flex-col items-center justify-center gap-3 p-6 bg-purple-600 text-white rounded-xl shadow-lg hover:bg-purple-700 transition"
        >
          <FaDownload className="text-4xl" />
          <span className="text-lg font-semibold">Baixar PDF</span>
          <p className="text-sm text-purple-200">Salve no seu dispositivo</p>
        </button>

        <button
          onClick={handleSendEmail}
          className="flex flex-col items-center justify-center gap-3 p-6 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition"
        >
          <FaEnvelope className="text-4xl" />
          <span className="text-lg font-semibold">Enviar por E-mail</span>
          <p className="text-sm text-blue-200">
            Anexo automático quando suportado
          </p>
        </button>

        <button
          onClick={handleSendWhatsApp}
          className="flex flex-col items-center justify-center gap-3 p-6 bg-green-600 text-white rounded-xl shadow-lg hover:bg-green-700 transition"
        >
          <FaWhatsapp className="text-4xl" />
          <span className="text-lg font-semibold">Enviar por WhatsApp</span>
          <p className="text-sm text-green-200">
            Anexo automático quando suportado
          </p>
        </button>
      </div>
    </div>
  );
}

