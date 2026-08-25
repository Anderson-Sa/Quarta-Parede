import { afterEach, describe, expect, it, vi } from "vitest";

// sendDigest talks to three things this test wants full control over: the
// Resend API (never make a real network call in tests), and the post/
// subscriber lookups (so "no posts"/"no subscribers" branches are
// reproducible without touching the shared dev DB's real data).
const sendMock = vi.fn();
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(function Resend() {
    return { batch: { send: sendMock } };
  }),
}));

const findManyPostMock = vi.fn();
const findManySubscriberMock = vi.fn();
vi.mock("@/lib/prisma", () => ({
  prisma: {
    post: { findMany: (...args: unknown[]) => findManyPostMock(...args) },
    subscriber: { findMany: (...args: unknown[]) => findManySubscriberMock(...args) },
  },
}));

vi.mock("@/lib/siteSettings", () => ({
  getSiteSettings: async () => ({ siteName: "Quarta Parede" }),
}));

vi.mock("@/lib/siteUrl", () => ({
  getSiteUrl: () => "https://example.com",
}));

import { escapeHtml, isNewsletterConfigured, sendDigest } from "./newsletter";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  sendMock.mockReset();
  findManyPostMock.mockReset();
  findManySubscriberMock.mockReset();
});

describe("escapeHtml", () => {
  it("escapes the five HTML-significant characters", () => {
    expect(escapeHtml(`<b>"quoted" & 'single'</b>`)).toBe(
      "&lt;b&gt;&quot;quoted&quot; &amp; &#39;single&#39;&lt;/b&gt;",
    );
  });

  it("leaves plain text untouched", () => {
    expect(escapeHtml("Sem tags nem entidades aqui.")).toBe("Sem tags nem entidades aqui.");
  });
});

describe("isNewsletterConfigured", () => {
  it("is false when either env var is missing", () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.NEWSLETTER_FROM_EMAIL;
    expect(isNewsletterConfigured()).toBe(false);

    process.env.RESEND_API_KEY = "re_test";
    delete process.env.NEWSLETTER_FROM_EMAIL;
    expect(isNewsletterConfigured()).toBe(false);
  });

  it("is true when both env vars are set", () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.NEWSLETTER_FROM_EMAIL = "news@example.com";
    expect(isNewsletterConfigured()).toBe(true);
  });
});

describe("sendDigest", () => {
  it("errors without calling Resend when not configured", async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.NEWSLETTER_FROM_EMAIL;

    const result = await sendDigest();

    expect(result).toEqual({ error: expect.stringContaining("não configurado") });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("errors when there are no published posts to include", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.NEWSLETTER_FROM_EMAIL = "news@example.com";
    findManyPostMock.mockResolvedValue([]);
    findManySubscriberMock.mockResolvedValue([{ email: "a@example.com" }]);

    const result = await sendDigest();

    expect(result).toEqual({ error: expect.stringContaining("Nenhum post") });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("errors when there are no subscribers", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.NEWSLETTER_FROM_EMAIL = "news@example.com";
    findManyPostMock.mockResolvedValue([{ title: "Post", slug: "post", excerpt: "Resumo" }]);
    findManySubscriberMock.mockResolvedValue([]);

    const result = await sendDigest();

    expect(result).toEqual({ error: expect.stringContaining("Nenhum assinante") });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("sends one batch and reports the number of subscribers sent to", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.NEWSLETTER_FROM_EMAIL = "news@example.com";
    findManyPostMock.mockResolvedValue([{ title: "Post", slug: "post", excerpt: "Resumo" }]);
    findManySubscriberMock.mockResolvedValue([{ email: "a@example.com" }, { email: "b@example.com" }]);
    sendMock.mockResolvedValue({ data: [], error: null });

    const result = await sendDigest();

    expect(result).toEqual({ sent: 2 });
    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it("splits sends into 100-subscriber batches", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.NEWSLETTER_FROM_EMAIL = "news@example.com";
    findManyPostMock.mockResolvedValue([{ title: "Post", slug: "post", excerpt: "Resumo" }]);
    findManySubscriberMock.mockResolvedValue(
      Array.from({ length: 150 }, (_, i) => ({ email: `subscriber-${i}@example.com` })),
    );
    sendMock.mockResolvedValue({ data: [], error: null });

    const result = await sendDigest();

    expect(result).toEqual({ sent: 150 });
    expect(sendMock).toHaveBeenCalledTimes(2);
  });

  it("surfaces a Resend error instead of reporting success", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.NEWSLETTER_FROM_EMAIL = "news@example.com";
    findManyPostMock.mockResolvedValue([{ title: "Post", slug: "post", excerpt: "Resumo" }]);
    findManySubscriberMock.mockResolvedValue([{ email: "a@example.com" }]);
    sendMock.mockResolvedValue({ data: null, error: { message: "boom" } });

    const result = await sendDigest();

    expect(result).toEqual({ error: "boom" });
  });
});
