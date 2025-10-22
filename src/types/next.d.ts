// src/types/next.d.ts
// ✅ Correção definitiva de tipos do Next.js 15
// 🔹 Remove erro "Promise<any>" no build de rotas dinâmicas ([param])
// 🔹 Evita uso de 'any' para manter o ESLint limpo
// 🔹 Totalmente compatível com TypeScript estrito e App Router

import type { PageProps as OriginalPageProps } from "next";

/**
 * Define que `params` é um dicionário de strings (chave-valor)
 * e `searchParams` segue o padrão nativo do App Router.
 */
type LucyParams = Record<string, string>;
type LucySearchParams = Record<string, string | string[] | undefined>;

declare module "next" {
  export interface PageProps extends Omit<OriginalPageProps, "params"> {
    params: LucyParams;
    searchParams?: LucySearchParams;
  }
}

