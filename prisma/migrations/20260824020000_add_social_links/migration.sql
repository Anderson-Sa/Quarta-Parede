-- AlterTable
-- Hand-written (not `prisma migrate dev`): the auto-diff engine doesn't know
-- about the PostSearch FTS5 virtual table (added via raw SQL, see
-- 20260823163625_add_rate_limit_revisions) and wants to drop it to
-- "reconcile" drift. Plain ADD COLUMN statements avoid that entirely.
ALTER TABLE "SiteSettings" ADD COLUMN "instagramUrl" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "facebookUrl" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "threadsUrl" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "twitterUrl" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "pinterestUrl" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "whatsappUrl" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "telegramUrl" TEXT;
