"use server";

import { sendDigest, type SendDigestResult } from "@/lib/newsletter";

export async function sendNewsletterDigest(): Promise<SendDigestResult> {
  return sendDigest();
}
