-- CreateTable
CREATE TABLE "articles" (
    "id" TEXT NOT NULL,
    "created_at" INTEGER,
    "image" TEXT,
    "offer_id" INTEGER NOT NULL,
    "site" TEXT,
    "tracking_link" TEXT,
    "uid" TEXT,
    "url" TEXT,
    "wishlistId" TEXT,
    "is_scraped" BOOLEAN DEFAULT false,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "articles_id_key" ON "articles"("id");
