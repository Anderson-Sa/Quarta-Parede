import { afterEach, describe, expect, it, vi } from "vitest";

const sendMock = vi.fn();
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(function Resend() {
    return { emails: { send: sendMock } };
  }),
}));

const findManyPostMock = vi.fn();
const updatePostMock = vi.fn();
vi.mock("@/lib/prisma", () => ({
  prisma: {
    post: {
      findMany: (...args: unknown[]) => findManyPostMock(...args),
      update: (...args: unknown[]) => updatePostMock(...args),
    },
  },
}));

vi.mock("@/lib/siteUrl", () => ({
  getSiteUrl: () => "https://example.com",
}));

import { isScheduledPostNotificationConfigured, notifyScheduledPosts } from "./scheduledPostNotifications";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  sendMock.mockReset();
  findManyPostMock.mockReset();
  updatePostMock.mockReset();
});

describe("isScheduledPostNotificationConfigured", () => {
  it("is false when either env var is missing", () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.NEWSLETTER_FROM_EMAIL;
    expect(isScheduledPostNotificationConfigured()).toBe(false);

    process.env.RESEND_API_KEY = "re_test";
    expect(isScheduledPostNotificationConfigured()).toBe(false);
  });

  it("is true when both env vars are set", () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.NEWSLETTER_FROM_EMAIL = "noreply@example.com";
    expect(isScheduledPostNotificationConfigured()).toBe(true);
  });
});

describe("notifyScheduledPosts", () => {
  it("does nothing (and makes no queries) when not configured", async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.NEWSLETTER_FROM_EMAIL;

    const result = await notifyScheduledPosts();

    expect(result).toEqual({ notified: 0 });
    expect(findManyPostMock).not.toHaveBeenCalled();
  });

  it("returns 0 when there are no due scheduled posts", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.NEWSLETTER_FROM_EMAIL = "noreply@example.com";
    findManyPostMock.mockResolvedValue([]);

    const result = await notifyScheduledPosts();

    expect(result).toEqual({ notified: 0 });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("emails the author and marks the post as notified", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.NEWSLETTER_FROM_EMAIL = "noreply@example.com";
    findManyPostMock.mockResolvedValue([
      {
        id: "post-1",
        title: "Meu post agendado",
        slug: "meu-post-agendado",
        author: { email: "autor@example.com", name: "Autor" },
      },
    ]);
    sendMock.mockResolvedValue({ error: null });

    const result = await notifyScheduledPosts();

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: "autor@example.com" }),
    );
    expect(updatePostMock).toHaveBeenCalledWith({
      where: { id: "post-1" },
      data: { scheduledNotifiedAt: expect.any(Date) },
    });
    expect(result).toEqual({ notified: 1 });
  });

  it("marks posts with no author as notified without sending an email", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.NEWSLETTER_FROM_EMAIL = "noreply@example.com";
    findManyPostMock.mockResolvedValue([
      { id: "post-1", title: "Sem autor", slug: "sem-autor", author: null },
    ]);

    const result = await notifyScheduledPosts();

    expect(sendMock).not.toHaveBeenCalled();
    expect(updatePostMock).toHaveBeenCalledWith({
      where: { id: "post-1" },
      data: { scheduledNotifiedAt: expect.any(Date) },
    });
    expect(result).toEqual({ notified: 1 });
  });

  it("leaves the post unnotified (for retry) when the email send fails", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.NEWSLETTER_FROM_EMAIL = "noreply@example.com";
    findManyPostMock.mockResolvedValue([
      {
        id: "post-1",
        title: "Falha no envio",
        slug: "falha-no-envio",
        author: { email: "autor@example.com", name: "Autor" },
      },
    ]);
    sendMock.mockResolvedValue({ error: { message: "boom" } });

    const result = await notifyScheduledPosts();

    expect(updatePostMock).not.toHaveBeenCalled();
    expect(result).toEqual({ notified: 0 });
  });
});
