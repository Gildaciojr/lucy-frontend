"use client";

import React, { useCallback, useEffect, useMemo, useState, forwardRef, Ref } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FaSpinner,
  FaDownload,
  FaWhatsapp,
  FaEnvelope,
  FaCalendarAlt,
} from "react-icons/fa";
import ReactDatePicker, { registerLocale } from "react-datepicker";
import { ptBR as dfnsPtBR } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
registerLocale("pt-BR", dfnsPtBR);

interface Financa {
  id: number;
  categoria: string;
  valor: number | string;
  data: string;
  tipo: "receita" | "despesa";
}

type PDF = InstanceType<typeof jsPDF>;

/** Botão visual de data */
const DatePill = forwardRef(
  (
    { label, value, onClick }: { label?: string; value: string; onClick?: () => void },
    ref: Ref<HTMLButtonElement>
  ) => (
    <button
      ref={ref}
      onClick={onClick}
      className="px-3 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-500 text-sm font-medium shadow-sm transition-colors"
      type="button"
    >
      {label ? `${label} ${value}` : value}
    </button>
  )
);
DatePill.displayName = "DatePill";

export default function ReportsPage() {
  const [financas, setFinancas] = useState<Financa[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("Usuário");
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const userId =
    typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

  /** 🔹 Corrige range para evitar incluir mês anterior */
  const normalizeDate = (d: Date, isEnd = false) => {
    const local = new Date(d);
    if (isEnd) {
      local.setHours(23, 59, 59, 999);
    } else {
      local.setHours(0, 0, 0, 0);
    }
    return local;
  };

  const fetchFinancas = useCallback(
    async (from?: Date | null, to?: Date | null) => {
      if (!token) return;

      const params: string[] = [];

      if (from) params.push(`from=${normalizeDate(from).toISOString()}`);
      if (to) params.push(`to=${normalizeDate(to, true).toISOString()}`);

      const qs = params.length ? `?${params.join("&")}` : "";
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/financas${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erro ao buscar finanças.");
      let data: Financa[] = await res.json();

      // 🔒 Garante filtragem local, independente do backend
      if (from || to) {
        const start = from ? normalizeDate(from) : null;
        const end = to ? normalizeDate(to, true) : null;

        data = data.filter((f) => {
          const date = new Date(f.data);
          return (!start || date >= start) && (!end || date <= end);
        });
      }

      setFinancas(data);
    },
    [token]
  );

  const fetchUserName = useCallback(async () => {
    if (!token || !userId) return;
    const userRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!userRes.ok) return;
    const userData = await userRes.json();
    setUserName(userData?.name || "Usuário");
  }, [token, userId]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchFinancas(), fetchUserName()]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchFinancas, fetchUserName]);

  useEffect(() => {
    const autoUpdate = async () => {
      try {
        await fetchFinancas(fromDate, toDate);
      } catch {}
    };
    if (fromDate || toDate) autoUpdate();
  }, [fromDate, toDate, fetchFinancas]);

  const { totalReceitas, totalDespesas } = useMemo(() => {
    let r = 0;
    let d = 0;
    for (const f of financas) {
      const v = Number(f.valor || 0);
      if (f.tipo === "receita") r += v;
      else d += v;
    }
    return { totalReceitas: r, totalDespesas: d };
  }, [financas]);

  const periodoLabel = useMemo(() => {
    if (!fromDate && !toDate) return "Todos os lançamentos";
    const fmt = (d: Date) =>
      d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    if (fromDate && !toDate) return `Período: ${fmt(fromDate)}`;
    if (!fromDate && toDate) return `Período: até ${fmt(toDate)}`;
    return `Período: ${fmt(fromDate!)} a ${fmt(toDate!)}`;
  }, [fromDate, toDate]);

  /** ===== PDF ===== */
  const drawLucyHeader = (doc: PDF) => {
    doc.setFillColor(109, 40, 217);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 18, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text("Lucy Finance", 14, 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(periodoLabel, doc.internal.pageSize.getWidth() - 14, 12, {
      align: "right",
    });
  };

  const drawLucyFooter = (doc: PDF) => {
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    doc.setDrawColor(230, 230, 230);
    doc.line(14, h - 18, w - 14, h - 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text("Relatório gerado automaticamente pela Lucy", 14, h - 10);
    doc.text(`${new Date().toLocaleString()}`, w - 14, h - 10, {
      align: "right",
    });
  };

  const buildPdf = () => {
    const doc = new jsPDF();
    drawLucyHeader(doc);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(`Usuário: ${userName}`, 14, 28);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const yResume = 36;
    doc.text(
      `Total de Receitas: R$ ${totalReceitas.toFixed(2).replace(".", ",")}`,
      14,
      yResume
    );
    doc.text(
      `Total de Despesas: R$ ${totalDespesas.toFixed(2).replace(".", ",")}`,
      14,
      yResume + 6
    );

    const body = financas.map((f) => [
      new Date(f.data).toLocaleDateString("pt-BR"),
      f.categoria,
      f.tipo === "receita" ? "Receita" : "Despesa",
      `R$ ${Number(f.valor || 0).toFixed(2).replace(".", ",")}`,
    ]);

    autoTable(doc, {
      head: [["Data", "Categoria", "Tipo", "Valor"]],
      body,
      startY: 50,
      styles: { fontSize: 10, halign: "center", valign: "middle" },
      headStyles: {
        fillColor: [109, 40, 217],
        textColor: 255,
        halign: "center",
      },
      alternateRowStyles: { fillColor: [250, 247, 255] },
      margin: { top: 30, left: 14, right: 14, bottom: 25 },
      didDrawPage: () => {
        drawLucyHeader(doc);
        drawLucyFooter(doc);
      },
    });
    drawLucyFooter(doc);
    return doc;
  };

  const pdfFilename = (suffix = "") =>
    `relatorio-financeiro-${userName}${suffix ? `-${suffix}` : ""}.pdf`;
  const getPdfBlob = () => buildPdf().output("blob");
  const downloadPdf = () => buildPdf().save(pdfFilename());

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

  const handleSendEmail = async () => {
    const shared = await trySharePdf(
      "Relatório Financeiro",
      `Relatório financeiro de ${userName}`
    );
    if (!shared) {
      downloadPdf();
      const assunto = encodeURIComponent("Relatório Financeiro");
      const corpo = encodeURIComponent(
        `O relatório financeiro de ${userName} foi baixado no seu dispositivo.\nAnexe o arquivo ${pdfFilename()} ao enviar este e-mail.\n`
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
        `Relatório financeiro de ${userName}. O PDF foi baixado no seu dispositivo.`
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-purple-100 to-white p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Cabeçalho */}
        <div className="bg-purple-400 rounded-2xl shadow-md border border-purple-400 p-5 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FaCalendarAlt className="text-white text-3xl" />
            Relatórios
          </h1>
          <p className="text-white mt-2 text-center">
            Exporte e compartilhe suas finanças com segurança.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-col items-center justify-center bg-white p-6 rounded-2xl shadow-md border border-purple-100">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <ReactDatePicker
              selected={fromDate}
              onChange={(date) => setFromDate(date)}
              selectsStart
              startDate={fromDate}
              endDate={toDate || undefined}
              locale="pt-BR"
              dateFormat="dd/MM/yyyy"
              customInput={
                <DatePill
                  label="📅 De:"
                  value={
                    fromDate
                      ? fromDate.toLocaleDateString("pt-BR")
                      : "Escolher data inicial"
                  }
                />
              }
            />
            <span className="text-gray-400 font-semibold select-none">→</span>
            <ReactDatePicker
              selected={toDate}
              onChange={(date) => setToDate(date)}
              selectsEnd
              startDate={fromDate || undefined}
              endDate={toDate}
              minDate={fromDate || undefined}
              locale="pt-BR"
              dateFormat="dd/MM/yyyy"
              customInput={
                <DatePill
                  label="Até:"
                  value={
                    toDate
                      ? toDate.toLocaleDateString("pt-BR")
                      : "Escolher data final"
                  }
                />
              }
            />
          </div>
          <p className="text-sm text-gray-500 mt-3 text-center">
            Escolha qualquer data de início e fim — o relatório é gerado automaticamente 💜
          </p>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-xl shadow-md border border-emerald-100">
            <p className="text-sm text-gray-500">Total de Receitas</p>
            <p className="text-2xl font-bold text-emerald-600">
              R$ {totalReceitas.toFixed(2).replace(".", ",")}
            </p>
          </div>
          <div className="p-4 bg-white rounded-xl shadow-md border border-rose-100">
            <p className="text-sm text-gray-500">Total de Despesas</p>
            <p className="text-2xl font-bold text-rose-600">
              R$ {totalDespesas.toFixed(2).replace(".", ",")}
            </p>
          </div>
        </div>

        {/* Ações */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={downloadPdf}
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
    </div>
  );
}








