import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";

// Constant-time-ish guard against a login for a non-existent e-mail returning
// faster than one for a wrong password, which would otherwise leak which
// e-mails have accounts. Computed once at module load (scrypt is slow by
// design) and compared against on every "user not found" login attempt.
const DUMMY_PASSWORD_HASH = hashPassword("not-a-real-password-used-only-for-timing");

/**
 * Bootstraps the very first admin account from ADMIN_EMAIL/ADMIN_PASSWORD in
 * .env, but only while the AdminUser table is still empty. This keeps the
 * env-var-based login working for a fresh install with zero setup; every
 * account created afterwards goes through /admin/usuarios and has its own
 * login/password.
 */
export async function bootstrapFirstAdminUser() {
  const existingCount = await prisma.adminUser.count();
  if (existingCount > 0) return;

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  await prisma.adminUser.create({
    data: {
      name: "Admin",
      email: email.trim().toLowerCase(),
      passwordHash: hashPassword(password),
      role: "admin",
    },
  });
}

/** Returns the matching admin user (without the password hash) or null if the credentials are invalid. */
export async function verifyAdminCredentials(email: string, password: string) {
  const user = await prisma.adminUser.findUnique({ where: { email: email.trim().toLowerCase() } });
  const valid = verifyPassword(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);
  if (!user || !valid) return null;

  return { id: user.id, name: user.name, email: user.email, totpSecret: user.totpSecret };
}
