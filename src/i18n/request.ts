// frontend/src/i18n/request.ts
import { getLocale } from "@/lib/getLocale";
import { getMessages } from "next-intl/server";

export default async function requestConfig() {
  const locale = await getLocale();
  const messages = await getMessages({ locale });

  return {
    locale,
    messages,
  };
}



