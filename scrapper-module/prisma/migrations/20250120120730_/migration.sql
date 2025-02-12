-- AlterTable
ALTER TABLE "influencers" ADD COLUMN     "id_clusters" TEXT[];

-- CreateTable
CREATE TABLE "clusters" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "influence_themes" TEXT[],
    "univers" TEXT[],
    "activities" TEXT[],
    "categories" TEXT[],
    "subcategories" TEXT[],
    "favorite_categories" TEXT[],
    "gender" TEXT[],
    "country" TEXT[],

    CONSTRAINT "clusters_pkey" PRIMARY KEY ("id")
);
