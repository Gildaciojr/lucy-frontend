import { getLocale } from "@/lib/getLocale";
import { getMessages } from "next-intl/server";

export default async function requestConfig() {
  const locale = getLocale();
  const messages = await getMessages({ locale });

  return {
    locale,
    messages,
  };
}

