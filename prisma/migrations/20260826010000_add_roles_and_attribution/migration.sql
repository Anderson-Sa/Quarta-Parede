-- AlterTable
-- Hand-written (not `prisma migrate dev`), same reason as
-- 20260826000000_add_post_author: a plain ALTER TABLE avoids the auto-diff
-- engine tripping over the hand-added PostSearch FTS5 virtual table (which
-- isn't modeled in schema.prisma).
--
-- Every AdminUser created before this migration was fully unrestricted, so
-- they're promoted to 'admin' here to preserve their access. New accounts
-- default to 'editor' (least privilege) unless an admin picks 'admin' when
-- creating them.
ALTER TABLE "AdminUser" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'editor';
UPDATE "AdminUser" SET "role" = 'admin';

-- AlterTable
ALTER TABLE "PostRevision" ADD COLUMN "authorId" TEXT REFERENCES "AdminUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "PostRevision_authorId_idx" ON "PostRevision"("authorId");

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN "moderatedById" TEXT REFERENCES "AdminUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD COLUMN "moderatedAt" DATETIME;
