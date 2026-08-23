-- CreateTable
CREATE TABLE "RateLimitBucket" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "count" INTEGER NOT NULL DEFAULT 1,
    "resetAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PostRevision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PostRevision_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "PostRevision_postId_idx" ON "PostRevision"("postId");

-- CreateFTS5 (standalone, not content-linked: Post.id is a TEXT cuid, not an
-- INTEGER rowid, so an external-content table isn't viable. Synced manually
-- from application code in createPost/updatePost/deletePost.)
CREATE VIRTUAL TABLE "PostSearch" USING fts5(
  postId UNINDEXED,
  title,
  excerpt,
  content
);

-- Backfill existing posts
INSERT INTO "PostSearch" (postId, title, excerpt, content)
SELECT "id", "title", "excerpt", "content" FROM "Post";
