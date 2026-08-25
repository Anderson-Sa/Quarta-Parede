import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { getDailyViewTotals, recordPostView, startOfUtcDay } from "./postViews";

let categoryId: string;
let postId: string;

// Uses the real dev DB (matching the convention in rateLimit.test.ts) — a
// throwaway Category/Post pair is created up front and torn down at the end;
// deleting the Post cascades to its PostViewDaily rows (see schema.prisma).
beforeAll(async () => {
  const unique = `postviews-test-${Date.now()}`;
  const category = await prisma.category.create({
    data: { name: unique, slug: unique },
  });
  categoryId = category.id;

  const post = await prisma.post.create({
    data: {
      title: unique,
      slug: unique,
      excerpt: "excerpt",
      content: "content",
      categoryId,
      published: true,
    },
  });
  postId = post.id;
});

afterAll(async () => {
  await prisma.post.delete({ where: { id: postId } });
  await prisma.category.delete({ where: { id: categoryId } });
});

describe("startOfUtcDay", () => {
  it("truncates a date to midnight UTC", () => {
    const date = new Date("2026-03-14T17:42:05.123Z");
    expect(startOfUtcDay(date).toISOString()).toBe("2026-03-14T00:00:00.000Z");
  });

  it("is idempotent on an already-truncated date", () => {
    const date = new Date("2026-01-01T00:00:00.000Z");
    expect(startOfUtcDay(date).toISOString()).toBe(date.toISOString());
  });
});

describe("recordPostView", () => {
  it("creates today's bucket on the first view", async () => {
    await recordPostView(postId);
    const today = startOfUtcDay(new Date());
    const row = await prisma.postViewDaily.findUnique({
      where: { postId_date: { postId, date: today } },
    });
    expect(row?.count).toBe(1);
  });

  it("increments the existing bucket on subsequent views", async () => {
    await recordPostView(postId);
    await recordPostView(postId);
    const today = startOfUtcDay(new Date());
    const row = await prisma.postViewDaily.findUnique({
      where: { postId_date: { postId, date: today } },
    });
    expect(row?.count).toBe(3);
  });
});

describe("getDailyViewTotals", () => {
  it("returns exactly `days` entries in ascending order, ending today", async () => {
    const totals = await getDailyViewTotals(7);
    expect(totals).toHaveLength(7);
    const today = startOfUtcDay(new Date());
    expect(totals[6].date.getTime()).toBe(today.getTime());
    for (let i = 1; i < totals.length; i++) {
      expect(totals[i].date.getTime() - totals[i - 1].date.getTime()).toBe(24 * 60 * 60 * 1000);
    }
  });

  it("includes today's recorded views in the total", async () => {
    const totals = await getDailyViewTotals(7);
    const today = startOfUtcDay(new Date());
    const todayEntry = totals.find((d) => d.date.getTime() === today.getTime());
    expect(todayEntry?.count).toBeGreaterThanOrEqual(3);
  });

  it("fills days with no recorded views with a zero count", async () => {
    // The test post only has views recorded today, so a window that also
    // covers a day none of the seed data touches should still return a row
    // for it, at zero, rather than skipping it.
    const totals = await getDailyViewTotals(90);
    expect(totals).toHaveLength(90);
    expect(totals.some((d) => d.count === 0)).toBe(true);
  });
});
