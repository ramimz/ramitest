const express = require("express");
const {
  scrapePage,
  extractDataFromFile,
  extractDorcel,
  checkUrl,
  extractOne,
  classify,
  classifyAll,
  scrapeDorcel,
} = require("../services/scrape.service");
const {
  SCRAPPER_QUEUE,
} = require("../utils/constants");
const Joi = require("joi");
const multer = require("multer");
const upload = multer();
const router = express.Router();

/**
 * @swagger
 * tags:
 *      - name : scraping
 * /extract-one:
 *   post:
 *     summary: Extract product data
 *     description: This API scrapes a webpage to retrieve product details, extracts key information like name, category, color, and price using a specified LLM model, and saves it to the database.
 *     tags: [scraping]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 description: The URL of the webpage to scrape
 *                 example : "https://www2.hm.com//fr_fr//productpage.0961255005.html"
 *               key :
 *                 type: string
 *                 example : "-NW2otw5yh5fWet8oOIj"
 *               offerid :
 *                 type: number
 *                 example : 2620
 *             required:
 *               - url
 *               - key
 *               - offerid
 *     responses:
 *       200:
 *         description: Product data extracted and added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 key:
 *                   type: number
 *                 id_product:
 *                   type: string
 *                 product_name:
 *                   type: string
 *                 available_color:
 *                   type: string
 *                 category:
 *                   type: string
 *                 subcategory:
 *                   type: string
 *                 description:
 *                   type: string
 *                 price:
 *                   type: string
 *                 url:
 *                   type: string
 *                 id_product_smi:
 *                   type: string
 *                 offer_id:
 *                   type: string
 *                 keywords:
 *                   type: string
 *                 currency:
 *                   type: string
 *       400:
 *         description: Bad request, validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
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
router.post("/extract-one", async (req, res) => {
  try {
    const body = req.body;

    const schema = Joi.object({
      key: Joi.string().required(),
      offerid: Joi.number().required(),
      url: Joi.string().uri().required(),
    });

    const { error } = schema.validate(body);
    if (error) {
      res.status(400).send({ message: error.message });
    }

    const product = await extractOne(body);
    res.status(200).send(product);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

/**
 * @swagger
 * tags:
 *      - name : scraping
 * /scrape:
 *   post:
 *     summary: Scrape a web page
 *     description: This API scrapes a webpage the content in HTML format.
 *     tags: [scraping]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 description: The URL of the webpage to scrape
 *                 example : "https://www2.hm.com//fr_fr//productpage.0961255005.html"
 *               key :
 *                 type: string
 *                 example : "-NW2otw5yh5fWet8oOIj"
 *               offerId :
 *                 type: number
 *                 example : 2620
 *             required:
 *               - url
 *               - key
 *               - offerId
 *     responses:
 *       200:
 *         description: Page scrapped successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: string
 *                 finalUrl: 
 *                   type: string
 *       400:
 *         description: Bad request, validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
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
router.post("/scrape", async (req, res) => {
  const body = req.body;
  const { url, offerId, key } = body;
  try {
    const schema = Joi.object({
      url: Joi.string().required(),
      // offerId: Joi.number().required(),
      // key: Joi.string().required(),
    });

    const { error } = schema.validate(body);
    if (error) {
      res.status(400).send({ message: error.message });
    }

    const content = await scrapeDorcel(url/*, offerId, key*/);
    res.status(200).send(content);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

/**
 * @swagger
 * /extract-multiple:
 *   post:
 *     summary: Extract data from multiple articles
 *     description: Upload a JSON file containing articles and extract data based on the specified model.
 *     tags:
 *       - scraping
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
 *         description: Successful data extraction.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Articles have been sent to the queue products-queue for processing. With a delay time = 60 seconds and batch size = 5
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
router.post("/extract-multiple", upload.single("file"), async (req, res) => {
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

    // Send messages to the queue for each article
    await extractDataFromFile({ fileData });
    res.status(200).send({
      message: `Articles have been sent to the queue ${SCRAPPER_QUEUE} for processing.`,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.post("/extract-dorcel", async (req, res) => {
  const body = req.body;
  try {
    const schema = Joi.object({
      url: Joi.string().required(),
      key: Joi.string().required(),
      offerId: Joi.number().required(),
    });

    const { error } = schema.validate(body);
    if (error) {
      res.status(400).send({ message: error.message });
    }

    const content = await extractDorcel(body);
    res.status(200).send(content);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.post("/check-url", (req, res) => {
  const body = req.body;
  const { url } = body;
  try {
    const schema = Joi.object({
      url: Joi.string().required(),
    });

    const { error } = schema.validate(body);
    if (error) {
      res.status(400).send({ message: error.message });
    }

    const content = checkUrl(url);
    res.status(200).send(content);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;
