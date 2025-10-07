"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaWallet,
  FaCalendarAlt,
  FaLightbulb,
  FaTrophy,
  FaChartBar,
  FaCog,
} from "react-icons/fa";

const NAV = [
  { href: "/", label: "Início", icon: <FaHome /> },
  { href: "/financas", label: "Finanças", icon: <FaWallet /> },
  { href: "/agenda", label: "Agenda", icon: <FaCalendarAlt /> },
  { href: "/conteudo", label: "Conteúdo", icon: <FaLightbulb /> },
  { href: "/reports", label: "Relatórios", icon: <FaChartBar /> },
  { href: "/settings", label: "Configurações", icon: <FaCog /> },

];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-purple-200 bg-white">
      <ul className="max-w-5xl mx-auto grid grid-cols-7 gap-1 px-2 py-2">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center rounded-xl px-2 py-2 text-xs font-semibold transition
                  ${active ? "bg-purple-600 text-white" : "text-gray-700 hover:bg-purple-50 hover:text-purple-700"}`}
              >
                <span className={`text-lg ${active ? "text-white" : "text-purple-700/90"}`}>
                  {item.icon}
                </span>
                <span className="mt-1 leading-none">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

