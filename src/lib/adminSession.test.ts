import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";

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

import {
  createAdminSession,
  destroyAdminSession,
  getCurrentAdminUserId,
  isAdminSessionValid,
} from "./adminSession";

// isAdminSessionValid() confirms the session's user id still exists in the
// DB, so a real AdminUser row is created per test (integration-style, same
// convention as the rest of the suite) rather than mocking prisma.
let testUserId: string;

beforeEach(async () => {
  store.clear();
  const user = await prisma.adminUser.create({
    data: {
      name: "Test Admin",
      email: `admin-session-test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
      passwordHash: "unused-in-these-tests",
    },
  });
  testUserId = user.id;
});

afterEach(async () => {
  await prisma.adminUser.delete({ where: { id: testUserId } }).catch(() => {});
});

describe("admin session lifecycle", () => {
  it("is invalid before any session is created", async () => {
    expect(await isAdminSessionValid()).toBe(false);
  });

  it("has no current user id before any session is created", async () => {
    expect(await getCurrentAdminUserId()).toBe(null);
  });

  it("is valid right after creating a session", async () => {
    await createAdminSession(testUserId);
    expect(await isAdminSessionValid()).toBe(true);
  });

  it("remembers which user the session was created for", async () => {
    await createAdminSession(testUserId);
    expect(await getCurrentAdminUserId()).toBe(testUserId);
  });

  it("is invalid if the session's user was deleted", async () => {
    await createAdminSession(testUserId);
    await prisma.adminUser.delete({ where: { id: testUserId } });
    expect(await isAdminSessionValid()).toBe(false);
  });

  it("is invalid again after destroying the session", async () => {
    await createAdminSession(testUserId);
    await destroyAdminSession();
    expect(await isAdminSessionValid()).toBe(false);
  });

  it("rejects a tampered token", async () => {
    await createAdminSession(testUserId);
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
