/*
  Warnings:

  - The primary key for the `invalid` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `key` on the `invalid` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "invalid" DROP CONSTRAINT "invalid_pkey",
DROP COLUMN "key",
ADD CONSTRAINT "invalid_pkey" PRIMARY KEY ("invalid_key");
