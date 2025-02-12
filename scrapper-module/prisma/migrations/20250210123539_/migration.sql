/*
  Warnings:

  - You are about to drop the `subcategory_smi` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "brands" ADD COLUMN     "gender" TEXT;

-- DropTable
DROP TABLE "subcategory_smi";
