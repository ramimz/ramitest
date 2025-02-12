/*
  Warnings:

  - A unique constraint covering the columns `[product_key]` on the table `product` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "product" ADD COLUMN     "product_key" UUID NOT NULL DEFAULT gen_random_uuid();

-- CreateIndex
CREATE UNIQUE INDEX "product_product_key_key" ON "product"("product_key");
