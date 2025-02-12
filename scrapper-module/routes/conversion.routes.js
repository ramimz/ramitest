const express = require("express");
const router = express.Router();
const {
  fetchAllConversions,
  editMultipleSeason,
  editMultipleIdProduct,
  createConversion,
} = require("../services/conversion.service.js");

/**
 * @swagger
 * tags:
 *      - name : conversions
 * /c/update-all-season:
 *   put:
 *     summary: Update all conversions season
 *     description: This API updates the conversions season.
 *     tags: [conversions]
 *     responses:
 *       200:
 *         description: Successful operation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                   message: 
 *                     type: string
 *                     example: All conversions season are updated successfully.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.put("/update-all-season", async (req, res) => {
    try {
      const conversions = await fetchAllConversions({options: {
        season: true
      }});
      console.log('All conversions retrieved successfully.');
      const result = await editMultipleSeason(conversions);
      res.status(200).json({ message: result });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
});

/**
 * @swagger
 * tags:
 *      - name : conversions
 * /c/update-all-id-product:
 *   put:
 *     summary: Update all conversions id product
 *     description: This API updates the conversions id product.
 *     tags: [conversions]
 *     responses:
 *       200:
 *         description: Successful operation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                   message: 
 *                     type: string
 *                     example: All conversions id product added successfully.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.put("/update-all-id-product", async (req, res) => {
  try {
    const conversions = await fetchAllConversions({options: {
      idProduct: true
    }});
    console.log('All conversions retrieved successfully.', conversions);
      const result = await editMultipleIdProduct(conversions);
      res.status(200).json({ message: result });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

/**
 * @swagger
 * tags:
 *   - name: conversions
 * /c:
 *   post:
 *     summary: Create a new conversion
 *     description: This API records a new conversion.
 *     tags: [conversions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *                 description: Unique identifier for the conversion event.
 *                 example: "conversion_12345"
 *               influencer:
 *                 type: string
 *                 description: ID of the influencer associated with the conversion.
 *                 example: "influencer_001"
 *               offerid:
 *                 type: number
 *                 description: ID of the offer linked to the conversion.
 *                 example: 789
 *               clickid:
 *                 type: string
 *                 description: ID of the related click event.
 *                 example: "click_567"
 *               amount:
 *                 type: number
 *                 format: float
 *                 description: Amount of the conversion.
 *                 example: 49.99
 *               articleid:
 *                 type: string
 *                 description: ID of the purchased article.
 *                 example: "article_67890"
 *               articleimgurl:
 *                 type: string
 *                 description: URL of the article image.
 *                 example: "https://example.com/article.jpg"
 *               articlepathurl:
 *                 type: string
 *                 description: URL of the article page.
 *                 example: "https://example.com/product"
 *               brandkey:
 *                 type: string
 *                 description: Key of the associated brand.
 *                 example: "brand_123"
 *               categ:
 *                 type: string
 *                 description: Category of the article.
 *                 example: "Fashion"
 *               subcateg:
 *                 type: string
 *                 description: Subcategory of the article.
 *                 example: "Shoes"
 *               maincolor:
 *                 type: string
 *                 description: Main color of the article.
 *                 example: "Red"
 *               createdat:
 *                 type: number
 *                 description: Timestamp when the conversion was recorded.
 *                 example: 1234567890
 *               lastmodified:
 *                 type: number
 *                 description: Last modification timestamp of the conversion.
 *                 example: 1234567890
 *               countrycode:
 *                 type: string
 *                 description: Country code of the conversion.
 *                 example: "FR"
 *               currency:
 *                 type: string
 *                 description: Currency used in the transaction.
 *                 example: "EUR"
 *               isprivate:
 *                 type: boolean
 *                 description: Indicates if the conversion is private.
 *                 example: false
 *               status:
 *                 type: number
 *                 description: Status of the conversion.
 *                 example: 2
 *               paiement_status:
 *                 type: boolean
 *                 description: Payment status of the conversion.
 *                 example: false
 *               referral_influencer:
 *                 type: string
 *                 description: ID of the referring influencer.
 *                 example: "influencer_002"
 *               smi_sales_payment_status:
 *                 type: integer
 *                 description: Payment status of SMI sales.
 *                 example: 2
 *               smi_referral_payment_status:
 *                 type: integer
 *                 description: Payment status of SMI referrals.
 *                 example: 2
 *     responses:
 *       200:
 *         description: Conversion event successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   example: {}
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 */
router.post("/", async (req, res) => {
  const body = req.body
  try {
    const result = await createConversion(body);
    res.status(200).json({ data: result });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;