import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, formatRetryAfter } from "./rateLimit";

const testKeys: string[] = [];
function uniqueKey(prefix: string) {
  const key = `${prefix}-${Math.random()}`;
  testKeys.push(key);
  return key;
}

afterAll(async () => {
  await prisma.rateLimitBucket.deleteMany({ where: { key: { in: testKeys } } });
});

describe("checkRateLimit", () => {
  it("allows attempts under the limit", async () => {
    const key = uniqueKey("test");
    expect((await checkRateLimit(key, 3, 1000)).allowed).toBe(true);
    expect((await checkRateLimit(key, 3, 1000)).allowed).toBe(true);
    expect((await checkRateLimit(key, 3, 1000)).allowed).toBe(true);
  });

  it("blocks attempts once the max is exceeded", async () => {
    const key = uniqueKey("test");
    await checkRateLimit(key, 2, 1000);
    await checkRateLimit(key, 2, 1000);
    const result = await checkRateLimit(key, 2, 1000);
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.retryAfterSeconds).toBeGreaterThan(0);
    }
  });

  it("resets the bucket after the window expires", async () => {
    const key = uniqueKey("test");
    await checkRateLimit(key, 1, 200);
    expect((await checkRateLimit(key, 1, 200)).allowed).toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 250));
    expect((await checkRateLimit(key, 1, 200)).allowed).toBe(true);
  });

  it("tracks separate keys independently", async () => {
    const keyA = uniqueKey("a");
    const keyB = uniqueKey("b");
    await checkRateLimit(keyA, 1, 1000);
    expect((await checkRateLimit(keyA, 1, 1000)).allowed).toBe(false);
    expect((await checkRateLimit(keyB, 1, 1000)).allowed).toBe(true);
  });
});

describe("formatRetryAfter", () => {
  it("rounds up to the nearest minute", () => {
    expect(formatRetryAfter(30)).toBe("1 minuto");
    expect(formatRetryAfter(60)).toBe("1 minuto");
    expect(formatRetryAfter(61)).toBe("2 minutos");
    expect(formatRetryAfter(120)).toBe("2 minutos");
  });
});
