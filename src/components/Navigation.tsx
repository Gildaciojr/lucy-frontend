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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-purple-200 bg-purple-100 backdrop-blur-lg">
      <ul className="flex justify-around items-center max-w-5xl mx-auto px-1 py-1 sm:py-2">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href} className="flex-1 text-center">
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center px-2 py-1 sm:py-2 rounded-xl text-[10px] sm:text-xs font-semibold transition-all duration-150 ${
                  active
                    ? "bg-purple-400 text-white shadow-md scale-105"
                    : "text-gray-700 hover:bg-purple-200 hover:text-purple-600"
                }`}
              >
                <span
                  className={`text-base sm:text-lg mb-0.5 ${
                    active ? "text-white" : "text-purple-600/80"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="truncate w-full leading-none">
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}


