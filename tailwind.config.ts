import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        lucy: {
          purple: "#7c3aed",
          light: "#ede9fe",
          accent: "#c4b5fd",
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

