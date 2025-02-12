-- CreateTable
CREATE TABLE "influencers" (
    "uid" TEXT NOT NULL,
    "banner" TEXT,
    "civility" TEXT,
    "community_size" JSONB,
    "country" TEXT,
    "description" TEXT,
    "email" TEXT,
    "first_name" TEXT,
    "language" TEXT,
    "last_name" TEXT,
    "name" TEXT,
    "private" BOOLEAN DEFAULT true,
    "score" BIGINT,
    "univers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "favorite_brands_ids" JSONB,
    "is_deleted" BOOLEAN DEFAULT false,

    CONSTRAINT "influencers_pkey" PRIMARY KEY ("uid")
);

-- CreateIndex
CREATE UNIQUE INDEX "influencers_uid_key" ON "influencers"("uid");
