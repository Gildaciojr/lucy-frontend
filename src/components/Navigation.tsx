"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaCalendarAlt,
  FaChartLine,
  FaTrophy,
  FaCog,
} from "react-icons/fa";

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Início", icon: <FaHome /> },
    { href: "/agenda", label: "Agenda", icon: <FaCalendarAlt /> },
    { href: "/financas", label: "Finanças", icon: <FaChartLine /> },
    { href: "/gamificacao", label: "Metas", icon: <FaTrophy /> },
    { href: "/settings", label: "Config", icon: <FaCog /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md flex justify-around items-center py-3 z-50">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center text-sm transition-all ${
              active
                ? "text-purple-500 font-semibold"
                : "text-gray-500 hover:text-purple-500"
            }`}
          >
            <div
              className={`text-lg mb-1 transition-transform ${
                active ? "scale-110" : ""
              }`}
            >
              {link.icon}
            </div>
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}


