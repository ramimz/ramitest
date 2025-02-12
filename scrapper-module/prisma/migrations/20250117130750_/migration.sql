-- CreateIndex
CREATE INDEX "brands_offer_id_idx" ON "brands"("offer_id");

-- CreateIndex
CREATE INDEX "conversions_articleid_idx" ON "conversions"("articleid");

-- CreateIndex
CREATE INDEX "conversions_id_product_idx" ON "conversions"("id_product");

-- CreateIndex
CREATE INDEX "conversions_influencer_idx" ON "conversions"("influencer");

-- CreateIndex
CREATE INDEX "conversions_offerid_idx" ON "conversions"("offerid");

-- CreateIndex
CREATE INDEX "product_offer_id_idx" ON "product"("offer_id");
