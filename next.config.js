// frontend/next.config.js
import createNextIntlPlugin from "next-intl/plugin.js";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ["pt", "es"],
    defaultLocale: "pt",
    domains: [
      { domain: "dashboard.mylucy.app", defaultLocale: "pt" },
      { domain: "www.dashboard.mylucy.app", defaultLocale: "pt" },
      { domain: "es.dashboard.mylucy.app", defaultLocale: "es" }
    ]
  }
};

export default withNextIntl(nextConfig);



