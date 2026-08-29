import { prisma } from "@/lib/prisma";
import { getCurrentAdminUser } from "@/lib/adminSession";

/**
 * Appends one row to the audit trail (see AuditLog in prisma/schema.prisma),
 * viewable at /admin/auditoria. Best-effort: a logging failure must never
 * block the action it's describing, so callers fire-and-forget this rather
 * than awaiting it inline with error handling.
 */
export async function logAudit(entry: {
  action: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
}) {
  try {
    const currentUser = await getCurrentAdminUser();
    const actor = currentUser
      ? await prisma.adminUser.findUnique({ where: { id: currentUser.id }, select: { name: true } })
      : null;

    await prisma.auditLog.create({
      data: {
        adminUserId: currentUser?.id ?? null,
        actorName: actor?.name ?? "Sistema",
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId ?? null,
        summary: entry.summary,
      },
    });
  } catch {
    // Never let audit logging break the caller's actual work.
  }
}
