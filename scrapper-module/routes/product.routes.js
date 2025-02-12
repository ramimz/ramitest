const express = require("express");
const Joi = require("joi");
const router = express.Router();
const JSONbig = require("json-bigint");
const multer = require("multer");
const upload = multer();
const fs = require("fs");
const {
  fetchAllProducts,
  fetchProductById,
  fetchAllProductsIds,
  fetchProductByIdSmi,
  classifyAll,
  classify,
  fetchFilteredProducts,
  editMultipleSales,
  editMultipleClicks,
  editMultipleImage,
  editMultipleConversionRate,
  fetchProductsWithScore,
  editMultipleSeason,
  editMultipleCateg,
  editMultipleGender,
} = require("../services/product.service.js");

/**
 * @swagger
 * tags:
 *      - name: products
 * /p:
 *   get:
 *     summary: Get all products
 *     description: This API retrieves the list of all products.
 *     tags: [products]
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
      const products = await fetchAllProducts();
      res.status(200).send(JSONbig.stringify({ data: products }, null, 2));
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
});

/**
 * @swagger
 * tags:
 *      - name: products
 * /p/filter/{uid}:
 *   get:
 *     summary: Get filtered products for an influencer
 *     description: This API retrieves list of filtered products for a specific influencer.
 *     tags: [products]
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         description: The UID of the influencer.
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
router.get("/filter/:uid", async (req, res) => {
  const params = req.params
  try {
    const schema = Joi.object({
      uid: Joi.string().required(),
    });

    const { error } = schema.validate(params);
    if (error) {
      res.status(400).send({ message: error.message });
    }

    const result = await fetchFilteredProducts(params);
    res.status(200).send(JSONbig.stringify({ data: result }, null, 2));
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

/**
 * @swagger
 * tags:
 *      - name: products
 * /p/{idProduct}:
 *   get:
 *     summary: Get a product by id
 *     description: This API retrieves a product details using its unique ID.
 *     tags: [products]
 *     parameters:
 *       - in: path
 *         name: idProduct
 *         required: true
 *         description: The ID of the product to fetch.
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
router.get("/:idProduct", async (req, res) => {
    const params = req.params
    try {
      const schema = Joi.object({
        idProduct: Joi.string().required(),
      });
  
      const { error } = schema.validate(params);
      if (error) {
        res.status(400).send({ message: error.message });
      }
  
      const result = await fetchProductById(params.idProduct);
      res.status(200).send(JSONbig.stringify({ data: result }, null, 2));
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
});

/**
 * @swagger
 * tags:
 *      - name: products
 * /p/smi/{idProductSmi}:
 *   get:
 *     summary: Get a product by id smi
 *     description: This API retrieves a product details using its unique ID in SMI DB.
 *     tags: [products]
 *     parameters:
 *       - in: path
 *         name: idProductSmi
 *         required: true
 *         description: The ID of the product to fetch.
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
router.get("/smi/:idProductSmi", async (req, res) => {
  const params = req.params
  try {
    const schema = Joi.object({
      idProductSmi: Joi.string().required(),
    });

    const { error } = schema.validate(params);
    if (error) {
      res.status(400).send({ message: error.message });
    }

    const result = await fetchProductByIdSmi(params.idProductSmi);
    res.status(200).send(JSONbig.stringify({ data: result }, null, 2));
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

/**
 * @swagger
 * tags:
 *      - name : products
 * /p/update-all-images:
 *   put:
 *     summary: Update all products images
 *     description: This API updates the image of all products.
 *     tags: [products]
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
 *                      example: All products images are updated successfully.
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
router.put("/update-all-images", async (req, res) => {
    try {
      const products = await fetchAllProductsIds({
        options: {
          image: true
        }
      });
      console.log('All products retrieved successfully.');
      const result = await editMultipleImage(products);
      res.status(200).json({ message: result });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
});

/**
 * @swagger
 * tags:
 *      - name : products
 * /p/update-all-sales:
 *   put:
 *     summary: Update all products sales number
 *     description: This API updates the sales number of all products.
 *     tags: [products]
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
 *                      example: All products sales are updated successfully.
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
      const products = await fetchAllProductsIds({});
      console.log('All products retrieved successfully.', products);
      const result = await editMultipleSales({idProducts: products.map(product => product.idProduct)});
      res.status(200).json({ message : result });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
});

/**
 * @swagger
 * tags:
 *      - name : products
 * /p/update-all-clicks:
 *   put:
 *     summary: Update all products clicks number
 *     description: This API updates the clicks number of all products.
 *     tags: [products]
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
 *                      example: All products clicks are updated successfully.
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
      const products = await fetchAllProductsIds({});
      console.log('All products retrieved successfully.');
      const result = await editMultipleClicks({idProducts: products.map(product => product.idProduct)});
      res.status(200).json({ message : result });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
});

/**
 * @swagger
 * tags:
 *      - name : products
 * /p/update-all-season:
 *   put:
 *     summary: Update all products season
 *     description: This API updates the products season.
 *     tags: [products]
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
 *                      example: All products season are updated successfully.
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
    const products = await fetchAllProductsIds({
      options: {
        season: true
      }
    });
    console.log('All products retrieved successfully.');
    const result = await editMultipleSeason(products);
    res.status(200).json({ message: result });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

/**
 * @swagger
 * tags:
 *      - name : products
 * /p/update-all-conversion-rate:
 *   put:
 *     summary: Update all products conversion rate
 *     description: This API updates the products conversion rate.
 *     tags: [products]
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
 *                      example: All products conversion rate are updated successfully.
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
    const products = await fetchAllProductsIds({});
    console.log('All products retrieved successfully.');
    const result = await editMultipleConversionRate({idProducts: products.map(product => product.idProduct)});
    res.status(200).json({ message : result });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

/**
 * @swagger
 * /p/classify-multiple:
 *   post:
 *     summary: Classify multiple articles
 *     description: Upload a JSON file containing articles and classify every single article.
 *     tags:
 *       - products
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The JSON file containing articles (articles.json).
 *     responses:
 *       200:
 *         description: Successful operation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All Products classified successfully.
 *       400:
 *         description: Invalid request data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid request data
 *       500:
 *         description: Internal Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server error
 */
