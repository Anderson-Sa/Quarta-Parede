import { describe, expect, it } from "vitest";
import { generateTotp, generateTotpSecret, totpUri, verifyTotp } from "./totp";

describe("generateTotpSecret", () => {
  it("returns a base32 string with no padding or lowercase letters", () => {
    const secret = generateTotpSecret();
    expect(secret).toMatch(/^[A-Z2-7]+$/);
    expect(secret.length).toBeGreaterThan(0);
  });

  it("returns a different secret each time", () => {
    expect(generateTotpSecret()).not.toBe(generateTotpSecret());
  });
});

describe("totpUri", () => {
  it("embeds the secret, account and issuer in an otpauth:// URI", () => {
    const uri = totpUri("ABCD1234", "editor@example.com", "Quarta Parede");
    expect(uri).toMatch(/^otpauth:\/\/totp\//);
    expect(uri).toContain("secret=ABCD1234");
    expect(decodeURIComponent(uri)).toContain("Quarta Parede:editor@example.com");
  });
});

describe("generateTotp / verifyTotp", () => {
  it("verifies a code generated for the same secret and timestamp", () => {
    const secret = generateTotpSecret();
    const now = Date.UTC(2026, 0, 1, 12, 0, 0);
    const code = generateTotp(secret, now);
    expect(code).toMatch(/^\d{6}$/);
    expect(verifyTotp(secret, code, now)).toBe(true);
  });

  it("rejects a code generated from a different secret", () => {
    const secretA = generateTotpSecret();
    const secretB = generateTotpSecret();
    const now = Date.UTC(2026, 0, 1, 12, 0, 0);
    const code = generateTotp(secretA, now);
    expect(verifyTotp(secretB, code, now)).toBe(false);
  });

  it("tolerates one step of clock drift in either direction", () => {
    const secret = generateTotpSecret();
    const now = Date.UTC(2026, 0, 1, 12, 0, 0);
    const code = generateTotp(secret, now);
    expect(verifyTotp(secret, code, now + 30_000)).toBe(true);
    expect(verifyTotp(secret, code, now - 30_000)).toBe(true);
  });

  it("rejects a code outside the drift window", () => {
    const secret = generateTotpSecret();
    const now = Date.UTC(2026, 0, 1, 12, 0, 0);
    const code = generateTotp(secret, now);
    expect(verifyTotp(secret, code, now + 120_000)).toBe(false);
  });

  it("rejects malformed input without throwing", () => {
    const secret = generateTotpSecret();
    expect(verifyTotp(secret, "abcdef")).toBe(false);
    expect(verifyTotp(secret, "12345")).toBe(false);
    expect(verifyTotp(secret, "")).toBe(false);
  });
});
