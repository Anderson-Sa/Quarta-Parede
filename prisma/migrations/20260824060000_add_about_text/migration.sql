-- AlterTable
-- Hand-written (not `prisma migrate dev`), same reason as
-- 20260824020000_add_social_links: a plain ADD COLUMN avoids the auto-diff
-- engine trying to drop the hand-added PostSearch FTS5 virtual table.
ALTER TABLE "SiteSettings" ADD COLUMN "aboutText" TEXT NOT NULL DEFAULT 'Somos apaixonados por cultura geek: cinema, animes, séries e games. Este espaço nasceu para compartilhar notícias, análises e tudo que move essas comunidades.';
