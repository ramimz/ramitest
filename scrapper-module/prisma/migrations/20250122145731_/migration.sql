-- CreateTable
CREATE TABLE "infs_theme_categ" (
    "key" TEXT NOT NULL,
    "influence_themes" TEXT NOT NULL,
    "id_categ" TEXT[],

    CONSTRAINT "infs_theme_categ_pkey" PRIMARY KEY ("key")
);
