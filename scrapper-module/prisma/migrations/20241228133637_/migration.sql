/*
  Warnings:

  - You are about to alter the column `createdat` on the `clicks` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `BigInt`.
  - You are about to alter the column `createdat` on the `conversions` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `BigInt`.
  - You are about to alter the column `lastmodified` on the `conversions` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `BigInt`.

*/
-- AlterTable
ALTER TABLE "clicks" ALTER COLUMN "createdat" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "conversions" ALTER COLUMN "createdat" SET DATA TYPE BIGINT,
ALTER COLUMN "lastmodified" SET DATA TYPE BIGINT;
