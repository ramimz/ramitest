/*
  Warnings:

  - A unique constraint covering the columns `[invalid_key]` on the table `invalid` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "invalid" ADD COLUMN     "invalid_key" UUID NOT NULL DEFAULT gen_random_uuid();

-- CreateIndex
CREATE UNIQUE INDEX "invalid_invalid_key_key" ON "invalid"("invalid_key");
