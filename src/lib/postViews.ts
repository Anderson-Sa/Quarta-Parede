import { prisma } from "@/lib/prisma";

/** Truncates a date to the start of its UTC day, matching the granularity
 * `PostViewDaily.date` is stored at (see prisma/schema.prisma). */
export function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/** Records one view for `postId` on today's UTC-day bucket, creating the row
 * if it doesn't exist yet. Best-effort, mirrors the "don't let analytics
 * break the page" posture of the `Post.views` increment it runs alongside
 * (see src/app/(site)/post/[slug]/page.tsx). */
export async function recordPostView(postId: string): Promise<void> {
  const date = startOfUtcDay(new Date());
  await prisma.postViewDaily.upsert({
    where: { postId_date: { postId, date } },
    create: { postId, date, count: 1 },
    update: { count: { increment: 1 } },
  });
}

/** Total views per UTC day across all posts, for the last `days` days
 * (oldest first), for the admin analytics traffic chart. Days with no
 * recorded views are filled in with a zero count so the chart has a
 * continuous x-axis. */
export async function getDailyViewTotals(
  days: number
): Promise<{ date: Date; count: number }[]> {
  const today = startOfUtcDay(new Date());
  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - (days - 1));

  const rows = await prisma.postViewDaily.groupBy({
    by: ["date"],
    where: { date: { gte: start } },
    _sum: { count: true },
  });

  const byDate = new Map(rows.map((row) => [row.date.getTime(), row._sum.count ?? 0]));

  const result: { date: Date; count: number }[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(start);
    date.setUTCDate(date.getUTCDate() + i);
    result.push({ date, count: byDate.get(date.getTime()) ?? 0 });
  }
  return result;
}
