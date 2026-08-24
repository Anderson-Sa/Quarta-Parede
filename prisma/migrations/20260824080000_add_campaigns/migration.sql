-- CreateTable
-- Hand-written (not `prisma migrate dev`), same reason as
-- 20260824020000_add_social_links: a plain CREATE TABLE avoids the auto-diff
-- engine trying to drop the hand-added PostSearch FTS5 virtual table.
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "linkUrl" TEXT NOT NULL,
    "ctaText" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
