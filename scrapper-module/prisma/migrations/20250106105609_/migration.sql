/*
  Warnings:

  - You are about to drop the `SubCategorySmi` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "SubCategorySmi";

-- CreateTable
CREATE TABLE "subcategory_smi" (
    "id" TEXT NOT NULL,
    "categ" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "text_en" TEXT,
    "text_fr" TEXT,

    CONSTRAINT "subcategory_smi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subcategory_smi_id_key" ON "subcategory_smi"("id");
