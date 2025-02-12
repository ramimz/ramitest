/*
  Warnings:

  - A unique constraint covering the columns `[uid,category,subcategory]` on the table `infs_categ_kpis` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "infs_categ_kpis_uid_key";

-- CreateIndex
CREATE UNIQUE INDEX "infs_categ_kpis_uid_category_subcategory_key" ON "infs_categ_kpis"("uid", "category", "subcategory");
