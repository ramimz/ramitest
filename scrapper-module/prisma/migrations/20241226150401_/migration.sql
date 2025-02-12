-- CreateTable
CREATE TABLE "category" (
    "id_categ" UUID NOT NULL DEFAULT gen_random_uuid(),
    "category_name" TEXT NOT NULL,
    "id_categ_smi" TEXT,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id_categ")
);

-- CreateTable
CREATE TABLE "subcategory" (
    "id_sub_categ" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sub_categ_name" TEXT NOT NULL,
    "id_categ" TEXT NOT NULL,
    "id_sub_categ_smi" TEXT,

    CONSTRAINT "subcategory_pkey" PRIMARY KEY ("id_sub_categ")
);
