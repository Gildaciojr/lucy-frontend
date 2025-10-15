"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center justify-center">
      <div className="flex items-center justify-center px-3 py-2 bg-white rounded-lg shadow-md border border-purple-200 hover:shadow-lg transition">
        <Image
          src="/images/logo-lucy.png" // ✅ imagem salva em /public/images/
          alt="Lucy Logo"
          width={120} // ajuste conforme o tamanho real da logo
          height={40}
          className="object-contain"
          priority
        />
      </div>
    </Link>
  );
}


