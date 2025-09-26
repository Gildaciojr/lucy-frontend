// frontend/next.config.js
import createNextIntlPlugin from "next-intl/plugin.js";

// Configura o next-intl para usar o request.ts
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true

};

export default withNextIntl(nextConfig);




