-- CreateEnum
CREATE TYPE "Season" AS ENUM ('SUMMER', 'SPRING', 'WINTER', 'AUTUMN');

-- AlterTable
ALTER TABLE "brands" ADD COLUMN     "conversion_rate" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "total_clicks" BIGINT DEFAULT 0,
ADD COLUMN     "total_sales" BIGINT DEFAULT 0;

-- AlterTable
ALTER TABLE "conversions" ADD COLUMN     "season" "Season";

-- AlterTable
ALTER TABLE "influencers" ADD COLUMN     "gender" TEXT DEFAULT '';

-- AlterTable
ALTER TABLE "product" ADD COLUMN     "conversion_rate" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "image_url" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "season" "Season",
ADD COLUMN     "total_clicks" BIGINT DEFAULT 0,
ADD COLUMN     "total_sales" BIGINT DEFAULT 0;
