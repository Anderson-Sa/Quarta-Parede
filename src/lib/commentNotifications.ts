import { Resend } from "resend";
import { getSiteUrl } from "@/lib/siteUrl";

/**
 * Like newsletter sending (src/lib/newsletter.ts), this stays entirely
 * opt-in: unless RESEND_API_KEY, NEWSLETTER_FROM_EMAIL and
 * COMMENT_NOTIFICATION_EMAIL are all set, no external API call is made.
 * Reuses the same Resend account/sender as the newsletter digest, since
 * both are just transactional emails from the same site.
 */
export function isCommentNotificationConfigured() {
  return Boolean(
    process.env.RESEND_API_KEY && process.env.NEWSLETTER_FROM_EMAIL && process.env.COMMENT_NOTIFICATION_EMAIL,
  );
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

/**
 * Notifies the site admin by email that a new comment is awaiting
 * moderation. Best-effort: failures are returned as `{ error }` rather than
 * thrown, so a Resend/network hiccup never breaks comment submission for
 * the visitor.
 */
export async function notifyNewComment(comment: {
  authorName: string;
  body: string;
  post: { title: string; slug: string };
}): Promise<{ sent: true } | { error: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NEWSLETTER_FROM_EMAIL;
  const to = process.env.COMMENT_NOTIFICATION_EMAIL;
  if (!apiKey || !from || !to) {
    return { error: "Notificação de comentário não configurada." };
  }

  const siteUrl = getSiteUrl();
  const postUrl = `${siteUrl}/post/${comment.post.slug}`;
  const moderationUrl = `${siteUrl}/admin/comentarios`;

  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from,
    to,
    subject: `Novo comentário em "${comment.post.title}"`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
        <h1 style="font-size:18px;">Novo comentário aguardando moderação</h1>
        <p style="margin:0 0 4px;"><strong>${escapeHtml(comment.authorName)}</strong> comentou em
          <a href="${postUrl}" style="color:#111;">${escapeHtml(comment.post.title)}</a>:
        </p>
        <blockquote style="margin:12px 0;padding:8px 12px;border-left:3px solid #ccc;color:#444;">
          ${escapeHtml(comment.body)}
        </blockquote>
        <p style="margin-top:24px;">
          <a href="${moderationUrl}" style="color:#111;font-weight:700;">Moderar comentários</a>
        </p>
      </div>`,
  });

  if (result.error) return { error: result.error.message };
  return { sent: true };
}
