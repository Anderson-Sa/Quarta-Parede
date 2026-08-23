-- AlterTable
-- Hand-written (not `prisma migrate dev`): see 20260823231745_add_appearance_settings
-- for why (the FTS5 virtual table confuses the auto-diff engine).
ALTER TABLE "SiteSettings" ADD COLUMN "destaquesLayout" TEXT NOT NULL DEFAULT 'grid';
