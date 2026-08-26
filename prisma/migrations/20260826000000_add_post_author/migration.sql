-- AlterTable
-- Hand-written (not `prisma migrate dev`), same reason as
-- 20260825120000_add_admin_users: a plain ALTER TABLE avoids the auto-diff
-- engine tripping over the hand-added PostSearch FTS5 virtual table (which
-- isn't modeled in schema.prisma). Nullable so existing posts (created
-- before AdminUser existed) don't need a backfilled value.
ALTER TABLE "Post" ADD COLUMN "authorId" TEXT REFERENCES "AdminUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");
