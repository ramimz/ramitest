/*
  Warnings:

  - The primary key for the `category` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "category" DROP CONSTRAINT "category_pkey",
ALTER COLUMN "id_categ" DROP DEFAULT,
ALTER COLUMN "id_categ" SET DATA TYPE TEXT,
ADD CONSTRAINT "category_pkey" PRIMARY KEY ("id_categ");

-- AlterTable
ALTER TABLE "conversions" ALTER COLUMN "id_product" DROP DEFAULT;
