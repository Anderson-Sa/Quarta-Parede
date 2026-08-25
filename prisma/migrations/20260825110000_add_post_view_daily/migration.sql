-- CreateTable
-- Hand-written (not `prisma migrate dev`), same reason as
-- 20260824100000_add_campaign_stats: a plain CREATE TABLE avoids the
-- auto-diff engine tripping over the hand-added PostSearch FTS5 virtual
-- table (which isn't modeled in schema.prisma).
CREATE TABLE "PostViewDaily" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "PostViewDaily_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PostViewDaily_postId_date_key" ON "PostViewDaily"("postId", "date");

-- CreateIndex
CREATE INDEX "PostViewDaily_date_idx" ON "PostViewDaily"("date");
