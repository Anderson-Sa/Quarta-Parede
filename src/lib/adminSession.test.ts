import { beforeEach, describe, expect, it, vi } from "vitest";

// next/headers' cookies() requires a request scope, which doesn't exist
// outside of Next.js — so it's mocked with an in-memory jar that mirrors the
// tiny slice of the API adminSession.ts actually uses (set/get/delete).
const { store } = vi.hoisted(() => ({ store: new Map<string, { value: string }>() }));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    set: (name: string, value: string) => store.set(name, { value }),
    get: (name: string) => store.get(name),
    delete: (name: string) => store.delete(name),
  }),
}));

import { checkAdminPassword, createAdminSession, destroyAdminSession, isAdminSessionValid } from "./adminSession";

beforeEach(() => {
  store.clear();
});

describe("checkAdminPassword", () => {
  it("accepts the password configured in .env", () => {
    expect(checkAdminPassword(process.env.ADMIN_PASSWORD!)).toBe(true);
  });

  it("rejects a wrong password", () => {
    expect(checkAdminPassword("senha-errada")).toBe(false);
  });

  it("rejects an empty password", () => {
    expect(checkAdminPassword("")).toBe(false);
  });

  it("rejects a password of a different length without throwing", () => {
    expect(checkAdminPassword(process.env.ADMIN_PASSWORD! + "x")).toBe(false);
  });
});

describe("admin session lifecycle", () => {
  it("is invalid before any session is created", async () => {
    expect(await isAdminSessionValid()).toBe(false);
  });

  it("is valid right after creating a session", async () => {
    await createAdminSession();
    expect(await isAdminSessionValid()).toBe(true);
  });

  it("is invalid again after destroying the session", async () => {
    await createAdminSession();
    await destroyAdminSession();
    expect(await isAdminSessionValid()).toBe(false);
  });

  it("rejects a tampered token", async () => {
    await createAdminSession();
    const cookie = store.get("admin_session");
    if (!cookie) throw new Error("expected a session cookie to be set");
    const tamperedSignature = cookie.value.slice(0, -1) + (cookie.value.endsWith("0") ? "1" : "0");
    store.set("admin_session", { value: tamperedSignature });
    expect(await isAdminSessionValid()).toBe(false);
  });

  it("rejects a malformed token", async () => {
    store.set("admin_session", { value: "not-a-valid-token" });
    expect(await isAdminSessionValid()).toBe(false);
  });
});
