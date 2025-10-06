"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaBook,
  FaChartBar,
  FaCog,
} from "react-icons/fa";

const items = [
  { href: "/", label: "Início", icon: <FaHome /> },
  { href: "/financas", label: "Finanças", icon: <FaMoneyBillWave /> },
  { href: "/agenda", label: "Agenda", icon: <FaCalendarAlt /> },
  { href: "/conteudo", label: "Conteúdo", icon: <FaBook /> },
  { href: "/relatorios", label: "Relatórios", icon: <FaChartBar /> },
  { href: "/configuracoes", label: "Configurações", icon: <FaCog /> },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-sm z-50">
      <ul className="grid grid-cols-5 sm:grid-cols-6 gap-1 max-w-4xl mx-auto">
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                className={`flex flex-col items-center py-3 text-xs ${
                  active ? "text-purple-600" : "text-gray-600"
                } hover:text-purple-600`}
              >
                <span className="text-lg">{it.icon}</span>
                <span className="mt-1">{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
