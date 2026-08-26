import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isTurnstileConfigured, verifyTurnstileToken } from "./turnstile";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.unstubAllGlobals();
});

describe("isTurnstileConfigured", () => {
  it("is false when TURNSTILE_SECRET_KEY is unset", () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    expect(isTurnstileConfigured()).toBe(false);
  });

  it("is true when TURNSTILE_SECRET_KEY is set", () => {
    process.env.TURNSTILE_SECRET_KEY = "secret";
    expect(isTurnstileConfigured()).toBe(true);
  });
});

describe("verifyTurnstileToken", () => {
  beforeEach(() => {
    process.env.TURNSTILE_SECRET_KEY = "secret";
  });

  it("returns true without calling fetch when not configured", async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    expect(await verifyTurnstileToken("some-token", "1.2.3.4")).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns false for an empty token without calling fetch", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    expect(await verifyTurnstileToken("", "1.2.3.4")).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns true when Cloudflare confirms success", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal("fetch", fetchMock);

    expect(await verifyTurnstileToken("valid-token", "1.2.3.4")).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      expect.objectContaining({ method: "POST" }),
    );
    const body = fetchMock.mock.calls[0][1].body as URLSearchParams;
    expect(body.get("secret")).toBe("secret");
    expect(body.get("response")).toBe("valid-token");
    expect(body.get("remoteip")).toBe("1.2.3.4");
  });

  it("returns false when Cloudflare reports failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: false }) }),
    );
    expect(await verifyTurnstileToken("bad-token", "1.2.3.4")).toBe(false);
  });

  it("returns false when the request itself fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }));
    expect(await verifyTurnstileToken("token", "1.2.3.4")).toBe(false);
  });

  it("returns false without throwing when fetch rejects", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    expect(await verifyTurnstileToken("token", "1.2.3.4")).toBe(false);
  });
});
