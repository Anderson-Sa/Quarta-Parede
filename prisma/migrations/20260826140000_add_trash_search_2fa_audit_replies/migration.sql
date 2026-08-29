-- Hand-written (not `prisma migrate dev`), same reason as prior migrations
-- in this project: a plain ALTER TABLE/CREATE TABLE avoids the auto-diff
-- engine tripping over the hand-added PostSearch FTS5 virtual table (which
-- isn't modeled in schema.prisma).

-- AlterTable: soft-delete + scheduled-publish notification bookkeeping
ALTER TABLE "Post" ADD COLUMN "deletedAt" DATETIME;
ALTER TABLE "Post" ADD COLUMN "notifyOnPublish" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Post" ADD COLUMN "scheduledNotifiedAt" DATETIME;

-- AlterTable: single attributed reply per comment
ALTER TABLE "Comment" ADD COLUMN "replyBody" TEXT;
ALTER TABLE "Comment" ADD COLUMN "repliedById" TEXT REFERENCES "AdminUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD COLUMN "repliedAt" DATETIME;

-- AlterTable: TOTP two-factor auth
ALTER TABLE "AdminUser" ADD COLUMN "totpSecret" TEXT;
ALTER TABLE "AdminUser" ADD COLUMN "totpEnabledAt" DATETIME;

-- CreateTable: append-only admin action log
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminUserId" TEXT,
    "actorName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "summary" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX "AuditLog_adminUserId_idx" ON "AuditLog"("adminUserId");
