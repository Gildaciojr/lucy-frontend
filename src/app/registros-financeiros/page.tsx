"use client";

import { useEffect, useState } from "react";
import {
  getRegistrosFinanceiros,
  createRegistroFinanceiro,
} from "@/lib/api";

export interface RegistroFinanceiro {
  id: number;
  responsavel: string;
  categoria: string;
  tipo: "gasto" | "receita";
  valor: number;
  descricao?: string;
  data_hora: string;
}

export default function RegistrosFinanceirosPage() {
  const [registros, setRegistros] = useState<RegistroFinanceiro[]>([]);
  const [novo, setNovo] = useState<{
    responsavel: string;
    categoria: string;
    tipo: "gasto" | "receita";
    valor: number;
    descricao: string;
  }>({
    responsavel: "",
    categoria: "",
    tipo: "gasto", // ✅ já começa tipado
    valor: 0,
    descricao: "",
  });

  useEffect(() => {
    getRegistrosFinanceiros()
      .then((data) => setRegistros(data as RegistroFinanceiro[])) // ✅ tipagem
      .catch((err) => console.error(err));
  }, []);

  async function salvarRegistro() {
    try {
      const saved = await createRegistroFinanceiro(novo);
      setRegistros((prev) => [saved as RegistroFinanceiro, ...prev]); // ✅ tipado
      setNovo({
        responsavel: "",
        categoria: "",
        tipo: "gasto",
        valor: 0,
        descricao: "",
      });
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">📑 Registros Financeiros</h1>

      {/* Formulário */}
      <div className="space-y-2 mb-6">
        <input
          type="text"
          placeholder="Responsável"
          value={novo.responsavel}
          onChange={(e) => setNovo({ ...novo, responsavel: e.target.value })}
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="Categoria"
          value={novo.categoria}
          onChange={(e) => setNovo({ ...novo, categoria: e.target.value })}
          className="border p-2 rounded w-full"
        />
        <select
          value={novo.tipo}
          onChange={(e) =>
            setNovo({ ...novo, tipo: e.target.value as "gasto" | "receita" })
          }
          className="border p-2 rounded w-full"
        >
          <option value="gasto">Gasto</option>
          <option value="receita">Receita</option>
        </select>
        <input
          type="number"
          placeholder="Valor"
          value={novo.valor}
          onChange={(e) => setNovo({ ...novo, valor: Number(e.target.value) })}
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="Descrição"
          value={novo.descricao}
          onChange={(e) => setNovo({ ...novo, descricao: e.target.value })}
          className="border p-2 rounded w-full"
        />
        <button
          onClick={salvarRegistro}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Salvar
        </button>
      </div>

      {/* Lista */}
      <ul className="space-y-2">
        {registros.map((r) => (
          <li
            key={r.id}
            className="border p-3 rounded flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">
                {r.categoria} - {r.tipo.toUpperCase()}
              </p>
              <p className="text-sm text-gray-600">{r.descricao}</p>
              <p className="text-sm">Responsável: {r.responsavel}</p>
            </div>
            <span
              className={`font-bold ${
                r.tipo === "gasto" ? "text-red-600" : "text-green-600"
              }`}
            >
              R$ {r.valor.toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
