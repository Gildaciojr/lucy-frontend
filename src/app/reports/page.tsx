"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FaSpinner,
  FaDownload,
  FaWhatsapp,
  FaEnvelope,
  FaCalendarAlt,
} from "react-icons/fa";

interface Financa {
  id: number;
  categoria: string;
  valor: number | string;
  data: string;
  tipo: "receita" | "despesa";
}

type MonthStr = string;
type PDF = InstanceType<typeof jsPDF>;

function monthStartEnd(ym: MonthStr): { from: string; to: string } {
  const [y, m] = ym.split("-").map((n) => parseInt(n, 10));
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0);
  const toIso = (d: Date) => d.toISOString().split("T")[0];
  return { from: toIso(start), to: toIso(end) };
}

function rangeFromToMonth(from?: MonthStr, to?: MonthStr): {
  from?: string;
  to?: string;
} {
  if (from && !to) return monthStartEnd(from);
  if (!from && to) return monthStartEnd(to);
  if (from && to) {
    const s = monthStartEnd(from).from;
    const e = monthStartEnd(to).to;
    return { from: s, to: e };
  }
  return {};
}

export default function ReportsPage() {
  const [financas, setFinancas] = useState<Financa[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("Usuário");
  const [mesDe, setMesDe] = useState<MonthStr>("");
  const [mesAte, setMesAte] = useState<MonthStr>("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const userId =
    typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

  const fetchFinancas = useCallback(
    async (mDe?: MonthStr, mAte?: MonthStr) => {
      if (!token) return;
      const params: string[] = [];
      const { from, to } = rangeFromToMonth(mDe, mAte);
      if (from) params.push(`from=${from}`);
      if (to) params.push(`to=${to}`);
      const qs = params.length ? `?${params.join("&")}` : "";
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/financas${qs}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Erro ao buscar finanças.");
      const data: Financa[] = await res.json();
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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchFinancas, fetchUserName]);

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
    const fmt = (ym: MonthStr) => {
      if (!ym) return "";
      const [y, m] = ym.split("-");
      return `${m}/${y}`;
    };
    if (!mesDe && !mesAte) return "Todos os lançamentos";
    if (mesDe && !mesAte) return `Período: ${fmt(mesDe)}`;
    if (!mesDe && mesAte) return `Período: ${fmt(mesAte)}`;
    return `Período: ${fmt(mesDe)} a ${fmt(mesAte)}`;
  }, [mesDe, mesAte]);

  // PDF HEADER / FOOTER
  const drawLucyHeader = (doc: PDF) => {
    doc.setFillColor(109, 40, 217);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 18, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text("Lucy Finance", 14, 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(periodoLabel, 120, 12, { align: "right" });
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
      startY: yResume + 14,
      styles: { fontSize: 10, halign: "center", valign: "middle" },
      headStyles: {
        fillColor: [109, 40, 217],
        textColor: 255,
        halign: "center",
      },
      alternateRowStyles: { fillColor: [250, 247, 255] },
      margin: { left: 14, right: 14 },
      didDrawPage: () => {
        drawLucyHeader(doc);
        drawLucyFooter(doc);
      },
    });
    drawLucyFooter(doc);
    return doc;
  };

  const pdfFilename = (suffix = "") =>
    `relatorio-financeiro-${userName}${
      suffix ? `-${suffix}` : ""
    }.pdf`;

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

  const handleGenerate = async () => {
    try {
      setLoading(true);
      await fetchFinancas(mesDe || undefined, mesAte || undefined);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
        {/* Título padronizado */}
        <div className="bg-purple-200 rounded-2xl shadow-md border border-purple-100 p-5 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold text-purple-700 flex items-center gap-3">
            <FaCalendarAlt className="text-purple-600 text-3xl" />
            Relatórios
          </h1>
          <p className="text-purple-400 mt-2 text-center">
            Exporte e compartilhe suas finanças com segurança.
          </p>
        </div>

        {/* Filtro de período */}
        <div className="flex flex-col items-center justify-center bg-white p-6 rounded-2xl shadow-md border border-purple-100">
          <div className="w-full max-w-3xl flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                De (mês)
              </label>
              <input
                type="month"
                value={mesDe}
                onChange={(e) => setMesDe(e.target.value)}
                className="w-full border-2 border-purple-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200 transition text-gray-700 font-medium"
              />
            </div>
            <div className="text-gray-400 font-semibold select-none">até</div>
            <div className="flex-1 w-full">
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                Até (mês)
              </label>
              <input
                type="month"
                value={mesAte}
                onChange={(e) => setMesAte(e.target.value)}
                className="w-full border-2 border-purple-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200 transition text-gray-700 font-medium"
              />
            </div>
            <button
              onClick={handleGenerate}
              className="mt-2 sm:mt-6 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition active:scale-95"
            >
              Gerar
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-3 text-center">
            Dica: Preencha só <b>“De”</b> para um mês específico. Preencha{" "}
            <b>“De”</b> e <b>“Até”</b> para um intervalo.
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
    </div>
  );
}




