/*
  Warnings:

  - The `season` column on the `conversions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `season` column on the `product` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "season" AS ENUM ('SUMMER', 'SPRING', 'WINTER', 'AUTUMN');

-- AlterTable
ALTER TABLE "conversions" DROP COLUMN "season",
ADD COLUMN     "season" "season";

-- AlterTable
ALTER TABLE "product" DROP COLUMN "season",
ADD COLUMN     "season" "season";

-- DropEnum
DROP TYPE "Season";
