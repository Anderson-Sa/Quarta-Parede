-- AlterTable
-- Hand-written (not `prisma migrate dev`): the auto-diff engine doesn't know
-- about the PostSearch FTS5 virtual table (added via raw SQL, see
-- 20260823163625_add_rate_limit_revisions) and wants to drop it to
-- "reconcile" drift. Plain ADD COLUMN statements avoid that entirely.
ALTER TABLE "SiteSettings" ADD COLUMN "brandColor" TEXT NOT NULL DEFAULT '#8b5cf6';
ALTER TABLE "SiteSettings" ADD COLUMN "accentColor" TEXT NOT NULL DEFAULT '#22d3ee';
ALTER TABLE "SiteSettings" ADD COLUMN "fontFamily" TEXT NOT NULL DEFAULT 'geist';
ALTER TABLE "SiteSettings" ADD COLUMN "homeSectionOrder" TEXT NOT NULL DEFAULT '[{"id":"destaques","visible":true},{"id":"outros","visible":true},{"id":"ultimas","visible":true}]';
