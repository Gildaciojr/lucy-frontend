"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center justify-center">
      <div className="flex items-center justify-center px-2 py-1 bg-white rounded-lg shadow-sm border border-purple-200">
        <Image
          src="/images/logo-lucy.png"
          alt="Lucy Logo"
          width={80} // 🔽 menor, tamanho ideal de logo
          height={30}
          className="object-contain"
          priority
        />
      </div>
    </Link>
  );
}



