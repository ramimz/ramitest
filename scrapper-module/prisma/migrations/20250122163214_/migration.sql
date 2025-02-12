/*
  Warnings:

  - You are about to drop the column `id_cluster` on the `influencers` table. All the data in the column will be lost.
  - You are about to drop the column `id_clusters` on the `influencers` table. All the data in the column will be lost.
  - You are about to drop the column `id_clusters` on the `product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "influencers" DROP COLUMN "id_cluster",
DROP COLUMN "id_clusters",
ALTER COLUMN "gender" SET DEFAULT '';

-- AlterTable
ALTER TABLE "product" DROP COLUMN "id_clusters";
