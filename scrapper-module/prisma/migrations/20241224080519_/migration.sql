-- CreateTable
CREATE TABLE "product" (
    "key" SERIAL NOT NULL,
    "id_product" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "product_name" TEXT NOT NULL,
    "color" TEXT,
    "category" TEXT,
    "sub_category" TEXT,
    "description" TEXT,
    "price" TEXT,
    "currency" TEXT,
    "url" TEXT NOT NULL,
    "id_product_smi" TEXT NOT NULL,
    "offer_id" INTEGER NOT NULL,
    "keywords" TEXT,
    "availability" BOOLEAN,
    "id_categ" TEXT NOT NULL DEFAULT '',
    "id_sub_categ" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "product_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "failed" (
    "key" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_product_smi" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "offer_id" INTEGER NOT NULL,
    "error_message" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "ignore" BOOLEAN NOT NULL DEFAULT false,
    "retry_count" INTEGER NOT NULL,
    "id_product" TEXT DEFAULT '',

    CONSTRAINT "failed_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "invalid" (
    "key" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_product_smi" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "offer_id" INTEGER NOT NULL,
    "reason" TEXT,

    CONSTRAINT "invalid_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_id_product_key" ON "product"("id_product");

-- CreateIndex
CREATE UNIQUE INDEX "product_id_product_smi_key" ON "product"("id_product_smi");

-- CreateIndex
CREATE UNIQUE INDEX "failed_id_product_smi_key" ON "failed"("id_product_smi");

-- CreateIndex
CREATE UNIQUE INDEX "invalid_id_product_smi_key" ON "invalid"("id_product_smi");
