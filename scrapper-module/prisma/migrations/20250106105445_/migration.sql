-- CreateTable
CREATE TABLE "universes" (
    "key" TEXT NOT NULL,
    "text_en" TEXT,
    "text_es" TEXT,
    "text_fr" TEXT,
    "text_pl" TEXT,

    CONSTRAINT "universes_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "category_smi" (
    "key" TEXT NOT NULL,
    "img" TEXT,
    "sub_categ" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "text_en" TEXT,
    "text_es" TEXT,
    "text_fr" TEXT,
    "text_pl" TEXT,

    CONSTRAINT "category_smi_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "SubCategorySmi" (
    "id" TEXT NOT NULL,
    "categ" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "text_en" TEXT,
    "text_fr" TEXT,

    CONSTRAINT "SubCategorySmi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "universes_key_key" ON "universes"("key");

-- CreateIndex
CREATE UNIQUE INDEX "category_smi_key_key" ON "category_smi"("key");

-- CreateIndex
CREATE UNIQUE INDEX "SubCategorySmi_id_key" ON "SubCategorySmi"("id");
