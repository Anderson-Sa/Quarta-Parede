import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/siteSettings";
import { getSiteUrl } from "@/lib/siteUrl";
import { publicPostWhere } from "@/lib/publicPosts";
import { unsubscribeToken } from "@/lib/newsletterToken";

const RECENT_POSTS_COUNT = 5;
const RESEND_BATCH_LIMIT = 100;

/**
 * Newsletter sending is entirely opt-in: unless both env vars below are set,
 * this stays inert (no external account/API calls), matching the pattern
 * used by src/components/Analytics.tsx for other optional integrations.
 */
export function isNewsletterConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.NEWSLETTER_FROM_EMAIL);
}

export function escapeHtml(value: string) {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return value.replace(/[&<>"']/g, (char) => map[char]);
}

export type SendDigestResult = { sent: number } | { error: string };

/** Sends a "recent posts" digest email to every newsletter subscriber. */
export async function sendDigest(): Promise<SendDigestResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NEWSLETTER_FROM_EMAIL;
  if (!apiKey || !from) {
    return {
      error:
        "Envio de newsletter não configurado. Defina RESEND_API_KEY e NEWSLETTER_FROM_EMAIL no .env.",
    };
  }

  const [posts, subscribers, settings] = await Promise.all([
    prisma.post.findMany({
      where: publicPostWhere(),
      orderBy: { publishedAt: "desc" },
      take: RECENT_POSTS_COUNT,
      select: { title: true, slug: true, excerpt: true },
    }),
    prisma.subscriber.findMany({ select: { email: true } }),
    getSiteSettings(),
  ]);

  if (posts.length === 0) return { error: "Nenhum post publicado para incluir no digest." };
  if (subscribers.length === 0) return { error: "Nenhum assinante cadastrado." };

  const siteUrl = getSiteUrl();
  const resend = new Resend(apiKey);

  const postsHtml = posts
    .map(
      (post) => `
        <li style="margin-bottom:16px;">
          <a href="${siteUrl}/post/${post.slug}" style="font-weight:700;text-decoration:none;color:#111;">${escapeHtml(post.title)}</a>
          <p style="margin:4px 0 0;color:#444;">${escapeHtml(post.excerpt)}</p>
        </li>`,
    )
    .join("");

  const emails = subscribers.map((subscriber) => {
    const token = unsubscribeToken(subscriber.email);
    const unsubscribeUrl = `${siteUrl}/newsletter/cancelar?email=${encodeURIComponent(subscriber.email)}&token=${token}`;
    return {
      from,
      to: subscriber.email,
      subject: `${settings.siteName} — novidades da semana`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
          <h1 style="font-size:20px;">${escapeHtml(settings.siteName)}</h1>
          <ul style="list-style:none;padding:0;">${postsHtml}</ul>
          <p style="margin-top:24px;font-size:12px;color:#888;">
            <a href="${unsubscribeUrl}" style="color:#888;">Cancelar inscrição</a>
          </p>
        </div>`,
    };
  });

  let sent = 0;
  for (let i = 0; i < emails.length; i += RESEND_BATCH_LIMIT) {
    const chunk = emails.slice(i, i + RESEND_BATCH_LIMIT);
    const result = await resend.batch.send(chunk);
    if (result.error) return { error: result.error.message };
    sent += chunk.length;
  }

  return { sent };
}