router.post("/classify-multiple", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    // Check if the file is provided and parse it
    if (file) {
      try {
        fileData = JSON.parse(file.buffer.toString()); // Parse JSON content from the uploaded file
      } catch (err) {
        return res
          .status(400)
          .send({ message: "Invalid JSON in uploaded file" });
      }
    } else {
      return res
        .status(400)
        .send({ message: "File 'articles.json' is required" });
    }

    
    const result = await classifyAll({ fileData });
    res.status(200).json({ message: result });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

/**
 * @swagger
 * tags:
 *   - name: products
 * /p/classify:
 *   post:
 *     summary: Classify a product
 *     description: Updates the category and subcategory of a product based on provided keywords.
 *     tags: [products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 example: "vêtements homme"
 *               sub_category:
 *                 type: string
 *                 example: "costumes et blazers homme"
 *               keywords:
 *                 type: string
 *                 example: "vêtements homme, costume, vestes"
 *               id_product_smi:
 *                 type: string
 *                 example: "XYZ123"
 *             required:
 *               - category
 *               - sub_category
 *               - keywords
 *               - id_product_smi
 *     responses:
 *       200:
 *         description: Successful operation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_product_smi:
 *                   type: string
 *                   example: "XYZ123"
 *                 category:
 *                   type: string
 *                   example: "vêtements homme"
 *                 sub_category:
 *                   type: string
 *                   example: "costumes et blazers homme"
 *       400:
 *         description: Bad request, validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Validation error: category is required."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An unexpected error occurred."
 */
router.post("/classify", async(req, res) => {
  const body = req.body;
  try {
    const schema = Joi.array().items(
      Joi.object({
        category: Joi.string().required().allow('', null),
        sub_category: Joi.string().required().allow('', null),
        id_product_smi: Joi.string().required(),
        keywords: Joi.string().required().allow('', null),
        product_name: Joi.string().required().allow('', null),
      })
    ).min(1);

    const { error } = schema.validate(body);
    if (error) {
      res.status(400).send({ message: error.message });
    }

    const result = await editMultipleCateg(body);
    res.status(200).json({ data: result });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

/**
 * @swagger
 * tags:
 *      - name: products
 * /p/score/{uid}:
 *   get:
 *     summary: Get scored and filtered products for an influencer
 *     description: This API retrieves list of scored and filtered products for a specific influencer.
 *     tags: [products]
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         description: The UID of the influencer.
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
 *                   example: []
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
router.get("/score/:uid", async (req, res) => {
  const params = req.params
  const query = req.query
  try {
    const schema = Joi.object({
      uid: Joi.string().required().invalid('null'),
      set: Joi.number().positive().required(),
      nextProduct: Joi.string().allow(null),
      nextScore: Joi.string().allow(null),
    });

    const { error } = schema.validate({ ...params, ...query });
    if (error) {
      res.status(400).send({ message: error.message });
    }

    const result = await fetchProductsWithScore({ ...params, ...query });
    res.status(200).send(JSONbig.stringify({ data: result }, null, 2));
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

/**
 * @swagger
 * tags:
 *      - name : products
 * /p/update-all-categ:
 *   put:
 *     summary: Update all products categories and subcategories
 *     description: This API updates the products categories and subcategories.
 *     tags: [products]
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
 *                      example: All products categories and subcategories are updated successfully.
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
router.put("/update-all-categ", async (req, res) => {
  try {
    const products = await fetchAllProductsIds({
      options: {
        categ: true
      }
    });
    console.log('All products retrieved successfully.');
    const result = await editMultipleCateg(products);
    res.status(200).json({ message : result });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

/**
 * @swagger
 * tags:
 *      - name : products
 * /p/update-all-gender:
 *   put:
 *     summary: Update all products genders
 *     description: This API updates all products genders.
 *     tags: [products]
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
 *                      example: All products genders are updated successfully.
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
    const products = await fetchAllProductsIds({
      options: {
        gender: true
      }
    });
    console.log('All products retrieved successfully.', products);
    const result = await editMultipleGender(products);
    res.status(200).json({ message : result });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;
  