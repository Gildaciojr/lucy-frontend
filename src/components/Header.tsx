import React from "react";
import Logo from "./Logo";

export default function Header() {
  return (
    <header className="w-full flex items-center justify-between px-6 py-4 bg-white shadow-md">
      <Logo />
      <nav className="text-sm text-gray-600">
        {/* Se quiser links no topo, pode colocar aqui */}
      </nav>
    </header>
  );
}
