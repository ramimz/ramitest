/*
  Warnings:

  - A unique constraint covering the columns `[failed_key]` on the table `failed` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "failed" ADD COLUMN     "failed_key" UUID NOT NULL DEFAULT gen_random_uuid();

-- CreateIndex
CREATE UNIQUE INDEX "failed_failed_key_key" ON "failed"("failed_key");
