import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/siteUrl";

/**
 * Like newsletter sending (src/lib/newsletter.ts), stays entirely opt-in:
 * unless both env vars are set, no external API call is made.
 */
export function isScheduledPostNotificationConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.NEWSLETTER_FROM_EMAIL);
}

function escapeHtml(value: string) {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return value.replace(/[&<>"']/g, (char) => map[char]);
}

export type NotifyScheduledPostsResult = { notified: number };

/**
 * Finds scheduled posts whose publishedAt has now passed and emails their
 * author that the post is live, then marks them as notified. Exactly-once:
 * scheduledNotifiedAt is set right after a successful send, so re-running
 * this (e.g. cron firing again before the next scheduled slot) never
 * double-emails an author regardless of how often the cron runs.
 */
export async function notifyScheduledPosts(): Promise<NotifyScheduledPostsResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NEWSLETTER_FROM_EMAIL;
  if (!apiKey || !from) return { notified: 0 };

  const posts = await prisma.post.findMany({
    where: {
      notifyOnPublish: true,
      scheduledNotifiedAt: null,
      published: true,
      publishedAt: { lte: new Date() },
      deletedAt: null,
    },
    include: { author: { select: { email: true, name: true } } },
  });

  if (posts.length === 0) return { notified: 0 };

  const siteUrl = getSiteUrl();
  const resend = new Resend(apiKey);
  let notified = 0;

  for (const post of posts) {
    if (post.author?.email) {
      const postUrl = `${siteUrl}/post/${post.slug}`;
      const result = await resend.emails.send({
        from,
        to: post.author.email,
        subject: `Seu post "${post.title}" acabou de ser publicado`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
            <h1 style="font-size:18px;">Publicado com sucesso</h1>
            <p>Olá, ${escapeHtml(post.author.name)}. O post agendado
              <strong>${escapeHtml(post.title)}</strong> acabou de ficar visível no site.</p>
            <p style="margin-top:24px;">
              <a href="${postUrl}" style="color:#111;font-weight:700;">Ver post publicado</a>
            </p>
          </div>`,
      });
      if (result.error) continue;
    }

    await prisma.post.update({
      where: { id: post.id },
      data: { scheduledNotifiedAt: new Date() },
    });
    notified += 1;
  }

  return { notified };
}
