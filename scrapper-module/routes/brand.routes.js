const express = require("express");
const Joi = require("joi");
const router = express.Router();
const JSONbig = require("json-bigint");
const {
  fetchAllBrands,
  fetchBrandByKey,
  fetchBrandByOfferId,
  createBrand,
  editBrand,
  removeBrand,
  editMultipleClicks,
  editMultipleSales,
  editMultipleConversionRate,
} = require("../services/brand.service.js");

const {
  getAllBrandsKeys,
  updateMultipleGender,
} = require("../repositories/brand.repository.js");

/**
 * @swagger
 * tags:
 *      - name: brands
 * /b:
 *   get:
 *     summary: Get all brands
 *     description: This API retrieves the list of all brands.
 *     tags: [brands]
 *     responses:
 *       200:
 *         description: Successful operation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   example : []
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
router.get("/", async (req, res) => {
    try {
      const brands = await fetchAllBrands();
      res.status(200).send(JSONbig.stringify({ data: brands }, null, 2));
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
});
 
/**
 * @swagger
 * tags:
 *      - name: brands
 * /b/{brandKey}:
 *   get:
 *     summary: Get a brand by id
 *     description: This API retrieves a brand details using its unique ID.
 *     tags: [brands]
 *     parameters:
 *       - in: path
 *         name: brandKey
 *         required: true
 *         description: The ID of the brand to fetch.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Bad request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid parameters.
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
router.get("/:brandKey", async (req, res) => {
    const params = req.params
    try {
      const schema = Joi.object({
        brandKey: Joi.string().required(),
      });
  
      const { error } = schema.validate(params);
      if (error) {
        res.status(400).send({ message: error.message });
      }
  
      const result = await fetchBrandByKey(params.brandKey);
      res.status(200).send(JSONbig.stringify({ data: result }, null, 2));
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
});

/**
 * @swagger
 * tags:
 *      - name: brands
 * /b/o/{offerId}:
 *   get:
 *     summary: Get a brand by offerId
 *     description: This API retrieves a brand details using its unique offerId.
 *     tags: [brands]
 *     parameters:
 *       - in: path
 *         name: offerId
 *         required: true
 *         description: The ID of the brand to fetch.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Bad request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid parameters.
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
router.get("/o/:offerId", async (req, res) => {
    const params = req.params
    try {
      const schema = Joi.object({
        offerId: Joi.number().required(),
      });
  
      const { error } = schema.validate(params);
      if (error) {
        res.status(400).send({ message: error.message });
      }
  
      const result = await fetchBrandByOfferId(params.offerId);
      res.status(200).send(JSONbig.stringify({ data: result }, null, 2));
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
});

/**
 * @swagger
 * tags:
 *      - name : brands
 * /b/update-all-clicks:
 *   put:
 *     summary: Update all brands clicks
 *     description: This API updates the clicks of all brands.
 *     tags: [brands]
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
 *                     example: All brands clicks are updated successfully.
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
router.put("/update-all-clicks", async (req, res) => {
    try {
      const brands = await getAllBrandsKeys();
      console.log('All brands retrieved successfully.');
      const result = await editMultipleClicks({offerIds: brands.map(brand => brand.offer_id)});
      res.status(200).json({ message: result });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
});

/**
 * @swagger
 * tags:
 *      - name : brands
 * /b/update-all-sales:
 *   put:
 *     summary: Update all brands sales
 *     description: This API updates the sales of all brands.
 *     tags: [brands]
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
 *                     example: All brands sales are updated successfully.
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
router.put("/update-all-sales", async (req, res) => {
    try {
      const brands = await getAllBrandsKeys();
      console.log('All brands retrieved successfully.');
      const result = await editMultipleSales({offerIds: brands.map(brand => brand.offer_id)});
      res.status(200).json({ message : result });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
});

/**
 * @swagger
 * tags:
 *      - name : brands
 * /b/update-all-conversion-rate:
 *   put:
 *     summary: Update all brands conversion rate
 *     description: This API updates the conversion rate of all brands.
 *     tags: [brands]
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
 *                     example: All brands conversion rate are updated successfully.
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
router.put("/update-all-conversion-rate", async (req, res) => {
    try {
      const brands = await getAllBrandsKeys();
      console.log('All brands retrieved successfully.');
      const result = await editMultipleConversionRate({offerIds: brands.map(brand => brand.offer_id)});
      res.status(200).json({ message : result });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
});

/**
 * @swagger
 * tags:
 *   - name: brands
 * /b:
 *   post:
 *     summary: Create a new brand
 *     description: This API creates a new brand with the provided details.
 *     tags: [brands]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               brand_id:
 *                 type: string
 *                 description: Unique identifier for the brand.
 *                 example: "B12345"
 *               currency:
 *                 type: string
 *                 description: The currency used.
 *                 example: "EUR"
 *               description:
 *                 type: string
 *                 description: Description in French.
 *                 example: "Description en français"
 *               description_en:
 *                 type: string
 *                 description: Description in English.
 *                 example: "Description in English"
 *               display_name:
 *                 type: string
 *                 description: Display name of the brand.
 *                 example: "Nom d'affichage"
 *               href:
 *                 type: string
 *                 description: Brand website URL.
 *                 example: "https://example.com"
 *               is_private_campaign:
 *                 type: boolean
 *                 description: Indicates if the campaign is private.
 *                 example: false
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of categories.
 *                 example: ["Mode", "Accessoires"]
 *               localisation:
 *                 type: string
 *                 description: Brand's location.
 *                 example: "FR"
 *               name:
 *                 type: string
 *                 description: Name of the brand.
 *                 example: "Nom du marque"
 *               offer_id:
 *                 type: number
 *                 description: Unique offer ID.
 *                 example: 123
 *               pic:
 *                 type: string
 *                 description: URL of the brand's image.
 *                 example: "https://example.com/image.jpg"
 *               private:
 *                 type: boolean
 *                 description: Indicates if the brand is private.
 *                 example: true
 *               score:
 *                 type: number
 *                 description: Brand rating score.
 *                 example: 4
 *               influencers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of influencers associated with the brand.
 *                 example: ["influencer_1", "influencer_2"]
 *               is_cpa:
 *                 type: boolean
 *                 description: Indicates if the brand supports CPA (Cost Per Action).
 *                 example: true
 *               is_cpc:
 *                 type: boolean
 *                 description: Indicates if the brand supports CPC (Cost Per Click).
 *                 example: false
 *               is_cpi:
 *                 type: boolean
 *                 description: Indicates if the brand supports CPI (Cost Per Install).
 *                 example: false
 *               language:
 *                 type: string
 *                 description: Language of the brand's content.
 *                 example: "fr"
 *               categ:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Primary categories of the brand.
 *                 example: ["Vêtements"]
 *     responses:
 *       200:
 *         description: Brand created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Bad request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid input data.
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
router.post("/", async (req, res) => {
  const body = req.body
  try {
    const result = await createBrand(body);
    res.status(200).send(JSONbig.stringify({ data: result }, null, 2));
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

/**
 * @swagger
 * tags:
 *   - name: brands
 * /b/{brandKey}:
 *   patch:
 *     summary: Update a brand by ID
 *     description: This API updates a brand's details using its unique ID.
 *     tags: [brands]
 *     parameters:
 *       - in: path
 *         name: brandKey
 *         required: true
 *         description: The ID of the brand to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currency:
 *                 type: string
 *                 description: The updated currency.
 *                 example: "USD"
 *               description:
 *                 type: string
 *                 description: Updated description in French.
 *                 example: "Nouvelle description en français"
 *               description_en:
 *                 type: string
 *                 description: Updated description in English.
 *                 example: "New description in English"
 *               display_name:
 *                 type: string
 *                 description: Updated display name.
 *                 example: "Nouveau nom d'affichage"
 *               href:
 *                 type: string
 *                 description: Updated brand website URL.
 *                 example: "https://new-example.com"
 *               is_private_campaign:
 *                 type: boolean
 *                 description: Indicates if the campaign is private.
 *                 example: true
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Updated list of categories.
 *                 example: ["Technologie", "Gadgets"]
 *               localisation:
 *                 type: string
 *                 description: Updated location.
 *                 example: "USA"
 *               name:
 *                 type: string
 *                 description: Updated brand name.
 *                 example: "Nouveau Nom"
 *               offer_id:
 *                 type: number
 *                 description: Updated unique offer ID.
 *                 example: 456
 *               pic:
 *                 type: string
 *                 description: Updated brand image URL.
 *                 example: "https://new-example.com/image.jpg"
 *               private:
 *                 type: boolean
 *                 description: Indicates if the brand is private.
 *                 example: false
 *               score:
 *                 type: number
 *                 description: Updated brand rating score.
 *                 example: 55
 *               influencers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Updated list of influencers.
 *                 example: ["influencer_3", "influencer_4"]
 *               is_cpa:
 *                 type: boolean
 *                 description: Indicates if the brand supports CPA.
 *                 example: false
 *               is_cpc:
 *                 type: boolean
 *                 description: Indicates if the brand supports CPC.
 *                 example: true
 *               is_cpi:
 *                 type: boolean
 *                 description: Indicates if the brand supports CPI.
 *                 example: true
 *               language:
 *                 type: string
 *                 description: Updated language.
 *                 example: "en"
 *               categ:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Updated categories.
 *                 example: ["Électronique"]
 *     responses:
 *       200:
 *         description: Brand updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Bad request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid brandKey or input data.
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
router.patch("/:brandKey", async (req, res) => {
  const params = req.params
  const body = req.body
  try {
    const schema = Joi.object({
      brandKey: Joi.string().required(),
    });

    const { error } = schema.validate(params);
    if (error) {
      res.status(400).send({ message: error.message });
    }

    const result = await editBrand({ brandKey: params.brandKey, updates: body });
    res.status(200).send(JSONbig.stringify({ data: result }, null, 2));
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

/**
 * @swagger
 * tags:
 *   - name: brands
 * /b/{brandKey}:
 *   delete:
 *     summary: Delete a brand by ID
 *     description: This API deletes a brand using its unique ID.
 *     tags: [brands]
 *     parameters:
 *       - in: path
 *         name: brandKey
 *         required: true
 *         description: The ID of the brand to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Brand deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Bad request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid brandKey.
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
router.delete("/:brandKey", async (req, res) => {
  const params = req.params
  try {
    const schema = Joi.object({
      brandKey: Joi.string().required(),
    });

    const { error } = schema.validate(params);
    if (error) {
      res.status(400).send({ message: error.message });
    }

    const result = await removeBrand(params);
    res.status(200).send(JSONbig.stringify({ data: result }, null, 2));
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

/**
 * @swagger
 * tags:
 *      - name : brands
 * /b/update-all-gender:
 *   put:
 *     summary: Update all brands genders
 *     description: This API updates all brands genders.
 *     tags: [brands]
 *     responses:
 *       200:
 *         description: Successful operation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                   message: 
 *                      type: string
 *                      example: All brands genders are updated successfully.
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
router.put("/update-all-gender", async (req, res) => {
  try {
    const result = await updateMultipleGender();
    res.status(200).json({ message : result });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;