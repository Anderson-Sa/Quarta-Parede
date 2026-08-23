-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteName" TEXT NOT NULL DEFAULT 'Quarta Parede',
    "slogan" TEXT NOT NULL DEFAULT 'Notícias e novidades do universo geek.',
    "logoUrl" TEXT,
    "footerText" TEXT NOT NULL DEFAULT 'Quarta Parede — notícias do universo geek: cinema, animes, séries e games.',
    "updatedAt" DATETIME NOT NULL
);
