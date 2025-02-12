/*
  Warnings:

  - The `id_categ_smi` column on the `category` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `id_sub_categ_smi` on the `subcategory` table. All the data in the column will be lost.
  - The `id_categ` column on the `subcategory` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `clusters` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "category" DROP COLUMN "id_categ_smi",
ADD COLUMN     "id_categ_smi" TEXT[];

-- AlterTable
ALTER TABLE "subcategory" DROP COLUMN "id_sub_categ_smi",
DROP COLUMN "id_categ",
ADD COLUMN     "id_categ" TEXT[];

-- DropTable
DROP TABLE "clusters";

-- CreateTable
CREATE TABLE "infs_categ_kpis" (
    "key" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "sales_kpi" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fav_brands_kpi" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "univers_kpi" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "infs_themes_kpi" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "infs_categ_kpis_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "infs_categ_kpis_uid_key" ON "infs_categ_kpis"("uid");
