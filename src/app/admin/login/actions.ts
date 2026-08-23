"use server";

import { redirect } from "next/navigation";
import { checkAdminPassword, createAdminSession } from "@/lib/adminSession";
import { checkRateLimit, formatRetryAfter, getClientIp } from "@/lib/rateLimit";

export type LoginState = { error?: string } | undefined;

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const ip = await getClientIp();
  const rateLimit = await checkRateLimit(`admin-login:${ip}`, MAX_ATTEMPTS, WINDOW_MS);
  if (!rateLimit.allowed) {
    return {
      error: `Muitas tentativas. Tente novamente em ${formatRetryAfter(rateLimit.retryAfterSeconds)}.`,
    };
  }

  const password = String(formData.get("password") ?? "");

  if (!password || !checkAdminPassword(password)) {
    return { error: "Senha incorreta." };
  }

  await createAdminSession();
  redirect("/admin");
}
