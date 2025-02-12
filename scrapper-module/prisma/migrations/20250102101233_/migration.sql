-- AlterTable
ALTER TABLE "product" ADD COLUMN     "id_clusters" TEXT[] DEFAULT ARRAY[]::TEXT[];
