-- AlterTable
-- Hand-written (not `prisma migrate dev`), same reason as
-- 20260824020000_add_social_links: a plain ADD COLUMN avoids the auto-diff
-- engine trying to drop the hand-added PostSearch FTS5 virtual table.
ALTER TABLE "Campaign" ADD COLUMN "views" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Campaign" ADD COLUMN "clicks" INTEGER NOT NULL DEFAULT 0;
