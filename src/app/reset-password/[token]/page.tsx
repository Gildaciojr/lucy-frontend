// src/app/reset-password/[token]/page.tsx
import ResetPasswordClient from "./reset-password-client";

// ✅ Este componente é do lado do servidor (Next.js 15 exige isso)
export default function ResetPasswordTokenPage({
  params,
}: {
  params: { token: string };
}) {
  return <ResetPasswordClient token={params.token} />;
}
