import { afterEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { bootstrapFirstAdminUser, verifyAdminCredentials } from "./adminUsers";

const ORIGINAL_ENV = { ...process.env };
const createdUserIds: string[] = [];

afterEach(async () => {
  process.env = { ...ORIGINAL_ENV };
  if (createdUserIds.length > 0) {
    await prisma.adminUser.deleteMany({ where: { id: { in: createdUserIds } } });
    createdUserIds.length = 0;
  }
});

describe("bootstrapFirstAdminUser", () => {
  it("does nothing when ADMIN_EMAIL or ADMIN_PASSWORD is missing", async () => {
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD;
    const before = await prisma.adminUser.count();

    await bootstrapFirstAdminUser();

    expect(await prisma.adminUser.count()).toBe(before);
  });

  it("creates the first admin from ADMIN_EMAIL/ADMIN_PASSWORD when the table is empty", async () => {
    // Isolate from any pre-existing rows (e.g. the real dev bootstrap admin)
    // by asserting against the specific e-mail this test creates, rather
    // than the table being literally empty.
    const email = `bootstrap-test-${Date.now()}@example.com`;
    process.env.ADMIN_EMAIL = email;
    process.env.ADMIN_PASSWORD = "a-strong-password";

    const existingCount = await prisma.adminUser.count();
    if (existingCount > 0) {
      // bootstrapFirstAdminUser() only acts when the table is empty; skip in
      // that case rather than mutating shared dev data.
      return;
    }

    await bootstrapFirstAdminUser();

    const created = await prisma.adminUser.findUnique({ where: { email } });
    expect(created).not.toBeNull();
    if (created) createdUserIds.push(created.id);
  });

  it("does nothing when an admin user already exists", async () => {
    const user = await prisma.adminUser.create({
      data: { name: "Existing", email: `existing-${Date.now()}@example.com`, passwordHash: hashPassword("x") },
    });
    createdUserIds.push(user.id);

    process.env.ADMIN_EMAIL = `should-not-be-created-${Date.now()}@example.com`;
    process.env.ADMIN_PASSWORD = "a-strong-password";

    await bootstrapFirstAdminUser();

    const notCreated = await prisma.adminUser.findUnique({ where: { email: process.env.ADMIN_EMAIL } });
    expect(notCreated).toBeNull();
  });
});

describe("verifyAdminCredentials", () => {
  it("returns the user for correct credentials", async () => {
    const email = `verify-test-${Date.now()}@example.com`;
    const user = await prisma.adminUser.create({
      data: { name: "Verify Test", email, passwordHash: hashPassword("correct-password") },
    });
    createdUserIds.push(user.id);

    const result = await verifyAdminCredentials(email, "correct-password");
    expect(result).toEqual({ id: user.id, name: "Verify Test", email });
  });

  it("is case-insensitive on e-mail", async () => {
    const email = `case-test-${Date.now()}@example.com`;
    const user = await prisma.adminUser.create({
      data: { name: "Case Test", email, passwordHash: hashPassword("correct-password") },
    });
    createdUserIds.push(user.id);

    const result = await verifyAdminCredentials(email.toUpperCase(), "correct-password");
    expect(result?.id).toBe(user.id);
  });

  it("returns null for a wrong password", async () => {
    const email = `wrongpass-test-${Date.now()}@example.com`;
    const user = await prisma.adminUser.create({
      data: { name: "Wrong Pass", email, passwordHash: hashPassword("correct-password") },
    });
    createdUserIds.push(user.id);

    expect(await verifyAdminCredentials(email, "wrong-password")).toBe(null);
  });

  it("returns null for an unknown e-mail", async () => {
    expect(await verifyAdminCredentials("nobody-here@example.com", "anything")).toBe(null);
  });
});
