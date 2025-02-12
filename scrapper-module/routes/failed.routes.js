const express = require("express");
const {
  setResolved,
} = require("../services/scrape.service");
const { 
  setIgnoreFailed,
  getUnresolvedFailed
} = require('../repositories/failed.repository.js');
const router = express.Router();

/**
 * @swagger
 * tags:
 *      - name : failed
 * /resolved:
 *   post:
 *     summary: Set resolved failed
 *     description: This API updates failed urls database by modifying field resolved to true after it has been resolved.
 *     tags: [failed]
 *     responses:
 *       200:
 *         description: Resolved failed set successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Resolved failed set successfully.
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
router.post("/resolved", async(req, res) => {
    try {
      const result = await setResolved();
      res.status(200).json({
        message : result
      });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
});
  
/**
   * @swagger
   * tags:
   *      - name : failed
   * /ignore:
   *   post:
   *     summary: Set ignore failed
   *     description: This API updates failed urls database by modifying field ignore to true.
   *     tags: [failed]
   *     responses:
   *       200:
   *         description: Ignored failed set successfully.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Ignored failed set successfully.
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
router.post("/ignore", async(req, res) => {
    try {
      const result = await setIgnoreFailed();
      res.status(200).json({
        message : result
      });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
});
  
/**
   * @swagger
   * tags:
   *      - name : failed
   * /unresolved:
   *   get:
   *     summary: Get unresolved failed
   *     description: This API returns unresolved failed articles.
   *     tags: [failed]
   *     responses:
   *       200:
   *         description: Unresolved failed retrieved successfully.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *               data:
   *                 type: object
   *                 example: {}
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
router.get("/unresolved", async(req, res) => {
    try {
      const result = await getUnresolvedFailed();
      res.status(200).json({
        articles : result
      });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
});

module.exports = router;