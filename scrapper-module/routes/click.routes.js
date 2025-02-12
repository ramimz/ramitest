const express = require("express");
const router = express.Router();
const JSONbig = require("json-bigint");

const {
  getAllClicks,
  updateMultipleIdProduct,
} = require("../repositories/click.repository");

const {
  createClick,
} = require("../services/click.service.js");

/**
 * @swagger
 * tags:
 *      - name : clicks
 * /cl/update-all-id-product:
 *   put:
 *     summary: Update all clicks id product
 *     description: This API updates the clicks id product.
 *     tags: [clicks]
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
 *                     example: All clicks id product added successfully.
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
      const clicks = await getAllClicks();
      console.log('All clicks retrieved successfully.', clicks);
        const result = await updateMultipleIdProduct(clicks);
        res.status(200).json({ message: result });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
});

/**
 * @swagger
 * tags:
 *   - name: clicks
 * /cl:
 *   post:
 *     summary: Create a new click
 *     description: This API records a new click in the system.
 *     tags: [clicks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *                 description: Unique identifier for the click event.
 *                 example: "click_12345"
 *               article:
 *                 type: string
 *                 description: The article associated with the click.
 *                 example: "article_67890"
 *               createdat:
 *                 type: number
 *                 format: date-time
 *                 description: Timestamp when the click was recorded.
 *                 example: 123456789
 *               influencer:
 *                 type: string
 *                 description: ID of the influencer who triggered the click.
 *                 example: "influencer_001"
 *               offerid:
 *                 type: number
 *                 description: ID of the associated offer.
 *                 example: 123
 *     responses:
 *       200:
 *         description: Click event successfully created.
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
    const result = await createClick(body);
    res.status(200).send(JSONbig.stringify({ data: result }, null, 2));
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;