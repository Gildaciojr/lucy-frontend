"use client";

import React, { useState } from "react";
import {
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

interface PasswordFieldProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function PasswordField({
  value,
  onChange,
  placeholder = "Digite sua senha",
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  const hasUpper = /[A-Z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasSymbol = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value);
  const hasLength = value.length >= 8;
  const valid = hasUpper && hasNumber && hasSymbol && hasLength;

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className={`w-full p-3 pr-10 border rounded-lg transition-colors ${
            value.length === 0
              ? "border-gray-300"
              : valid
                ? "border-green-500"
                : "border-red-500"
          }`}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-3 text-gray-500 hover:text-lucy"
        >
          {show ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      {/* feedback das regras */}
      <ul className="text-sm space-y-1">
        <li
          className={`flex items-center ${hasLength ? "text-green-600" : "text-red-500"}`}
        >
          {hasLength ? (
            <FaCheckCircle className="mr-1" />
          ) : (
            <FaTimesCircle className="mr-1" />
          )}
          Mínimo de 8 caracteres
        </li>
        <li
          className={`flex items-center ${hasUpper ? "text-green-600" : "text-red-500"}`}
        >
          {hasUpper ? (
            <FaCheckCircle className="mr-1" />
          ) : (
            <FaTimesCircle className="mr-1" />
          )}
          Pelo menos 1 letra maiúscula
        </li>
        <li
          className={`flex items-center ${hasNumber ? "text-green-600" : "text-red-500"}`}
        >
          {hasNumber ? (
            <FaCheckCircle className="mr-1" />
          ) : (
            <FaTimesCircle className="mr-1" />
          )}
          Pelo menos 1 número
        </li>
        <li
          className={`flex items-center ${hasSymbol ? "text-green-600" : "text-red-500"}`}
        >
          {hasSymbol ? (
            <FaCheckCircle className="mr-1" />
          ) : (
            <FaTimesCircle className="mr-1" />
          )}
          Pelo menos 1 caractere especial
        </li>
      </ul>
    </div>
  );
}
