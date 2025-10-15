// tailwind.config.js — compatível com Tailwind v4 e sem avisos do ESLint

const tailwindConfig = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
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
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: {
    "tailwindcss-animate": {},
  },
};

export default tailwindConfig;
