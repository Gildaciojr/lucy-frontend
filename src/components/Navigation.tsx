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
import { useTranslations } from "next-intl";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  text: string;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, text }) => {
  return (
    <Link
      href={href}
      className="flex flex-col items-center p-2 sm:p-3 rounded-xl transition-colors duration-200 text-black hover:bg-purple-300"
    >
      <div className="text-lg sm:text-xl mb-1">{icon}</div>
      <span className="text-[10px] sm:text-xs font-semibold">{text}</span>
    </Link>
  );
};

export default function Navigation() {
  const t = useTranslations("nav");

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-purple-200 shadow-xl z-50 rounded-t-2xl">
      <div className="mx-auto flex justify-around">
        <NavItem href="/" icon={<FaHome />} text={t("home")} />
        <NavItem href="/financas" icon={<FaMoneyBillWave />} text={t("financas")} />
        <NavItem href="/agenda" icon={<FaCalendarAlt />} text={t("agenda")} />
        <NavItem href="/conteudo" icon={<FaLightbulb />} text={t("conteudo")} />
        <NavItem href="/gamificacao" icon={<FaTrophy />} text={t("gamificacao")} />
        <NavItem href="/reports" icon={<FaFileAlt />} text={t("reports")} />
        <NavItem href="/settings" icon={<FaCog />} text={t("settings")} />
      </div>
    </nav>
  );
}

