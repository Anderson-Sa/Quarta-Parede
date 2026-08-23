import { describe, expect, it, vi } from "vitest";
import { checkRateLimit, formatRetryAfter } from "./rateLimit";

describe("checkRateLimit", () => {
  it("allows attempts under the limit", () => {
    const key = `test-${Math.random()}`;
    expect(checkRateLimit(key, 3, 1000).allowed).toBe(true);
    expect(checkRateLimit(key, 3, 1000).allowed).toBe(true);
    expect(checkRateLimit(key, 3, 1000).allowed).toBe(true);
  });

  it("blocks attempts once the max is exceeded", () => {
    const key = `test-${Math.random()}`;
    checkRateLimit(key, 2, 1000);
    checkRateLimit(key, 2, 1000);
    const result = checkRateLimit(key, 2, 1000);
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.retryAfterSeconds).toBeGreaterThan(0);
    }
  });

  it("resets the bucket after the window expires", () => {
    const key = `test-${Math.random()}`;
    vi.useFakeTimers();
    try {
      checkRateLimit(key, 1, 1000);
      expect(checkRateLimit(key, 1, 1000).allowed).toBe(false);
      vi.advanceTimersByTime(1001);
      expect(checkRateLimit(key, 1, 1000).allowed).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("tracks separate keys independently", () => {
    const keyA = `a-${Math.random()}`;
    const keyB = `b-${Math.random()}`;
    checkRateLimit(keyA, 1, 1000);
    expect(checkRateLimit(keyA, 1, 1000).allowed).toBe(false);
    expect(checkRateLimit(keyB, 1, 1000).allowed).toBe(true);
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
