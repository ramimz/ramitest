/*
  Warnings:

  - The primary key for the `subcategory` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "subcategory" DROP CONSTRAINT "subcategory_pkey",
ALTER COLUMN "id_sub_categ" DROP DEFAULT,
ALTER COLUMN "id_sub_categ" SET DATA TYPE TEXT,
ADD CONSTRAINT "subcategory_pkey" PRIMARY KEY ("id_sub_categ");
