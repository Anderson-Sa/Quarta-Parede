"use server";

import { redirect } from "next/navigation";
import { bootstrapFirstAdminUser, verifyAdminCredentials } from "@/lib/adminUsers";
import { createAdminSession } from "@/lib/adminSession";
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

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "Informe e-mail e senha." };
  }

  // No-ops once at least one admin user exists — cheap enough to call on
  // every attempt and avoids needing a separate setup step for fresh installs.
  await bootstrapFirstAdminUser();

  const user = await verifyAdminCredentials(email, password);
  if (!user) {
    return { error: "E-mail ou senha incorretos." };
  }

  await createAdminSession(user.id);
  redirect("/admin");
}
