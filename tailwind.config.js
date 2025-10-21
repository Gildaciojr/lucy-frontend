/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from "tailwindcss-animate";

const config = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        lucy: {
          DEFAULT: "#AE43C6", // 💜 Cor oficial Lucy (Pantone 2592 C)
          light: "#C87BDA",
          dark: "#9B3AB3",
        },
      },
      borderRadius: {
        xl: "0.75rem",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
