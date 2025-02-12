-- CreateTable
CREATE TABLE "brands" (
    "brand_id" TEXT NOT NULL,
    "currency" TEXT,
    "description" TEXT,
    "description_en" TEXT,
    "display_name" TEXT,
    "href" TEXT,
    "is_private_campaign" BOOLEAN,
    "categories" JSONB,
    "localisation" TEXT,
    "name" TEXT,
    "offer_id" INTEGER,
    "pic" TEXT,
    "private" BOOLEAN,
    "score" BIGINT,
    "influencers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_cpa" BOOLEAN,
    "is_cpc" BOOLEAN,
    "is_cpi" BOOLEAN,
    "language" TEXT,
    "categ" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "brands_pkey" PRIMARY KEY ("brand_id")
);

-- CreateTable
CREATE TABLE "clicks" (
    "key" TEXT NOT NULL,
    "article" TEXT,
    "createdat" BIGINT,
    "influencer" TEXT,
    "offerid" INTEGER,

    CONSTRAINT "clicks_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "infs_extra_data" (
    "key" TEXT NOT NULL,
    "gender" TEXT,
    "influence_themes" TEXT[],
    "activities" TEXT[],

    CONSTRAINT "infs_extra_data_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "conversions" (
    "key" TEXT NOT NULL,
    "influencer" TEXT,
    "offerid" INTEGER,
    "clickid" TEXT,
    "amount" DOUBLE PRECISION,
    "articleid" TEXT,
    "articleimgurl" TEXT,
    "articlepathurl" TEXT,
    "brandkey" TEXT,
    "categ" TEXT,
    "subcateg" TEXT,
    "maincolor" TEXT,
    "createdat" BIGINT,
    "lastmodified" BIGINT,
    "countrycode" TEXT,
    "currency" TEXT,
    "isprivate" BOOLEAN,
    "status" INTEGER,
    "paiement_status" BOOLEAN,
    "referral_influencer" TEXT,
    "smi_sales_payment_status" INTEGER,
    "smi_referral_payment_status" INTEGER,

    CONSTRAINT "conversions_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "brands_brand_id_key" ON "brands"("brand_id");

-- CreateIndex
CREATE UNIQUE INDEX "clicks_key_key" ON "clicks"("key");

-- CreateIndex
CREATE UNIQUE INDEX "infs_extra_data_key_key" ON "infs_extra_data"("key");

-- CreateIndex
CREATE UNIQUE INDEX "conversions_key_key" ON "conversions"("key");
