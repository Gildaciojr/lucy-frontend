"use client";

import Link from "next/link";
import {
  FaHome,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaLightbulb,
  FaTrophy,
  FaCog,
  FaFileAlt,
} from "react-icons/fa";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  text: string;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, text }) => {
  return (
    <Link
      href={href}
      className="flex flex-col items-center p-4 rounded-xl transition-colors duration-200 text-black hover:bg-lucy-purple-dark"
    >
      <div className="text-2xl mb-1">{icon}</div>
      <span className="text-xs font-semibold">{text}</span>
    </Link>
  );
};

export default function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-purple-200 shadow-xl z-50 rounded-t-3xl">
      <div className="container mx-auto flex justify-around p-2">
        <NavItem href="/" icon={<FaHome />} text="Início" />
        <NavItem href="/financas" icon={<FaMoneyBillWave />} text="Finanças" />
        <NavItem href="/agenda" icon={<FaCalendarAlt />} text="Agenda" />
        <NavItem href="/conteudo" icon={<FaLightbulb />} text="Conteúdo" />
        <NavItem href="/gamificacao" icon={<FaTrophy />} text="Gamificação" />
        <NavItem href="/reports" icon={<FaFileAlt />} text="Relatórios" />
        <NavItem href="/settings" icon={<FaCog />} text="Ajustes" />
      </div>
    </nav>
  );
}
