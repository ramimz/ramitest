/*
  Warnings:

  - You are about to drop the `universes` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "product" ADD COLUMN     "gender" TEXT;

-- DropTable
DROP TABLE "universes";
