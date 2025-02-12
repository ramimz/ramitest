-- AlterTable
ALTER TABLE "failed" ALTER COLUMN "id_product" DROP DEFAULT;

-- AlterTable
ALTER TABLE "product" ALTER COLUMN "id_categ" DROP DEFAULT,
ALTER COLUMN "id_sub_categ" DROP DEFAULT;
