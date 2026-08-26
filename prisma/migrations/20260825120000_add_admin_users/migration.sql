-- CreateTable
-- Hand-written (not `prisma migrate dev`), same reason as
-- 20260825110000_add_post_view_daily: a plain CREATE TABLE avoids the
-- auto-diff engine tripping over the hand-added PostSearch FTS5 virtual
-- table (which isn't modeled in schema.prisma).
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
