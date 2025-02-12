/*
  Warnings:

  - The primary key for the `failed` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "failed" DROP CONSTRAINT "failed_pkey",
ALTER COLUMN "key" DROP DEFAULT,
ADD CONSTRAINT "failed_pkey" PRIMARY KEY ("failed_key");
DROP SEQUENCE "failed_key_seq";
